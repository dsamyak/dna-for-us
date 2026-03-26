import { useState, useEffect, useRef } from "react";
import type { BaseName } from "./ExplorerScene";

const COMPLEMENT: Record<BaseName, BaseName> = { A: "T", T: "A", C: "G", G: "C" };
const RNA_COMPLEMENT: Record<BaseName, string> = { A: "U", T: "A", C: "G", G: "C" };

const BASE_STYLE: Record<string, string> = {
  A: "text-dna-adenine",
  T: "text-dna-thymine",
  C: "text-dna-cytosine",
  G: "text-dna-guanine",
  U: "text-secondary",
};

interface ReplicationViewProps {
  sequence: BaseName[];
}

export default function ReplicationView({ sequence }: ReplicationViewProps) {
  const [mode, setMode] = useState<"replication" | "transcription" | "translation">("replication");
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= sequence.length) {
            setIsPlaying(false);
            return p;
          }
          return p + 1;
        });
      }, 600);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, sequence.length]);

  const reset = () => {
    setProgress(0);
    setIsPlaying(false);
  };

  const mRNA = sequence.map((b) => RNA_COMPLEMENT[b]);
  
  // Codons from mRNA
  const codons: string[] = [];
  for (let i = 0; i + 2 < mRNA.length; i += 3) {
    codons.push(mRNA[i] + mRNA[i + 1] + mRNA[i + 2]);
  }

  return (
    <div className="flex flex-col gap-3 overflow-y-auto">
      <h3 className="font-display text-sm text-primary text-glow">Central Dogma of Molecular Biology</h3>

      {/* Mode tabs */}
      <div className="flex gap-1 rounded-lg bg-muted/30 p-1">
        {(["replication", "transcription", "translation"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); reset(); }}
            className={`flex-1 rounded px-2 py-1.5 font-display text-[10px] capitalize transition-all ${
              mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Process description */}
      <div className="rounded border border-border bg-card/40 p-2">
        {mode === "replication" && (
          <div className="font-mono text-[10px] text-muted-foreground">
            <p className="mb-1 font-display text-xs text-foreground">DNA → DNA</p>
            <p>DNA Helicase unwinds the double helix. DNA Polymerase reads the template strand (3'→5') and synthesizes a new complementary strand (5'→3'). Each base pairs with its complement: A↔T, C↔G.</p>
          </div>
        )}
        {mode === "transcription" && (
          <div className="font-mono text-[10px] text-muted-foreground">
            <p className="mb-1 font-display text-xs text-foreground">DNA → mRNA</p>
            <p>RNA Polymerase reads the template strand and creates messenger RNA. Thymine (T) is replaced by Uracil (U) in RNA. The mRNA carries genetic instructions from the nucleus to ribosomes.</p>
          </div>
        )}
        {mode === "translation" && (
          <div className="font-mono text-[10px] text-muted-foreground">
            <p className="mb-1 font-display text-xs text-foreground">mRNA → Protein</p>
            <p>Ribosomes read mRNA codons (3-base sequences). Each codon specifies an amino acid. tRNA molecules deliver matching amino acids. The chain forms a protein.</p>
          </div>
        )}
      </div>

      {/* Animation */}
      <div className="space-y-2">
        {mode === "replication" && (
          <>
            <p className="font-mono text-[10px] text-muted-foreground">TEMPLATE STRAND (3'→5')</p>
            <div className="flex flex-wrap gap-0.5">
              {sequence.map((b, i) => (
                <span
                  key={i}
                  className={`inline-flex h-6 w-6 items-center justify-center rounded text-[10px] font-display border border-border/50 transition-all duration-300 ${
                    i < progress ? `${BASE_STYLE[b]} bg-card/80` : "text-muted-foreground/30 bg-muted/20"
                  }`}
                >
                  {b}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span>↕</span>
              <span className="font-mono">Hydrogen bonds</span>
              {progress > 0 && <span className="ml-auto font-display text-accent">DNA Polymerase →</span>}
            </div>

            <p className="font-mono text-[10px] text-muted-foreground">NEW STRAND (5'→3')</p>
            <div className="flex flex-wrap gap-0.5">
              {sequence.map((b, i) => {
                const comp = COMPLEMENT[b];
                return (
                  <span
                    key={i}
                    className={`inline-flex h-6 w-6 items-center justify-center rounded text-[10px] font-display border transition-all duration-500 ${
                      i < progress
                        ? `${BASE_STYLE[comp]} bg-card/80 border-accent/30 scale-105`
                        : "text-transparent bg-muted/10 border-border/20"
                    }`}
                  >
                    {i < progress ? comp : "?"}
                  </span>
                );
              })}
            </div>
          </>
        )}

        {mode === "transcription" && (
          <>
            <p className="font-mono text-[10px] text-muted-foreground">DNA TEMPLATE (3'→5')</p>
            <div className="flex flex-wrap gap-0.5">
              {sequence.map((b, i) => (
                <span key={i} className={`inline-flex h-6 w-6 items-center justify-center rounded text-[10px] font-display border border-border/50 ${BASE_STYLE[b]} bg-card/80`}>
                  {b}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span>↓</span>
              <span className="font-mono">RNA Polymerase</span>
              {progress > 0 && <span className="ml-auto font-display text-secondary">Transcribing →</span>}
            </div>

            <p className="font-mono text-[10px] text-muted-foreground">mRNA (5'→3')</p>
            <div className="flex flex-wrap gap-0.5">
              {sequence.map((b, i) => {
                const rna = RNA_COMPLEMENT[b];
                return (
                  <span
                    key={i}
                    className={`inline-flex h-6 w-6 items-center justify-center rounded text-[10px] font-display border transition-all duration-500 ${
                      i < progress
                        ? `${BASE_STYLE[rna]} bg-secondary/10 border-secondary/30 scale-105`
                        : "text-transparent bg-muted/10 border-border/20"
                    }`}
                  >
                    {i < progress ? rna : "?"}
                  </span>
                );
              })}
            </div>
          </>
        )}

        {mode === "translation" && (
          <>
            <p className="font-mono text-[10px] text-muted-foreground">mRNA CODONS</p>
            <div className="flex flex-wrap gap-1">
              {codons.map((codon, i) => (
                <div
                  key={i}
                  className={`rounded border px-1.5 py-1 text-center transition-all duration-500 ${
                    i < Math.floor(progress / 3)
                      ? "border-secondary/40 bg-secondary/10"
                      : "border-border/20 bg-muted/10"
                  }`}
                >
                  <span className="block font-mono text-[9px] text-secondary">{codon}</span>
                  <span className={`block font-display text-[10px] transition-all ${
                    i < Math.floor(progress / 3) ? "text-accent" : "text-transparent"
                  }`}>
                    {i < Math.floor(progress / 3) ? getAminoAcid(codon) : "???"}
                  </span>
                </div>
              ))}
            </div>

            {Math.floor(progress / 3) > 0 && (
              <div className="mt-2">
                <p className="font-mono text-[10px] text-muted-foreground">POLYPEPTIDE CHAIN</p>
                <div className="flex flex-wrap gap-0.5">
                  {codons.slice(0, Math.floor(progress / 3)).map((codon, i) => {
                    const aa = getAminoAcid(codon);
                    if (aa === "STOP") return <span key={i} className="font-display text-[10px] text-destructive">⬛ STOP</span>;
                    return (
                      <span key={i} className="rounded bg-accent/20 px-1 py-0.5 font-display text-[9px] text-accent">
                        {aa}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex-1 rounded bg-primary px-3 py-2 font-display text-xs text-primary-foreground transition-transform hover:scale-105"
        >
          {isPlaying ? "⏸ Pause" : progress > 0 ? "▶ Resume" : "▶ Start"}
        </button>
        <button
          onClick={reset}
          className="rounded border border-border px-3 py-2 font-display text-xs text-muted-foreground hover:bg-card"
        >
          ↺ Reset
        </button>
        <button
          onClick={() => setProgress((p) => Math.min(p + 1, sequence.length))}
          className="rounded border border-border px-3 py-2 font-display text-xs text-muted-foreground hover:bg-card"
        >
          Step →
        </button>
      </div>

      {/* Progress */}
      <div className="h-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${(progress / sequence.length) * 100}%` }} />
      </div>
    </div>
  );
}

const RNA_CODON_TABLE: Record<string, string> = {
  AUG: "Met", UUU: "Phe", UUC: "Phe", UUA: "Leu", UUG: "Leu",
  CUU: "Leu", CUC: "Leu", CUA: "Leu", CUG: "Leu", AUU: "Ile",
  AUC: "Ile", AUA: "Ile", GUU: "Val", GUC: "Val", GUA: "Val",
  GUG: "Val", UCU: "Ser", UCC: "Ser", UCA: "Ser", UCG: "Ser",
  CCU: "Pro", CCC: "Pro", CCA: "Pro", CCG: "Pro", ACU: "Thr",
  ACC: "Thr", ACA: "Thr", ACG: "Thr", GCU: "Ala", GCC: "Ala",
  GCA: "Ala", GCG: "Ala", UAU: "Tyr", UAC: "Tyr", CAU: "His",
  CAC: "His", CAA: "Gln", CAG: "Gln", AAU: "Asn", AAC: "Asn",
  AAA: "Lys", AAG: "Lys", GAU: "Asp", GAC: "Asp", GAA: "Glu",
  GAG: "Glu", UGU: "Cys", UGC: "Cys", UGG: "Trp", CGU: "Arg",
  CGC: "Arg", CGA: "Arg", CGG: "Arg", AGU: "Ser", AGC: "Ser",
  AGA: "Arg", AGG: "Arg", GGU: "Gly", GGC: "Gly", GGA: "Gly",
  GGG: "Gly", UAA: "STOP", UAG: "STOP", UGA: "STOP",
};

function getAminoAcid(codon: string): string {
  return RNA_CODON_TABLE[codon] || "?";
}
