declare module '*.glsl' {
    const content:string;
    export default content;
}

declare module '*.frag' {
    const content:string;
    export default content;
}

declare module '*.vert' {
    const content:string;
    export default content;
}

declare interface ObjectConstructor {
    assign(...objects:Object[]):Object;
}

// overrides on the window object so we can customize it a bit.
interface Window {
    FLOAT:any;
    TEXTURE2D:any;
    TEXTURE3D:any;
    TRIANGLES:any;
    RGBA:any;
    SIMD:any;
}

declare module Typekit {
    export function load(opts:Object):void;
}
