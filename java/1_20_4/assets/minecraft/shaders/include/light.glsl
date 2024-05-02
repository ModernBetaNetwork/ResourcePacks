#version 150

#define MINECRAFT_LIGHT_POWER   (0.6)
#define MINECRAFT_AMBIENT_LIGHT (0.4)

vec4 minecraft_mix_light(vec3 lightDir0, vec3 lightDir1, vec3 normal, vec4 color) {
    lightDir0 = normalize(lightDir0);
    lightDir1 = normalize(lightDir1);
    float light0 = max(0.0, dot(lightDir0, normal));
    float light1 = max(0.0, dot(lightDir1, normal));
    float lightAccum = min(1.0, (light0 + light1) * MINECRAFT_LIGHT_POWER + MINECRAFT_AMBIENT_LIGHT);
    
	return vec4(color.rgb * lightAccum, color.a);
	
	//return vec4(1,0,0,1);
}

vec4 minecraft_sample_lightmap(sampler2D lightMap, ivec2 uv) {
	
    //return texture(lightMap, clamp(uv / 256.0, vec2(0.5 / 16.0), vec2(15.5 / 16.0)));
	
	// by shmoobalizer
    vec3 mapZero = texelFetch(lightMap, ivec2(0), 0).rgb;
	vec4 lightTex = texture(lightMap, clamp(uv / 256.0, vec2(0.5 / 16.0), vec2(15.5 / 16.0)));
	vec3 greyScale = vec3(0.21,0.72,0.07);
    if (mapZero.g > mapZero.r) { // in end
        return lightTex;
    } else {
	    return vec4(vec3(dot(lightTex.rgb, greyScale)), lightTex.a);
    }
}
