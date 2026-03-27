import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import * as THREE from "three";

type BaseName = "A" | "T" | "C" | "G";

const BASE_COLORS: Record<BaseName, string> = {
  A: "#00d4ff",
  T: "#ffbb00",
  C: "#33dd77",
  G: "#e050a0",
};

const COMPLEMENT: Record<BaseName, BaseName> = { A: "T", T: "A", C: "G", G: "C" };

const BASE_NAMES: Record<BaseName, string> = {
  A: "Adenine",
  T: "Thymine",
  C: "Cytosine",
  G: "Guanine",
};

const BASE_INFO: Record<BaseName, { title: string, content: string }> = {
  A: { title: "Adenine (A)", content: "Purine base. Forms 2 hydrogen bonds with Thymine." },
  T: { title: "Thymine (T)", content: "Pyrimidine base. Forms 2 hydrogen bonds with Adenine." },
  C: { title: "Cytosine (C)", content: "Pyrimidine base. Forms 3 hydrogen bonds with Guanine." },
  G: { title: "Guanine (G)", content: "Purine base. Forms 3 hydrogen bonds with Cytosine." },
};

const BACKBONE_INFO = {
  title: "Sugar-Phosphate Backbone",
  content: "Provides the structural framework of nucleic acids, consisting of alternating sugar and phosphate groups."
};

export type TooltipData = { id: string, title: string, content: string, position: THREE.Vector3 };

// Generate a full double helix
function FullHelix({ 
  sequence, 
  showLabels, 
  showHydrogenBonds,
  showBackbone,
  showGrooves,
  highlightIndex,
  mutationIndex,
  mutationType,
  activeTooltip,
  setActiveTooltip,
}: {
  sequence: BaseName[];
  showLabels: boolean;
  showHydrogenBonds: boolean;
  showBackbone: boolean;
  showGrooves: boolean;
  highlightIndex: number | null;
  mutationIndex: number | null;
  mutationType: string | null;
  activeTooltip: TooltipData | null;
  setActiveTooltip: (v: TooltipData | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const count = sequence.length;

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  const helixData = useMemo(() => {
    const strand1Points: THREE.Vector3[] = [];
    const strand2Points: THREE.Vector3[] = [];
    const basePairs: {
      pos1: THREE.Vector3;
      pos2: THREE.Vector3;
      base1: BaseName;
      base2: BaseName;
      index: number;
      y: number;
    }[] = [];

    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = t * Math.PI * 3;
      const y = (t - 0.5) * 10;
      const radius = 1.8;

      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;

      strand1Points.push(new THREE.Vector3(x1, y, z1));
      strand2Points.push(new THREE.Vector3(x2, y, z2));

      const base1 = sequence[i];
      const base2 = COMPLEMENT[base1];

      basePairs.push({
        pos1: new THREE.Vector3(x1, y, z1),
        pos2: new THREE.Vector3(x2, y, z2),
        base1,
        base2,
        index: i,
        y,
      });
    }

    const curve1 = new THREE.CatmullRomCurve3(strand1Points);
    const curve2 = new THREE.CatmullRomCurve3(strand2Points);

    return { curve1, curve2, basePairs, strand1Points, strand2Points };
  }, [sequence, count]);

  const tube1 = useMemo(() => new THREE.TubeGeometry(helixData.curve1, 128, 0.07, 8, false), [helixData.curve1]);
  const tube2 = useMemo(() => new THREE.TubeGeometry(helixData.curve2, 128, 0.07, 8, false), [helixData.curve2]);

  return (
    <group ref={groupRef}>
      {/* Sugar-phosphate backbones */}
      {showBackbone && (
        <>
          <mesh 
            geometry={tube1}
            onClick={(e) => { e.stopPropagation(); setActiveTooltip({ id: 'bb1', ...BACKBONE_INFO, position: e.point }); }}
          >
            <meshStandardMaterial color="#1a6a9a" emissive="#0a3a5a" emissiveIntensity={0.6} />
          </mesh>
          <mesh 
            geometry={tube2}
            onClick={(e) => { e.stopPropagation(); setActiveTooltip({ id: 'bb2', ...BACKBONE_INFO, position: e.point }); }}
          >
            <meshStandardMaterial color="#6a1a5a" emissive="#3a0a2a" emissiveIntensity={0.6} />
          </mesh>

          {/* Phosphate groups on backbone */}
          {helixData.strand1Points.filter((_, i) => i % 2 === 0).map((p, i) => (
            <mesh key={`p1-${i}`} position={p}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="#ff6633" emissive="#993300" emissiveIntensity={0.5} />
            </mesh>
          ))}
          {helixData.strand2Points.filter((_, i) => i % 2 === 0).map((p, i) => (
            <mesh key={`p2-${i}`} position={p}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="#ff6633" emissive="#993300" emissiveIntensity={0.5} />
            </mesh>
          ))}
        </>
      )}

      {/* Base pairs with hydrogen bonds */}
      {helixData.basePairs.map((bp) => {
        const isMutated = mutationIndex === bp.index;
        const isHighlighted = highlightIndex === bp.index;
        const c1 = isMutated ? "#ff0000" : BASE_COLORS[bp.base1];
        const c2 = isMutated ? "#ff0000" : BASE_COLORS[bp.base2];
        const mid = bp.pos1.clone().lerp(bp.pos2, 0.5);
        const dir = bp.pos2.clone().sub(bp.pos1).normalize();

        // Positions along the bond
        const basePos1 = bp.pos1.clone().lerp(bp.pos2, 0.25);
        const basePos2 = bp.pos1.clone().lerp(bp.pos2, 0.75);

        const bondCount = (bp.base1 === "C" || bp.base1 === "G") ? 3 : 2;

        return (
          <group key={`bp-${bp.index}`}>
            {/* Base spheres */}
            <mesh 
              position={basePos1} 
              scale={isHighlighted ? 1.5 : 1}
              onClick={(e) => { e.stopPropagation(); setActiveTooltip({ id: `b1-${bp.index}`, ...BASE_INFO[bp.base1], position: basePos1.clone() }); }}
            >
              <sphereGeometry args={[0.18, 12, 12]} />
              <meshStandardMaterial
                color={c1}
                emissive={c1}
                emissiveIntensity={isHighlighted ? 1.2 : isMutated ? 1.5 : 0.5}
              />
            </mesh>
            <mesh 
              position={basePos2} 
              scale={isHighlighted ? 1.5 : 1}
              onClick={(e) => { e.stopPropagation(); setActiveTooltip({ id: `b2-${bp.index}`, ...BASE_INFO[bp.base2], position: basePos2.clone() }); }}
            >
              <sphereGeometry args={[0.18, 12, 12]} />
              <meshStandardMaterial
                color={c2}
                emissive={c2}
                emissiveIntensity={isHighlighted ? 1.2 : isMutated ? 1.5 : 0.5}
              />
            </mesh>

            {/* Hydrogen bonds (dashed effect with segments) */}
            {showHydrogenBonds && Array.from({ length: bondCount }).map((_, bi) => {
              const offset = (bi - (bondCount - 1) / 2) * 0.08;
              const perpDir = new THREE.Vector3(0, 1, 0).cross(dir).normalize();
              const startP = basePos1.clone().add(perpDir.clone().multiplyScalar(offset));
              const endP = basePos2.clone().add(perpDir.clone().multiplyScalar(offset));

              return (
                <line key={`hb-${bp.index}-${bi}`}>
                  <bufferGeometry>
                    <bufferAttribute
                      attach="attributes-position"
                      count={2}
                      array={new Float32Array([startP.x, startP.y, startP.z, endP.x, endP.y, endP.z])}
                      itemSize={3}
                    />
                  </bufferGeometry>
                  <lineBasicMaterial color="#ffffff" transparent opacity={0.25} />
                </line>
              );
            })}

            {/* Labels */}
            {showLabels && (
              <>
                <Text position={[basePos1.x, basePos1.y + 0.3, basePos1.z]} fontSize={0.15} color={c1} anchorX="center">
                  {bp.base1}
                </Text>
                <Text position={[basePos2.x, basePos2.y + 0.3, basePos2.z]} fontSize={0.15} color={c2} anchorX="center">
                  {bp.base2}
                </Text>
              </>
            )}

            {/* Mutation indicator */}
            {isMutated && (
              <mesh position={mid}>
                <sphereGeometry args={[0.35, 16, 16]} />
                <meshBasicMaterial color="#ff0000" transparent opacity={0.15} wireframe />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Groove labels */}
      {showGrooves && (
        <>
          <Html position={[2.5, 1, 0]} center>
            <div className="rounded border border-primary/30 bg-card/80 px-2 py-1 font-mono text-[10px] text-primary backdrop-blur-sm whitespace-nowrap">
              Major Groove (~22Å)
            </div>
          </Html>
          <Html position={[-2.5, -1, 0]} center>
            <div className="rounded border border-secondary/30 bg-card/80 px-2 py-1 font-mono text-[10px] text-secondary backdrop-blur-sm whitespace-nowrap">
              Minor Groove (~12Å)
            </div>
          </Html>
          <Html position={[0, 5.5, 0]} center>
            <div className="rounded border border-border bg-card/80 px-2 py-1 font-mono text-[10px] text-foreground backdrop-blur-sm whitespace-nowrap">
              5' → 3' Direction
            </div>
          </Html>
          <Html position={[0, -5.5, 0]} center>
            <div className="rounded border border-border bg-card/80 px-2 py-1 font-mono text-[10px] text-foreground backdrop-blur-sm whitespace-nowrap">
              3' → 5' Direction
            </div>
          </Html>
        </>
      )}

      {/* Educational Hover/Click Tooltip */}
      {activeTooltip && (
        <Html position={activeTooltip.position} center style={{ pointerEvents: 'none' }}>
          <div className="rounded-xl border border-primary/40 bg-card/90 px-4 py-3 backdrop-blur-md shadow-2xl w-56 sm:w-64 animate-in fade-in zoom-in pointer-events-none">
            <h4 className="font-display text-sm font-bold text-primary mb-1">{activeTooltip.title}</h4>
            <p className="font-mono text-[11px] text-muted-foreground leading-snug">{activeTooltip.content}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

function Particles() {
  const count = 300;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    return pos;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.015;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#0088aa" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

export interface ExplorerSceneProps {
  sequence: BaseName[];
  showLabels: boolean;
  showHydrogenBonds: boolean;
  showBackbone: boolean;
  showGrooves: boolean;
  highlightIndex: number | null;
  mutationIndex: number | null;
  mutationType: string | null;
}

export default function ExplorerScene(props: ExplorerSceneProps) {
  const [activeTooltip, setActiveTooltip] = useState<TooltipData | null>(null);

  return (
    <Canvas 
      camera={{ position: [0, 0, 8], fov: 50 }} 
      style={{ background: "transparent" }}
      onPointerMissed={() => setActiveTooltip(null)}
    >
      <ambientLight intensity={0.25} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#00aaff" />
      <pointLight position={[-5, -3, 3]} intensity={0.6} color="#e050a0" />
      <spotLight position={[0, 10, 0]} intensity={0.4} color="#33dd77" angle={0.4} />

      <FullHelix {...props} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />
      <Particles />

      <OrbitControls enableZoom enablePan={false} minDistance={4} maxDistance={15} />
    </Canvas>
  );
}

export { BASE_COLORS, BASE_NAMES, COMPLEMENT };
export type { BaseName };
