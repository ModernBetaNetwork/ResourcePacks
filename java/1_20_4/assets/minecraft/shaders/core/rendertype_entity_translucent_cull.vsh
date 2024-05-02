#version 150

#moj_import <light.glsl>
#moj_import <fog.glsl>

in vec3 Position;
in vec4 Color;
in vec2 UV0;
in vec2 UV1;
in ivec2 UV2;
in vec3 Normal;

uniform sampler2D Sampler0;
uniform sampler2D Sampler2;

uniform mat4 ModelViewMat;
uniform mat4 ProjMat;
uniform mat3 IViewRotMat;
uniform float FogStart;
uniform int FogShape;

uniform vec3 Light0_Direction;
uniform vec3 Light1_Direction;

out float vertexDistance;
out vec4 vertexColor;
out vec2 texCoord0;
out vec2 texCoord1;
out vec2 texCoord2;
out vec4 normal;

const vec2[4] corners = vec2[4](vec2(-1, 1), vec2(-1, -1), vec2(1, -1), vec2(1, 1));

void main() {
    //gl_Position = ProjMat * ModelViewMat * vec4(Position, 1.0);
	
	vertexColor = vec4(0);
    #moj_import <flat_item.glsl>

    vertexDistance = fog_distance(ModelViewMat, IViewRotMat * Position, FogShape);
    
	//vertexColor = minecraft_mix_light(Light0_Direction, Light1_Direction, Normal, Color) * texelFetch(Sampler2, UV2 / 16, 0);
    // written by shmoobalizer
	vec4 wColor = Color;
	if (fzyEqlV3(Color.rgb,frmHex(0xA06540),0.012)) { // leather
		wColor.rgb = vec3(0.7765,0.3608,0.2078);
	}
	if (fzyEqlV3(Color.rgb,frmHex(0xFC9700),0.012)) { // Fire Resistance
		wColor.rgb = vec3(0.8823,0.5961,0.2235);
	}
	if (fzyEqlV3(Color.rgb,frmHex(0xA76469),0.012)) { // Harming
		wColor.rgb = vec3(0.2588,0.0392,0.0353);
	}
	if (fzyEqlV3(Color.rgb,frmHex(0xF3F3F3),0.012)) { // Invisibility
		wColor.rgb = vec3(0.4941,0.5059,0.5647);
	}
	if (fzyEqlV3(Color.rgb,frmHex(0xFAFC82),0.012)) { // Leaping
		wColor.rgb = vec3(0.1333,0.9882,0.2941);
	}
	if (fzyEqlV3(Color.rgb,frmHex(0x58BF06),0.012)) { // Luck
		wColor.rgb = vec3(0.1961,0.5922,0);
	}
	if (fzyEqlV3(Color.rgb,frmHex(0xC0FC65),0.012)) { // Night Vision
		wColor.rgb = vec3(0.1216,0.1216,0.6235);
	}
	if (fzyEqlV3(Color.rgb,frmHex(0x85A162),0.012)) { // Poison
		wColor.rgb = vec3(0.3020,0.5686,0.1882);
	}
	if (fzyEqlV3(Color.rgb,frmHex(0x89ADDD),0.012)) { // Slowness
		wColor.rgb = vec3(0.3490,0.4196,0.4980);
	}
	if (fzyEqlV3(Color.rgb,frmHex(0xFCC500),0.012)) { // Strength
		wColor.rgb = vec3(0.5686,0.1412,0.1372);
	}
	if (fzyEqlV3(Color.rgb,frmHex(0x32E8FC),0.012)) { // Swiftness
		wColor.rgb = vec3(0.4824,0.6784,0.7686);
	}
	if (fzyEqlV3(Color.rgb,frmHex(0x8B80E3),0.02)) { // Turtle Master
		wColor.rgb = vec3(0.4471,0.3569,0.3882);
	}
	if (fzyEqlV3(Color.rgb,frmHex(0x96D7BE),0.012)) { // Water Breathing
		wColor.rgb = vec3(0.1765,0.3177,0.5922);
	}
	// sample lightmap directly for custom color + tint.
	vertexColor = minecraft_mix_light(Light0_Direction, Light1_Direction, Normal, wColor) * minecraft_sample_lightmap(Sampler2, UV2);
    
	texCoord0 = UV0;
    texCoord1 = UV1;
    texCoord2 = UV2;
    normal = ProjMat * ModelViewMat * vec4(Normal, 0.0);
}
