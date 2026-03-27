import { useState, useCallback, useMemo } from "react";
import ExplorerScene, { type BaseName } from "@/components/ExplorerScene";
import MutationLab from "@/components/MutationLab";
import ReplicationView from "@/components/ReplicationView";
import TheoryPanel from "@/components/TheoryPanel";
import GameMode from "@/components/GameMode";

const DEFAULT_SEQUENCE: BaseName[] = ["A", "T", "G", "C", "C", "A", "T", "G", "A", "C", "G", "T", "A", "T", "C", "G", "A", "T"];

type Mode = "explore" | "mutations" | "replication" | "theory" | "game";

const MODES: { id: Mode; label: string; icon: string; desc: string }[] = [
  { id: "explore", label: "Explorer", icon: "🔬", desc: "Interactive 3D model" },
  { id: "mutations", label: "Mutations", icon: "⚡", desc: "Simulate mutations" },
  { id: "replication", label: "Replication", icon: "🔄", desc: "Central dogma" },
  { id: "theory", label: "Theory", icon: "📖", desc: "Learn DNA biology" },
  { id: "game", label: "Play Game", icon: "🎮", desc: "Match Base Pairs" },
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
      <div className="z-20 flex w-96 flex-col border-r border-border bg-card/80 backdrop-blur-md">
        {/* Header */}
        <div className="border-b border-border p-5">
          <h1 className="font-display text-2xl font-bold text-primary text-glow">DNA Helix Decoder</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1">Molecular Engineering Lab</p>
        </div>

        {/* Mode selector */}
        <div className="border-b border-border p-4 w-full">
          <div className="grid grid-cols-2 gap-3 w-full">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`rounded-xl border p-3 text-left transition-all shadow-sm flex flex-col items-start ${
                  mode === m.id
                    ? "border-primary/50 bg-primary/10 scale-105"
                    : "border-transparent hover:bg-card/60"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{m.icon}</span>
                  <span className={`font-display text-sm font-bold ${mode === m.id ? "text-primary text-glow" : "text-foreground"}`}>{m.label}</span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground leading-tight">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sequence stats */}
        <div className="border-b border-border p-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-card/40 p-3 text-center shadow-inner">
              <p className="font-mono text-[10px] sm:text-xs text-muted-foreground mb-1">LENGTH</p>
              <p className="font-display text-xl text-foreground font-bold">{sequence.length}bp</p>
            </div>
            <div className="rounded-xl border border-border bg-card/40 p-3 text-center shadow-inner">
              <p className="font-mono text-[10px] sm:text-xs text-muted-foreground mb-1">GC%</p>
              <p className="font-display text-xl text-accent font-bold">{gcContent}%</p>
            </div>
            <div className="rounded-xl border border-border bg-card/40 p-3 text-center shadow-inner">
              <p className="font-mono text-[10px] sm:text-xs text-muted-foreground mb-1">Tm</p>
              <p className="font-display text-xl text-secondary font-bold">{meltingTemp}°C</p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={randomizeSequence} className="flex-1 rounded-lg border border-border px-4 py-2 font-mono text-xs font-semibold text-foreground transition-all hover:bg-card hover:text-primary hover:scale-105 active:scale-95 shadow-sm">
              🎲 Randomize
            </button>
            <button onClick={resetSequence} className="flex-1 rounded-lg border border-border px-4 py-2 font-mono text-xs font-semibold text-foreground transition-all hover:bg-card hover:text-destructive hover:scale-105 active:scale-95 shadow-sm">
              ↺ Reset
            </button>
          </div>
        </div>

        {/* Mode-specific panel */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {mode === "explore" && (
            <div className="flex flex-col gap-4">
              <h3 className="font-display text-lg font-bold text-primary text-glow">Structure Controls</h3>

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
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-all ${
                    toggle.value
                      ? "border-primary/40 bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-card/30 text-muted-foreground hover:bg-card/50"
                  }`}
                >
                  <span className="font-mono text-sm">{toggle.label}</span>
                  <span className={`font-display text-sm font-bold ${toggle.value ? "text-primary" : "opacity-60"}`}>{toggle.value ? "ON" : "OFF"}</span>
                </button>
              ))}

              {/* Base pair legend */}
              <div className="mt-3">
                <p className="mb-2 font-mono text-xs font-bold tracking-widest text-muted-foreground">BASE PAIR LEGEND</p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { base: "A", name: "Adenine", type: "Purine", bonds: "2 H-bonds: T" },
                    { base: "T", name: "Thymine", type: "Pyrimidine", bonds: "2 H-bonds: A" },
                    { base: "C", name: "Cytosine", type: "Pyrimidine", bonds: "3 H-bonds: G" },
                    { base: "G", name: "Guanine", type: "Purine", bonds: "3 H-bonds: C" },
                  ] as const).map((info) => (
                    <div
                      key={info.base}
                      className="rounded-lg border border-border bg-card/40 p-3 shadow-inner transition-transform hover:scale-105"
                      onMouseEnter={() => {
                        const idx = sequence.indexOf(info.base as BaseName);
                        setHighlightIndex(idx >= 0 ? idx : null);
                      }}
                      onMouseLeave={() => setHighlightIndex(null)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`font-display text-2xl font-black text-glow ${
                          info.base === "A" ? "text-dna-adenine" :
                          info.base === "T" ? "text-dna-thymine" :
                          info.base === "C" ? "text-dna-cytosine" : "text-dna-guanine"
                        }`}>{info.base}</span>
                        <span className="font-display text-sm font-semibold">{info.name}</span>
                      </div>
                      <p className="font-mono text-[11px] text-muted-foreground mb-1">{info.type}</p>
                      <p className="font-mono text-[10px] text-muted-foreground/80">{info.bonds}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* DNA layers */}
              <div className="mt-3">
                <p className="mb-2 font-mono text-xs font-bold tracking-widest text-muted-foreground">DNA STRUCTURAL LAYERS</p>
                <div className="space-y-2">
                  {[
                    { name: "Nucleotide", desc: "Base + Sugar + Phosphate", color: "text-primary" },
                    { name: "Base Pair", desc: "Two complementary bases linked by H-bonds", color: "text-accent" },
                    { name: "Double Helix", desc: "Two antiparallel strands wound around each other", color: "text-secondary" },
                    { name: "Nucleosome", desc: "DNA wrapped around histone proteins", color: "text-dna-thymine" },
                    { name: "Chromatin", desc: "Nucleosomes packed into 30nm fiber", color: "text-dna-guanine" },
                    { name: "Chromosome", desc: "Maximally condensed chromatin during division", color: "text-destructive" },
                  ].map((layer) => (
                    <div key={layer.name} className="rounded-lg border border-border/50 bg-card/30 px-3 py-2">
                      <span className={`font-display text-xs font-bold ${layer.color}`}>{layer.name}</span>
                      <p className="font-mono text-[11px] text-muted-foreground mt-1">{layer.desc}</p>
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

      {/* Main Stage */}
      <div className="relative flex-1">
        {mode === "game" ? (
          <GameMode />
        ) : (
          <>
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
            <div className="absolute bottom-6 right-6 rounded-xl border border-border bg-card/80 px-4 py-3 backdrop-blur-md shadow-lg pointer-events-none z-10">
              <p className="font-mono text-xs font-semibold text-muted-foreground">🖱️ Drag to rotate • Scroll to zoom</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
