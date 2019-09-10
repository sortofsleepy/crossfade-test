import vao from '../core/vao'
import vbo from '../core/vbo'
import createShader from '../core/shader'
import {ShaderFormat} from "../core/formats";

/**
 * A helper for dealing with transform feedback operations.
 */
class TransformFeedback {
    gl:any;
    vaos:[any,any];
    attributes:Array<any> = []
    varyings:Array<any> = [];

    // GLenum dictating how to treat data ie gl.POINTS, gl.TRIANGLES etc.
    feedbackPrim:number;

    feedbackMode:number;

    // number of items to update
    numItems:number;

    flag:number = 0;

    shader:any = null;

    tf:any;

    constructor(gl,{
        numItems = 100
    }={}){
        this.gl = gl;

        this.tf = gl.createTransformFeedback();
        this.feedbackMode = gl.SEPARATE_ATTRIBS;
        this.numItems = numItems;
        this.feedbackPrim = gl.POINTS;

        this.vaos = [
            vao(gl),
            vao(gl)
        ]
    }

    /**
     * Binds vao for use
     */
    bind(){
        this.vaos[this.flag].bind();
    }

    /**
     * Unbinds currently bound vao.
     */
    unbind(){
        this.vaos[this.flag].unbind();
    }

    addAttribute(name:string,data:Array<any>,{
        size=3,
        normalized=this.gl.FALSE,
        format=this.gl.FLOAT,
        stride=0,
        offset=0
    }={}){

        let arr = new Float32Array(data);
        let gl = this.gl;


        let buffer,buffer2;
        let loc = this.attributes.length;

        for(let i = 0 ;i < 2; ++i){

            // bind vao and build buffer for attribute
            this.vaos[i].bind();
            buffer = vbo(this.gl,false,arr);
            buffer2 = vbo(this.gl,false,arr);

            buffer.bind();
            gl.vertexAttribPointer(loc,size,format,normalized,stride,offset);
            gl.enableVertexAttribArray(loc)
            buffer.unbind();

            buffer2.bind();
            gl.vertexAttribPointer(loc,size,format,normalized,stride,offset);
            gl.enableVertexAttribArray(loc)
            buffer2.unbind();
            this.vaos[i].unbind();

        }

        // add attribute to the list.
        this.attributes.push({
            vbos:[buffer,buffer2],
            location: loc,
            size: size,
            type: format,
            normalized: normalized,
            stride: stride,
            offset: offset,
            name: name
        });

        return this;
    }

    update(){

        if(this.shader === null){
            return;
        }
        let gl = this.gl;
        let src = this.flag;
        let dst = (this.flag + 1) % 2;

        this.shader.bind();

        this.vaos[src].bind();

        // discard fragment stage
        gl.enable(gl.RASTERIZER_DISCARD);

        // start transform feedback
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.tf);

        // bind all the buffers to read data from transform feedback process
        this._bindBufferBase(dst);
        this._enableVertexAttribs();

        // start transform feedback
        gl.beginTransformFeedback(this.feedbackPrim);
        gl.drawArrays(this.feedbackPrim, 0, this.numItems);
        gl.endTransformFeedback();


        this.vaos[src].unbind();

        this._unbindBufferBase();
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

        gl.disable(gl.RASTERIZER_DISCARD);
        this.flag =  (this.flag + 1) % 2;
    }

    setShader(vertex:string,varyings:Array<string>,uniforms:Array<any>){

        if(varyings.length > 0){
            varyings.forEach(varying => { this.addVarying(varying); })
        }
        let shaderSource = {
            vertex:vertex,
            fragment:[
                'precision highp float;',
                'out vec4 glFragColor;',
                'void main(){',
                'glFragColor = vec4(1.);',
                '}'
            ]
        }

        this.shader = createShader(this.gl,new ShaderFormat()
            .vertexSource(shaderSource.vertex)
            .fragmentSource(shaderSource.fragment.join(""))
            .setVaryings(this.varyings)
            .setFeedbackMode(this.feedbackMode));


    }

    /**
     * Add varying
     */
    addVarying(name:string){
        this.varyings.push(name);
        return this;
    }

    _bindBufferBase(flag){
        let gl = this.gl;
        let len = this.attributes.length;
        for(let i = 0; i < len; ++i){
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, i,this.attributes[i].vbos[flag]);
        }
    }

    _unbindBufferBase(){
        let gl = this.gl;
        let len = this.attributes.length;
        for(let i = 0; i < len; ++i){
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, i,null);
        }
    }

    /**
     * Enables buffer attribute arrays during the update cycle.
     * @private
     */
    _enableVertexAttribs(){
        let gl = this.gl;
        let len = this.attributes.length;
        this.vaos[this.flag].bind();

        for(let i = 0; i < len; ++i){
            let attrib = this.attributes[i];
            let buffer = this.attributes[i].vbos[this.flag];

            buffer.bind();
            gl.vertexAttribPointer(i,attrib.size,attrib.type,attrib.normalized,attrib.stride,attrib.offset);
            gl.enableVertexAttribArray(i)

        }
    }

    /**
     * Returns VBO of data
     * @param name {string} name of the attribute to retrieve.
     */
    getAttributeData(name:string){
        for(let i = 0; i < this.attributes.length; ++i){
            if(this.attributes[i].name !== undefined){
                return this.attributes[i].vbos[this.flag];
            }
        }
    }

}

export default TransformFeedback;