/**
 * An interface to describe the basic attributes of a texture.
 */
export interface TextureSpec {
    wrapS:number;
    wrapT:number;
    width:number;
    height:number;
    minFilter:number;
    magFilter:number;
    depthType:number;
    data:any;
    // reference to the texture type - ie TEXTURE_2D etc
    target:number

    // number specifying level of detail. Most of the time it just is 0
    level:number;

    // A GLenum specifying the color components in the texture.
    internalFormat:number;

    //A GLenum specifying the format of the texel data.
    // See https://www.khronos.org/registry/webgl/specs/latest/2.0/#3.7.6 for possible combinations
    format:number;

    // reference to texel type, RGB,RGBA
    texelType:number;

    // primarily for FBOs - holds an array of texture indicating all the attachments associated with an FBO.
    // it is always assumed that index 0 is the main color texture.
    attachments:Array<any>;

    // whether or not the texture should be flipped.
    flipY:boolean;

}

/**
 * Basic interface for describing regular or indexed Geometry.
 * Ensures that the object has a set of vertices and indices if need-be
 */
export interface Geometry {
    vertices:Array<number>;
    indices:Array<any>;
    uvs:Array<any>;
}

/**
 * Defines the basic items involved in creating a shader.
 */
export interface ShaderSpec {
    vertex:string;
    fragment:string;
    uniforms:Array<any>;
    attributes:Array<any>;

    // a name to help identify the shader
    name:string;

    // shader version. will almost always be 300 es
    version:string

}

export interface Camera {
    projectionMatrix:Array<any>;
    viewMatrix:Array<any>;
    near:number;
    far:number;
    aspect:number;
    fov:number;
    translate:Function;
    cameraLookAt:Function;
    eye:Array<any>;
    target:Array<any>;
    center:Array<any>;
    position:Array<any>;
    up:Array<any>;
}