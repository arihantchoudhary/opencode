// ── Simplex 3D Noise (Ashima Arts / Stefan Gustavson) ──
export const simplexNoise3D = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    value += amplitude * snoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}
`;

// ── Planet Shader ──
export const planetVertexShader = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 vViewDir;
varying vec2 vUv;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPos = worldPos.xyz;
  vViewDir = normalize(cameraPosition - worldPos.xyz);
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const planetFragmentShader = /* glsl */ `
${simplexNoise3D}

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uLightDir;
uniform vec3 uAtmosphereColor;
uniform float uAtmosphereIntensity;
uniform float uNoiseScale;
uniform float uBanding;
uniform float uCraters;
uniform float uTime;
uniform float uOpacity;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 vViewDir;
varying vec2 vUv;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 lightDir = normalize(uLightDir);
  vec3 viewDir = normalize(vViewDir);

  // Surface noise — mix between spherical and banded
  vec3 noiseCoord = vWorldPos * uNoiseScale;
  vec3 bandedCoord = vec3(noiseCoord.x * 0.3, noiseCoord.y * 3.0, noiseCoord.z * 0.3);
  vec3 mixedCoord = mix(noiseCoord, bandedCoord, uBanding);

  float n1 = fbm(mixedCoord + uTime * 0.02, 4);
  float n2 = fbm(mixedCoord * 2.0 + 100.0, 3);

  // Craters
  float crater = 0.0;
  if (uCraters > 0.0) {
    float cn = snoise(vWorldPos * uNoiseScale * 4.0);
    crater = smoothstep(0.3, 0.35, cn) * uCraters * 0.3;
  }

  float surface = n1 * 0.6 + n2 * 0.3 - crater;

  // Color mapping
  vec3 col = mix(uColor1, uColor2, smoothstep(-0.3, 0.3, surface));
  col = mix(col, uColor3, smoothstep(0.2, 0.7, surface));

  // Lighting
  float NdotL = dot(normal, lightDir);
  float diffuse = smoothstep(-0.15, 0.3, NdotL); // soft terminator
  float ambient = 0.06;

  // Specular
  vec3 halfDir = normalize(lightDir + viewDir);
  float specular = pow(max(dot(normal, halfDir), 0.0), 40.0) * 0.25;

  // Rim / atmospheric fringe (Fresnel)
  float rim = 1.0 - max(dot(viewDir, normal), 0.0);
  rim = pow(rim, 3.0);
  vec3 atmosphere = uAtmosphereColor * rim * uAtmosphereIntensity;

  // Final color
  vec3 finalColor = col * (diffuse + ambient) + specular * diffuse + atmosphere;

  gl_FragColor = vec4(finalColor, uOpacity);
}
`;

// ── Background Sky Shader ──
export const skyVertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldDir;

void main() {
  vUv = uv;
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldDir = normalize(worldPos.xyz - cameraPosition);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const skyFragmentShader = /* glsl */ `
${simplexNoise3D}

uniform float uTime;
uniform float uDimming; // 0 = full sunrise, 1 = dark

varying vec2 vUv;
varying vec3 vWorldDir;

void main() {
  vec3 dir = normalize(vWorldDir);

  // Base sunrise gradient
  float horizon = smoothstep(-0.3, 0.4, dir.y);
  float zenith = smoothstep(0.0, 1.0, dir.y);

  vec3 horizonColor = vec3(0.85, 0.55, 0.35);   // warm gold/orange
  vec3 midColor = vec3(0.45, 0.25, 0.55);        // violet
  vec3 zenithColor = vec3(0.08, 0.12, 0.25);     // deep blue
  vec3 lowColor = vec3(0.65, 0.35, 0.45);        // muted pink

  vec3 sky = mix(lowColor, horizonColor, smoothstep(-0.5, -0.1, dir.y));
  sky = mix(sky, midColor, smoothstep(-0.1, 0.3, dir.y));
  sky = mix(sky, zenithColor, smoothstep(0.3, 0.8, dir.y));

  // Add teal accents
  float tealNoise = snoise(dir * 2.0 + uTime * 0.01) * 0.5 + 0.5;
  sky += vec3(0.0, 0.15, 0.2) * tealNoise * 0.15 * (1.0 - zenith);

  // Milky Way band — diagonal arc across the sky
  vec3 mwAxis = normalize(vec3(0.5, 0.3, 1.0));
  float mwDist = abs(dot(dir, cross(mwAxis, vec3(0.0, 1.0, 0.0))));
  float milkyWay = smoothstep(0.25, 0.0, mwDist);
  float mwDetail = fbm(dir * 8.0 + uTime * 0.005, 4) * 0.5 + 0.5;
  milkyWay *= mwDetail;
  sky += vec3(0.7, 0.65, 0.8) * milkyWay * 0.2;

  // Subtle nebula patches
  float nebula1 = smoothstep(0.2, 0.6, snoise(dir * 3.0 + vec3(50.0, 0.0, 0.0)));
  float nebula2 = smoothstep(0.2, 0.6, snoise(dir * 3.0 + vec3(0.0, 50.0, 0.0)));
  sky += vec3(0.3, 0.1, 0.4) * nebula1 * 0.08;
  sky += vec3(0.1, 0.2, 0.3) * nebula2 * 0.06;

  // Dimming
  sky = mix(sky, sky * 0.08, uDimming);

  // Keep milky way faintly visible even when dim
  sky += vec3(0.5, 0.45, 0.6) * milkyWay * 0.04 * uDimming;

  gl_FragColor = vec4(sky, 1.0);
}
`;

// ── Star Particle Shaders ──
export const starVertexShader = /* glsl */ `
attribute float aSize;
attribute float aOffset;
attribute vec3 aColor;
attribute float aSpeed;

uniform float uTime;
uniform float uDimming;
uniform float uMotion;
uniform float uPixelRatio;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vColor = aColor;

  vec3 pos = position;

  // Phase 2 motion: drift
  float motionPhase = smoothstep(0.0, 1.0, uMotion);
  pos += normalize(position) * sin(uTime * aSpeed + aOffset) * motionPhase * 0.5;

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  float dist = -mvPos.z;

  // Twinkle
  float twinkle = sin(uTime * (0.5 + aSpeed) + aOffset * 6.28) * 0.3 + 0.7;

  // Dimming — keep some stars visible
  float keepStar = step(aOffset, 0.15); // ~15% stay bright
  float dimFactor = mix(1.0, mix(0.05, 0.8, keepStar), uDimming);

  vAlpha = twinkle * dimFactor;

  gl_PointSize = aSize * uPixelRatio * (200.0 / dist) * dimFactor;
  gl_Position = projectionMatrix * mvPos;
}
`;

export const starFragmentShader = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float alpha = smoothstep(0.5, 0.1, d) * vAlpha;
  gl_FragColor = vec4(vColor, alpha);
}
`;

// ── Stardrop Shader ──
export const stardropVertexShader = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vWorldPos;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPos = worldPos.xyz;
  vViewDir = normalize(cameraPosition - worldPos.xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const stardropFragmentShader = /* glsl */ `
${simplexNoise3D}

uniform float uTime;
uniform float uPulse;
uniform float uReveal; // 0 = invisible, 1 = fully visible

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vWorldPos;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewDir);

  // Iridescent color based on view angle
  float NdotV = max(dot(normal, viewDir), 0.0);
  float fresnel = pow(1.0 - NdotV, 2.0);

  // Breathing pulse
  float breath = sin(uTime * 0.8) * 0.15 + 0.85;

  // Shifting color palette: gold → pearl → cyan → warm white
  float colorPhase = uTime * 0.15;
  vec3 gold = vec3(1.0, 0.85, 0.5);
  vec3 pearl = vec3(0.95, 0.92, 0.98);
  vec3 cyan = vec3(0.6, 0.9, 0.95);
  vec3 warmWhite = vec3(1.0, 0.97, 0.9);

  float t = fract(colorPhase);
  int phase = int(mod(colorPhase, 4.0));
  vec3 baseColor;
  if (phase == 0) baseColor = mix(gold, pearl, t);
  else if (phase == 1) baseColor = mix(pearl, cyan, t);
  else if (phase == 2) baseColor = mix(cyan, warmWhite, t);
  else baseColor = mix(warmWhite, gold, t);

  // Internal depth — noise-based variation
  float internal = snoise(vWorldPos * 4.0 + uTime * 0.3) * 0.15 + 0.85;

  // Diamond refraction effect
  float refraction = snoise(vWorldPos * 8.0 + viewDir * 2.0) * 0.5 + 0.5;
  vec3 refrColor = mix(baseColor, vec3(1.0), refraction * 0.3);

  // Combine
  vec3 core = refrColor * internal * breath;
  vec3 rim = baseColor * fresnel * 1.5;
  vec3 finalColor = core + rim;

  // Soft glow — never blinding
  finalColor = min(finalColor, vec3(1.2));

  float alpha = uReveal * (0.85 + fresnel * 0.15);

  gl_FragColor = vec4(finalColor, alpha);
}
`;

// ── Stardrop Glow (outer sphere) ──
export const glowVertexShader = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vViewDir = normalize(cameraPosition - worldPos.xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const glowFragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
uniform float uReveal;

varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  float fresnel = pow(1.0 - max(dot(normalize(vViewDir), normalize(vNormal)), 0.0), 2.5);
  float alpha = fresnel * uIntensity * uReveal;
  gl_FragColor = vec4(uColor, alpha);
}
`;

// ── Shooting Star Shader ──
export const shootingStarVertexShader = /* glsl */ `
attribute float aAlpha;
varying float vAlpha;

void main() {
  vAlpha = aAlpha;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const shootingStarFragmentShader = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;

void main() {
  gl_FragColor = vec4(uColor, vAlpha);
}
`;
