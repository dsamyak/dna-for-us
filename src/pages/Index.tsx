import { useState, useCallback, useMemo, useEffect } from "react";
import * as THREE from "three";
import ExplorerScene, { type BaseName } from "@/components/ExplorerScene";
import MutationLab from "@/components/MutationLab";
import ReplicationView from "@/components/ReplicationView";
import TheoryPanel from "@/components/TheoryPanel";
import BaseInfoPanel from "@/components/BaseInfoPanel";
import GameMode from "@/components/GameMode";
import { Search, RotateCw, Keyboard } from "lucide-react";

const DEFAULT_SEQUENCE: BaseName[] = ["A", "T", "G", "C", "C", "A", "T", "G", "A", "C", "G", "T", "A", "T", "C", "G", "A", "T"];

type Mode = "explore" | "mutations" | "replication" | "theory" | "game";

const MODES: { id: Mode; label: string; icon: string; desc: string }[] = [
  { id: "explore", label: "Structure Explorer", icon: "🔬", desc: "Interactive 3D DNA model" },
  { id: "mutations", label: "Mutation Lab", icon: "⚡", desc: "Simulate DNA mutations" },
  { id: "replication", label: "Replication", icon: "🔄", desc: "Central dogma processes" },
  { id: "theory", label: "Theory", icon: "📖", desc: "Learn DNA biology" },
  { id: "game", label: "DNA Match", icon: "🕹️", desc: "Build a DNA strand" },
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
  const [autoRotate, setAutoRotate] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Search & Focus state
  const [searchPattern, setSearchPattern] = useState("");
  const [focusedBasePair, setFocusedBasePair] = useState<{ index: number; base: BaseName; position: THREE.Vector3 } | null>(null);

  const resetSequence = useCallback(() => {
    setSequence([...DEFAULT_SEQUENCE]);
    setMutationIndex(null);
    setMutationType(null);
    setHighlightIndex(null);
    setSearchPattern("");
    setFocusedBasePair(null);
  }, []);

  const randomizeSequence = useCallback(() => {
    const bases: BaseName[] = ["A", "T", "C", "G"];
    setSequence(Array.from({ length: 18 }, () => bases[Math.floor(Math.random() * 4)]));
    setMutationIndex(null);
    setMutationType(null);
    setSearchPattern("");
    setFocusedBasePair(null);
  }, []);

  const gcContent = useMemo(() => {
    const gc = sequence.filter((b) => b === "G" || b === "C").length;
    return ((gc / sequence.length) * 100).toFixed(1);
  }, [sequence]);

  const meltingTemp = useMemo(() => {
    const at = sequence.filter((b) => b === "A" || b === "T").length;
    const gc = sequence.filter((b) => b === "G" || b === "C").length;
    return 2 * at + 4 * gc;
  }, [sequence]);

  const handleBasePairClick = useCallback((index: number, base: BaseName, position: THREE.Vector3) => {
    setFocusedBasePair({ index, base, position });
  }, []);

  const handleCanvasClick = useCallback(() => {
    setFocusedBasePair(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case "r":
          setAutoRotate((r) => !r);
          break;
        case "l":
          setShowLabels((l) => !l);
          break;
        case "b":
          setShowBackbone((b) => !b);
          break;
        case "h":
          setShowHydrogenBonds((h) => !h);
          break;
        case "g":
          setShowGrooves((g) => !g);
          break;
        case "?":
          setShowShortcuts((s) => !s);
          break;
        case "escape":
          setFocusedBasePair(null);
          setShowShortcuts(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-background bg-gradient-to-br from-background via-[#051525] to-background bg-[length:200%_200%] animate-[gradient-bg_15s_ease_infinite]">
      {/* Background visual effects */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,212,255,0.05)_0%,rgba(0,0,0,0)_50%)]" />
      
      {/* Shortuts Overlay */}
      {showShortcuts && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowShortcuts(false)}>
          <div className="rounded-xl border border-border bg-card/90 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 font-display text-lg text-primary text-glow">Keyboard Shortcuts</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 font-mono text-sm text-muted-foreground">
              <div className="flex justify-between gap-4"><span>Rotate Model</span><kbd className="rounded border border-border/50 bg-muted/50 px-2 text-foreground">R</kbd></div>
              <div className="flex justify-between gap-4"><span>Toggle Labels</span><kbd className="rounded border border-border/50 bg-muted/50 px-2 text-foreground">L</kbd></div>
              <div className="flex justify-between gap-4"><span>Toggle Backbone</span><kbd className="rounded border border-border/50 bg-muted/50 px-2 text-foreground">B</kbd></div>
              <div className="flex justify-between gap-4"><span>Toggle H-Bonds</span><kbd className="rounded border border-border/50 bg-muted/50 px-2 text-foreground">H</kbd></div>
              <div className="flex justify-between gap-4"><span>Toggle Grooves</span><kbd className="rounded border border-border/50 bg-muted/50 px-2 text-foreground">G</kbd></div>
              <div className="flex justify-between gap-4"><span>Unfocus/Close</span><kbd className="rounded border border-border/50 bg-muted/50 px-2 text-foreground">ESC</kbd></div>
              <div className="flex justify-between gap-4"><span>Shortcuts Help</span><kbd className="rounded border border-border/50 bg-muted/50 px-2 text-foreground">?</kbd></div>
            </div>
            <button className="mt-6 w-full rounded bg-primary/20 p-2 font-display text-xs text-primary transition-colors hover:bg-primary hover:text-primary-foreground" onClick={() => setShowShortcuts(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Left sidebar */}
      <div className="z-20 flex w-80 flex-col border-r border-border bg-card/60 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        {/* Header */}
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-lg text-primary text-glow">DNA Helix Decoder</h1>
              <p className="font-mono text-[10px] text-muted-foreground">Molecular Engineering Lab</p>
            </div>
            <button 
              onClick={() => setShowShortcuts(true)}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary"
              title="Keyboard Shortcuts (?)"
            >
              <Keyboard size={16} />
            </button>
          </div>
        </div>

        {/* Mode selector */}
        <div className="border-b border-border p-2">
          <div className="grid grid-cols-2 gap-1">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setMode(m.id);
                  setFocusedBasePair(null);
                }}
                className={`rounded-lg border px-2 py-2 text-left transition-all duration-300 ${
                  mode === m.id
                    ? "border-primary/40 bg-primary/10 shadow-[inset_0_0_12px_rgba(0,212,255,0.1)]"
                    : "border-transparent hover:bg-card/80"
                }`}
              >
                <span className="block text-sm">{m.icon}</span>
                <span className={`block font-display text-[10px] ${mode === m.id ? "text-primary text-glow" : "text-foreground"}`}>{m.label}</span>
                <span className="block font-mono text-[8px] text-muted-foreground">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sequence stats (Not shown in Game mode) */}
        {mode !== "game" && (
          <div className="border-b border-border p-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded border border-border bg-card/40 p-1.5 text-center transition-colors hover:border-primary/30">
                <p className="font-mono text-[8px] text-muted-foreground">LENGTH</p>
                <p className="font-display text-sm text-foreground">{sequence.length}bp</p>
              </div>
              <div className="rounded border border-border bg-card/40 p-1.5 text-center transition-colors hover:border-accent/30">
                <p className="font-mono text-[8px] text-muted-foreground">GC%</p>
                <p className="font-display text-sm text-accent">{gcContent}%</p>
              </div>
              <div className="rounded border border-border bg-card/40 p-1.5 text-center transition-colors hover:border-secondary/30">
                <p className="font-mono text-[8px] text-muted-foreground">Tm</p>
                <p className="font-display text-sm text-secondary">{meltingTemp}°C</p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="mt-2 relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Find sequence (e.g. ATG)" 
                value={searchPattern}
                onChange={(e) => setSearchPattern(e.target.value)}
                className="w-full rounded border border-border bg-card/40 py-1 pl-6 pr-2 font-mono text-[10px] text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            
            <div className="mt-2 flex gap-1">
              <button onClick={randomizeSequence} className="flex-1 rounded border border-border px-2 py-1 font-mono text-[9px] text-muted-foreground transition-all hover:border-primary/30 hover:bg-card hover:text-primary">
                🎲 Random
              </button>
              <button onClick={resetSequence} className="flex-1 rounded border border-border px-2 py-1 font-mono text-[9px] text-muted-foreground transition-all hover:border-destructive/30 hover:bg-card hover:text-destructive">
                ↺ Reset
              </button>
            </div>
          </div>
        )}

        {/* Mode-specific panel */}
        <div className="flex-1 overflow-y-auto p-3 relative">
          <div className={`transition-opacity duration-300 absolute inset-0 p-3 ${mode === "explore" ? "opacity-100 z-10" : "opacity-0 -z-10 pointer-events-none"}`}>
            {mode === "explore" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm text-primary text-glow">Structure Controls</h3>
                  <button 
                    onClick={() => setAutoRotate(!autoRotate)}
                    className={`flex items-center gap-1 rounded px-2 py-1 font-mono text-[9px] transition-colors ${autoRotate ? "bg-primary/20 text-primary" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"}`}
                  >
                    <RotateCw size={10} className={autoRotate ? "animate-spin" : ""} style={{ animationDuration: "3s" }} />
                    Auto Rotate
                  </button>
                </div>

                {/* Toggles */}
                {[
                  { label: "Base Labels (L)", value: showLabels, set: setShowLabels },
                  { label: "Hydrogen Bonds (H)", value: showHydrogenBonds, set: setShowHydrogenBonds },
                  { label: "Sugar-Phosphate Back. (B)", value: showBackbone, set: setShowBackbone },
                  { label: "Major/Minor Grooves (G)", value: showGrooves, set: setShowGrooves },
                ].map((toggle) => (
                  <button
                    key={toggle.label}
                    onClick={() => toggle.set(!toggle.value)}
                    className={`flex items-center justify-between rounded border px-3 py-2 transition-all ${
                      toggle.value
                        ? "border-primary/30 bg-primary/10 text-primary shadow-[inset_0_0_8px_rgba(0,212,255,0.05)]"
                        : "border-border bg-card/30 text-muted-foreground hover:bg-card/50"
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
                        className="rounded border border-border bg-card/30 p-2 transition-colors hover:border-primary/20 hover:bg-card/50"
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
                      <div key={layer.name} className="rounded border border-border/50 bg-card/20 px-2 py-1.5 transition-colors hover:bg-card/40">
                        <span className={`font-display text-[10px] ${layer.color}`}>{layer.name}</span>
                        <p className="font-mono text-[8px] text-muted-foreground">{layer.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={`transition-opacity duration-300 absolute inset-0 p-3 ${mode === "mutations" ? "opacity-100 z-10" : "opacity-0 -z-10 pointer-events-none"}`}>
            {mode === "mutations" && (
              <MutationLab
                sequence={sequence}
                onSequenceChange={setSequence}
                onMutationIndex={setMutationIndex}
                onMutationType={setMutationType}
              />
            )}
          </div>

          <div className={`transition-opacity duration-300 absolute inset-0 p-3 ${mode === "replication" ? "opacity-100 z-10" : "opacity-0 -z-10 pointer-events-none"}`}>
            {mode === "replication" && (
              <ReplicationView sequence={sequence} />
            )}
          </div>

          <div className={`transition-opacity duration-300 absolute inset-0 p-3 ${mode === "theory" ? "opacity-100 z-10" : "opacity-0 -z-10 pointer-events-none"}`}>
            {mode === "theory" && (
              <TheoryPanel />
            )}
          </div>
          
          <div className={`flex items-center justify-center transition-opacity duration-300 absolute inset-0 p-3 ${mode === "game" ? "opacity-100 z-10" : "opacity-0 -z-10 pointer-events-none"}`}>
            {mode === "game" && (
              <div className="text-center w-full">
                <p className="font-display text-sm text-primary text-glow">Game Mode Active</p>
                <p className="font-mono text-[10px] text-muted-foreground mt-2">Play in the main view!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3D Canvas Area */}
      <div className="relative flex-1 bg-[radial-gradient(circle_at_50%_0%,rgba(0,170,255,0.05)_0%,rgba(0,0,0,0)_60%)]">
        <div key={mode === "game" ? "game" : "explore"} className="absolute inset-0 animate-in fade-in duration-700">
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
                autoRotate={autoRotate}
                searchPattern={searchPattern}
                onBasePairClick={handleBasePairClick}
                focusedIndex={focusedBasePair?.index ?? null}
                focusedPosition={focusedBasePair?.position ?? null}
                onCanvasClick={handleCanvasClick}
              />
              
              {/* Click-to-Focus Info Panel overlay */}
              {focusedBasePair && (
                <BaseInfoPanel 
                  base={focusedBasePair.base} 
                  index={focusedBasePair.index} 
                  onClose={() => setFocusedBasePair(null)} 
                />
              )}

              {/* Floating info */}
              <div className="pointer-events-none absolute bottom-4 left-0 right-0 flex justify-center">
                <div className="animate-[float_3s_ease-in-out_infinite] rounded-full border border-border/50 bg-card/60 px-4 py-1.5 backdrop-blur-md transition-opacity">
                  <p className="font-mono text-[10px] text-muted-foreground">
                    🖱️ Drag to rotate • Scroll to zoom • <span className="text-primary/80">Click spheres to inspect base pairs</span>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
