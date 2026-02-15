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

  vec3 noiseCoord = vWorldPos * uNoiseScale;
  vec3 bandedCoord = vec3(noiseCoord.x * 0.3, noiseCoord.y * 3.0, noiseCoord.z * 0.3);
  vec3 mixedCoord = mix(noiseCoord, bandedCoord, uBanding);

  float n1 = fbm(mixedCoord + uTime * 0.02, 4);
  float n2 = fbm(mixedCoord * 2.0 + 100.0, 3);

  float crater = 0.0;
  if (uCraters > 0.0) {
    float cn = snoise(vWorldPos * uNoiseScale * 4.0);
    crater = smoothstep(0.3, 0.35, cn) * uCraters * 0.3;
  }

  float surface = n1 * 0.6 + n2 * 0.3 - crater;

  vec3 col = mix(uColor1, uColor2, smoothstep(-0.3, 0.3, surface));
  col = mix(col, uColor3, smoothstep(0.2, 0.7, surface));

  float NdotL = dot(normal, lightDir);
  float diffuse = smoothstep(-0.15, 0.3, NdotL);
  float ambient = 0.06;

  vec3 halfDir = normalize(lightDir + viewDir);
  float specular = pow(max(dot(normal, halfDir), 0.0), 40.0) * 0.25;

  float rim = 1.0 - max(dot(viewDir, normal), 0.0);
  rim = pow(rim, 3.0);
  vec3 atmosphere = uAtmosphereColor * rim * uAtmosphereIntensity;

  vec3 finalColor = col * (diffuse + ambient) + specular * diffuse + atmosphere;

  gl_FragColor = vec4(finalColor, uOpacity);
}
`;

// ── Background Sky Shader (dramatic sunrise from video) ──
export const skyVertexShader = /* glsl */ `
varying vec3 vWorldDir;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldDir = normalize(worldPos.xyz - cameraPosition);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const skyFragmentShader = /* glsl */ `
${simplexNoise3D}

uniform float uTime;
uniform float uDimming;

varying vec3 vWorldDir;

void main() {
  vec3 dir = normalize(vWorldDir);
  float elev = dir.y;

  // Dramatic sunrise at horizon
  float horizonPeak = exp(-pow((elev + 0.05) / 0.12, 2.0));
  float horizonWide = exp(-pow((elev + 0.0) / 0.25, 2.0));
  float blueAtmo = exp(-pow((elev + 0.08) / 0.06, 2.0));

  // Color palette matching the reference video
  vec3 brightGold = vec3(1.0, 0.72, 0.28);
  vec3 deepOrange = vec3(0.9, 0.3, 0.1);
  vec3 magenta = vec3(0.5, 0.12, 0.25);
  vec3 deepViolet = vec3(0.12, 0.05, 0.18);
  vec3 darkSpace = vec3(0.02, 0.02, 0.05);
  vec3 blueRim = vec3(0.15, 0.35, 0.85);

  // Sky gradient: bottom to top
  vec3 sky = darkSpace;
  sky = mix(deepViolet, sky, smoothstep(0.0, 0.4, elev));
  sky = mix(magenta, sky, smoothstep(-0.15, 0.15, elev));
  sky = mix(deepOrange, sky, smoothstep(-0.25, -0.05, elev));

  // Sunrise glow
  sky += brightGold * horizonPeak * 1.2;
  sky += deepOrange * horizonWide * 0.5;

  // Blue atmospheric rim (thin band just below horizon)
  sky += blueRim * blueAtmo * 0.6;

  // Milky Way band — prominent diagonal arc
  vec3 mwAxis = normalize(vec3(0.4, 0.35, 1.0));
  float mwDist = abs(dot(dir, normalize(cross(mwAxis, vec3(0.0, 1.0, 0.0)))));
  float milkyWay = smoothstep(0.3, 0.0, mwDist);
  float mwCore = smoothstep(0.12, 0.0, mwDist);
  float mwDetail = fbm(dir * 10.0 + uTime * 0.003, 5) * 0.5 + 0.5;
  float mwFine = fbm(dir * 25.0, 3) * 0.5 + 0.5;
  milkyWay *= mwDetail;
  sky += vec3(0.6, 0.55, 0.75) * milkyWay * 0.25;
  sky += vec3(0.8, 0.75, 0.9) * mwCore * mwFine * 0.15;

  // Nebula patches with warm/cool tones
  float neb1 = smoothstep(0.15, 0.55, snoise(dir * 3.5 + vec3(50.0, 0.0, 0.0)));
  float neb2 = smoothstep(0.2, 0.6, snoise(dir * 2.5 + vec3(0.0, 50.0, 0.0)));
  float neb3 = smoothstep(0.1, 0.5, snoise(dir * 4.0 + vec3(0.0, 0.0, 50.0)));
  sky += vec3(0.35, 0.1, 0.45) * neb1 * 0.1;
  sky += vec3(0.1, 0.15, 0.35) * neb2 * 0.08;
  sky += vec3(0.4, 0.2, 0.15) * neb3 * 0.06;

  // Dark shimmer in empty regions
  float shimmer = snoise(dir * 15.0 + uTime * 0.02) * 0.5 + 0.5;
  sky += vec3(0.03, 0.02, 0.05) * shimmer * step(0.3, elev);

  // Dimming for later phases
  float dimAmount = uDimming * 0.85;
  sky = mix(sky, sky * 0.1, dimAmount);
  // Keep Milky Way faintly visible
  sky += vec3(0.4, 0.35, 0.5) * milkyWay * 0.05 * uDimming;

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

  float motionPhase = smoothstep(0.0, 1.0, uMotion);
  pos += normalize(position) * sin(uTime * aSpeed + aOffset) * motionPhase * 0.5;

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  float dist = -mvPos.z;

  float twinkle = sin(uTime * (0.5 + aSpeed) + aOffset * 6.28) * 0.3 + 0.7;

  float keepStar = step(aOffset, 0.15);
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

// ── Stardrop Core Shader (planetary appearance) ──
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
uniform float uReveal;

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vWorldPos;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewDir);
  float NdotV = max(dot(normal, viewDir), 0.0);
  float fresnel = pow(1.0 - NdotV, 2.5);

  // Breathing pulse
  float breath = sin(uTime * 0.7) * 0.1 + 0.9;

  // Planetary surface — warm amber swirling atmosphere
  vec3 swirl = vWorldPos * 3.0 + vec3(uTime * 0.15, uTime * 0.08, uTime * 0.12);
  float n1 = fbm(swirl, 5);
  float n2 = fbm(swirl * 1.5 + 50.0, 4);
  float surface = n1 * 0.6 + n2 * 0.4;

  // Color palette: warm amber/gold with hints of copper
  vec3 amber = vec3(0.95, 0.7, 0.3);
  vec3 gold = vec3(1.0, 0.85, 0.5);
  vec3 copper = vec3(0.8, 0.5, 0.25);
  vec3 cream = vec3(1.0, 0.95, 0.85);

  vec3 surfaceColor = mix(amber, gold, smoothstep(-0.3, 0.2, surface));
  surfaceColor = mix(surfaceColor, copper, smoothstep(0.1, 0.6, n2));
  surfaceColor = mix(surfaceColor, cream, smoothstep(0.4, 0.8, surface) * 0.4);

  // Lighting — warm directional
  vec3 lightDir = normalize(vec3(0.4, 0.6, 0.5));
  float diffuse = smoothstep(-0.1, 0.4, dot(normal, lightDir));

  // Specular highlight
  vec3 halfDir = normalize(lightDir + viewDir);
  float specular = pow(max(dot(normal, halfDir), 0.0), 48.0) * 0.4;

  // Rim glow — warm iridescent
  vec3 rimColor = mix(gold, cream, fresnel);
  vec3 atmosphere = rimColor * fresnel * 0.8;

  // Internal warmth
  float internalGlow = smoothstep(0.3, 0.0, length(vWorldPos)) * 0.2;

  vec3 finalColor = surfaceColor * (diffuse * 0.7 + 0.25) * breath;
  finalColor += specular * cream;
  finalColor += atmosphere;
  finalColor += gold * internalGlow;

  finalColor = min(finalColor, vec3(1.3));
  float alpha = uReveal * (0.9 + fresnel * 0.1);

  gl_FragColor = vec4(finalColor, alpha);
}
`;

// ── Crystal Petal Shader (diamond-like refraction) ──
export const crystalVertexShader = /* glsl */ `
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

export const crystalFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uReveal;

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vWorldPos;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewDir);

  float NdotV = max(dot(normal, viewDir), 0.0);
  float fresnel = pow(1.0 - NdotV, 2.5);

  // Warm crystal color palette
  vec3 goldColor = vec3(1.0, 0.85, 0.5);
  vec3 pearlColor = vec3(0.95, 0.92, 1.0);
  vec3 whiteColor = vec3(1.0, 0.98, 0.95);
  vec3 amberColor = vec3(0.95, 0.75, 0.4);

  // Facet-dependent color variation
  float facetVar = abs(dot(normal, normalize(vec3(0.577, 0.577, 0.577))));
  vec3 baseColor = mix(goldColor, pearlColor, facetVar * 0.5);
  baseColor = mix(baseColor, amberColor, (1.0 - facetVar) * 0.3);

  // Main light
  vec3 lightDir = normalize(vec3(0.3, 0.8, 0.5));
  float diffuse = max(dot(normal, lightDir), 0.0) * 0.4 + 0.6;

  // Sharp specular (crystal highlights)
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec1 = pow(max(dot(normal, halfDir), 0.0), 128.0);
  float spec2 = pow(max(dot(normal, halfDir), 0.0), 32.0) * 0.3;

  // Rainbow refraction at edges
  vec3 refracted = refract(-viewDir, normal, 0.9);
  float rainbow = dot(refracted, lightDir) * 0.5 + 0.5;
  vec3 refractionColor = mix(goldColor, pearlColor, rainbow) * fresnel * 0.3;

  // Edge glow
  float edge = pow(1.0 - abs(NdotV), 4.0);

  // Combine
  vec3 color = baseColor * diffuse;
  color += whiteColor * spec1 * 0.9;
  color += goldColor * spec2;
  color += goldColor * edge * 0.3;
  color += refractionColor;
  color += amberColor * 0.1; // internal glow

  // Gentle breathing
  float breath = sin(uTime * 0.6) * 0.05 + 0.95;
  color *= breath;

  float alpha = (0.55 + fresnel * 0.35 + spec1 * 0.1) * uReveal;

  gl_FragColor = vec4(color, alpha);
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
