'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface BuoySceneProps {
  alert: boolean;
  pumping: boolean;
  dist: number;
}

function Ocean() {
  const mesh = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(16, 16, 80, 80);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    const pos = mesh.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y =
        Math.sin(x * 0.55 + t * 1.1) * 0.08 +
        Math.cos(z * 0.45 + t * 0.85) * 0.06 +
        Math.sin((x + z) * 0.3 + t * 1.4) * 0.04;
      pos.setY(i, y - 0.95);
    }
    pos.needsUpdate = true;
    mesh.current.geometry.computeVertexNormals();
  });

  return (
    <mesh ref={mesh} geometry={geo} receiveShadow>
      <meshStandardMaterial
        color="#0a3d5c"
        transparent
        opacity={0.92}
        roughness={0.15}
        metalness={0.35}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function FoamRings() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.children.forEach((c, i) => {
      const t = (state.clock.elapsedTime * 0.4 + i * 1.2) % 4;
      c.scale.setScalar(0.8 + t * 0.9);
      const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = Math.max(0, 0.25 - t * 0.06);
    });
  });
  return (
    <group ref={ref} position={[0, -0.88, 0]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 1.05, 48]} />
          <meshBasicMaterial color="#8ecae6" transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function UnderwaterGlow() {
  return (
    <mesh position={[0, -1.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[6, 48]} />
      <meshBasicMaterial color="#0b4a6e" transparent opacity={0.35} />
    </mesh>
  );
}

function BuoyBody({ alert, pumping }: { alert: boolean; pumping: boolean }) {
  const ledRef = useRef<THREE.Mesh>(null);
  const pumpRef = useRef<THREE.Mesh>(null);
  const floatRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (floatRef.current) {
      floatRef.current.position.y = Math.sin(t * 0.9) * 0.04;
      floatRef.current.rotation.z = Math.sin(t * 0.55) * 0.03;
      floatRef.current.rotation.x = Math.cos(t * 0.4) * 0.02;
    }
    if (ledRef.current) {
      const mat = ledRef.current.material as THREE.MeshStandardMaterial;
      if (alert) {
        mat.emissiveIntensity = 0.9 + Math.sin(t * 10) * 0.5;
        mat.color.set('#E0653B');
        mat.emissive.set('#E0653B');
      } else {
        mat.emissiveIntensity = 0.4;
        mat.color.set('#2FBE96');
        mat.emissive.set('#2FBE96');
      }
    }
    if (pumpRef.current) {
      const mat = pumpRef.current.material as THREE.MeshStandardMaterial;
      if (pumping) {
        mat.emissiveIntensity = 1 + Math.sin(t * 14) * 0.4;
        mat.emissive.set('#2FBE96');
      } else {
        mat.emissiveIntensity = 0.25;
        mat.emissive.set('#E3A857');
      }
    }
  });

  return (
    <group ref={floatRef} position={[0, 0.2, 0]}>
      <mesh position={[0, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.72, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#c8d4e0" metalness={0.55} roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <torusGeometry args={[0.7, 0.06, 12, 40]} />
        <meshStandardMaterial color="#E3A857" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.52, 0.58, 1.55, 32]} />
        <meshStandardMaterial color="#0F2E4D" metalness={0.45} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.535, 0.535, 0.12, 32]} />
        <meshStandardMaterial color="#2FBE96" metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.42, 0]}>
        <sphereGeometry args={[0.14, 16, 12]} />
        <meshStandardMaterial color="#1a2a3a" metalness={0.6} roughness={0.2} transparent opacity={0.85} />
      </mesh>
      <Text position={[0, 1.62, 0]} fontSize={0.06} color="#EFE7D8" anchorX="center">GPS</Text>
      <mesh position={[0, 0.75, 0.5]}>
        <boxGeometry args={[0.38, 0.24, 0.05]} />
        <meshStandardMaterial color="#0B2440" metalness={0.5} roughness={0.25} />
      </mesh>
      <Text position={[0, 0.75, 0.54]} fontSize={0.05} color="#2FBE96" anchorX="center">ESP32</Text>
      <mesh position={[0, 0.2, 0.55]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial
          color={alert ? '#E0653B' : '#E3A857'}
          emissive={alert ? '#E0653B' : '#E3A857'}
          emissiveIntensity={alert ? 0.8 : 0.3}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
      {[[-0.32, -0.05, 0.48], [0.32, -0.05, 0.48], [0, -0.2, 0.52]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#2FBE96" emissive="#2FBE96" emissiveIntensity={0.25} metalness={0.4} />
        </mesh>
      ))}
      <mesh ref={pumpRef} position={[0, -0.42, 0.45]} castShadow>
        <boxGeometry args={[0.34, 0.24, 0.22]} />
        <meshStandardMaterial color="#0F2E4D" emissive="#E3A857" emissiveIntensity={0.2} metalness={0.4} roughness={0.35} />
      </mesh>
      <Text position={[0, -0.42, 0.58]} fontSize={0.045} color="#EFE7D8" anchorX="center">eDNA</Text>
      <mesh ref={ledRef} position={[0.42, 0.98, 0.2]}>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshStandardMaterial color="#2FBE96" emissive="#2FBE96" emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[0.14, 0.2, 0.35, 16]} />
        <meshStandardMaterial color="#12345A" metalness={0.55} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.95, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#0a1a2a" metalness={0.6} roughness={0.25} />
      </mesh>
      <mesh position={[0.15, -0.85, -0.1]} rotation={[0.4, 0, 0.2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.5, 6]} />
        <meshStandardMaterial color="#555" metalness={0.7} roughness={0.4} />
      </mesh>
    </group>
  );
}

function SonarRings({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null);
  const rings = useMemo(() => [0, 1, 2, 3], []);

  useFrame((state) => {
    if (!group.current || !active) return;
    group.current.children.forEach((child, i) => {
      const t = (state.clock.elapsedTime * 1.2 + i * 0.55) % 2.8;
      child.scale.setScalar(0.25 + t * 1.6);
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.5 - t * 0.18);
    });
  });

  if (!active) return null;

  return (
    <group ref={group} position={[0, 0.2, 0.55]}>
      {rings.map((i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.1, 0.14, 32]} />
          <meshBasicMaterial color="#E0653B" transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function SceneContent({ alert, pumping }: BuoySceneProps) {
  return (
    <>
      <color attach="background" args={['#040e18']} />
      <fog attach="fog" args={['#040e18', 6, 16]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 8, 4]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-3, 2, 2]} intensity={0.5} color="#2FBE96" />
      <pointLight position={[2, 1, -2]} intensity={0.25} color="#E3A857" />
      <spotLight position={[0, 6, 0]} intensity={0.4} angle={0.5} penumbra={0.8} color="#8ecae6" />
      <BuoyBody alert={alert} pumping={pumping} />
      <SonarRings active={alert} />
      <Ocean />
      <FoamRings />
      <UnderwaterGlow />
      <Sparkles count={40} scale={[8, 1.5, 8]} size={1.5} speed={0.3} opacity={0.35} color="#8ecae6" position={[0, -0.5, 0]} />
      <OrbitControls enablePan={false} minDistance={2.8} maxDistance={9} maxPolarAngle={Math.PI / 1.55} target={[0, 0.3, 0]} />
      <Environment preset="night" />
    </>
  );
}

export default function BuoyScene({ alert, pumping, dist }: BuoySceneProps) {
  return (
    <div className="relative w-full h-[360px] sm:h-[440px] md:h-[520px] lg:h-[580px] rounded-xl overflow-hidden border border-white/10 bg-[#040e18]">
      <Canvas shadows camera={{ position: [3.6, 2.2, 4.0], fov: 36 }} gl={{ antialias: true, alpha: false }} dpr={[1, 1.8]}>
        <SceneContent alert={alert} pumping={pumping} dist={dist} />
      </Canvas>
      <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
        <span className="font-mono text-[10px] text-white/35 tracking-wide">arraste · scroll</span>
      </div>
    </div>
  );
}
