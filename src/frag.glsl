precision highp float;

uniform float mixRatio;
uniform float threshold;
uniform sampler2D tDiffuse1;
uniform sampler2D tDiffuse2;
uniform sampler2D tMixTexture;

in vec2 vUv;

out vec4 glFragColor;
void main(){

    vec4 texel1 = texture( tDiffuse1, vUv );
	vec4 texel2 = texture( tDiffuse2, vUv );
    vec4 mixTexture = texture(tMixTexture,vUv);

    vec4 transitionTexel = texture( tMixTexture, vUv );
	float r = mixRatio * (1.0 + threshold * 2.0) - threshold;
    float mixf=clamp((transitionTexel.r - r)*(1.0/threshold), 0.0, 1.0);



    //glFragColor = vec4(threshold,mixRatio,0.0,1.);
    glFragColor = mix(texel1,texel2,mixf);

}