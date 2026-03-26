import { useState } from "react";

const TOPICS = [
  {
    id: "structure",
    title: "DNA Structure",
    icon: "🧬",
    content: [
      { heading: "The Double Helix", text: "DNA (Deoxyribonucleic Acid) is a double-stranded molecule that forms a twisted ladder shape called a double helix. Discovered by Watson & Crick in 1953, using X-ray crystallography data from Rosalind Franklin." },
      { heading: "Sugar-Phosphate Backbone", text: "Each strand has a backbone made of alternating deoxyribose sugar and phosphate groups. The backbone provides structural support and creates the 'rails' of the DNA ladder." },
      { heading: "Nitrogenous Bases", text: "Four bases form the 'rungs': Adenine (A) and Guanine (G) are purines (double-ring). Thymine (T) and Cytosine (C) are pyrimidines (single-ring). A purine always pairs with a pyrimidine." },
      { heading: "Base Pairing Rules", text: "Chargaff's Rules: A always pairs with T (2 hydrogen bonds), C always pairs with G (3 hydrogen bonds). This complementary base pairing is fundamental to DNA replication and gene expression." },
      { heading: "Antiparallel Strands", text: "The two strands run in opposite directions: one 5'→3' and the other 3'→5'. The numbers refer to carbon atoms in the deoxyribose sugar. This antiparallel nature is crucial for replication." },
      { heading: "Major & Minor Grooves", text: "The twisting creates two grooves of different widths. The major groove (~22Å) is where most proteins bind to read DNA. The minor groove (~12Å) is narrower but also important for protein recognition." },
    ],
  },
  {
    id: "replication",
    title: "DNA Replication",
    icon: "🔄",
    content: [
      { heading: "Semi-Conservative Model", text: "Each new DNA molecule contains one original strand and one new strand. Proven by the Meselson-Stahl experiment (1958) using isotope labeling." },
      { heading: "Key Enzymes", text: "Helicase: Unwinds the double helix at the replication fork. Primase: Creates RNA primers. DNA Polymerase III: Synthesizes new DNA (5'→3'). Ligase: Joins Okazaki fragments." },
      { heading: "Leading vs Lagging Strand", text: "Leading strand: Continuous synthesis toward the replication fork. Lagging strand: Discontinuous synthesis away from the fork, creating Okazaki fragments (~1000-2000 bases each)." },
      { heading: "Proofreading", text: "DNA Polymerase has 3'→5' exonuclease activity for error correction. Error rate: ~1 in 10 billion bases after proofreading and mismatch repair." },
    ],
  },
  {
    id: "mutations",
    title: "Mutations",
    icon: "⚡",
    content: [
      { heading: "Point Mutations", text: "Single base changes. Substitution types: Transition (purine↔purine or pyrimidine↔pyrimidine) and Transversion (purine↔pyrimidine)." },
      { heading: "Silent Mutations", text: "Base change that doesn't alter the amino acid due to codon degeneracy. Multiple codons can code for the same amino acid." },
      { heading: "Missense Mutations", text: "Base change that results in a different amino acid. Can be conservative (similar properties) or non-conservative (different properties). Example: Sickle cell disease (GAG→GTG, Glu→Val)." },
      { heading: "Nonsense Mutations", text: "Creates a premature stop codon (TAA, TAG, TGA), resulting in a truncated, usually nonfunctional protein." },
      { heading: "Frameshift Mutations", text: "Insertions or deletions that aren't multiples of 3 shift the reading frame, altering all downstream amino acids. Usually devastating to protein function." },
      { heading: "Causes", text: "Spontaneous errors during replication. Mutagens: UV radiation (thymine dimers), chemicals (base analogs, deaminating agents), reactive oxygen species. Some mutations are beneficial and drive evolution." },
    ],
  },
  {
    id: "central-dogma",
    title: "Central Dogma",
    icon: "📜",
    content: [
      { heading: "The Flow of Information", text: "DNA → RNA → Protein. Francis Crick's Central Dogma (1958) describes how genetic information flows in biological systems." },
      { heading: "Transcription", text: "RNA Polymerase reads the template strand (3'→5') and synthesizes mRNA (5'→3'). In eukaryotes, mRNA undergoes processing: 5' cap, 3' poly-A tail, and intron splicing." },
      { heading: "Translation", text: "Ribosomes read mRNA codons (3-base sequences). tRNA anticodons bring matching amino acids. Begins at AUG (start codon), ends at UAA/UAG/UGA (stop codons)." },
      { heading: "The Genetic Code", text: "64 codons code for 20 amino acids + 3 stop signals. The code is degenerate (multiple codons per amino acid), universal (same in nearly all organisms), and non-overlapping." },
    ],
  },
  {
    id: "packaging",
    title: "DNA Packaging",
    icon: "📦",
    content: [
      { heading: "Nucleosomes", text: "DNA wraps around histone protein octamers (2 each of H2A, H2B, H3, H4). ~146 base pairs wrap 1.65 times around each histone core. Connected by linker DNA (~20-80 bp)." },
      { heading: "Chromatin", text: "Nucleosomes compact into a 30nm fiber (solenoid or zigzag model). Euchromatin: loosely packed, actively transcribed. Heterochromatin: tightly packed, silenced." },
      { heading: "Chromosomes", text: "During cell division, chromatin condenses into visible chromosomes. Humans have 46 chromosomes (23 pairs). Total DNA per cell: ~6.4 billion base pairs, ~2 meters if stretched out!" },
      { heading: "Epigenetics", text: "Chemical modifications (methylation, acetylation) alter gene expression without changing the DNA sequence. These can be inherited and are influenced by environment." },
    ],
  },
];

export default function TheoryPanel() {
  const [activeTopic, setActiveTopic] = useState("structure");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(["The Double Helix"]));

  const topic = TOPICS.find((t) => t.id === activeTopic)!;

  const toggleItem = (heading: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(heading)) next.delete(heading);
      else next.add(heading);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-3 overflow-y-auto">
      <h3 className="font-display text-sm text-primary text-glow">DNA Theory & Knowledge</h3>

      {/* Topic tabs */}
      <div className="flex flex-wrap gap-1">
        {TOPICS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setActiveTopic(t.id); setExpandedItems(new Set([t.content[0].heading])); }}
            className={`rounded-lg border px-2 py-1.5 font-display text-[10px] transition-all ${
              activeTopic === t.id
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-card/40 text-muted-foreground hover:bg-card/60"
            }`}
          >
            {t.icon} {t.title}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        {topic.content.map((item) => {
          const isOpen = expandedItems.has(item.heading);
          return (
            <div key={item.heading} className="rounded border border-border bg-card/30 overflow-hidden">
              <button
                onClick={() => toggleItem(item.heading)}
                className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-card/50"
              >
                <span className="font-display text-xs text-foreground">{item.heading}</span>
                <span className="text-muted-foreground text-xs">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && (
                <div className="border-t border-border/50 px-3 py-2">
                  <p className="font-mono text-[10px] leading-relaxed text-muted-foreground">{item.text}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
