
uniform sampler2D inputTexture;
in  vec2 vUv;
out vec4 glFragColor;

void main(){

   #ifdef HAS_TEXTURE
        vec4 data = texture(inputTexture,vUv);
        glFragColor = data;
   #else
        glFragColor = vec4(1.0);
   #endif

}