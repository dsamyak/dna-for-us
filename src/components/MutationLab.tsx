import { useState, useCallback } from "react";
import type { BaseName } from "./ExplorerScene";

const BASES: BaseName[] = ["A", "T", "C", "G"];
const COMPLEMENT: Record<BaseName, BaseName> = { A: "T", T: "A", C: "G", G: "C" };

const MUTATION_TYPES = [
  { id: "substitution", label: "Substitution", desc: "One base replaced by another" },
  { id: "insertion", label: "Insertion", desc: "Extra base added to sequence" },
  { id: "deletion", label: "Deletion", desc: "Base removed from sequence" },
  { id: "silent", label: "Silent Mutation", desc: "Change that doesn't affect protein" },
  { id: "missense", label: "Missense", desc: "Changes one amino acid" },
  { id: "nonsense", label: "Nonsense", desc: "Creates premature stop codon" },
] as const;

// Codon table (simplified)
const CODON_TABLE: Record<string, string> = {
  ATG: "Met (START)", TTT: "Phe", TTC: "Phe", TTA: "Leu", TTG: "Leu",
  CTT: "Leu", CTC: "Leu", CTA: "Leu", CTG: "Leu", ATT: "Ile",
  ATC: "Ile", ATA: "Ile", GTT: "Val", GTC: "Val", GTA: "Val",
  GTG: "Val", TCT: "Ser", TCC: "Ser", TCA: "Ser", TCG: "Ser",
  CCT: "Pro", CCC: "Pro", CCA: "Pro", CCG: "Pro", ACT: "Thr",
  ACC: "Thr", ACA: "Thr", ACG: "Thr", GCT: "Ala", GCC: "Ala",
  GCA: "Ala", GCG: "Ala", TAT: "Tyr", TAC: "Tyr", CAT: "His",
  CAC: "His", CAA: "Gln", CAG: "Gln", AAT: "Asn", AAC: "Asn",
  AAA: "Lys", AAG: "Lys", GAT: "Asp", GAC: "Asp", GAA: "Glu",
  GAG: "Glu", TGT: "Cys", TGC: "Cys", TGG: "Trp", CGT: "Arg",
  CGC: "Arg", CGA: "Arg", CGG: "Arg", AGT: "Ser", AGC: "Ser",
  AGA: "Arg", AGG: "Arg", GGT: "Gly", GGC: "Gly", GGA: "Gly",
  GGG: "Gly", TAA: "STOP", TAG: "STOP", TGA: "STOP",
};

function getCodons(seq: BaseName[]): string[] {
  const codons: string[] = [];
  for (let i = 0; i + 2 < seq.length; i += 3) {
    codons.push(seq[i] + seq[i + 1] + seq[i + 2]);
  }
  return codons;
}

interface MutationLabProps {
  sequence: BaseName[];
  onSequenceChange: (seq: BaseName[]) => void;
  onMutationIndex: (idx: number | null) => void;
  onMutationType: (type: string | null) => void;
}

const BASE_STYLE: Record<BaseName, string> = {
  A: "text-dna-adenine bg-dna-adenine/10 border-dna-adenine/30",
  T: "text-dna-thymine bg-dna-thymine/10 border-dna-thymine/30",
  C: "text-dna-cytosine bg-dna-cytosine/10 border-dna-cytosine/30",
  G: "text-dna-guanine bg-dna-guanine/10 border-dna-guanine/30",
};

export default function MutationLab({ sequence, onSequenceChange, onMutationIndex, onMutationType }: MutationLabProps) {
  const [selectedMutation, setSelectedMutation] = useState<string>("substitution");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [history, setHistory] = useState<BaseName[][]>([]);
  const [lastMutationResult, setLastMutationResult] = useState<string>("");

  const applyMutation = useCallback(() => {
    if (selectedIndex === null) return;

    setHistory((h) => [...h, [...sequence]]);
    const newSeq = [...sequence];

    switch (selectedMutation) {
      case "substitution":
      case "missense":
      case "silent": {
        const current = newSeq[selectedIndex];
        const others = BASES.filter((b) => b !== current);
        const replacement = others[Math.floor(Math.random() * others.length)];
        newSeq[selectedIndex] = replacement;

        // Check if protein changes
        const oldCodons = getCodons(sequence);
        const newCodons = getCodons(newSeq);
        const codonIdx = Math.floor(selectedIndex / 3);
        const oldAA = CODON_TABLE[oldCodons[codonIdx]] || "?";
        const newAA = CODON_TABLE[newCodons[codonIdx]] || "?";

        if (oldAA === newAA) {
          setLastMutationResult(`Silent mutation: ${current}→${replacement}. Amino acid unchanged (${oldAA})`);
        } else if (newAA === "STOP") {
          setLastMutationResult(`Nonsense mutation: ${current}→${replacement}. Creates premature STOP codon!`);
        } else {
          setLastMutationResult(`Missense mutation: ${current}→${replacement}. Amino acid changed: ${oldAA} → ${newAA}`);
        }
        break;
      }
      case "insertion": {
        const insertBase = BASES[Math.floor(Math.random() * 4)];
        newSeq.splice(selectedIndex, 0, insertBase);
        if (newSeq.length > 20) newSeq.pop();
        setLastMutationResult(`Insertion: Added ${insertBase} at position ${selectedIndex + 1}. Frameshift mutation! All downstream codons shifted.`);
        break;
      }
      case "deletion": {
        if (newSeq.length > 6) {
          const removed = newSeq.splice(selectedIndex, 1)[0];
          setLastMutationResult(`Deletion: Removed ${removed} at position ${selectedIndex + 1}. Frameshift mutation! All downstream codons shifted.`);
        }
        break;
      }
      case "nonsense": {
        // Force a stop codon
        const codonStart = Math.floor(selectedIndex / 3) * 3;
        if (codonStart + 2 < newSeq.length) {
          newSeq[codonStart] = "T";
          newSeq[codonStart + 1] = "A";
          newSeq[codonStart + 2] = "A";
          setLastMutationResult(`Nonsense mutation: Codon at position ${codonStart + 1} changed to TAA (STOP). Protein truncated!`);
        }
        break;
      }
    }

    onSequenceChange(newSeq);
    onMutationIndex(selectedIndex);
    onMutationType(selectedMutation);
  }, [selectedIndex, selectedMutation, sequence, onSequenceChange, onMutationIndex, onMutationType]);

  const undo = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      onSequenceChange(prev);
      onMutationIndex(null);
      onMutationType(null);
      setLastMutationResult("");
    }
  };

  const codons = getCodons(sequence);

  return (
    <div className="flex flex-col gap-3 overflow-y-auto">
      <h3 className="font-display text-sm text-primary text-glow">Mutation Laboratory</h3>

      {/* Sequence display */}
      <div>
        <p className="mb-1 font-mono text-[10px] text-muted-foreground">5' CODING STRAND 3'</p>
        <div className="flex flex-wrap gap-0.5">
          {sequence.map((base, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedIndex(i);
                onMutationIndex(i);
              }}
              className={`w-7 h-7 rounded text-xs font-display border transition-all ${BASE_STYLE[base]} ${
                selectedIndex === i ? "ring-2 ring-primary scale-110" : "hover:scale-105"
              }`}
            >
              {base}
            </button>
          ))}
        </div>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">3' TEMPLATE STRAND 5'</p>
        <div className="flex flex-wrap gap-0.5">
          {sequence.map((base, i) => (
            <div key={i} className={`w-7 h-7 rounded text-xs font-display border flex items-center justify-center ${BASE_STYLE[COMPLEMENT[base]]} opacity-60`}>
              {COMPLEMENT[base]}
            </div>
          ))}
        </div>
      </div>

      {/* Codons & Amino acids */}
      <div>
        <p className="mb-1 font-mono text-[10px] text-muted-foreground">CODONS → AMINO ACIDS</p>
        <div className="flex flex-wrap gap-1">
          {codons.map((codon, i) => {
            const aa = CODON_TABLE[codon] || "?";
            const isStop = aa === "STOP";
            return (
              <div
                key={i}
                className={`rounded border px-2 py-1 text-center font-mono text-[10px] ${
                  isStop ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-border bg-card/60 text-foreground"
                }`}
              >
                <span className="block text-[9px] text-muted-foreground">{codon}</span>
                <span className="font-display text-xs">{aa}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mutation type selector */}
      <div>
        <p className="mb-1 font-mono text-[10px] text-muted-foreground">MUTATION TYPE</p>
        <div className="grid grid-cols-2 gap-1">
          {MUTATION_TYPES.map((mt) => (
            <button
              key={mt.id}
              onClick={() => setSelectedMutation(mt.id)}
              className={`rounded border px-2 py-1.5 text-left transition-all ${
                selectedMutation === mt.id
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border bg-card/40 text-muted-foreground hover:bg-card/60"
              }`}
            >
              <span className="block font-display text-[10px]">{mt.label}</span>
              <span className="block font-mono text-[8px] opacity-60">{mt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={applyMutation}
          disabled={selectedIndex === null}
          className="flex-1 rounded bg-primary px-3 py-2 font-display text-xs text-primary-foreground transition-transform hover:scale-105 disabled:opacity-40"
        >
          Apply Mutation
        </button>
        <button
          onClick={undo}
          disabled={history.length === 0}
          className="rounded border border-border px-3 py-2 font-display text-xs text-muted-foreground transition-all hover:bg-card disabled:opacity-40"
        >
          Undo
        </button>
      </div>

      {/* Result */}
      {lastMutationResult && (
        <div className="rounded border border-accent/30 bg-accent/5 p-2 font-mono text-[10px] text-accent">
          {lastMutationResult}
        </div>
      )}
    </div>
  );
}
