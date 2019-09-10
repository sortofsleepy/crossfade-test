import TypedArray = NodeJS.TypedArray;
import {TextureFormat} from "./formats";

export default function(gl,format:TextureFormat= new TextureFormat(gl)){


    let tex = gl.createTexture();

    for(let i in GLTexture.prototype){
        tex[i] = GLTexture.prototype[i];
    }

    let t = new GLTexture(gl,format);
    Object.assign(tex,t);

    tex._checkData();

    return tex;
}

/**
 * Base functions for extending the WebGL texture object
 * @param gl {WebGLRenderingContext} a WebGL Rendering Context
 * @param format {TextureFormat} a TextureFormat object describing the texture.
 * @constructor
 */
function GLTexture(gl,format:TextureFormat){

    this.gl = gl;
    this.format = format;
    if(this.format.type === undefined || this.format.type === null){
        this.format.type = gl.TEXTURE_2D;
    }
}

GLTexture.prototype = {

    /**
     * Checks to see if any data was set on the format and then calls the appropriate loading function.
     * Generally only called on texture init.
     * TODO handle non-image data
     */
    _checkData(){
        if(this.format.data !== null && this.format.data !== undefined){
            if(this.format.data instanceof Image){
                this.loadImage(this.format.data);
            }
        }else {
            // if there's no data available to load, then we instantiate the texture with null data.
            this.loadBlankTexture();
        }
    },

    /**
     * Changes current active texture and binds it
     * @param index {number} the texture index to bind and activate on.
     */
    bind(index:number=0){
        let gl = this.gl;
        gl.activeTexture(gl[`TEXTURE${index}`]);
        gl.bindTexture(this.format.type,this);
        return this;
    },

    /**
     * Unbinds all currently bound textures
     */
    unbind(){
        this.gl.bindTexture(this.format.type,null);
        return this;
    },


    /**
     * Restructures texture so that it is treated as a depth texture.
     * @param settings {TextureFormat}
     */
    createDepthTexture(settings?:TextureFormat){
        let gl = this.gl;

        gl.bindTexture(this.format.type,this);
        gl.texParameteri(this.format.type,gl.TEXTURE_MAG_FILTER,settings.magFilter);
        gl.texParameteri(this.format.type,gl.TEXTURE_MIN_FILTER,settings.minFilter);

        gl.texParameteri(this.format.type,gl.TEXTURE_WRAP_S,settings.wrapS);
        gl.texParameteri(this.format.type,gl.TEXTURE_WRAP_T,settings.wrapT);

        if(gl instanceof WebGLRenderingContext){
            gl.texImage2D(this.format.type,0,settings.depthType,settings.width,settings.height,0,settings.depthType,gl.UNSIGNED_SHORT,null);
        }else{
            gl.texImage2D(this.format.type,0,settings.depthType,settings.width,settings.height,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_SHORT,null);
        }

        gl.bindTexture(this.format.type,null);

        return this;
    },

    loadBlankTexture(){
        this.loadData(null);
        return this;
    },

    /**
     * Loads some data as the texture's contents.
     * @param data {TypedArray} A typed array with content for the texture.
     */
    loadData(data:TypedArray){
        let gl = this.gl;
        let options = this.format;

        gl.bindTexture(this.format.type,this);

        // set the image
        // known to work with random floating point data
        //gl.texImage2D(this.format.type,0,gl.RGBA16F,width,height,0,gl.RGBA,gl.FLOAT,data);
        gl.texImage2D(
            this.format.type,
            0,
            options.internalFormat,
            options.width,
            options.height,
            0,
            options.format,
            options.texelType,
            data
        );

        // set min and mag filters
        gl.texParameteri(this.format.type,gl.TEXTURE_MAG_FILTER,options.magFilter);
        gl.texParameteri(this.format.type,gl.TEXTURE_MIN_FILTER,options.minFilter);

        //set wrapping
        gl.texParameteri(this.format.type,gl.TEXTURE_WRAP_S,options.wrapS)
        gl.texParameteri(this.format.type,gl.TEXTURE_WRAP_T,options.wrapT)

        // generate mipmaps if necessary
        if(options.generateMipMaps){
            gl.generateMipmap(this.format.type);
        }
        gl.bindTexture(this.format.type,null);

        return this;
    },

    /**
     * Loads an image as the texture data
     * @param img {Image} an Image object containing the image to load.
     */
    loadImage(image:HTMLImageElement){
        let gl = this.gl;
        let options = this.format;
        this.format.width = image.width;
        this.format.height = image.height;

        gl.bindTexture(this.format.type,this);

        // if we need to flip texture
        if(this.format.flipY){
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,options.flipY);
        }

        // set the image
        gl.texImage2D(this.format.target,this.format.level,this.format.internalFormat,image.width,image.height,0,this.format.format,this.format.texelType,image);

        // set min and mag filters
        gl.texParameteri(this.format.type,gl.TEXTURE_MAG_FILTER,options.magFilter);
        gl.texParameteri(this.format.type,gl.TEXTURE_MIN_FILTER,options.minFilter)

        //set wrapping
        gl.texParameteri(this.format.type,gl.TEXTURE_WRAP_S,options.wrapS)
        gl.texParameteri(this.format.type,gl.TEXTURE_WRAP_T,options.wrapT)

        // generate mipmaps if necessary
        if(options.generateMipMaps){
            gl.generateMipmap(this.format.type);
        }

        // ensure texture is unbound.
        gl.bindTexture(this.format.type,null);

        return this;
    },

    resize(w,h) {
        let gl = this.gl;
        let options = this.format;
        this.format.width = w;
        this.format.height = h;

        this.bind();

        gl.texImage2D(
            this.format.type,
            0,
            options.internalFormat,
            this.format.width,
            this.format.height,
            0,
            options.format,
            options.texelType,
            this.contents
        );
        return this;
    }

};



