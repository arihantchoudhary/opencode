'use client';

import { useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  planetVertexShader,
  planetFragmentShader,
  skyVertexShader,
  skyFragmentShader,
  starVertexShader,
  starFragmentShader,
  stardropVertexShader,
  stardropFragmentShader,
  crystalVertexShader,
  crystalFragmentShader,
  glowVertexShader,
  glowFragmentShader,
} from './shaders';

// ══════════════════════════════════════════════
// TIMELINE (30 seconds total)
// ══════════════════════════════════════════════
// 0-5s    Surface sunrise, calm
// 5-10s   Camera rises, planets appear
// 10-14s  Full space panorama
// 14-17s  Stars drift, shooting stars
// 17-19s  Stardrop appears as distant light
// 19-25s  Stardrop exploratory journey
// 25-28s  Stardrop approaches, mandala visible
// 28-30s  Stardrop settles, text appears
const T_RISE_START = 4;
const T_RISE_END = 11;
const T_MOTION_START = 13;
const T_MOTION_END = 18;
const T_DIM_START = 16;
const T_DIM_END = 22;
const T_STARDROP_APPEAR = 17;
const T_STARDROP_JOURNEY_END = 27;
const T_SETTLE = 28;
const T_END = 30;

function smoothstep(a: number, b: number, t: number): number {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

function getPhaseProgress(time: number) {
  return {
    cameraRise: smoothstep(T_RISE_START, T_RISE_END, time),
    dimming: smoothstep(T_DIM_START, T_DIM_END, time),
    motion: Math.max(0, smoothstep(T_MOTION_START, T_MOTION_END, time) - smoothstep(T_DIM_END, T_DIM_END + 3, time) * 0.7),
    stardropReveal: smoothstep(T_STARDROP_APPEAR, T_STARDROP_JOURNEY_END, time),
    mandalaOpen: smoothstep(T_STARDROP_JOURNEY_END - 4, T_STARDROP_JOURNEY_END, time),
    textReveal: smoothstep(T_SETTLE, T_END, time),
  };
}

// ══════════════════════════════════════════════
// SKY BACKGROUND
// ══════════════════════════════════════════════
function SkyBackground() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uDimming: { value: 0 },
  }), []);

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    const t = clock.elapsedTime;
    matRef.current.uniforms.uTime.value = t;
    matRef.current.uniforms.uDimming.value = getPhaseProgress(t).dimming;
  });

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[90, 64, 64]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={skyVertexShader}
        fragmentShader={skyFragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ══════════════════════════════════════════════
// TERRAIN (sand dunes / mountains)
// ══════════════════════════════════════════════
function Terrain() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(160, 100, 200, 120);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Multi-octave dune/mountain terrain
      let y = 0;
      y += Math.abs(Math.sin(x * 0.06 + z * 0.04)) * 5;
      y += Math.abs(Math.sin(x * 0.12 - z * 0.07 + 1.5)) * 3;
      y += Math.sin(x * 0.25 + 2.5) * Math.cos(z * 0.2 + 1.0) * 1.5;
      y += Math.sin(x * 0.5 + 4.0) * Math.cos(z * 0.4 + 3.0) * 0.7;
      y += Math.sin(x * 1.0) * Math.cos(z * 0.8) * 0.3;

      // Sharp ridges
      y = Math.pow(Math.max(y, 0), 0.85);

      // Taper edges to avoid hard cutoff
      const edgeFade = Math.min(
        smoothstep(-80, -60, x) * smoothstep(80, 60, x),
        smoothstep(-50, -30, z) * smoothstep(50, 30, z),
      );
      y *= edgeFade;

      pos.setY(i, y - 1);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} position={[0, -9, -25]}>
      <meshStandardMaterial
        color="#8B6914"
        roughness={0.88}
        metalness={0.05}
      />
    </mesh>
  );
}

// ══════════════════════════════════════════════
// STARFIELD
// ══════════════════════════════════════════════
function Starfield({ count = 4000 }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, sizes, offsets, colors, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const off = new Float32Array(count);
    const col = new Float32Array(count * 3);
    const spd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 35 + Math.random() * 45;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      sz[i] = 0.5 + Math.random() * 2.5;
      off[i] = Math.random();
      spd[i] = 0.3 + Math.random() * 1.5;

      const ct = Math.random();
      if (ct < 0.5) {
        col[i * 3] = 0.95 + Math.random() * 0.05;
        col[i * 3 + 1] = 0.93 + Math.random() * 0.07;
        col[i * 3 + 2] = 0.9 + Math.random() * 0.1;
      } else if (ct < 0.7) {
        col[i * 3] = 1.0;
        col[i * 3 + 1] = 0.8 + Math.random() * 0.15;
        col[i * 3 + 2] = 0.6 + Math.random() * 0.2;
      } else if (ct < 0.85) {
        col[i * 3] = 0.7 + Math.random() * 0.2;
        col[i * 3 + 1] = 0.8 + Math.random() * 0.15;
        col[i * 3 + 2] = 1.0;
      } else {
        col[i * 3] = 0.8 + Math.random() * 0.1;
        col[i * 3 + 1] = 0.7 + Math.random() * 0.1;
        col[i * 3 + 2] = 1.0;
      }
    }
    return { positions: pos, sizes: sz, offsets: off, colors: col, speeds: spd };
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uDimming: { value: 0 },
    uMotion: { value: 0 },
    uPixelRatio: { value: 1 },
  }), []);

  const { gl } = useThree();
  uniforms.uPixelRatio.value = gl.getPixelRatio();

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    const t = clock.elapsedTime;
    const phase = getPhaseProgress(t);
    matRef.current.uniforms.uTime.value = t;
    matRef.current.uniforms.uDimming.value = phase.dimming;
    matRef.current.uniforms.uMotion.value = phase.motion;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aOffset" args={[offsets, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
        <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={starVertexShader}
        fragmentShader={starFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ══════════════════════════════════════════════
// PLANET
// ══════════════════════════════════════════════
interface PlanetConfig {
  position: [number, number, number];
  radius: number;
  colors: [string, string, string];
  atmosphereColor: string;
  atmosphereIntensity: number;
  noiseScale: number;
  banding: number;
  craters: number;
  lightDir: [number, number, number];
  rotationSpeed: number;
  orbitRadius?: number;
  orbitSpeed?: number;
  layer: 'bg' | 'mid';
}

function Planet({
  position, radius, colors, atmosphereColor, atmosphereIntensity,
  noiseScale, banding, craters, lightDir, rotationSpeed,
  orbitRadius = 0, orbitSpeed = 0, layer,
}: PlanetConfig) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const [c1, c2, c3] = colors.map((c) => new THREE.Color(c));
  const atmoCol = new THREE.Color(atmosphereColor);

  const uniforms = useMemo(() => ({
    uColor1: { value: c1 },
    uColor2: { value: c2 },
    uColor3: { value: c3 },
    uLightDir: { value: new THREE.Vector3(...lightDir).normalize() },
    uAtmosphereColor: { value: atmoCol },
    uAtmosphereIntensity: { value: atmosphereIntensity },
    uNoiseScale: { value: noiseScale },
    uBanding: { value: banding },
    uCraters: { value: craters },
    uTime: { value: 0 },
    uOpacity: { value: 1 },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = t;
      const { dimming } = getPhaseProgress(t);
      const minOpacity = layer === 'bg' ? 0.08 : 0.12;
      matRef.current.uniforms.uOpacity.value = Math.max(minOpacity, 1 - dimming * 0.85);
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed * 0.005;
    }
    if (groupRef.current && orbitRadius > 0) {
      groupRef.current.position.x = position[0] + Math.sin(t * orbitSpeed) * orbitRadius;
      groupRef.current.position.z = position[2] + Math.cos(t * orbitSpeed) * orbitRadius;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 64, 64]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={planetVertexShader}
          fragmentShader={planetFragmentShader}
          uniforms={uniforms}
          transparent
        />
      </mesh>
    </group>
  );
}

// ══════════════════════════════════════════════
// SHOOTING STARS
// ══════════════════════════════════════════════
interface ShootingStarData {
  start: THREE.Vector3;
  end: THREE.Vector3;
  birthTime: number;
  duration: number;
  color: THREE.Color;
}

function ShootingStars() {
  const groupRef = useRef<THREE.Group>(null);
  const starsRef = useRef<ShootingStarData[]>([]);

  const spawnStar = useCallback((time: number) => {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.6 + 0.2;
    const r = 20 + Math.random() * 15;
    const start = new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    );
    const dir = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      -0.5 - Math.random(),
      (Math.random() - 0.5) * 2,
    ).normalize();
    const end = start.clone().add(dir.multiplyScalar(3 + Math.random() * 5));
    const colors = [new THREE.Color(1, 1, 1), new THREE.Color(0.9, 0.85, 1), new THREE.Color(1, 0.95, 0.8)];
    starsRef.current.push({
      start, end,
      birthTime: time,
      duration: 0.4 + Math.random() * 0.6,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const { motion } = getPhaseProgress(t);
    if (motion > 0.2 && Math.random() < 0.015 * motion) spawnStar(t);
    starsRef.current = starsRef.current.filter((s) => t - s.birthTime < s.duration + 0.5);

    if (!groupRef.current) return;
    while (groupRef.current.children.length > starsRef.current.length) {
      const child = groupRef.current.children[groupRef.current.children.length - 1];
      groupRef.current.remove(child);
      if (child instanceof THREE.Line) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    }

    starsRef.current.forEach((star, i) => {
      const progress = (t - star.birthTime) / star.duration;
      const alpha = progress < 0.5 ? progress * 2 : Math.max(0, 2 - progress * 2);

      if (i >= groupRef.current!.children.length) {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
        const mat = new THREE.LineBasicMaterial({
          color: star.color, transparent: true, opacity: alpha,
          blending: THREE.AdditiveBlending,
        });
        groupRef.current!.add(new THREE.Line(geo, mat));
      }

      const line = groupRef.current!.children[i] as THREE.Line;
      const headPos = new THREE.Vector3().lerpVectors(star.start, star.end, Math.min(progress, 1));
      const tailPos = new THREE.Vector3().lerpVectors(star.start, star.end, Math.max(0, Math.min(progress, 1) - 0.3));
      const posAttr = line.geometry.getAttribute('position') as THREE.BufferAttribute;
      posAttr.setXYZ(0, tailPos.x, tailPos.y, tailPos.z);
      posAttr.setXYZ(1, headPos.x, headPos.y, headPos.z);
      posAttr.needsUpdate = true;
      (line.material as THREE.LineBasicMaterial).opacity = alpha * 0.8;
    });
  });

  return <group ref={groupRef} />;
}

// ══════════════════════════════════════════════
// CRYSTAL PETAL GEOMETRY
// ══════════════════════════════════════════════
function createPetalGeometry(length: number, width: number, thickness: number = 0.025): THREE.BufferGeometry {
  const hw = width / 2;
  const ht = thickness / 2;

  // Flat diamond petal shape with slight thickness
  const vertices = new Float32Array([
    // Top face
    0, ht, length,           // 0: tip
    hw, ht, length * 0.15,   // 1: right-mid
    0, ht, -length * 0.15,   // 2: base
    -hw, ht, length * 0.15,  // 3: left-mid
    // Bottom face
    0, -ht, length,           // 4: tip
    hw, -ht, length * 0.15,   // 5: right-mid
    0, -ht, -length * 0.15,   // 6: base
    -hw, -ht, length * 0.15,  // 7: left-mid
  ]);

  const indices = new Uint16Array([
    // Top face
    0, 1, 3, 1, 2, 3,
    // Bottom face
    4, 7, 5, 5, 7, 6,
    // Side edges
    0, 4, 1, 1, 4, 5,
    1, 5, 2, 2, 5, 6,
    2, 6, 3, 3, 6, 7,
    3, 7, 0, 0, 7, 4,
  ]);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geo.setIndex(new THREE.BufferAttribute(indices, 1));
  geo.computeVertexNormals();
  return geo;
}

// ══════════════════════════════════════════════
// STARDROP ENTITY (core planet + crystal mandala)
// ══════════════════════════════════════════════
function StardropEntity() {
  const groupRef = useRef<THREE.Group>(null);
  const mandalaRef = useRef<THREE.Group>(null);
  const coreMatRef = useRef<THREE.ShaderMaterial>(null);
  const glowMatRef = useRef<THREE.ShaderMaterial>(null);
  const crystalMatRefs = useRef<THREE.ShaderMaterial[]>([]);

  const coreUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uReveal: { value: 0 },
  }), []);

  const glowUniforms = useMemo(() => ({
    uColor: { value: new THREE.Color(1.0, 0.88, 0.55) },
    uIntensity: { value: 0.7 },
    uReveal: { value: 0 },
  }), []);

  // Build crystal petal rings
  const petalRings = useMemo(() => {
    const rings: { geo: THREE.BufferGeometry; angle: number; dist: number; tiltExtra: number }[][] = [];

    // Inner ring: 8 short wide petals
    const inner: typeof rings[0] = [];
    for (let i = 0; i < 8; i++) {
      inner.push({
        geo: createPetalGeometry(0.45, 0.1, 0.02),
        angle: (i / 8) * Math.PI * 2,
        dist: 0.28,
        tiltExtra: 0.1,
      });
    }
    rings.push(inner);

    // Middle ring: 12 medium petals
    const mid: typeof rings[0] = [];
    for (let i = 0; i < 12; i++) {
      mid.push({
        geo: createPetalGeometry(0.85, 0.14, 0.02),
        angle: (i / 12) * Math.PI * 2 + Math.PI / 12,
        dist: 0.3,
        tiltExtra: 0.15,
      });
    }
    rings.push(mid);

    // Outer ring: 16 large petals
    const outer: typeof rings[0] = [];
    for (let i = 0; i < 16; i++) {
      outer.push({
        geo: createPetalGeometry(1.5, 0.2, 0.025),
        angle: (i / 16) * Math.PI * 2 + Math.PI / 16,
        dist: 0.32,
        tiltExtra: 0.22,
      });
    }
    rings.push(outer);

    return rings;
  }, []);

  // Exploratory path through space
  const path = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(22, 14, -55),
    new THREE.Vector3(12, 8, -40),
    new THREE.Vector3(-14, 10, -32),
    new THREE.Vector3(-6, 2, -22),
    new THREE.Vector3(9, -1, -16),
    new THREE.Vector3(3, 8, -10),
    new THREE.Vector3(-3, 4, -6),
    new THREE.Vector3(1, 2, -2),
    new THREE.Vector3(0, 1, 3),
  ]), []);

  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime;
    const { stardropReveal, mandalaOpen } = getPhaseProgress(t);

    // Update core material
    if (coreMatRef.current) {
      coreMatRef.current.uniforms.uTime.value = t;
      coreMatRef.current.uniforms.uReveal.value = stardropReveal;
    }

    // Update glow
    if (glowMatRef.current) {
      glowMatRef.current.uniforms.uReveal.value = stardropReveal;
      const ct = (Math.sin(t * 0.2) + 1) * 0.5;
      glowMatRef.current.uniforms.uColor.value.setRGB(
        0.95 + ct * 0.05, 0.82 + (1 - ct) * 0.1, 0.45 + ct * 0.25,
      );
      glowMatRef.current.uniforms.uIntensity.value = 0.5 + stardropReveal * 0.3;
    }

    // Update crystal materials
    crystalMatRefs.current.forEach((mat) => {
      if (mat) {
        mat.uniforms.uTime.value = t;
        mat.uniforms.uReveal.value = Math.max(0, stardropReveal * 2 - 0.5); // Crystals appear after core
      }
    });

    // Position along path
    if (groupRef.current && stardropReveal > 0) {
      const eased = stardropReveal < 0.5
        ? 2 * stardropReveal * stardropReveal
        : 1 - Math.pow(-2 * stardropReveal + 2, 2) / 2;
      const pos = path.getPointAt(Math.min(eased, 1));
      groupRef.current.position.copy(pos);

      // Gentle hover after settling
      if (stardropReveal >= 1) {
        const st = t - T_STARDROP_JOURNEY_END;
        groupRef.current.position.y += Math.sin(st * 0.4) * 0.04;
        groupRef.current.position.x += Math.sin(st * 0.25) * 0.02;
      }

      // Face camera
      groupRef.current.quaternion.copy(camera.quaternion);
    }

    // Mandala unfold: scale petals based on mandalaOpen
    if (mandalaRef.current) {
      mandalaRef.current.rotation.z = t * 0.04;
      const petalScale = mandalaOpen;
      mandalaRef.current.scale.setScalar(petalScale);
    }
  });

  const storeCrystalRef = useCallback((mat: THREE.ShaderMaterial | null) => {
    if (mat && !crystalMatRefs.current.includes(mat)) {
      crystalMatRefs.current.push(mat);
    }
  }, []);

  return (
    <group ref={groupRef} position={[22, 14, -55]}>
      {/* Planetary core sphere */}
      <mesh>
        <sphereGeometry args={[0.25, 48, 48]} />
        <shaderMaterial
          ref={coreMatRef}
          vertexShader={stardropVertexShader}
          fragmentShader={stardropFragmentShader}
          uniforms={coreUniforms}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* Crystal mandala */}
      <group ref={mandalaRef} scale={0}>
        {petalRings.map((ring, ri) =>
          ring.map((petal, pi) => {
            const dir = new THREE.Vector3(
              Math.cos(petal.angle),
              Math.sin(petal.angle),
              petal.tiltExtra * (ri === 0 ? 0.3 : 0.1),
            ).normalize();
            const q = new THREE.Quaternion().setFromUnitVectors(
              new THREE.Vector3(0, 0, 1), dir,
            );
            const euler = new THREE.Euler().setFromQuaternion(q);
            const pos = dir.clone().multiplyScalar(petal.dist);

            return (
              <mesh
                key={`${ri}-${pi}`}
                geometry={petal.geo}
                position={[pos.x, pos.y, pos.z]}
                rotation={euler}
              >
                <shaderMaterial
                  ref={storeCrystalRef}
                  vertexShader={crystalVertexShader}
                  fragmentShader={crystalFragmentShader}
                  uniforms={{
                    uTime: { value: 0 },
                    uReveal: { value: 0 },
                  }}
                  transparent
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                  side={THREE.DoubleSide}
                />
              </mesh>
            );
          }),
        )}
      </group>

      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[0.6, 32, 32]} />
        <shaderMaterial
          ref={glowMatRef}
          vertexShader={glowVertexShader}
          fragmentShader={glowFragmentShader}
          uniforms={glowUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// ══════════════════════════════════════════════
// CAMERA RIG (rising from surface to space)
// ══════════════════════════════════════════════
function CameraRig() {
  const { camera } = useThree();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const { cameraRise } = getPhaseProgress(t);

    // Surface position: low, looking at horizon
    const startY = 0;
    const startZ = 5;
    const startLookY = 1;
    const startLookZ = -40;

    // Space position: high, looking at center
    const endY = 10;
    const endZ = 8;
    const endLookY = 4;
    const endLookZ = -15;

    const y = startY + (endY - startY) * cameraRise;
    const z = startZ + (endZ - startZ) * cameraRise;
    const lookY = startLookY + (endLookY - startLookY) * cameraRise;
    const lookZ = startLookZ + (endLookZ - startLookZ) * cameraRise;

    // Gentle sway
    const swayX = Math.sin(t * 0.04) * 0.3;
    const swayY = Math.sin(t * 0.025) * 0.15;

    camera.position.set(swayX, y + swayY, z);
    camera.lookAt(0, lookY, lookZ);
  });

  return null;
}

// ══════════════════════════════════════════════
// SCENE MANAGER
// ══════════════════════════════════════════════
function SceneManager({
  onPhaseChange,
  onComplete,
}: {
  onPhaseChange: (phase: number, textReveal: number) => void;
  onComplete: () => void;
}) {
  const lastPhaseRef = useRef(-1);
  const completedRef = useRef(false);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const progress = getPhaseProgress(t);

    let phase = 0;
    if (t < T_RISE_START) phase = 1;
    else if (t < T_RISE_END) phase = 2;
    else if (t < T_MOTION_START) phase = 3;
    else if (t < T_DIM_END) phase = 4;
    else if (t < T_STARDROP_JOURNEY_END) phase = 5;
    else phase = 6;

    if (phase !== lastPhaseRef.current || phase === 6) {
      lastPhaseRef.current = phase;
      onPhaseChange(phase, progress.textReveal);
    }

    if (t >= T_END && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  });

  return null;
}

// ══════════════════════════════════════════════
// PLANETS CONFIGURATION (matching video layout)
// ══════════════════════════════════════════════
const PLANETS: PlanetConfig[] = [
  {
    // Large gas giant (far left, partially behind horizon)
    position: [-22, 4, -50],
    radius: 8,
    colors: ['#8B6914', '#C4A35A', '#6B4226'],
    atmosphereColor: '#D4A574',
    atmosphereIntensity: 0.4,
    noiseScale: 0.3,
    banding: 0.85,
    craters: 0,
    lightDir: [-0.5, 0.3, 0.5],
    rotationSpeed: 0.3,
    orbitRadius: 0.8,
    orbitSpeed: 0.015,
    layer: 'bg',
  },
  {
    // Medium blue planet (left-center)
    position: [-10, 3, -22],
    radius: 2,
    colors: ['#1a4a6a', '#2d6a8a', '#3a8aaa'],
    atmosphereColor: '#5ac8d8',
    atmosphereIntensity: 0.5,
    noiseScale: 0.8,
    banding: 0.3,
    craters: 0.2,
    lightDir: [-0.3, 0.5, 0.4],
    rotationSpeed: 0.5,
    orbitRadius: 0.4,
    orbitSpeed: 0.03,
    layer: 'mid',
  },
  {
    // Small rocky (center-left, closer)
    position: [-4, 5, -18],
    radius: 1.2,
    colors: ['#8B4513', '#A0522D', '#CD853F'],
    atmosphereColor: '#FF8C69',
    atmosphereIntensity: 0.3,
    noiseScale: 1.4,
    banding: 0.05,
    craters: 0.7,
    lightDir: [-0.4, 0.4, 0.5],
    rotationSpeed: 0.6,
    orbitRadius: 0.3,
    orbitSpeed: 0.04,
    layer: 'mid',
  },
  {
    // Small moon (center)
    position: [2, 4, -20],
    radius: 0.7,
    colors: ['#808080', '#A9A9A9', '#696969'],
    atmosphereColor: '#C0C0C0',
    atmosphereIntensity: 0.15,
    noiseScale: 1.8,
    banding: 0,
    craters: 1.0,
    lightDir: [0.3, 0.4, 0.5],
    rotationSpeed: 0.2,
    orbitRadius: 0.2,
    orbitSpeed: 0.05,
    layer: 'mid',
  },
  {
    // Medium orange planet (right)
    position: [10, 2, -28],
    radius: 2.2,
    colors: ['#B5651D', '#D2691E', '#DEB887'],
    atmosphereColor: '#FFD700',
    atmosphereIntensity: 0.4,
    noiseScale: 0.6,
    banding: 0.5,
    craters: 0,
    lightDir: [0.5, 0.5, 0.3],
    rotationSpeed: 0.35,
    orbitRadius: 0.5,
    orbitSpeed: 0.025,
    layer: 'mid',
  },
  {
    // Large icy blue (far right)
    position: [20, -1, -45],
    radius: 5.5,
    colors: ['#B0C4DE', '#6495ED', '#4682B4'],
    atmosphereColor: '#87CEEB',
    atmosphereIntensity: 0.55,
    noiseScale: 0.4,
    banding: 0.2,
    craters: 0,
    lightDir: [0.6, 0.4, 0.3],
    rotationSpeed: 0.2,
    orbitRadius: 1.0,
    orbitSpeed: 0.012,
    layer: 'bg',
  },
  {
    // Distant small purple (top-left)
    position: [-15, 10, -40],
    radius: 1.5,
    colors: ['#483D8B', '#6A5ACD', '#7B68EE'],
    atmosphereColor: '#9370DB',
    atmosphereIntensity: 0.35,
    noiseScale: 0.9,
    banding: 0.15,
    craters: 0.3,
    lightDir: [-0.3, 0.6, 0.4],
    rotationSpeed: 0.4,
    orbitRadius: 0.3,
    orbitSpeed: 0.02,
    layer: 'bg',
  },
];

// ══════════════════════════════════════════════
// MAIN CANVAS EXPORT
// ══════════════════════════════════════════════
interface SpaceSceneProps {
  onPhaseChange: (phase: number, textReveal: number) => void;
  onComplete: () => void;
}

export default function SpaceScene({ onPhaseChange, onComplete }: SpaceSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 65, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#000000']} />

      {/* Sunrise lighting for terrain */}
      <directionalLight position={[-30, 3, -20]} intensity={2.5} color="#FF8040" />
      <directionalLight position={[25, 2, -15]} intensity={0.8} color="#4488CC" />
      <ambientLight intensity={0.08} color="#221133" />

      <CameraRig />
      <SkyBackground />
      <Terrain />
      <Starfield />
      {PLANETS.map((config, i) => (
        <Planet key={i} {...config} />
      ))}
      <ShootingStars />
      <StardropEntity />
      <SceneManager onPhaseChange={onPhaseChange} onComplete={onComplete} />
    </Canvas>
  );
}
