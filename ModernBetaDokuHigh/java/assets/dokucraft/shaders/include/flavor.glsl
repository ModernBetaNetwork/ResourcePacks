#ifndef FLAVOR
#define FLAVOR


// Loading screen background color
#define LOADING_BG_DARK_COLOR vec3(0.043, 0.141, 0.207)
#define LOADING_BG_COLOR vec3(0.043, 0.141, 0.207)

// Fix for the gradients on the top/bottom of buttons
#define ENABLE_BUTTON_GRADIENTS
#define BUTTON_GRADIENT_COLOR_A vec3(1, 0.996, 0.596)
#define BUTTON_GRADIENT_COLOR_B vec3(0.847, 0.756, 0.364)

// Grass color multiplier for shader grass effects
#define GRASS_COLOR_MULTIPLIER 0.63

// Procedural water surface colors
#define PROCEDURAL_WATER_COLOR_1 vec3(0.176, 0.678, 0.765)
#define PROCEDURAL_WATER_COLOR_2 vec3(0.297, 0.866, 0.952)
#define PROCEDURAL_WATER_COLOR_3 vec3(0.493, 1.000, 1.000)
#define PROCEDURAL_WATER_COLOR_4 vec3(0.796, 1.000, 1.000)

// Water tint correction weights
#define WATER_TINT_RED   vec3( 1.0,   0.3,   0.6)
#define WATER_TINT_GREEN vec3( 0.0,   1.0,   0.5)
#define WATER_TINT_BLUE  vec3(-0.5,   0.6,   1.0)

// Underwater fog correction weights
#define UNDERWATER_FOG_RED   vec3( 1.0,   0.0,   0.0)
#define UNDERWATER_FOG_GREEN vec3( 0.0,   1.0,   0.2)
#define UNDERWATER_FOG_BLUE  vec3( 0.0,   0.0,   0.25)

// Colors used in the sketch menu background effect.
#define SKETCH_PAPER_COLOR vec3(0.889, 0.8797, 0.862)
#define SKETCH_INK_COLOR vec3(0.231, 0.145, 0)


#endif
