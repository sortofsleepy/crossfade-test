import {ShaderSpec} from '../interfaces'
import {log,logError} from '../utils'

/**
 * Default function for creating a GLSL shader
 * @param gl {WebGLRenderingContext} a webgl context
 * @param spec {ShaderSpec} a object implementing ShaderSpec interface describing shader settings.
 */
export default function(gl,spec:ShaderSpec){

    if(spec === undefined){
        return;
    }

    let shader = gl.createProgram();

    for(let i in Shader.prototype){
        shader[i] = Shader.prototype[i];
    }


    let glsl = new Shader(gl,spec);
    Object.assign(shader,glsl);

    shader.loadShader();

    return shader;

}

/**
 * The class to augment the WebGLProgram
 * @param gl
 * @param spec
 * @constructor
 */
function Shader(gl,spec:ShaderSpec){

    this.gl = gl;
    this.uniforms = spec.uniforms !== undefined ? spec.uniforms : {};
    this.attributes = spec.attributes !== undefined ? spec.attributes : {};
    this.version = `#version ${spec.version} \n`;
    this.precision = "highp float";
    this.spec = spec;
    this.name = spec.name;
}

Shader.prototype = {

    /**
     * Loads a shader
     * @param vertex {string} source for the vertex shader
     * @param fragment {string} source for the fragment shader.
     */
    loadShader(vertex:string=this.spec.vertex,fragment:string = this.spec.fragment){
        let gl = this.gl;

        vertex = this.version + vertex;
        fragment = this.version + fragment;


        let vShader = this._compileShader(gl.VERTEX_SHADER,vertex);
        let fShader = this._compileShader(gl.FRAGMENT_SHADER,fragment);

        // attach shaders
        gl.attachShader(this,vShader);
        gl.attachShader(this,fShader);

        // if transform feedback is being used, we need to parse varyings before linking program.
        this._parseTransformFeedback();

        // link program
        gl.linkProgram(this);

        gl.deleteShader(vShader);
        gl.deleteShader(fShader);

        if(!gl.getProgramParameter(this,gl.LINK_STATUS)){
            logError(`Could not initialize WebGLProgram ${this.name}`);
            throw ("Couldn't link shader program - " + gl.getProgramInfoLog(this));
        }else{

            // if debugging is on
            if(window["jraDebug"]){
                if(this.name !== ""){
                    log(`Shader "${this.name}" compiled successfully`);
                }else{
                    log(`Shader compiled successfully`);
                }
            }

            this._parseActiveAttributes();
            this._parseActiveUniforms();
            return this;
        }
    },

    /**
     * Binds the shader
     */
    bind(){
        this.gl.useProgram(this);
    },

    /**
     * Deletes ahders
     */
    delete(){
        this.gl.deleteProgram(this);
    },

    /**
     * Looks through shader and parses the attribute data of any currently in-use
     * uniform values
     */
    _parseActiveUniforms(){
        let gl = this.gl;

        // set uniforms and their locations (plus default values if specified)
        let numUniforms = gl.getProgramParameter(this,gl.ACTIVE_UNIFORMS);

        // first loop through and save all active uniforms.
        for(let i = 0; i < numUniforms; ++i){
            let info = gl.getActiveUniform(this,i);
            let location = gl.getUniformLocation(this,info.name);
            this.uniforms[info.name] = {
                location:location,
                name:info.name
            };
        }
    },

    /**
     * Helps set up transform feedback when the varyings array and feedback mode are set.
     * @private
     */
    _parseTransformFeedback(){
        if(this.spec.varyings.length > 0 && this.spec.feedbackMode !== null){
            this.setVaryings(this.spec.varyings,this.spec.feedbackMode);
        }
    },

    /**
     * Looks through shader and parses the attribute data of any currently in-use
     * attribute values
     */
    _parseActiveAttributes(){
        let gl = this.gl;

        let attribs = gl.getProgramParameter(this, gl.ACTIVE_ATTRIBUTES);


        for(let i = 0; i < attribs; ++i){
            let attrib = gl.getActiveAttrib(this,i);
            let loc = gl.getAttribLocation(this,attrib.name) ;

            if(loc !== null){
                this.attributes[attrib.name] = {
                    size:attrib.size,
                    name:attrib.name,
                    type:attrib.type,
                    location:loc
                };
            }
        }
    },

    /**
     * Compiles a shader.
     * @param type
     * @param source
     * @returns {*}
     */
    _compileShader(type,source){
        let gl = this.gl;
        let shader = gl.createShader(type);
        let shaderTypeName = ""

        // get the string name of the type of shader we're trying to compile.
        if(type === gl.FRAGMENT_SHADER){
            shaderTypeName = "FRAGMENT"
        }else{
            shaderTypeName = "VERTEX";
        }

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

            if(this.name){
                logError(`Error in ${shaderTypeName} shader compilation with "${this.name}" - ` + gl.getShaderInfoLog(shader) + `\n source was :\n ${source}`,true);
            }else {
                logError(`Error in ${shaderTypeName} shader compilation with ${this.name} - ` + gl.getShaderInfoLog(shader), true);
                console.log(source)
            }

            // just halt execution if we run into an error.
            throw new Error("Shader error - see message");

        } else {
            return shader;
        }
    },

    setVaryings(varyings:Array<string>,mode:number){
        this.gl.transformFeedbackVaryings(this,varyings,mode);
    },

    // ============= HANDLE UNIFORMS ================= //

    /**
     * A general catch-all for calling the correct uniform function
     * @param name {string} name of the uniform
     * @param value {*} value to send to the uniform .
     */
    uniform(name,value){

        if(value instanceof Array || Object.prototype.toString.call(value.buffer) === "[object ArrayBuffer]"){


            switch(value.length){
                case 2:
                    this.vec2(name,value);
                    break;
                case 3:
                    this.vec3(name,value);
                    break;
                case 9:
                    this.mat3(name,value);
                    break;
                case 16:
                    this.mat4(name,value);
                    break;
            }
        }else {

            if(value.toString().search("\.")){
                this.float(name,value);
            }else{
                this.int(name,value);
            }
        }

        return this;
    },

    /**
     * Sets a vec2 uniform on the shader.
     * @param name {string} the name of the uniform
     * @param value {Array} a 2 component array
     */
    vec2(name:string,value:[number,number]){
        if(this.uniforms[name] !== undefined){
            this.gl.uniform2fv(this.uniforms[name].location,value);
        }
        return this;
    },

    /**
     * Sets a vec3 uniform on the shader.
     * @param name {string} the name of the uniform
     * @param value {Array} a 3 component array
     */
    vec3(name:string,value:[number,number,number]){
        if(this.uniforms[name] !== undefined){
            this.gl.uniform3fv(this.uniforms[name].location,value);
        }
        return this;
    },

    /**
     * Sets an int uniform on the shader.
     * @param name {string} the name of the uniform
     * @param value {number} value to set
     */
    int(name:string,value:number){

        if(this.uniforms[name] !== undefined){
            this.gl.uniform1i(this.uniforms[name].location,value);
        }
        return this;
    },

    float(name:string,value:number){
       if(this.uniforms[name] !== undefined){
           this.gl.uniform1f(this.uniforms[name].location,value);
       }
        return this;
    },

    /**
     * Sets a mat4 uniform on the shader.
     * @param name {string} the name of the uniform
     * @param value {Array} a 16 component array
     */
    mat4(name:string,value:[
        number,number,number,number,
        number,number,number,number,
        number,number,number,number,
        number,number,number,number
        ]){

        if(this.uniforms[name] !== undefined){
            this.gl.uniformMatrix4fv(this.uniforms[name].location,false,value);
        }
        return this;
    },

    /**
     * Sets a mat3 uniform on the shader.
     * @param name {string} the name of the uniform
     * @param value {Array} a 9 component array
     */
    mat3(name:string,value:[
        number,number,number,
        number,number,number,
        number,number,number
        ]){

        if(this.uniforms[name] !== undefined){
            this.gl.uniformMatrix3fv(this.uniforms[name].location,false,value);
        }
        return this;
    }
};