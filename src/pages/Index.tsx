import { useState, useEffect, useCallback, useRef } from "react";
import DNAScene, { type BaseName, type SlotData } from "@/components/DNAScene";
import GameUI from "@/components/GameUI";

const BASES: BaseName[] = ["A", "T", "C", "G"];
const COMPLEMENT: Record<BaseName, BaseName> = { A: "T", T: "A", C: "G", G: "C" };

function generateSlots(count: number): SlotData[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    base: BASES[Math.floor(Math.random() * 4)],
    position: new (window as any).THREE?.Vector3?.(0, 0, 0) ?? { x: 0, y: 0, z: 0 } as any,
    matched: false,
  }));
}

function generateFloatingPositions(): [number, number, number][] {
  const positions: [number, number, number][] = [];
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const r = 3.5;
    positions.push([Math.cos(angle) * r, (Math.random() - 0.5) * 4, Math.sin(angle) * r]);
  }
  return positions;
}

const TOTAL_SLOTS = 8;
const GAME_TIME = 90;

export default function Index() {
  const [slots, setSlots] = useState<SlotData[]>(() => generateSlots(TOTAL_SLOTS));
  const [selectedBase, setSelectedBase] = useState<BaseName | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [message, setMessage] = useState("Select a nucleotide base to begin");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [highlightSlot, setHighlightSlot] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const matchedCount = slots.filter((s) => s.matched).length;

  // Timer
  useEffect(() => {
    if (gameState !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameState("lost");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  // Win check
  useEffect(() => {
    if (matchedCount === TOTAL_SLOTS && gameState === "playing") {
      setGameState("won");
      setMessage("Perfect! You've completed the DNA strand!");
      setMessageType("success");
    }
  }, [matchedCount, gameState]);

  const showMessage = useCallback((msg: string, type: "success" | "error" | "info") => {
    setMessage(msg);
    setMessageType(type);
    if (type !== "info") {
      setTimeout(() => {
        setMessage("");
      }, 2000);
    }
  }, []);

  const handleSlotClick = useCallback(
    (slotId: number) => {
      if (gameState !== "playing") return;
      const slot = slots.find((s) => s.id === slotId);
      if (!slot || slot.matched) return;

      if (!selectedBase) {
        showMessage("Select a base first!", "info");
        return;
      }

      const needed = slot.base;
      if (selectedBase === needed) {
        // Correct match!
        setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, matched: true } : s)));
        setScore((s) => s + Math.ceil(timeLeft / 10) * 10);
        showMessage(`Correct! ${COMPLEMENT[needed]} bonds with ${needed}`, "success");
        setSelectedBase(null);
        setHighlightSlot(null);
      } else {
        showMessage(`Wrong! ${COMPLEMENT[needed]} pairs with ${needed}, not ${selectedBase}`, "error");
        setScore((s) => Math.max(0, s - 5));
      }
    },
    [selectedBase, slots, gameState, timeLeft, showMessage]
  );

  const handleSelectBase = useCallback((base: BaseName | null) => {
    if (gameState !== "playing") return;
    setSelectedBase((prev) => (prev === base ? null : base));
    setHighlightSlot(null);
    if (base) {
      // Find first unmatched slot that needs this base
      const targetSlot = slots.find((s) => !s.matched && s.base === base);
      if (targetSlot) {
        setHighlightSlot(targetSlot.id);
      }
    }
  }, [gameState, slots]);

  const handleRestart = useCallback(() => {
    setSlots(generateSlots(TOTAL_SLOTS));
    setSelectedBase(null);
    setScore(0);
    setTimeLeft(GAME_TIME);
    setMessage("Select a nucleotide base to begin");
    setMessageType("info");
    setGameState("playing");
    setHighlightSlot(null);
  }, []);

  const floatingBases = BASES.map((base, i) => {
    const positions = generateFloatingPositions();
    return { base, position: positions[i] };
  });

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <DNAScene
        slots={slots}
        selectedBase={selectedBase}
        floatingBases={floatingBases}
        onSelectBase={handleSelectBase}
        onSlotClick={handleSlotClick}
        highlightSlot={highlightSlot}
      />
      <GameUI
        score={score}
        totalSlots={TOTAL_SLOTS}
        matchedCount={matchedCount}
        timeLeft={timeLeft}
        selectedBase={selectedBase}
        message={message}
        messageType={messageType}
        gameState={gameState}
        onRestart={handleRestart}
        onSelectBase={handleSelectBase}
      />
    </div>
  );
}
