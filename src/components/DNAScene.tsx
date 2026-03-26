import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Text, Environment } from "@react-three/drei";
import * as THREE from "three";

type BaseName = "A" | "T" | "C" | "G" | "U";

const BASE_COLORS: Record<BaseName, string> = {
  A: "#00d4ff",
  T: "#ffbb00",
  C: "#33dd77",
  G: "#e050a0",
  U: "#ff8800",
};

const COMPLEMENT: Record<BaseName, BaseName> = {
  A: "T",
  T: "A",
  C: "G",
  G: "C",
  U: "A",
};

interface SlotData {
  id: number;
  base: BaseName;
  position: THREE.Vector3;
  matched: boolean;
  isMutated?: boolean;
}

interface FloatingBaseProps {
  base: BaseName;
  position: [number, number, number];
  selected: boolean;
  onClick: () => void;
}

function FloatingBase({ base, position, selected, onClick }: FloatingBaseProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = BASE_COLORS[base];

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
      <group position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <mesh ref={meshRef}>
          <dodecahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={selected ? 1.5 : 0.4}
            roughness={0.2}
            metalness={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>
        <Text
          position={[0, 0.55, 0]}
          fontSize={0.25}
          color={color}
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          {base}
        </Text>
        {selected && (
          <mesh>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color={color} transparent opacity={0.15} wireframe />
          </mesh>
        )}
      </group>
    </Float>
  );
}

interface HelixProps {
  slots: SlotData[];
  onSlotClick: (slotId: number) => void;
  highlightSlot: number | null;
}

function DNAHelix({ slots, onSlotClick, highlightSlot }: HelixProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  const { templateStrand, backboneCurve } = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const templatePoints: { pos: THREE.Vector3; base: BaseName; id: number }[] = [];

    for (let i = 0; i < 12; i++) {
      const t = i / 12;
      const angle = t * Math.PI * 2.5;
      const y = (t - 0.5) * 8;
      const radius = 1.5;

      // Template strand (left side - always present)
      const tx = Math.cos(angle) * radius;
      const tz = Math.sin(angle) * radius;
      points.push(new THREE.Vector3(tx, y, tz));

      if (i < slots.length) {
        templatePoints.push({
          pos: new THREE.Vector3(tx, y, tz),
          base: COMPLEMENT[slots[i].base],
          id: i,
        });
      }
    }

    return {
      templateStrand: templatePoints,
      backboneCurve: new THREE.CatmullRomCurve3(points),
    };
  }, [slots]);

  const tubeGeo = useMemo(
    () => new THREE.TubeGeometry(backboneCurve, 64, 0.06, 8, false),
    [backboneCurve]
  );

  return (
    <group ref={groupRef}>
      {/* Template backbone */}
      <mesh geometry={tubeGeo}>
        <meshStandardMaterial color="#1a5a7a" emissive="#0a3050" emissiveIntensity={0.5} />
      </mesh>

      {/* Template bases */}
      {templateStrand.map((item, i) => {
        const color = BASE_COLORS[item.base];
        const dir = new THREE.Vector3(0, 0, 0).sub(item.pos).normalize();
        const innerPos = item.pos.clone().add(dir.multiplyScalar(0.4));

        return (
          <group key={`template-${i}`}>
            <mesh position={innerPos}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
            </mesh>
            {/* Bond line from backbone to base */}
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([item.pos.x, item.pos.y, item.pos.z, innerPos.x, innerPos.y, innerPos.z])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color={color} transparent opacity={0.5} />
            </line>
          </group>
        );
      })}

      {/* Complementary slots */}
      {slots.map((slot, i) => {
        if (i >= templateStrand.length) return null;
        const tPos = templateStrand[i].pos;
        const dir = new THREE.Vector3(0, 0, 0).sub(tPos).normalize();
        const slotPos = tPos.clone().add(dir.multiplyScalar(1.2));
        const color = BASE_COLORS[slot.base];
        const isHighlighted = highlightSlot === slot.id;

        return (
          <group key={`slot-${slot.id}`}>
            {slot.matched ? (
              <>
                <mesh 
                  position={slotPos}
                  onClick={(e) => {
                    if (slot.isMutated) {
                      e.stopPropagation();
                      onSlotClick(slot.id);
                    }
                  }}
                >
                  <sphereGeometry args={[0.15, 8, 8]} />
                  <meshStandardMaterial 
                    color={slot.isMutated ? "#ff0000" : color} 
                    emissive={slot.isMutated ? "#ff0000" : color} 
                    emissiveIntensity={slot.isMutated ? 1.5 : 0.8} 
                    wireframe={slot.isMutated}
                  />
                </mesh>
                {slot.isMutated && (
                  <mesh position={slotPos}>
                    <sphereGeometry args={[0.25, 16, 16]} />
                    <meshBasicMaterial color="#ff0000" transparent opacity={0.3} wireframe />
                  </mesh>
                )}
                {/* Bond between bases */}
                <line>
                  <bufferGeometry>
                    <bufferAttribute
                      attach="attributes-position"
                      count={2}
                      array={new Float32Array([
                        tPos.x + dir.x * 0.4, tPos.y + dir.y * 0.4, tPos.z + dir.z * 0.4,
                        slotPos.x, slotPos.y, slotPos.z,
                      ])}
                      itemSize={3}
                    />
                  </bufferGeometry>
                  <lineBasicMaterial color={slot.isMutated ? "#ff0000" : "#ffffff"} transparent opacity={slot.isMutated ? 0.6 : 0.3} />
                </line>
              </>
            ) : (
              <mesh
                position={slotPos}
                onClick={(e) => { e.stopPropagation(); onSlotClick(slot.id); }}
              >
                <torusGeometry args={[0.2, 0.04, 8, 16]} />
                <meshStandardMaterial
                  color={isHighlighted ? "#ffffff" : "#334455"}
                  emissive={isHighlighted ? "#ffffff" : "#1a2a3a"}
                  emissiveIntensity={isHighlighted ? 1 : 0.3}
                  transparent
                  opacity={isHighlighted ? 0.9 : 0.5}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

function Particles() {
  const count = 200;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#0088aa" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

export interface DNASceneProps {
  slots: SlotData[];
  selectedBase: BaseName | null;
  floatingBases: { base: BaseName; position: [number, number, number] }[];
  onSelectBase: (base: BaseName | null) => void;
  onSlotClick: (slotId: number) => void;
  highlightSlot: number | null;
}

export default function DNAScene({
  slots,
  selectedBase,
  floatingBases,
  onSelectBase,
  onSlotClick,
  highlightSlot,
}: DNASceneProps) {
  const handleBaseClick = useCallback(
    (base: BaseName) => {
      onSelectBase(selectedBase === base ? null : base);
    },
    [selectedBase, onSelectBase]
  );

  return (
    <Canvas camera={{ position: [0, 0, 7], fov: 50 }} style={{ background: "transparent" }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#00aaff" />
      <pointLight position={[-5, -3, 3]} intensity={0.6} color="#e050a0" />
      <spotLight position={[0, 8, 0]} intensity={0.5} color="#33dd77" angle={0.4} />

      <DNAHelix slots={slots} onSlotClick={onSlotClick} highlightSlot={highlightSlot} />

      {floatingBases.map((fb, i) => (
        <FloatingBase
          key={`floating-${i}`}
          base={fb.base}
          position={fb.position}
          selected={selectedBase === fb.base}
          onClick={() => handleBaseClick(fb.base)}
        />
      ))}

      <Particles />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} maxPolarAngle={Math.PI * 0.75} minPolarAngle={Math.PI * 0.25} />
    </Canvas>
  );
}

export type { BaseName, SlotData };
