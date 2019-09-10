import TypedArray = NodeJS.TypedArray;


/**
 * Constructor function
 * @param gl {WebGLRenderingContext} A webgl context
 * @param data {Array} optional array of information
 * @param indexed {boolean} whether or not the function needs to create an IndexedVbo
 */
export default function(gl,indexed:boolean = false, data?:ArrayBufferView){

    let vbo = gl.createBuffer();

    if(indexed){
        for(let i in IndexVbo.prototype){
            vbo[i] = IndexVbo.prototype[i];
        }
        Object.assign(vbo,new IndexVbo(gl));

    }else{
        for(let i in Vbo.prototype){
            vbo[i] = Vbo.prototype[i];
        }

        Object.assign(vbo,new Vbo(gl));
    }

    if(data !== undefined){
        vbo.bufferData(data);
    }

    return vbo;
};


/**
 * Functional definition for a regular VBO buffer
 * @param gl {WebGLRenderingContext} a WebGL context
 * @constructor
 */
function Vbo (gl){
    this.gl = gl;
}

Vbo.prototype = {

    /**
     * Binds this buffer
     */
    bind(){
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this);
    },

    /**
     * Unbinds previously bound buffer
     */
    unbind(){
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER,null);
    },

    /**
     * Buffers data onto a VBO
     * @param target {number} GLenum constant of target time
     * @param data {TypedArray} a TypedArray of information to load into the buffer
     * @param usage {number} GLenum indicating how the data will get used.
     */
    bufferData(
        data:ArrayBufferView,
        usage:number = this.gl.STATIC_DRAW
    ){
        this.bind();
        this.gl.bufferData(this.gl.ARRAY_BUFFER,data,usage);
        this.unbind();

        return this;
    },

    /**
     * Updates the buffer (by running bufferSubData)
     * @param data {TypedArray} TypedArray of data to update.
     * @param offset {number} offset value to use when setting data.
     */
    updateBuffer(data:ArrayBufferView,offset = 0){
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER,offset,data);
        return this;
    }
};

/**
 * Functional definition for an indexed VBO
 * @param gl {WebGLRenderingContext} a WebGLRendering Context
 * @constructor
 */
function IndexVbo(gl){
    this.gl = gl;
}

IndexVbo.prototype = {
    /**
     * Binds this buffer
     */
    bind(){
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,this);
    },

    /**
     * Unbinds previously bound buffer
     */
    unbind(){
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,null);
    },

    /**
     * Buffers data onto a VBO
     * @param target {number} GLenum constant of target time
     * @param data {TypedArray} a TypedArray of information to load into the buffer
     * @param usage {number} GLenum indicating how the data will get used.
     */
    bufferData(
        data:ArrayBufferView,
        usage:number = this.gl.STATIC_DRAW
    ){
        this.bind();
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,data,usage);
        this.unbind();

        return this;
    },

    /**
     * Updates the buffer (by running bufferSubData)
     * @param data {TypedArray} TypedArray of data to update.
     * @param offset {number} offset value to use when setting data.
     */
    updateBuffer(data:ArrayBufferView,offset = 0){
        this.gl.bufferSubData(this.gl.ELEMENT_ARRAY_BUFFER,offset,data);
        return this;
    }
};