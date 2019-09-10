import {TextureSpec,ShaderSpec} from "../interfaces";
import {logError} from "../utils";

/**
 * Helps to define the basic properties of a Texture.
 * Used between standard textures and FBOs
 */
export class TextureFormat implements TextureSpec{
    wrapS:number;
    wrapT:number;
    width:number;
    height:number;
    minFilter:number;
    magFilter:number;
    depthType:number;
    data:any;
    attachments:Array<any>;
    target:number;
    internalFormat:number;
    texelType:number;
    level:number;
    format:number;
    flipY:boolean;

    // a way to help identify an FBO or texture.
    name:string = " ";

    constructor(gl = null,{
        data=null,
        isdepth=false
    }={}){
        if(gl === null){
            logError("Unable to init TextureFormat - no WebGL context")
            return;

        }
        this.wrapS = gl.CLAMP_TO_EDGE;
        this.wrapT = gl.CLAMP_TO_EDGE;
        this.width = 512;
        this.height = 512;
        this.minFilter = gl.NEAREST;
        this.magFilter = gl.NEAREST;
        this.internalFormat = gl.RGB;
        this.format = gl.RGB;
        this.texelType = gl.UNSIGNED_BYTE;
        this.level = 0;
        this.flipY = true;
        this.attachments = [];
        this.data = null;

        if(data !== null){
            this.data = data;
        }
        if(isdepth){

        }else{
            this.target = gl.TEXTURE_2D;
        }

        return this;
    }

    /**
     * Set the width of the texture
     * @param val {number} width for the texture
     */
    setWidth(val:number){
        this.width = val;
        return this;
    }

    /**
     * Sets the height of the texture
     * @param val {number} the height for the texture.
     */
    setHeight(val:number){
        this.height = val;
        return this
    }

    /**
     * Sets the texture target
     * @param val {number} the texture target to use ie TEXTURE_2D, etc.
     */
    setTarget(val:number){
        this.target = val;
        return this;
    }

    /**
     * Sets the internal format for the texture.
     * @param val {number} the webgl enum of the internal format type.
     */
    setInternalFormat(val:number){
        this.internalFormat = val;
        return this;
    }

    /**
     * Toggles whether or not the texture should be flipped on the y axis.
     */
    toggleFlipY(){
        this.flipY = !this.flipY;
        return this;
    }
}

/**
 * This defines the basic attributes of a WebGLProgram
 */
export class ShaderFormat implements ShaderSpec {
    vertex:string;
    fragment:string;
    uniforms:Array<any>;
    attributes:Array<any>;
    name:string = "";
    version:string = "300 es";

    // varying names for transform feedback.
    varyings:Array<string> = [];

    feedbackMode:number = null;

    constructor(vertex=null,fragment=null) {
        this.vertex = vertex !== null ? vertex : "";
        this.fragment = fragment !== null ? fragment : "";
        this.uniforms = [];
        this.attributes = [];
        return this;
    }

    setVaryings(outputs:Array<string>){
        this.varyings = outputs;
        return this
    }

    /**
     * Sets the transform feedback mode
     * @param mode {number} GLenum specifying the feedback mode, either gl.SEPARATE_ATTRIBS or gl.INTERLEAVED_ATTRIBS
     */
    setFeedbackMode(mode:number){
        this.feedbackMode = mode;
        return this;
    }

    /**
     * Sets the vertex source
     * @param source {string} source for the vertex shader
     */
    vertexSource(source:string){
        this.vertex = source;
        return this;
    }

    /**
     * Sets the vertex source
     * @param sources {Array} an array of strings that contain glsl code.
     */
    vertexSources(sources:Array<string>){
        this.vertex = sources.join("\n");
        return this;
    }

    /**
     * Sets the fragment source
     * @param source {string} source for the fragment shader.
     */
    fragmentSource(source:string){
        this.fragment = source;
        return this;
    }

    fragmentSources(sources:Array<string>){
        this.fragment = sources.join("\n");
        return this;
    }

    /**
     * Sets a uniform that should be a part of the shader.
     * @param uni
     */
    uniform(uni){
        this.uniforms.push(uni);
        return this
    }

    /**
     * Sets the shader version.
     * @param ver
     */
    setVersion(ver:string){
        this.version = ver;
        return this;
    }
}