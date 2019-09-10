
import createTexture from './texture'
import {TextureFormat} from "./formats";
import {logError} from "../utils";

/**
 * Creator function for FBOs
 * @param gl {WebGLRenderingContext} a WebGL context
 * @param format {TextureFormat} an object that implements the TextureFormat interface - this is used to
 * describe the various attributes of how a texture should work. This will be used to create the texture at
 * gl.ATTACHMENT0; any other attachments will derive from this setting as well unless a new instance of TextureFormat is
 * used.
 */
export default function (gl,format:TextureFormat = new TextureFormat(gl)){
    let fbo = gl.createFramebuffer();


    for(let i in Fbo.prototype){
        fbo[i] = Fbo.prototype[i];
    }

    Object.assign(fbo,new Fbo(gl,format));

    // initialize fbo
    fbo.build();

    return fbo;
};


function Fbo(gl,format:TextureFormat){
    this.gl = gl;
    this.format = format;
    this.depthTexture = null;

    // create default texture aka gl.ATTACHMENT0 if it doesn't already exist.
    if(this.format.attachments.length < 1){
        let tex = createTexture(gl,format);
        this.format.attachments.push(tex);
    }

}

Fbo.prototype = {

    /**
     * Builds out the FBO based on the current settings
     */
    build(){
        let gl = this.gl;
        let format = this.format;

        this.bind();

        // bind default texture
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, format.attachments[0], 0);

        // if there are other attachments, apply them onto the fbo.
        if(format.attachments.length > 1){
            format.attachments.forEach((attachment,index) => {
                let slot = gl.COLOR_ATTACHMENT0 + (index + 1);
                gl.framebufferTexture2D(gl.FRAMEBUFFER,slot, gl.TEXTURE_2D, attachment, 0);
            })
        }

        // build depth texture.

        // last check of FBO status before un-bind
        let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        this._throwError(status);

        this.unbind();
        return this;
    },

    /**
     * Returns the default Framebuffer texture.
     */
    getColorTexture(){
        return this.format.attachments[0];

    },

    bind(){
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this);
        return this;
    },

    unbind(){
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null);
        return this;
    },

    /**
     * Allows you to clear the framebuffer's texture to get rid of junk.
     * @param r
     * @param g
     * @param b
     * @param a
     */
    clear(r:number=0,g:number=0,b:number=0,a:number=0){
        this.bind();
        this.gl.clearColor(r,g,b,a);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.unbind();
        return this;
    },


    /**
     * Resizes a texture to match the given dimensions
     * @param w {number} the new width to set the texture
     * @param h {number} the new height to set the texture.
     * @param attachmetnIndex {number} the index of the attachment you want to resize. By default this will resize the default
     * attachment.
     */
    resize(w:number,h:number, attachmetnIndex=0){

        if(attachmetnIndex > this.format.attachments.length){
            logError(`Attempt to resize FBO ${this.format.name} failed - selected an index greater than the number of attachments on this FBO`);
            return;
        }

        let gl = this.gl;
        this.format.width = w;
        this.format.height = h;
        this.format.attachments[attachmetnIndex].resize(w,h);

        //TODO heard its cheaper to rebuild fbo vs re-attach texture , not sure which is true
        this.build();

        return this;

    },

    /**
     * Adds a new texture attachment to the FBO
     * @param format {TextureFormat} an optional format describing the paramters for the texture
     * @param index {number}
     */
    addAttachment(format?:TextureFormat,index?:number){

        // if a new format is passed in - use that, otherwise use whatever the default attachment was created with.
        let texFormat = format !== undefined ? format : this.format;
        let tex = createTexture(this.gl,texFormat);
        let gl = this.gl;

        this.bind();
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        this.unbind();

        this.format.attachments.push(tex);
        return this;
    },

    /**
     * Replaces the texture at the specified attachment
     * @param tex {WebGLTexture} the new webgl texture to use for replacement.
     * @param index {number} the attachment on the FBO to replace.
     */
    replaceTexture(tex:WebGLTexture,index:number=0){
        let gl = this.gl;
        this.bind();
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + index, gl.TEXTURE_2D, tex, 0);
        this.unbind();

        return this;

    },

    _throwError(status){
        let gl = this.gl;
        switch(status){
            case gl.FRAMEBUFFER_UNSUPPORTED:
                throw new Error(`FBO ${this.format.name}: Framebuffer unsupported`)
            case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                throw new Error(`FBO ${this.format.name}: Framebuffer incomplete attachment`)
            case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                throw new Error(`FBO ${this.format.name}: Framebuffer incomplete dimensions`)
            case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                throw new Error(`FBO ${this.format.name}: Framebuffer incomplete missing attachment`)

            case gl.FRAMEBUFFER_COMPLETE:
                return true;
            default:
                console.error("unknown error creating framebuffer")
                return false;
        }
    }
};