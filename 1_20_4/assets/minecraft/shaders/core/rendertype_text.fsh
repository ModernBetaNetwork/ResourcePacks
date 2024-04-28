#version 150

#moj_import <fog.glsl>

uniform sampler2D Sampler0;

uniform float GameTime;
uniform vec4 ColorModulator;
uniform float FogStart;
uniform float FogEnd;
uniform vec4 FogColor;

in float vertexDistance;
in vec4 vertexColor;
in vec2 texCoord0;

out vec4 fragColor;

void main() {
    vec4 color = texture(Sampler0, texCoord0) * vertexColor * ColorModulator;
	ivec2 texSize = textureSize(Sampler0, 0);
	if (texture(Sampler0, texCoord0).a == 69/255.0) {
		color = vec4(texture(Sampler0, vec2(texCoord0.x,texCoord0.y/7 + floor(fract(GameTime*600)*13)/13 )).rgb,1.0) * vertexColor * ColorModulator;
	}
    if (color.a < 0.1) {
        discard;
    }
    fragColor = linear_fog(color, vertexDistance, FogStart, FogEnd, FogColor);
}
