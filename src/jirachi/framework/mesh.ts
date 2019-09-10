import vbo from '../core/vbo'
import vao from '../core/vao'
import {Geometry} from '../interfaces'
import mat4 from '../math/mat4'


/**
 * Basic framework for rendering a 3D mesh.
 */
export default class Mesh {
    gl:any;
    vao:any;
    attributes:any;
    attribData:Array<any>;
    shader:any;
    primMode:number;

    // when instancing, this decribes the number of items to draw.
    numItems:number;

    // if using a framebuffer, stores framebuffer.
    framebuffer:any = null;

    // number of vertices to render
    numVertices:number;

    // whether or not the mesh is an indexed mesh.
    isIndexed:boolean = false;
    indexVbo:any;

    // whether or not the mesh is an instanced mesh.
    isInstanced:boolean = false;

    modelMatrix:Array<number> = mat4.create();


    constructor(shader,geometry?:Geometry) {
        let gl = shader.gl;
        this.gl = shader.gl;
        this.shader = shader;
        this.vao = vao(gl);
        this.attributes = shader.attributes;
        this.attribData = [];
        this.numVertices = 0;

        this.primMode = gl.TRIANGLES;
        // TODO if geometry is not undefined, process it's vertices, etc..
        if(geometry !== undefined){
            this._processGeometry(geometry);
        }
    }

    setPrimitiveMode(mode:number){
        this.primMode = mode;
        return this;
    }

    /**
     * Translate the mesh.
     * @param pos {Array} a 3 component array representing a translation vector
     */
    translate(pos:[number,number,number]){
        this.modelMatrix[12] = pos[0];
        this.modelMatrix[13] = pos[1];
        this.modelMatrix[14] = pos[2];
        return this;
    }

    /**
     * Translates the model matrix in an additive manner.
     * @param pos {Array} a 3 component array representing a translation vector
     */
    additiveTranslate(pos:[number,number,number]){
        mat4.translate(this.modelMatrix,this.modelMatrix,pos);
        return this;
    }

    /**
     * Draws the mesh
     * @param camera {Camera} an object that contains the keys "projectionMatrix" and "viewMatrix"
     */
    draw(camera){
        let gl = this.gl;

        if(this.framebuffer){
            this.framebuffer.bind();
        }

        this.shader.bind();
        this.vao.bind();

        if(camera){
            this.shader.uniform("projectionMatrix",camera.projectionMatrix);
            this.shader.uniform("viewMatrix",camera.viewMatrix);
            this.shader.uniform("modelMatrix",this.modelMatrix);

        }

        this._enableAttributes();

        // TODO handle indexed data + instanced data.

        if(this.isInstanced){

            if(this.isIndexed){
                this.indexVbo.bind();
                gl.drawElementsInstanced(this.primMode,this.numVertices, gl.UNSIGNED_SHORT,0,this.numItems);
                this.indexVbo.unbind();
            }else{
                gl.drawArraysInstanced(this.primMode,0,this.numVertices,this.numItems);
            }
        }else{
            if(this.isIndexed){

                this.indexVbo.bind();
                gl.drawElements(this.primMode,this.numVertices,gl.UNSIGNED_SHORT,0);
                this.indexVbo.unbind();
            }else{

                gl.drawArrays(this.primMode,0,this.numVertices);
            }
        }

        this._disableAttributes();
        this.vao.unbind();

        if(this.framebuffer){
            this.framebuffer.unbind();
        }
    }

    /**
     * Sets a uniform value on the mesh. Note that this runs the general shader uniform function so it may or may not work
     * depending on the value that you would like to send.
     * @param name {string} the name of the uniform.
     * @param value {*} the value for the uniform
     */
    uniform(name,value){
        this.shader.uniform(name,value);
        return this;
    }

    /**
     * Processes a geometry object.
     * @param geo {Geometry} a Geometry object
     * @private
     */
    _processGeometry(geo:Geometry){

        // add positions because we at least know that should exist.
        this.addAttribute('position',geo.vertices);

        // add uvs
        if(geo.uvs.length > 0){
            this.addAttribute('uv',geo.uvs,{
                size:2
            });
        }

        // add indices
        if(geo.indices.length > 0){
            this.addIndexBuffer(geo.indices);
        }

    }

    /**
     * Enables all attributes for the the mesh.
     * @private
     */
    _enableAttributes(){
        for(let i in this.attributes){
            let attrib = this.attributes[i];
            this.vao.enable(attrib.location);
        }
    }

    /**
     * Disables all attributes for the mesh.
     * @private
     */
    _disableAttributes(){
        for(let i in this.attributes){
            let attrib = this.attributes[i];
            this.vao.disable(attrib.location);
        }
    }

    scale(scale:[number,number,number]){
        this.modelMatrix = mat4.scale(this.modelMatrix,this.modelMatrix,scale);

        return this;
    }
    /**
     * Sets an fbo for the mesh  - if set, mesh will draw onto FBO instead of
     * rendering to screen.
     * @param fbo
     */
    setFbo(fbo:WebGLFramebuffer){
        this.framebuffer = fbo;
        return this;
    }

    /**
     * When rendering onto a framebuffer, this will return the Texture associated with
     * COLOR_ATTACHMENT0.
     *
     * If not rendering with a framebuffer, will just return the mesh object
     */
    getRenderedMesh(){
        if(this.framebuffer){
            return this.framebuffer.getColorTexture();
        }else {
            console.warn("Mesh::getRenderedMesh called with no FBO assigned. Returning mesh object");
            return this;
        }
    }


    /**
     * Adds an indices to a mesh
     * @param data {Array} array of indices to utilize.
     */
    addIndexBuffer(data:Array<any>){
        let gl = this.gl;
        this.vao.bind();

        let arr = new Uint16Array(data);
        this.indexVbo = vbo(gl,true,arr);

        this.vao.unbind();
        this.isIndexed = true;
        this.numVertices = data.length;
        return this;
    }

    /**
     * Adds an instanced attribute
     * @param name {string} name for the attribute
     * @param data {Array} data to populate attribute buffer
     * @param size {number} the size of each component of the attribute ie 3d position would be 3
     * @param divisor {number} number of instances that will get run during update. Usually 1 is fine
     * @param normalized {number} whether or not the data is normalized.
     * @param format {number} GLenum of what type of data the attribute contains - ie gl.FLOAT
     * @param stride
     * @param offset
     */
    addInstancedAttribute(name:string,data:Array<any>,{
        size=3,
        divisor=1,
        normalized=this.gl.FALSE,
        format=this.gl.FLOAT,
        stride=0,
        offset=0
    }={}){

        this.addAttribute(name,data,{
            size:size,
            normalized:normalized,
            format:format,
            stride:stride,
            offset:offset
        });

        let attrib = this.attributes[name];
        this.vao.bind();

        attrib.buffer.bind();
        this.vao.makeInstancedAttribute(attrib.location,divisor);
        attrib.buffer.unbind();
        this.vao.unbind();

        this.isInstanced = true;

    }

    /**
     * Adds an attribute to the mesh via a buffer instead of an array.
     * @param name {string} name of the attribute in the shader
     * @param buffer {WebGLBuffer} a WebGL buffer of pre-loaded data.
     * @param size {number} the size of each component per vertex
     * @param normalized {boolean} whether or not the data is normalized
     * @param format {number} GLenum indicating the type of information for the attribute.
     */
    addAttributeBuffer(name:string,buffer:any,{
        size=3,
        normalized=this.gl.FALSE,
        format=this.gl.FLOAT,
        stride=0,
        offset=0
    }={}) {

        this.vao.bind();
        buffer.bind();

        // check to see if we already have an attribute for the data
        if(this.attributes.hasOwnProperty(name)){
            let attrib  = this.attributes[name];
            this.vao.enable(attrib.location);
            this.vao.assignData(attrib.location,size,format,normalized,stride,offset);
            attrib["data"] = null;
            attrib["buffer"] = buffer;
            this.vao.disable(attrib.location);
            this.attribData.push(attrib);
        }else{
            // create a new attribute and assign it a location
            let loc = this.attribData.length;
            let attrib = {
                location:loc,
                name:name,
                data:null,
                buffer:buffer
            }
            this.gl.bindAttribLocation(this.shader,attrib.location,name);
            this.vao.enable(loc);
            this.vao.assignData(loc,size,format,normalized,stride,offset);
            this.vao.disable(attrib.location);
            this.attribData.push(attrib);
        }
        buffer.unbind();
        this.vao.unbind();

    }

    /**
     * Adds an instanced attribute to the mesh via a buffer instead of an array.
     * @param name {string} name of the attribute in the shader
     * @param buffer {WebGLBuffer} a WebGL buffer of pre-loaded data.
     * @param size {number} the size of each component per vertex
     * @param normalized {boolean} whether or not the data is normalized
     * @param format {number} GLenum indicating the type of information for the attribute.
     */
    addInstancedAttributeBuffer(name:string,buffer:any,{
        size=3,
        normalized=this.gl.FALSE,
        format=this.gl.FLOAT,
        stride=0,
        offset=0,
        divisor=1,
        numItems=100
    }={}) {

        this.vao.bind();
        buffer.bind();

        // check to see if we already have an attribute for the data
        if(this.attributes.hasOwnProperty(name)){
            let attrib  = this.attributes[name];
            this.vao.enable(attrib.location);
            this.vao.assignData(attrib.location,size,format,normalized,stride,offset);
            attrib["data"] = null;
            attrib["buffer"] = buffer;
            this.vao.makeInstancedAttribute(attrib.location,divisor);
            this.vao.disable(attrib.location);
            this.attribData.push(attrib);
        }else{
            // create a new attribute and assign it a location
            let loc = this.attribData.length;
            let attrib = {
                location:loc,
                name:name,
                data:null,
                buffer:buffer
            }
            this.gl.bindAttribLocation(this.shader,attrib.location,name);
            this.vao.enable(loc);
            this.vao.assignData(loc,size,format,normalized,stride,offset);
            this.vao.makeInstancedAttribute(loc,divisor);
            this.vao.disable(attrib.location);
            this.attribData.push(attrib);
        }
        buffer.unbind();
        this.vao.unbind();


        this.isInstanced = true;
        this.numItems = numItems;
        return this;

    }
    /**
     * Add an attribute to the mesh
     * @param name {string} name of the attribute in the shader
     * @param data {Array} data array of attribute info
     * @param size {number} the size of each component per vertex
     * @param normalized {boolean} whether or not the data is normalized
     * @param format {number} GLenum indicating the type of information for the attribute.
     */
    addAttribute(name:string,data:Array<any>,{
        size=3,
        normalized=this.gl.FALSE,
        format=this.gl.FLOAT,
        stride=0,
        offset=0
    }={}){

        let arr = null;

        // determing the type of TypedArray to use.
        // TODO could use more work for specifics
        if(format == this.gl.FLOAT){
            arr = new Float32Array(data);
        }else{
            arr = new Uint16Array(data);
        }

        // bind vao and build buffer for attribute
        this.vao.bind();
        let buffer = vbo(this.gl,false,arr);


        buffer.bind();

        // check to see if we already have an attribute for the data
        if(this.attributes.hasOwnProperty(name)){
            let attrib  = this.attributes[name];
            this.vao.enable(attrib.location);
            this.vao.assignData(attrib.location,size,format,normalized,stride,offset);
            attrib["data"] = arr;
            attrib["buffer"] = buffer;
            this.vao.disable(attrib.location);
            this.attribData.push(attrib);
        }else{
            // create a new attribute and assign it a location
            let loc = this.attribData.length;
            let attrib = {
                location:loc,
                name:name,
                data:data,
                buffer:buffer
            }
            this.gl.bindAttribLocation(this.shader,attrib.location,name);
            this.vao.enable(loc);
            this.vao.assignData(loc,size,format,normalized,stride,offset);
            this.vao.disable(attrib.location);
            this.attribData.push(attrib);
        }


        // figure out the number of vertices to use when drawing.
        if(name === "position" || name === "Position"){
            this.numVertices = data.length / size;
        }

        buffer.unbind();
        this.vao.unbind();

        return this;
    }

    /**
     * Sets the numItems property of the mesh. Used when drawings an instance mesh.
     * @param itms{number} the number of instances to draw
     */
    setNumItems(itms:number=1){
        this.numItems = itms;
        return this;
    }

    /**
     * Allows you to set the number of vertices manually.
     */
    setNumVertices(num:number){

        this.numVertices = num;
        return this;
    }

    // returns data associated with an attribute.
    getAttributeData(name:string){

    }

}