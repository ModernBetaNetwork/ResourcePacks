#version 150

#moj_import <fog.glsl>

in vec3 Position;
in vec4 Color;

uniform mat4 ModelViewMat;
uniform mat4 ProjMat;

out vec4 vertexColor;

bool rougheq(vec3 a, vec3 b) {
    return all(lessThan(abs(a - b), vec3(0.01)));
}
vec2 corners[4] = vec2[4](vec2(-1, -1), vec2(1, -1), vec2(1, 1), vec2(-1, 1));

void main() {

	// written by shmoobalizer
	vec3 colorHSV = toHsv(Color.rgb);
	if (distance(Color.rgb,frmHex(0x100010)) < 0.003) { // backplate
	    vertexColor = vec4(0,0,0,0.75);
	} else if (distance(colorHSV.x,0.717) < 0.003) { // line
		vertexColor = vec4(0,0,0,0);
	} else if (Position.z == 0) { // dura
		if (fzyEqlV3(Color.rgb,frmHex(0x08FF00),0.07)) {
			vertexColor = Color;
		} else if (fzyEqlV3(Color.rgb,frmHex(0x19FF00),0.09)) {
			vertexColor = Color - Color * 12/255;
		} else if (fzyEqlV3(Color.rgb,frmHex(0x3CFF00),0.09)) {
			vertexColor = Color - Color * 28/255;
		} else if (fzyEqlV3(Color.rgb,frmHex(0x67FF00),0.09)) {
			vertexColor = Color - Color * 53/255;
		} else if (fzyEqlV3(Color.rgb,frmHex(0x8AFF00),0.09)) {
			vertexColor = Color - Color * 72/255;
		} else if (fzyEqlV3(Color.rgb,frmHex(0xB5FF00),0.09)) {
			vertexColor = Color - Color * 94/255;
		} else if (fzyEqlV3(Color.rgb,frmHex(0xD8FF00),0.09)) {
			vertexColor = Color - Color * 110/255;
		} else if (fzyEqlV3(Color.rgb,frmHex(0xFFFA00),0.09)) {
			vertexColor = Color - Color * 127/255;
		} else if (fzyEqlV3(Color.rgb,frmHex(0xFFCF00),0.09)) {
			vertexColor = Color - Color * 120/255;
		} else if (fzyEqlV3(Color.rgb,frmHex(0xFFAC00),0.09)) {
			vertexColor = Color - Color * 110/255;
		} else if (fzyEqlV3(Color.rgb,frmHex(0xFF8100),0.09)) {
			vertexColor = Color - Color * 92/255;
		} else if (fzyEqlV3(Color.rgb,frmHex(0xFF5F00),0.10)) {
			vertexColor = Color - Color * 73/255;
		} else if (fzyEqlV3(Color.rgb,frmHex(0xFF3300),0.15)) {
			vertexColor = Color - Color * 45/255;
		} else {
			vertexColor = Color;
		}
	} else {
		vertexColor = Color;
	}
	// thanks Godlander ^w^
    vec3 pos = Position;
    if (Position.x <= 2 && Position.z == 50 && Color.r > 0.3) vertexColor = vec4(0);
    if (Position.z == 0) {
        if (rougheq(Color.rgb, vec3(51,51,170)/255.)) vertexColor = vec4(0);
        if (rougheq(Color.rgb, vec3(204)/255.)) pos.x = corners[(gl_VertexID+2)%4].x-1.0;
    }
    gl_Position = ProjMat * ModelViewMat * vec4(pos, 1.0);
}
