

export default function(gl){
    let vao = gl.createVertexArray();

    for(let i in Vao.prototype){
        vao[i] = Vao.prototype[i];
    }
    Object.assign(vao,new Vao(gl));

    return vao;
};


function Vao(gl){
    this.gl = gl;
}

Vao.prototype = {

    bind(){
        this.gl.bindVertexArray(this);
    },

    unbind(){
        this.gl.bindVertexArray(null);
    },

    /**
     * Turns the attribute instanced.
     * @param attribute {number} the attribute location that should be instanced.
     * @param divisor {number} A GLuint specifying the number of instances that will pass between updates of the generic attribute. Usually 1 is more than enough.
     */
    makeInstancedAttribute(attribute:number,divisor:number=1){
        let gl = this.gl;
        gl.vertexAttribDivisor(attribute,divisor);
        return this;
    },


    /**
     * Enables an attribute on the Vao
     * @param idx {number} a index value. Should not exceed the number of vertex attributes supported
     * by your graphics card.
     * TODO maybe add a check to insure index is less than max
     */
    enableAttrib(idx=0){
        this.gl.enableVertexAttribArray(idx);
        return this;
    },
    disableAttrib(idx=0){
        this.gl.disableVertexAttribArray(idx);
        return this;
    },
    enable(idx=0){
        this.enableAttrib(idx);
        return this;
    },

    disable(idx){
        this.disableAttrib(idx);
        return this;
    },

    /**
     * Associates the contents of a Vbo with a vertex attribute
     * @param index {number} the index of the vertex attribute to assign data to.
     * @param size {number} A GLint specifying the number of components per vertex attribute. Must be 1, 2, 3, or 4. ie positions have a size of 3 for x,y,z
     * @param type {number} GLenum of the type of data the Vbo contains
     * @param normalized {number} A GLboolean specifying whether integer data values should be normalized into a certain range when being casted to a float.
     * @param stride {number} A GLsizei specifying the offset in bytes between the beginning of consecutive vertex attributes. Cannot be larger than 255. If stride is 0, the attribute is assumed to be tightly packed, that is, the attributes are not interleaved but each attribute is in a separate block, and the next vertex' attribute follows immediately after the current vertex.
     * @param offset {number} A GLintptr specifying an offset in bytes of the first component in the vertex attribute array. Must be a multiple of the byte length of type.
     */
    assignData(
        index:number = 0,
        size:number = 3,
        type:number = this.gl.FLOAT,
        normalized:GLboolean = this.gl.FALSE,
        stride:number = 0,
        offset:number = 0

    ){

        this.gl.vertexAttribPointer(index,size,type,normalized,stride,offset);
        return this;
    }
};
