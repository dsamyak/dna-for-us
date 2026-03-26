import { X } from "lucide-react";
import type { BaseName } from "./ExplorerScene";
import { BASE_NAMES, COMPLEMENT } from "./ExplorerScene";

interface BaseInfoPanelProps {
  base: BaseName;
  index: number;
  onClose: () => void;
}

const BASE_DETAILS: Record<BaseName, { type: string; bonds: number; desc: string }> = {
  A: { type: "Purine (double-ring)", bonds: 2, desc: "Adenine forms two hydrogen bonds with Thymine. It's also a key component of ATP, the energy currency of the cell." },
  T: { type: "Pyrimidine (single-ring)", bonds: 2, desc: "Thymine is found only in DNA (replaced by Uracil in RNA). It forms two hydrogen bonds with Adenine." },
  C: { type: "Pyrimidine (single-ring)", bonds: 3, desc: "Cytosine forms three strong hydrogen bonds with Guanine. It is frequently involved in epigenetic methylation." },
  G: { type: "Purine (double-ring)", bonds: 3, desc: "Guanine forms three strong hydrogen bonds with Cytosine. GC-rich regions are more thermally stable." },
};

export default function BaseInfoPanel({ base, index, onClose }: BaseInfoPanelProps) {
  const complement = COMPLEMENT[base];
  const details1 = BASE_DETAILS[base];
  const details2 = BASE_DETAILS[complement];

  return (
    <div className="absolute right-6 top-6 z-50 w-80 animate-in slide-in-from-right-8 fade-in duration-300">
      <div className="rounded-xl border border-primary/30 bg-card/80 p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-wider text-primary">POSITION {index + 1}</p>
            <h3 className="mt-1 font-display text-2xl text-glow">{BASE_NAMES[base]} - {BASE_NAMES[complement]}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-border/50 bg-background/40 p-3">
            <div className="flex items-center justify-between">
              <span className={`font-display text-xl ${base === "A" ? "text-dna-adenine" : base === "T" ? "text-dna-thymine" : base === "C" ? "text-dna-cytosine" : "text-dna-guanine"}`}>
                {base}
              </span>
              <span className="font-mono text-xs text-muted-foreground">{details1.type}</span>
            </div>
            <p className="mt-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
              {details1.desc}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 font-mono text-xs text-secondary">
            <span className="h-px w-8 bg-secondary/50"></span>
            {details1.bonds} Hydrogen Bonds
            <span className="h-px w-8 bg-secondary/50"></span>
          </div>

          <div className="rounded-lg border border-border/50 bg-background/40 p-3">
            <div className="flex items-center justify-between">
              <span className={`font-display text-xl ${complement === "A" ? "text-dna-adenine" : complement === "T" ? "text-dna-thymine" : complement === "C" ? "text-dna-cytosine" : "text-dna-guanine"}`}>
                {complement}
              </span>
              <span className="font-mono text-xs text-muted-foreground">{details2.type}</span>
            </div>
            <p className="mt-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
              {details2.desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
