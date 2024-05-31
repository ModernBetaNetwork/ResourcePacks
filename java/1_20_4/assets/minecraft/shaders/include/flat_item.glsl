const vec2[4] corners = vec2[4](vec2(-1, 1), vec2(-1, -1), vec2(1, -1), vec2(1, 1));
vec2 corner = corners[gl_VertexID % 4];

gl_Position = ProjMat * ModelViewMat * vec4(Position, 1.0);
#ifndef NO_LIGHTMAP
vertexColor = minecraft_mix_light(Light0_Direction, Light1_Direction, Normal, Color) * texelFetch(Sampler2, UV2 / 16, 0);
#endif
if (FogStart < 100000 && abs(length(Normal) - 0.625) < 0.01) //Not in hand or GUI, weird Normal length from display.
{
    vec3 absNormal = IViewRotMat * normalize(Normal);

    if (abs(absNormal.y) - 1 > -0.001) //Check if it isn't throwable.
    {
        vec3 offset = vec3(0, corner.y, 0) * IViewRotMat + vec3(corner.x, 0, 0) * (float(absNormal.y >= -0.1) * 2 - 1);
        gl_Position = ProjMat * ModelViewMat * vec4(Position + offset * 0.25, 1.0);        
    }
    else 
    {
        vec3 offset = vec3(corner * vec2(float(Normal.y > 0) * 2 - 1, 1), 0);

        if (ModelViewMat[0][0] != 1) //Rotate on pickup.
            offset.xz = (IViewRotMat * vec3(offset.x, 0, offset.z)).xz;

        gl_Position = ProjMat * ModelViewMat * vec4(Position + offset * 0.25, 1.0);
    }
    #ifndef NO_LIGHTMAP
    vertexColor = texelFetch(Sampler2, UV2 / 16, 0) * Color;
    #else
    vertexColor = Color;
    #endif
}

/*
MIT License

Copyright (c) 2023 DartCat25

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/