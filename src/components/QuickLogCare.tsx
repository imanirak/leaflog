"use client";

import { useState, useTransition } from "react";
import { logCare, type CareType } from "@/lib/careLogActions";

const ACTIONS: { type: CareType; label: string; emoji: string }[] = [
  { type: "watered", label: "Watered", emoji: "💧" },
  { type: "fertilized", label: "Fertilized", emoji: "🌱" },
  { type: "repotted", label: "Repotted", emoji: "🪴" },
  { type: "pruned", label: "Pruned", emoji: "✂️" },
  { type: "misted", label: "Misted", emoji: "💦" },
  { type: "rotated", label: "Rotated", emoji: "🔄" },
];

export default function QuickLogCare({ plantId }: { plantId: string }) {
  const [pending, startTransition] = useTransition();
  const [justLogged, setJustLogged] = useState<CareType | null>(null);

  function handleLog(type: CareType) {
    startTransition(async () => {
      await logCare(plantId, type);
      setJustLogged(type);
      setTimeout(() => setJustLogged(null), 1500);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map(({ type, label, emoji }) => (
        <button
          key={type}
          onClick={() => handleLog(type)}
          disabled={pending}
          className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-all disabled:opacity-50"
          style={{
            background: justLogged === type ? "var(--orange-light)" : "var(--card)",
            borderColor: justLogged === type ? "var(--orange)" : "#ede8e0",
            color: justLogged === type ? "var(--orange)" : "var(--text)",
          }}
        >
          <span>{justLogged === type ? "✓" : emoji}</span>
          {justLogged === type ? "Logged!" : label}
        </button>
      ))}
    </div>
  );
}
