'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Text } from '@react-three/drei';
import * as THREE from 'three';

interface BuoySceneProps {
  alert: boolean;
  pumping: boolean;
  dist: number;
}

function Water() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.03 - 0.85;
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.85, 0]} receiveShadow>
      <circleGeometry args={[5, 64]} />
      <meshStandardMaterial color="#0B3A5C" transparent opacity={0.8} roughness={0.35} metalness={0.1} />
    </mesh>
  );
}

function Waves() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.12;
      const mat = ref.current.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.1 + Math.sin(state.clock.elapsedTime) * 0.03;
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]}>
      <ringGeometry args={[1.1, 4, 64]} />
      <meshStandardMaterial color="#2FBE96" transparent opacity={0.12} side={THREE.DoubleSide} />
    </mesh>
  );
}

function BuoyBody({ alert, pumping }: { alert: boolean; pumping: boolean }) {
  const ledRef = useRef<THREE.Mesh>(null);
  const pumpRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ledRef.current) {
      const mat = ledRef.current.material as THREE.MeshStandardMaterial;
      if (alert) {
        mat.emissiveIntensity = 0.7 + Math.sin(state.clock.elapsedTime * 8) * 0.35;
        mat.color.set('#E0653B');
        mat.emissive.set('#E0653B');
      } else {
        mat.emissiveIntensity = 0.35;
        mat.color.set('#2FBE96');
        mat.emissive.set('#2FBE96');
      }
    }
    if (pumpRef.current) {
      const mat = pumpRef.current.material as THREE.MeshStandardMaterial;
      if (pumping) {
        mat.emissiveIntensity = 0.85 + Math.sin(state.clock.elapsedTime * 12) * 0.25;
        mat.emissive.set('#2FBE96');
      } else {
        mat.emissiveIntensity = 0.2;
        mat.emissive.set('#E3A857');
      }
    }
  });

  return (
    <group position={[0, 0.15, 0]}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.7, 0.3, 32]} />
        <meshStandardMaterial color="#12345A" metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.42, 0]}>
        <boxGeometry args={[0.38, 0.16, 0.26]} />
        <meshStandardMaterial color="#0B2440" metalness={0.5} roughness={0.3} />
      </mesh>
      <Text position={[0, 1.52, 0.15]} fontSize={0.065} color="#EFE7D8" anchorX="center" anchorY="middle">GPS</Text>

      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.55, 1.5, 32]} />
        <meshStandardMaterial color="#0F2E4D" metalness={0.35} roughness={0.4} />
      </mesh>

      <mesh position={[0, 0.72, 0.45]}>
        <boxGeometry args={[0.34, 0.22, 0.06]} />
        <meshStandardMaterial color="#0B2440" metalness={0.4} roughness={0.3} />
      </mesh>
      <Text position={[0, 0.72, 0.49]} fontSize={0.05} color="#2FBE96" anchorX="center" anchorY="middle">ESP32</Text>

      <mesh position={[0, 0.22, 0.52]} castShadow>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial
          color={alert ? '#E0653B' : '#E3A857'}
          emissive={alert ? '#E0653B' : '#E3A857'}
          emissiveIntensity={alert ? 0.75 : 0.28}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {[[-0.28, -0.08, 0.45], [0, -0.18, 0.48], [0.28, -0.08, 0.45]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.065, 12, 12]} />
          <meshStandardMaterial color="#2FBE96" emissive="#2FBE96" emissiveIntensity={0.22} />
        </mesh>
      ))}

      <mesh ref={pumpRef} position={[0, -0.4, 0.42]} castShadow>
        <boxGeometry args={[0.32, 0.22, 0.2]} />
        <meshStandardMaterial color="#0F2E4D" emissive="#E3A857" emissiveIntensity={0.2} metalness={0.4} roughness={0.35} />
      </mesh>
      <Text position={[0, -0.4, 0.53]} fontSize={0.048} color="#EFE7D8" anchorX="center" anchorY="middle">eDNA</Text>

      <mesh ref={ledRef} position={[0.4, 0.95, 0.22]}>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshStandardMaterial color="#2FBE96" emissive="#2FBE96" emissiveIntensity={0.4} />
      </mesh>

      <mesh position={[0, -0.62, 0]}>
        <cylinderGeometry args={[0.13, 0.16, 0.28, 16]} />
        <meshStandardMaterial color="#12345A" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

function SonarRings({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null);
  const rings = useMemo(() => Array.from({ length: 3 }).map((_, i) => ({ id: i, offset: i * 0.8 })), []);

  useFrame((state) => {
    if (!group.current || !active) return;
    group.current.children.forEach((child, i) => {
      const t = (state.clock.elapsedTime + rings[i].offset) % 2.4;
      child.scale.setScalar(0.3 + t * 1.4);
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.55 - t * 0.25);
    });
  });

  if (!active) return null;

  return (
    <group ref={group} position={[0, 0.22, 0.52]}>
      {rings.map((r) => (
        <mesh key={r.id} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.12, 0.15, 32]} />
          <meshBasicMaterial color="#E0653B" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function SceneContent({ alert, pumping }: BuoySceneProps) {
  return (
    <>
      <color attach="background" args={['#071A2C']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 7, 4]} intensity={1.15} castShadow />
      <pointLight position={[-2, 2, 2]} intensity={0.45} color="#2FBE96" />
      <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.2}>
        <BuoyBody alert={alert} pumping={pumping} />
        <SonarRings active={alert} />
      </Float>
      <Water />
      <Waves />
      <OrbitControls enablePan={false} minDistance={2.5} maxDistance={8} maxPolarAngle={Math.PI / 1.65} target={[0, 0.35, 0]} />
      <Environment preset="night" />
    </>
  );
}

export default function BuoyScene({ alert, pumping, dist }: BuoySceneProps) {
  return (
    <div className="relative w-full h-[420px] md:h-[520px] lg:h-[560px] rounded-xl overflow-hidden border border-white/10 bg-[#071A2C]">
      <Canvas shadows camera={{ position: [3.4, 2.0, 3.8], fov: 38 }} gl={{ antialias: true, alpha: false }}>
        <SceneContent alert={alert} pumping={pumping} dist={dist} />
      </Canvas>
      <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
        <span className="font-mono text-[10px] text-white/40 tracking-wide">
          arraste para girar · scroll para zoom
        </span>
      </div>
    </div>
  );
}
