import { useState, useCallback, useMemo } from "react";
import ExplorerScene, { type BaseName } from "@/components/ExplorerScene";
import MutationLab from "@/components/MutationLab";
import ReplicationView from "@/components/ReplicationView";
import TheoryPanel from "@/components/TheoryPanel";

const DEFAULT_SEQUENCE: BaseName[] = ["A", "T", "G", "C", "C", "A", "T", "G", "A", "C", "G", "T", "A", "T", "C", "G", "A", "T"];

type Mode = "explore" | "mutations" | "replication" | "theory";

const MODES: { id: Mode; label: string; icon: string; desc: string }[] = [
  { id: "explore", label: "Structure Explorer", icon: "🔬", desc: "Interactive 3D DNA model" },
  { id: "mutations", label: "Mutation Lab", icon: "⚡", desc: "Simulate DNA mutations" },
  { id: "replication", label: "Replication", icon: "🔄", desc: "Central dogma processes" },
  { id: "theory", label: "Theory", icon: "📖", desc: "Learn DNA biology" },
];

export default function Index() {
  const [mode, setMode] = useState<Mode>("explore");
  const [sequence, setSequence] = useState<BaseName[]>([...DEFAULT_SEQUENCE]);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const [mutationIndex, setMutationIndex] = useState<number | null>(null);
  const [mutationType, setMutationType] = useState<string | null>(null);

  // Explorer toggles
  const [showLabels, setShowLabels] = useState(true);
  const [showHydrogenBonds, setShowHydrogenBonds] = useState(true);
  const [showBackbone, setShowBackbone] = useState(true);
  const [showGrooves, setShowGrooves] = useState(false);

  const resetSequence = useCallback(() => {
    setSequence([...DEFAULT_SEQUENCE]);
    setMutationIndex(null);
    setMutationType(null);
    setHighlightIndex(null);
  }, []);

  const randomizeSequence = useCallback(() => {
    const bases: BaseName[] = ["A", "T", "C", "G"];
    setSequence(Array.from({ length: 18 }, () => bases[Math.floor(Math.random() * 4)]));
    setMutationIndex(null);
    setMutationType(null);
  }, []);

  const gcContent = useMemo(() => {
    const gc = sequence.filter((b) => b === "G" || b === "C").length;
    return ((gc / sequence.length) * 100).toFixed(1);
  }, [sequence]);

  const meltingTemp = useMemo(() => {
    // Simple formula: Tm = 2(A+T) + 4(G+C) for short sequences
    const at = sequence.filter((b) => b === "A" || b === "T").length;
    const gc = sequence.filter((b) => b === "G" || b === "C").length;
    return 2 * at + 4 * gc;
  }, [sequence]);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-background">
      {/* Left sidebar */}
      <div className="z-20 flex w-80 flex-col border-r border-border bg-card/50 backdrop-blur-md">
        {/* Header */}
        <div className="border-b border-border p-4">
          <h1 className="font-display text-lg text-primary text-glow">DNA Helix Decoder</h1>
          <p className="font-mono text-[10px] text-muted-foreground">Molecular Engineering Lab</p>
        </div>

        {/* Mode selector */}
        <div className="border-b border-border p-2">
          <div className="grid grid-cols-2 gap-1">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`rounded-lg border px-2 py-2 text-left transition-all ${
                  mode === m.id
                    ? "border-primary/40 bg-primary/10"
                    : "border-transparent hover:bg-card/60"
                }`}
              >
                <span className="block text-sm">{m.icon}</span>
                <span className={`block font-display text-[10px] ${mode === m.id ? "text-primary" : "text-foreground"}`}>{m.label}</span>
                <span className="block font-mono text-[8px] text-muted-foreground">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sequence stats */}
        <div className="border-b border-border p-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded border border-border bg-card/40 p-1.5 text-center">
              <p className="font-mono text-[8px] text-muted-foreground">LENGTH</p>
              <p className="font-display text-sm text-foreground">{sequence.length}bp</p>
            </div>
            <div className="rounded border border-border bg-card/40 p-1.5 text-center">
              <p className="font-mono text-[8px] text-muted-foreground">GC%</p>
              <p className="font-display text-sm text-accent">{gcContent}%</p>
            </div>
            <div className="rounded border border-border bg-card/40 p-1.5 text-center">
              <p className="font-mono text-[8px] text-muted-foreground">Tm</p>
              <p className="font-display text-sm text-secondary">{meltingTemp}°C</p>
            </div>
          </div>
          <div className="mt-2 flex gap-1">
            <button onClick={randomizeSequence} className="flex-1 rounded border border-border px-2 py-1 font-mono text-[9px] text-muted-foreground transition-colors hover:bg-card">
              🎲 Random
            </button>
            <button onClick={resetSequence} className="flex-1 rounded border border-border px-2 py-1 font-mono text-[9px] text-muted-foreground transition-colors hover:bg-card">
              ↺ Reset
            </button>
          </div>
        </div>

        {/* Mode-specific panel */}
        <div className="flex-1 overflow-y-auto p-3">
          {mode === "explore" && (
            <div className="flex flex-col gap-3">
              <h3 className="font-display text-sm text-primary text-glow">Structure Controls</h3>

              {/* Toggles */}
              {[
                { label: "Base Labels", value: showLabels, set: setShowLabels },
                { label: "Hydrogen Bonds", value: showHydrogenBonds, set: setShowHydrogenBonds },
                { label: "Sugar-Phosphate Backbone", value: showBackbone, set: setShowBackbone },
                { label: "Major/Minor Grooves", value: showGrooves, set: setShowGrooves },
              ].map((toggle) => (
                <button
                  key={toggle.label}
                  onClick={() => toggle.set(!toggle.value)}
                  className={`flex items-center justify-between rounded border px-3 py-2 transition-all ${
                    toggle.value
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-card/30 text-muted-foreground"
                  }`}
                >
                  <span className="font-mono text-[10px]">{toggle.label}</span>
                  <span className="font-display text-xs">{toggle.value ? "ON" : "OFF"}</span>
                </button>
              ))}

              {/* Base pair legend */}
              <div className="mt-2">
                <p className="mb-1 font-mono text-[10px] text-muted-foreground">BASE PAIR LEGEND</p>
                <div className="grid grid-cols-2 gap-1">
                  {([
                    { base: "A", name: "Adenine", type: "Purine", bonds: "2 H-bonds with T" },
                    { base: "T", name: "Thymine", type: "Pyrimidine", bonds: "2 H-bonds with A" },
                    { base: "C", name: "Cytosine", type: "Pyrimidine", bonds: "3 H-bonds with G" },
                    { base: "G", name: "Guanine", type: "Purine", bonds: "3 H-bonds with C" },
                  ] as const).map((info) => (
                    <div
                      key={info.base}
                      className="rounded border border-border bg-card/30 p-2"
                      onMouseEnter={() => {
                        const idx = sequence.indexOf(info.base as BaseName);
                        setHighlightIndex(idx >= 0 ? idx : null);
                      }}
                      onMouseLeave={() => setHighlightIndex(null)}
                    >
                      <span className={`font-display text-lg ${
                        info.base === "A" ? "text-dna-adenine" :
                        info.base === "T" ? "text-dna-thymine" :
                        info.base === "C" ? "text-dna-cytosine" : "text-dna-guanine"
                      }`}>{info.base}</span>
                      <p className="font-display text-[9px] text-foreground">{info.name}</p>
                      <p className="font-mono text-[8px] text-muted-foreground">{info.type}</p>
                      <p className="font-mono text-[7px] text-muted-foreground/60">{info.bonds}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* DNA layers */}
              <div className="mt-2">
                <p className="mb-1 font-mono text-[10px] text-muted-foreground">DNA STRUCTURAL LAYERS</p>
                <div className="space-y-1">
                  {[
                    { name: "Nucleotide", desc: "Base + Sugar + Phosphate", color: "text-primary" },
                    { name: "Base Pair", desc: "Two complementary bases linked by H-bonds", color: "text-accent" },
                    { name: "Double Helix", desc: "Two antiparallel strands wound around each other", color: "text-secondary" },
                    { name: "Nucleosome", desc: "DNA wrapped around histone proteins", color: "text-dna-thymine" },
                    { name: "Chromatin", desc: "Nucleosomes packed into 30nm fiber", color: "text-dna-guanine" },
                    { name: "Chromosome", desc: "Maximally condensed chromatin during division", color: "text-destructive" },
                  ].map((layer) => (
                    <div key={layer.name} className="rounded border border-border/50 bg-card/20 px-2 py-1.5">
                      <span className={`font-display text-[10px] ${layer.color}`}>{layer.name}</span>
                      <p className="font-mono text-[8px] text-muted-foreground">{layer.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {mode === "mutations" && (
            <MutationLab
              sequence={sequence}
              onSequenceChange={setSequence}
              onMutationIndex={setMutationIndex}
              onMutationType={setMutationType}
            />
          )}

          {mode === "replication" && (
            <ReplicationView sequence={sequence} />
          )}

          {mode === "theory" && (
            <TheoryPanel />
          )}
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="relative flex-1">
        <ExplorerScene
          sequence={sequence}
          showLabels={showLabels}
          showHydrogenBonds={showHydrogenBonds}
          showBackbone={showBackbone}
          showGrooves={showGrooves}
          highlightIndex={highlightIndex}
          mutationIndex={mutationIndex}
          mutationType={mutationType}
        />

        {/* Floating info */}
        <div className="absolute bottom-4 right-4 rounded-lg border border-border bg-card/60 px-3 py-2 backdrop-blur-md">
          <p className="font-mono text-[9px] text-muted-foreground">🖱️ Drag to rotate • Scroll to zoom</p>
        </div>
      </div>
    </div>
  );
}
