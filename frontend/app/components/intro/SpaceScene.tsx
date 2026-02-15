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
  glowVertexShader,
  glowFragmentShader,
  shootingStarVertexShader,
  shootingStarFragmentShader,
} from './shaders';

// ── Timeline phases (seconds) ──
const PHASE_CALM_END = 6;
const PHASE_MOTION_END = 14;
const PHASE_DIM_END = 20;
const PHASE_REVEAL_END = 27;
const PHASE_SETTLE_END = 30;

function getPhaseProgress(time: number) {
  const dimming =
    time < PHASE_MOTION_END
      ? 0
      : time < PHASE_DIM_END
        ? (time - PHASE_MOTION_END) / (PHASE_DIM_END - PHASE_MOTION_END)
        : 1;
  const motion =
    time < PHASE_CALM_END
      ? 0
      : time < PHASE_MOTION_END
        ? (time - PHASE_CALM_END) / (PHASE_MOTION_END - PHASE_CALM_END)
        : Math.max(0, 1 - (time - PHASE_MOTION_END) / 3);
  const stardropReveal =
    time < PHASE_DIM_END
      ? 0
      : time < PHASE_REVEAL_END
        ? (time - PHASE_DIM_END) / (PHASE_REVEAL_END - PHASE_DIM_END)
        : 1;
  const textReveal = time < PHASE_REVEAL_END ? 0 : (time - PHASE_REVEAL_END) / (PHASE_SETTLE_END - PHASE_REVEAL_END);
  return { dimming, motion, stardropReveal, textReveal: Math.min(textReveal, 1) };
}

// ═══════════════════════════════════════════
// SKY BACKGROUND
// ═══════════════════════════════════════════
function SkyBackground() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDimming: { value: 0 },
    }),
    [],
  );

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    const t = clock.elapsedTime;
    matRef.current.uniforms.uTime.value = t;
    matRef.current.uniforms.uDimming.value = getPhaseProgress(t).dimming;
  });

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[80, 64, 64]} />
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

// ═══════════════════════════════════════════
// STARFIELD
// ═══════════════════════════════════════════
function Starfield({ count = 3500 }) {
  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, sizes, offsets, colors, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const off = new Float32Array(count);
    const col = new Float32Array(count * 3);
    const spd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Distribute on a large sphere shell
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 30 + Math.random() * 40;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      sz[i] = 0.5 + Math.random() * 2.5;
      off[i] = Math.random();
      spd[i] = 0.3 + Math.random() * 1.5;

      // Varying star colors: white, warm, cool, blue
      const colorType = Math.random();
      if (colorType < 0.5) {
        col[i * 3] = 0.95 + Math.random() * 0.05;
        col[i * 3 + 1] = 0.93 + Math.random() * 0.07;
        col[i * 3 + 2] = 0.9 + Math.random() * 0.1;
      } else if (colorType < 0.7) {
        col[i * 3] = 1.0;
        col[i * 3 + 1] = 0.8 + Math.random() * 0.15;
        col[i * 3 + 2] = 0.6 + Math.random() * 0.2;
      } else if (colorType < 0.85) {
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

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDimming: { value: 0 },
      uMotion: { value: 0 },
      uPixelRatio: { value: 1 },
    }),
    [],
  );

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
    <points ref={pointsRef}>
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

// ═══════════════════════════════════════════
// PLANET
// ═══════════════════════════════════════════
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
  position,
  radius,
  colors,
  atmosphereColor,
  atmosphereIntensity,
  noiseScale,
  banding,
  craters,
  lightDir,
  rotationSpeed,
  orbitRadius = 0,
  orbitSpeed = 0,
  layer,
}: PlanetConfig) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const [c1, c2, c3] = colors.map((c) => new THREE.Color(c));
  const atmoCol = new THREE.Color(atmosphereColor);

  const uniforms = useMemo(
    () => ({
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
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = t;

      // Fade planets during dimming phase
      const { dimming } = getPhaseProgress(t);
      const targetOpacity = layer === 'bg' ? Math.max(0.1, 1 - dimming * 0.85) : Math.max(0.15, 1 - dimming * 0.7);
      matRef.current.uniforms.uOpacity.value = targetOpacity;
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

// ═══════════════════════════════════════════
// SHOOTING STARS
// ═══════════════════════════════════════════
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
  const meshesRef = useRef<(THREE.Line | null)[]>([]);

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
    const length = 3 + Math.random() * 5;
    const end = start.clone().add(dir.multiplyScalar(length));
    const colors = [new THREE.Color(1, 1, 1), new THREE.Color(0.9, 0.85, 1), new THREE.Color(1, 0.95, 0.8)];

    starsRef.current.push({
      start,
      end,
      birthTime: time,
      duration: 0.4 + Math.random() * 0.6,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const { motion } = getPhaseProgress(t);

    // Spawn shooting stars during motion phase
    if (motion > 0.2 && Math.random() < 0.015 * motion) {
      spawnStar(t);
    }

    // Clean up expired
    starsRef.current = starsRef.current.filter((s) => t - s.birthTime < s.duration + 0.5);

    // Update line meshes
    if (groupRef.current) {
      // Remove old children
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
          const geometry = new THREE.BufferGeometry();
          const positions = new Float32Array(6);
          geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          const material = new THREE.LineBasicMaterial({
            color: star.color,
            transparent: true,
            opacity: alpha,
            blending: THREE.AdditiveBlending,
          });
          const line = new THREE.Line(geometry, material);
          groupRef.current!.add(line);
        }

        const line = groupRef.current!.children[i] as THREE.Line;
        const headPos = new THREE.Vector3().lerpVectors(star.start, star.end, Math.min(progress, 1));
        const tailPos = new THREE.Vector3().lerpVectors(
          star.start,
          star.end,
          Math.max(0, Math.min(progress, 1) - 0.3),
        );

        const posAttr = line.geometry.getAttribute('position') as THREE.BufferAttribute;
        posAttr.setXYZ(0, tailPos.x, tailPos.y, tailPos.z);
        posAttr.setXYZ(1, headPos.x, headPos.y, headPos.z);
        posAttr.needsUpdate = true;

        (line.material as THREE.LineBasicMaterial).opacity = alpha * 0.8;
      });
    }
  });

  return <group ref={groupRef} />;
}

// ═══════════════════════════════════════════
// STARDROP ENTITY
// ═══════════════════════════════════════════
function StardropEntity() {
  const groupRef = useRef<THREE.Group>(null);
  const coreMatRef = useRef<THREE.ShaderMaterial>(null);
  const glowMatRef = useRef<THREE.ShaderMaterial>(null);

  const coreUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPulse: { value: 0 },
      uReveal: { value: 0 },
    }),
    [],
  );

  const glowUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(1.0, 0.92, 0.7) },
      uIntensity: { value: 0.6 },
      uReveal: { value: 0 },
    }),
    [],
  );

  // Curved path for Stardrop's journey through space
  const path = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(15, 8, -20),
      new THREE.Vector3(8, 3, -12),
      new THREE.Vector3(-5, 6, -8),
      new THREE.Vector3(3, -2, -5),
      new THREE.Vector3(-3, 4, -3),
      new THREE.Vector3(1, 1, -2),
      new THREE.Vector3(0, 0, 2),   // Final resting position (center foreground)
    ]);
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const { stardropReveal } = getPhaseProgress(t);

    if (coreMatRef.current) {
      coreMatRef.current.uniforms.uTime.value = t;
      coreMatRef.current.uniforms.uReveal.value = stardropReveal;
    }
    if (glowMatRef.current) {
      glowMatRef.current.uniforms.uReveal.value = stardropReveal;
      // Shift glow color over time
      const colorT = (Math.sin(t * 0.2) + 1) * 0.5;
      glowMatRef.current.uniforms.uColor.value.setRGB(
        0.9 + colorT * 0.1,
        0.8 + (1 - colorT) * 0.12,
        0.6 + colorT * 0.3,
      );
    }

    if (groupRef.current && stardropReveal > 0) {
      // Navigate along the curved path
      const pathProgress = Math.min(stardropReveal, 1);
      // Use eased progress for smoother motion
      const eased = pathProgress < 0.5
        ? 2 * pathProgress * pathProgress
        : 1 - Math.pow(-2 * pathProgress + 2, 2) / 2;
      const pos = path.getPointAt(eased);
      groupRef.current.position.copy(pos);

      // Gentle wobble after settling
      if (stardropReveal >= 1) {
        const settleTime = t - PHASE_REVEAL_END;
        groupRef.current.position.y += Math.sin(settleTime * 0.5) * 0.05;
        groupRef.current.position.x += Math.sin(settleTime * 0.3) * 0.03;
      }
    }
  });

  return (
    <group ref={groupRef} position={[15, 8, -20]} visible>
      {/* Core sphere */}
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
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[0.55, 32, 32]} />
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

// ═══════════════════════════════════════════
// SCENE MANAGER
// ═══════════════════════════════════════════
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
    if (t < PHASE_CALM_END) phase = 1;
    else if (t < PHASE_MOTION_END) phase = 2;
    else if (t < PHASE_DIM_END) phase = 3;
    else if (t < PHASE_REVEAL_END) phase = 4;
    else phase = 5;

    if (phase !== lastPhaseRef.current || phase === 5) {
      lastPhaseRef.current = phase;
      onPhaseChange(phase, progress.textReveal);
    }

    if (t >= PHASE_SETTLE_END && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  });

  return null;
}

// ═══════════════════════════════════════════
// PLANETS CONFIGURATION
// ═══════════════════════════════════════════
const PLANETS: PlanetConfig[] = [
  {
    // Gas giant (far background, large) — Jupiter-like
    position: [-18, 5, -45],
    radius: 8,
    colors: ['#8B6914', '#C4A35A', '#6B4226'],
    atmosphereColor: '#D4A574',
    atmosphereIntensity: 0.4,
    noiseScale: 0.3,
    banding: 0.85,
    craters: 0,
    lightDir: [1, 0.3, 0.5],
    rotationSpeed: 0.3,
    orbitRadius: 1,
    orbitSpeed: 0.02,
    layer: 'bg',
  },
  {
    // Rocky planet (mid) — Mars-like
    position: [10, -3, -20],
    radius: 2.5,
    colors: ['#8B4513', '#A0522D', '#CD853F'],
    atmosphereColor: '#FF8C69',
    atmosphereIntensity: 0.3,
    noiseScale: 1.2,
    banding: 0.1,
    craters: 0.6,
    lightDir: [1, 0.5, 0.3],
    rotationSpeed: 0.6,
    orbitRadius: 0.5,
    orbitSpeed: 0.03,
    layer: 'mid',
  },
  {
    // Icy moon (close, small) — Europa-like
    position: [-6, -2, -10],
    radius: 0.8,
    colors: ['#B0C4DE', '#E0E8F0', '#87CEEB'],
    atmosphereColor: '#ADD8E6',
    atmosphereIntensity: 0.5,
    noiseScale: 2.0,
    banding: 0.05,
    craters: 0.3,
    lightDir: [0.8, 0.4, 0.5],
    rotationSpeed: 0.4,
    orbitRadius: 0.3,
    orbitSpeed: 0.05,
    layer: 'mid',
  },
  {
    // Cloudy planet (mid-far) — Venus-like
    position: [20, 8, -35],
    radius: 4,
    colors: ['#DEB887', '#F5DEB3', '#FAEBD7'],
    atmosphereColor: '#FFE4B5',
    atmosphereIntensity: 0.6,
    noiseScale: 0.5,
    banding: 0.3,
    craters: 0,
    lightDir: [0.5, 0.6, 0.5],
    rotationSpeed: 0.15,
    orbitRadius: 0.8,
    orbitSpeed: 0.015,
    layer: 'bg',
  },
  {
    // Cratered moon (close) — Luna-like
    position: [5, 3, -12],
    radius: 1.2,
    colors: ['#808080', '#A9A9A9', '#696969'],
    atmosphereColor: '#C0C0C0',
    atmosphereIntensity: 0.15,
    noiseScale: 1.5,
    banding: 0,
    craters: 1.0,
    lightDir: [1, 0.2, 0.3],
    rotationSpeed: 0.2,
    orbitRadius: 0.2,
    orbitSpeed: 0.04,
    layer: 'mid',
  },
  {
    // Distant blue-green planet
    position: [-25, -8, -55],
    radius: 5,
    colors: ['#1a4a5a', '#2d7a8a', '#3a9aaa'],
    atmosphereColor: '#5ac8d8',
    atmosphereIntensity: 0.5,
    noiseScale: 0.4,
    banding: 0.4,
    craters: 0,
    lightDir: [0.7, 0.5, 0.3],
    rotationSpeed: 0.25,
    orbitRadius: 1.2,
    orbitSpeed: 0.01,
    layer: 'bg',
  },
];

// ═══════════════════════════════════════════
// CAMERA RIG
// ═══════════════════════════════════════════
function CameraRig() {
  const { camera } = useThree();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // Very gentle sway
    camera.position.x = Math.sin(t * 0.05) * 0.3;
    camera.position.y = Math.sin(t * 0.03) * 0.2;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ═══════════════════════════════════════════
// MAIN CANVAS EXPORT
// ═══════════════════════════════════════════
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
      <CameraRig />
      <SkyBackground />
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
