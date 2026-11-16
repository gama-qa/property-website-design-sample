/**
 * Effect layer only: blends two sources (video or flat colour) over a
 * fullscreen quad. No geometry beyond the quad.
 *
 * Colour handling: textures use NoColorSpace and the canvas is `linear flat`,
 * so sRGB values pass through untouched and flat colours match the CSS tokens
 * exactly (the outro must end on #F6F3EE, same as the page).
 */
export const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const fragmentShader = /* glsl */ `
precision highp float;

uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform float uIsColorA;
uniform float uIsColorB;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec2 uSizeA;
uniform vec2 uSizeB;
uniform vec2 uRes;
uniform float uMix;
uniform vec2 uFocus;     // screen uv, y up
uniform float uRadial;   // 1 = radial from focus, 0 = plain noise dissolve
uniform float uTime;
uniform float uGrain;
uniform float uVignette;
uniform float uSharpen;  // unsharp amount while upscaling, 0 = off
uniform float uDimA;     // charcoal veil over layer A (opening title screen)
uniform vec3 uInk;

varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

// object-fit: cover
vec2 coverUv(vec2 uv, vec2 tex) {
  float rs = uRes.x / uRes.y;
  float rt = tex.x / tex.y;
  vec2 scale = rs > rt ? vec2(1.0, rt / rs) : vec2(rs / rt, 1.0);
  return (uv - 0.5) * scale + 0.5;
}

// The footage is smaller than the screen, so plain bilinear upscaling looks
// soft. This restores edge contrast with an unsharp mask on the source texel
// grid, clamped to the local min/max so it cannot ring or halo. uSharpen is 0
// when the video is not being enlarged.
vec3 sharpTex(sampler2D tex, vec2 uv, vec2 size) {
  vec3 c = texture2D(tex, uv).rgb;
  if (uSharpen <= 0.0) return c;
  vec2 px = 1.0 / size;
  vec3 n = texture2D(tex, uv + vec2(0.0, px.y)).rgb;
  vec3 s = texture2D(tex, uv - vec2(0.0, px.y)).rgb;
  vec3 e = texture2D(tex, uv + vec2(px.x, 0.0)).rgb;
  vec3 w = texture2D(tex, uv - vec2(px.x, 0.0)).rgb;
  vec3 lo = min(c, min(min(n, s), min(e, w)));
  vec3 hi = max(c, max(max(n, s), max(e, w)));
  return clamp(c + (c - (n + s + e + w) * 0.25) * uSharpen, lo, hi);
}

vec3 sampleA(vec2 uv) {
  if (uIsColorA > 0.5) return uColorA;
  return sharpTex(uTexA, clamp(coverUv(uv, uSizeA), 0.0, 1.0), uSizeA);
}

vec3 sampleB(vec2 uv) {
  if (uIsColorB > 0.5) return uColorB;
  return sharpTex(uTexB, clamp(coverUv(uv, uSizeB), 0.0, 1.0), uSizeB);
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  float m = uMix;
  vec2 dir = uv - uFocus;

  // Noise is only needed while a transition is running; skip it otherwise
  // (the walkthrough spends almost all its time at m == 0).
  float mask = m >= 1.0 ? 1.0 : 0.0;
  if (m > 0.0 && m < 1.0) {
    if (uRadial > 0.5) {
      float dist = length(dir * vec2(aspect, 1.0));
      float n = fbm(uv * 3.0 + vec2(0.0, uTime * 0.015));
      // Far enough to clear the farthest corner from any focus point.
      float maxR = length(vec2(aspect, 1.0)) + 0.35;
      float r = m * maxR;
      mask = 1.0 - smoothstep(r - 0.3, r, dist + (n - 0.5) * 0.1);
    } else {
      float n = fbm(uv * 4.0);
      mask = smoothstep(n - 0.2, n + 0.2, m * 1.4 - 0.2);
    }
  }

  // Displacement lives only on the moving edge, pushing away from the focus.
  float band = mask * (1.0 - mask) * 4.0;
  vec2 push = normalize(dir + 1e-5) * band * 0.004;

  // Both layers drift forward: A grows as it leaves, B grows into place.
  vec2 uvA = uFocus + (uv - uFocus) * (1.0 - 0.02 * m) - push;
  vec2 uvB = uFocus + (uv - uFocus) * (1.0 + 0.012 * (1.0 - m)) + push * 0.5;

  vec3 colA = mix(sampleA(uvA), uInk, uDimA);
  vec3 col = mask <= 0.0 ? colA : mix(colA, sampleB(uvB), mask);

  float v = smoothstep(0.95, 0.3, length((vUv - 0.5) * vec2(aspect * 0.8, 1.0)));
  col *= mix(1.0 - uVignette, 1.0, v);

  float g = hash(gl_FragCoord.xy + fract(uTime * 24.0) * 97.0) - 0.5;
  col += g * uGrain;

  gl_FragColor = vec4(col, 1.0);
}
`;
