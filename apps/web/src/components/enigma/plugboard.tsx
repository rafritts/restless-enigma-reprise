"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ALPHABET, normalizePlugboard, type PlugboardMap } from "@restless/enigma";
import { cn } from "@/lib/utils";

interface PlugboardProps {
  value: PlugboardMap;
  onChange: (map: PlugboardMap) => void;
  maxCables?: number;
}

function cablePath(
  fromIdx: number,
  toIdx: number,
  width: number,
  height: number,
): string {
  const colW = width / 13;
  const rowH = height / 2;
  const fx = (fromIdx % 13) * colW + colW / 2;
  const fy = Math.floor(fromIdx / 13) * rowH + rowH / 2;
  const tx = (toIdx % 13) * colW + colW / 2;
  const ty = Math.floor(toIdx / 13) * rowH + rowH / 2;
  const midY = (fy + ty) / 2 + (fromIdx < toIdx ? 18 : -18);
  return `M ${fx} ${fy} Q ${(fx + tx) / 2} ${midY} ${tx} ${ty}`;
}

export function Plugboard({ value, onChange, maxCables = 1 }: PlugboardProps) {
  const [pending, setPending] = useState<string | null>(null);
  const pairs = useMemo(() => {
    const seen = new Set<string>();
    const result: [string, string][] = [];
    for (const [a, b] of Object.entries(value)) {
      const key = [a, b].sort().join("");
      if (seen.has(key)) continue;
      seen.add(key);
      result.push([a, b]);
    }
    return result;
  }, [value]);

  const used = useMemo(() => new Set(Object.keys(value)), [value]);

  const toggle = (letter: string) => {
    if (used.has(letter) && !pending) {
      // remove cable containing this letter
      const partner = value[letter];
      if (!partner) return;
      const next = { ...value };
      delete next[letter];
      delete next[partner];
      onChange(normalizePlugboard(next));
      return;
    }

    if (!pending) {
      setPending(letter);
      return;
    }

    if (pending === letter) {
      setPending(null);
      return;
    }

    if (used.has(letter)) {
      setPending(letter);
      return;
    }

    // form new cable; respect max
    let next = { ...value };
    if (pairs.length >= maxCables) {
      // drop oldest
      const [oldA, oldB] = pairs[0]!;
      delete next[oldA];
      delete next[oldB];
    }
    next[pending] = letter;
    next[letter] = pending;
    onChange(normalizePlugboard(next));
    setPending(null);
  };

  const width = 520;
  const height = 140;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            Plugboard
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            Click two letters to run a cable
            {maxCables === 1 ? " · demo limit 1 cable" : ` · up to ${maxCables} cables`}.
          </p>
        </div>
        <div className="font-mono text-xs text-zinc-500">
          {pairs.length === 0
            ? "No cables"
            : pairs.map(([a, b]) => `${a}↔${b}`).join("  ")}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-950/70 p-4">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
        >
          <AnimatePresence>
            {pairs.map(([a, b]) => {
              const fi = ALPHABET.indexOf(a);
              const ti = ALPHABET.indexOf(b);
              if (fi < 0 || ti < 0) return null;
              const d = cablePath(fi, ti, width, height);
              return (
                <motion.path
                  key={`${a}${b}`}
                  d={d}
                  fill="none"
                  stroke="url(#cableGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  exit={{ pathLength: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                />
              );
            })}
          </AnimatePresence>
          <defs>
            <linearGradient id="cableGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.85" />
            </linearGradient>
          </defs>
        </svg>

        <div className="relative grid grid-cols-13 gap-1.5 sm:gap-2">
          {ALPHABET.split("").map((letter) => {
            const isUsed = used.has(letter);
            const isPending = pending === letter;
            return (
              <button
                key={letter}
                type="button"
                onClick={() => toggle(letter)}
                className={cn(
                  "aspect-square rounded-lg border font-mono text-xs sm:text-sm font-semibold transition-all duration-200",
                  isPending &&
                    "border-amber-400/60 bg-amber-400/20 text-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.25)] scale-105",
                  isUsed &&
                    !isPending &&
                    "border-sky-400/40 bg-sky-400/10 text-sky-100",
                  !isUsed &&
                    !isPending &&
                    "border-white/10 bg-zinc-900/80 text-zinc-300 hover:border-white/20 hover:bg-zinc-800",
                )}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
