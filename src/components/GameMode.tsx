import { useState, useEffect, useCallback, useRef } from "react";
import * as THREE from "three";
import DNAScene, { type BaseName, type SlotData } from "./DNAScene";
import GameUI from "./GameUI";

const BASES: BaseName[] = ["A", "T", "C", "G"];
const RNA_BASES: BaseName[] = ["A", "U", "C", "G"];

export default function GameMode() {
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [selectedBase, setSelectedBase] = useState<BaseName | null>(null);
  const [highlightSlot, setHighlightSlot] = useState<number | null>(null);
  
  const [floatingBases, setFloatingBases] = useState<{ base: BaseName; position: [number, number, number] }[]>([]);

  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showMessage = useCallback((msg: string, type: "success" | "error" | "info") => {
    setMessage(msg);
    setMessageType(type);
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => {
      setMessage("");
    }, 2500);
  }, []);

  const initGame = useCallback((newLevel = 1, currentScore = 0) => {
    let numSlots = 12;
    let time = 90;
    let allowedBases: BaseName[] = BASES;

    if (newLevel === 2) {
      numSlots = 24;
      time = 120;
    } else if (newLevel === 3) {
      numSlots = 20;
      time = 100;
      allowedBases = RNA_BASES;
    }

    const newSlots: SlotData[] = Array.from({ length: numSlots }, (_, i) => ({
      id: i,
      base: allowedBases[Math.floor(Math.random() * 4)],
      position: new THREE.Vector3(),
      matched: false,
      isMutated: false,
    }));
    setSlots(newSlots);
    setGameState("playing");
    setScore(currentScore);
    setTimeLeft(time);
    setLevel(newLevel);
    setCombo(1);
    setSelectedBase(null);
    showMessage(`Level ${newLevel} Start! ${newLevel === 3 ? "Build RNA!" : "Build DNA!"}`, "info");
    
    // Generate floating bases
    const floats = Array.from({ length: numSlots + 5 }, () => ({
      base: allowedBases[Math.floor(Math.random() * 4)],
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 5 - 2,
      ] as [number, number, number],
    }));
    setFloatingBases(floats);
  }, [showMessage]);

  useEffect(() => {
    initGame(1, 0);
  }, [initGame]);

  useEffect(() => {
    if (gameState !== "playing") return;
    
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          setGameState("lost");
          return 0;
        }
        return t - 1;
      });

      // Random mutations
      if (Math.random() < 0.1) {
        setSlots((prev) => {
          const next = [...prev];
          const matchedSlots = next.filter((s) => s.matched && !s.isMutated);
          if (matchedSlots.length > 2) {
            const slotToMutate = matchedSlots[Math.floor(Math.random() * matchedSlots.length)];
            slotToMutate.isMutated = true;
            showMessage("Mutation Detected! Fix the broken bond!", "error");
            return next;
          }
          return prev;
        });
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState, showMessage]);


  const handleSlotClick = useCallback((slotId: number) => {
    if (gameState !== "playing" || !selectedBase) return;

    setSlots((prev) => {
      const next = [...prev];
      const slot = next.find((s) => s.id === slotId);
      if (!slot) return prev;
      if (slot.matched && !slot.isMutated) return prev;

      if (selectedBase === slot.base) {
        // Correct match!
        slot.matched = true;
        slot.isMutated = false;
        
        setCombo((c) => {
          const newCombo = c + 1;
          setScore((s) => s + (100 * newCombo));
          if (newCombo >= 3) {
            showMessage(`${newCombo}x Combo!`, "success");
          } else {
            showMessage("Correct match!", "success");
          }
          return newCombo;
        });

        setSelectedBase(null);
        
        // Remove a floating base of that type
        setFloatingBases((fb) => {
          const idx = fb.findIndex((b) => b.base === selectedBase);
          if (idx >= 0) {
            const newFb = [...fb];
            newFb.splice(idx, 1);
            return newFb;
          }
          return fb;
        });

        // Check win condition
        if (next.every((s) => s.matched && !s.isMutated)) {
          setGameState("won");
          setScore((s) => s + timeLeft * 10); // Time bonus
        }
      } else {
        // Wrong match!
        setCombo(1);
        setScore((s) => Math.max(0, s - 25));
        showMessage(`Wrong match! The template needs ${slot.base}.`, "error");
      }
      return next;
    });
  }, [gameState, selectedBase, timeLeft, showMessage]);

  return (
    <div className="relative flex-1 h-full w-full bg-background overflow-hidden">
      <GameUI 
        score={score}
        level={level}
        combo={combo}
        totalSlots={slots.length}
        matchedCount={slots.filter((s) => s.matched && !s.isMutated).length}
        timeLeft={timeLeft}
        selectedBase={selectedBase}
        message={message}
        messageType={messageType}
        gameState={gameState}
        onRestart={() => initGame(1, 0)}
        onNextLevel={() => initGame(level === 3 ? 1 : level + 1, score)}
        onSelectBase={setSelectedBase}
      />
      <DNAScene 
        slots={slots}
        selectedBase={selectedBase}
        floatingBases={floatingBases}
        onSelectBase={setSelectedBase}
        onSlotClick={handleSlotClick}
        highlightSlot={highlightSlot}
      />
    </div>
  );
}
