import type { BaseName } from "./DNAScene";

const BASE_LABELS: Record<BaseName, string> = {
  A: "Adenine",
  T: "Thymine",
  C: "Cytosine",
  G: "Guanine",
  U: "Uracil",
};

const BASE_TW: Record<BaseName, string> = {
  A: "text-dna-adenine border-dna-adenine/40",
  T: "text-dna-thymine border-dna-thymine/40",
  C: "text-dna-cytosine border-dna-cytosine/40",
  G: "text-dna-guanine border-dna-guanine/40",
  U: "text-orange-500 border-orange-500/40",
};

interface GameUIProps {
  score: number;
  level: number;
  combo: number;
  totalSlots: number;
  matchedCount: number;
  timeLeft: number;
  selectedBase: BaseName | null;
  message: string;
  messageType: "success" | "error" | "info";
  gameState: "playing" | "won" | "lost";
  onRestart: () => void;
  onNextLevel: () => void;
  onSelectBase: (base: BaseName) => void;
}

export default function GameUI({
  score,
  level,
  combo,
  totalSlots,
  matchedCount,
  timeLeft,
  selectedBase,
  message,
  messageType,
  gameState,
  onRestart,
  onNextLevel,
  onSelectBase,
}: GameUIProps) {
  const timePercent = (timeLeft / 90) * 100;
  const isLow = timeLeft <= 15;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Top bar */}
      <div className="pointer-events-auto flex items-center justify-between p-4">
        <div className="rounded-lg border border-border bg-card/80 px-4 py-2 backdrop-blur-md">
          <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">DNA Polymerase</p>
          <p className="font-display text-lg text-primary text-glow">Helix Decoder</p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-lg border border-border bg-card/80 px-4 py-2 text-center backdrop-blur-md">
            <p className="font-mono text-xs text-muted-foreground">LEVEL/COMBO</p>
            <p className="font-display text-xl text-primary">{level} <span className="text-sm text-accent opacity-80">({combo}x)</span></p>
          </div>
          <div className="rounded-lg border border-border bg-card/80 px-4 py-2 text-center backdrop-blur-md">
            <p className="font-mono text-xs text-muted-foreground">MATCHED</p>
            <p className="font-display text-xl text-accent">{matchedCount}/{totalSlots}</p>
          </div>
          <div className="rounded-lg border border-border bg-card/80 px-4 py-2 text-center backdrop-blur-md">
            <p className="font-mono text-xs text-muted-foreground">SCORE</p>
            <p className="font-display text-xl text-primary">{score}</p>
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className="pointer-events-none px-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${isLow ? "bg-destructive" : "bg-primary"}`}
            style={{ width: `${timePercent}%` }}
          />
        </div>
        <p className={`mt-1 text-right font-mono text-xs ${isLow ? "text-destructive" : "text-muted-foreground"}`}>
          {timeLeft}s
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className="pointer-events-none flex justify-center px-4 pt-2">
          <div
            className={`rounded-lg border px-4 py-2 font-mono text-sm backdrop-blur-md ${
              messageType === "success"
                ? "border-accent/40 bg-accent/10 text-accent"
                : messageType === "error"
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : "border-primary/40 bg-primary/10 text-primary"
            }`}
          >
            {message}
          </div>
        </div>
      )}

      {/* Base selector at bottom */}
      <div className="pointer-events-auto absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3">
        {(["A", level === 3 ? "U" : "T", "C", "G"] as BaseName[]).map((base) => (
          <button
            key={base}
            onClick={() => onSelectBase(base)}
            className={`rounded-xl border-2 px-5 py-3 font-display text-lg transition-all backdrop-blur-md ${
              BASE_TW[base]
            } ${
              selectedBase === base
                ? "scale-110 bg-card/90 shadow-lg"
                : "bg-card/50 hover:scale-105 hover:bg-card/70"
            }`}
          >
            <span className="block text-sm">{base}</span>
            <span className="block text-[10px] opacity-60">{BASE_LABELS[base]}</span>
          </button>
        ))}
      </div>

      {/* Instructions */}
      {gameState === "playing" && matchedCount === 0 && (
        <div className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 text-center">
          <p className="font-mono text-xs text-muted-foreground">
            Select a base below, then click the matching slot on the helix
          </p>
          <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">
            A↔T &nbsp; C↔G
          </p>
        </div>
      )}

      {/* Game over overlay */}
      {gameState !== "playing" && (
        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="rounded-2xl border border-border bg-card/90 p-8 text-center backdrop-blur-md">
            <p className="font-display text-2xl text-glow">
              {gameState === "won" ? (
                <span className="text-accent">DNA Strand Complete!</span>
              ) : (
                <span className="text-destructive">Time's Up!</span>
              )}
            </p>
            <p className="mt-2 font-mono text-muted-foreground">
              Score: {score} • Matched: {matchedCount}/{totalSlots}
            </p>
            <button
              onClick={gameState === "won" ? onNextLevel : onRestart}
              className="mt-4 rounded-lg bg-primary px-6 py-2 font-display text-sm text-primary-foreground transition-transform hover:scale-105"
            >
              {gameState === "won" ? (level === 3 ? "Play Again" : "Next Level") : "Try Again"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
