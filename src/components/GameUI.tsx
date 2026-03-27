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
  U: "text-orange-400 border-orange-400/40",
};

interface GameUIProps {
  score: number;
  level: number;
  combo: number;
  totalSlots: number;
  matchedCount: number;
  timeLeft: number;
  selectedBase: BaseName | null;
  allowedBases: BaseName[];
  message: string;
  messageType: "success" | "error" | "info";
  gameState: "playing" | "won" | "lost";
  onRestart: () => void;
  onNextLevel: () => void;
  onSelectBase: (base: BaseName) => void;
  onHint?: () => void;
}

export default function GameUI({
  score,
  level,
  combo,
  totalSlots,
  matchedCount,
  timeLeft,
  selectedBase,
  allowedBases,
  message,
  messageType,
  gameState,
  onRestart,
  onNextLevel,
  onSelectBase,
  onHint,
}: GameUIProps) {
  const timePercent = (timeLeft / 90) * 100;
  const isLow = timeLeft <= 15;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Top bar */}
      <div className="pointer-events-auto flex flex-col sm:flex-row items-center justify-between p-2 sm:p-4 gap-2 sm:gap-0">
        <div className="rounded-lg border border-border bg-card/80 px-4 sm:px-6 py-2 sm:py-3 backdrop-blur-md text-center sm:text-left">
          <p className="font-display text-xs sm:text-sm uppercase tracking-widest text-muted-foreground">Level {level} • DNA Polymerase</p>
          <p className="font-display text-xl sm:text-2xl lg:text-3xl text-primary text-glow">Helix Decoder</p>
        </div>
        <div className="flex gap-2 sm:gap-4 w-full sm:w-auto justify-center">
          <div className="flex-1 sm:flex-none rounded-lg border border-border bg-card/80 px-4 sm:px-6 py-2 sm:py-3 text-center backdrop-blur-md">
            <p className="font-mono text-xs sm:text-sm text-muted-foreground">MATCHED</p>
            <p className="font-display text-2xl sm:text-3xl lg:text-4xl text-accent">{matchedCount}/{totalSlots}</p>
          </div>
          <div className="flex-1 sm:flex-none rounded-lg border border-border bg-card/80 px-4 sm:px-6 py-2 sm:py-3 text-center backdrop-blur-md relative">
            <p className="font-mono text-xs sm:text-sm text-muted-foreground">SCORE</p>
            <p className="font-display text-2xl sm:text-3xl lg:text-4xl text-primary">{score}</p>
            {combo > 1 && (
              <span className="absolute -top-3 -right-3 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full animate-bounce shadow-lg">
                {combo}x
              </span>
            )}
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
        <p className={`mt-2 text-right font-mono text-sm sm:text-base md:text-lg font-bold ${isLow ? "text-destructive" : "text-muted-foreground"}`}>
          {timeLeft}s
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className="pointer-events-none flex justify-center px-4 pt-2">
          <div
            className={`rounded-lg border px-6 py-3 font-mono text-base md:text-lg font-semibold backdrop-blur-md shadow-lg ${
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
      <div className="pointer-events-auto absolute bottom-4 sm:bottom-8 w-full flex flex-col items-center gap-4 px-4">
        {gameState === "playing" && onHint && (
          <button
            onClick={onHint}
            className="rounded-full border border-secondary/50 bg-secondary/10 px-6 py-2 font-display text-sm text-secondary hover:bg-secondary/20 transition-colors backdrop-blur-md"
          >
            💡 Hint (-15s)
          </button>
        )}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          {allowedBases.map((base) => (
            <button
              key={base}
              onClick={() => onSelectBase(base)}
              className={`rounded-xl border-2 px-6 sm:px-8 py-4 sm:py-5 font-display text-xl sm:text-2xl transition-all backdrop-blur-md ${
                BASE_TW[base]
              } ${
                selectedBase === base
                  ? "scale-110 bg-card/90 shadow-xl"
                  : "bg-card/50 hover:scale-105 hover:bg-card/70"
              }`}
            >
              <span className="block text-xl sm:text-2xl font-bold">{base}</span>
              <span className="block text-xs sm:text-sm opacity-80 mt-1">{BASE_LABELS[base]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      {gameState === "playing" && matchedCount === 0 && (
        <div className="pointer-events-none absolute bottom-[180px] sm:bottom-36 left-1/2 -translate-x-1/2 text-center w-full px-4">
          <p className="font-mono text-sm sm:text-base text-muted-foreground">
            Select a base below, then click the matching slot on the helix
          </p>
          <p className="font-mono text-xs sm:text-sm text-muted-foreground/60 mt-2">
            A↔T &nbsp; C↔G &nbsp; (A↔U for RNA)
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
            {gameState === "won" ? (
              <button
                onClick={onNextLevel}
                className="mt-4 rounded-lg bg-accent px-6 py-2 font-display text-sm text-accent-foreground transition-transform hover:scale-105"
              >
                Next Level
              </button>
            ) : (
              <button
                onClick={onRestart}
                className="mt-4 rounded-lg bg-primary px-6 py-2 font-display text-sm text-primary-foreground transition-transform hover:scale-105"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
