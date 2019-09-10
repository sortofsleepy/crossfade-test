/**
 Default vertex shader for full screen quad
 */

in vec2 position;
out vec2 vUv;
out vec2 vPosition;
const vec2 scale = vec2(0.5,0.5);


 void main(){
     vPosition = position;
     vUv = position.xy * scale + scale;
     gl_Position = vec4(position,0.0,1.0);
 }