

export default function(options={
    canvas:document.createElement("canvas"),
    width:window.innerWidth,
    height:window.innerHeight,
    glOptions:{
        alpha: true,
        antialias: true,
        depth: true
    }
}){
    // build context
    let gl = options.canvas.getContext("webgl2",options.glOptions);

    // extend GL prototypes
    for(let i in Context.prototype){
        gl[i] = Context.prototype[i];
    }

    // extend other props onto the context
    Object["assign"](gl,new Context(options.width,options.height));

    return gl;
}

/**
 * A class that gets augmented on top of a WebGLContext object
 * @param width {number} the width for the canvas
 * @param height {number} the height for the canvas
 * @constructor
 */
function Context (width=window.innerWidth,height=window.innerHeight){
    this.viewportX = 0;
    this.viewportY = 0;
    this.width = width;
    this.height = height;
}



Context.prototype = {

    /**
     * Sets the viewport for the context
     * @param x {number} x position
     * @param y {number} y position
     * @param width {number} width for viewport
     * @param height {number} height for viewport
     */
    setViewport(x:number=0,y:number=0,width:number=this.width,height:number=this.height){
        this.viewportX = x;
        this.viewportY = y;
        this.width = width;
        this.height = height;

        this.canvas.width = width;
        this.canvas.height = height;

        this.viewport(x,y,width,height);
        return this;
    },

    /**
     * Clears color buffer bit
     */
    clearColorBit(){
        this.clear(this.COLOR_BUFFER_BIT);
        return this;
    },

    /**
     * Clears depth buffer bit.
     */
    clearDepthBit(){
        this.clear(this.DEPTH_BUFFER_BIT);
        return this;
    },

    /**
     * Helper function to set clear color and clear screen in one go.
     * @param r {number} the red component
     * @param g {number} the green component
     * @param b {number} the blue component
     * @param a {number} the alpha component
     */
    clearScreen(r:number=0,g:number=0,b:number=0,a:number=1){
        this.clearColor(r,g,b,a);
        this.viewport(this.viewportX,this.viewportY, this.canvas.width,this.canvas.height);
        this.clear(this.COLOR_BUFFER_BIT | this.DEPTH_BUFFER_BIT);
        return this;
    },

    /**
     * Enables alpha blending
     */
    enableAlphaBlending(){
        this.enable(this.BLEND);
        this.blendFunc(this.SRC_ALPHA,this.ONE_MINUS_SRC_ALPHA);
    },

    /**
     * Sets the size of the gl canvas
     * @param width {Number} Width that the canvas should be. Defaults to entire window
     * @param height { Number} Height that the canvas should be. Defaults to window.innerHeight
     * @returns {RendererFormat}
     */
    setSize(width=window.innerWidth,height=window.innerHeight){
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
        return this;
    },

    /**
     * Helper function to unbind currently bound textures.
     */
    unbindTexture(){
        this.bindTexture(this.TEXTURE_2D,null);
        return this;
    },

    /**
     * Sets the context to be full screen of it's containing element.
     * @param {function} customResizeCallback specify an optional callback to deal with what happens when the screen re-sizes.
     * @returns {WebGLRenderingContext}
     */
    setFullscreen(customResizeCallback=null){

        let parent = this.canvas.parentElement;

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        //set the viewport size
        this.setViewport();

        if(customResizeCallback){
            window.addEventListener("resize",customResizeCallback);
        }else {
            window.addEventListener("resize",() => {

                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;

                this.setViewport(0,0,this.canvas.width,this.canvas.height);
            });
        }
        return this;
    }

};