"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ALPHABET } from "@restless/enigma";
import { cn } from "@/lib/utils";

interface RotorDialProps {
  label: string;
  value: string;
  onChange: (letter: string) => void;
  className?: string;
}

export function RotorDial({ label, value, onChange, className }: RotorDialProps) {
  const letter = (value || "A").toUpperCase();
  const index = Math.max(0, ALPHABET.indexOf(letter));
  const rotation = useMotionValue(-index * (360 / 26));
  const spring = useSpring(rotation, { stiffness: 160, damping: 22, mass: 0.8 });
  const counter = useTransform(spring, (r) => -r);
  const glow = useTransform(
    spring,
    (r) => `rgba(251, 191, 36, ${0.12 + (Math.abs(r) % 360) / 3600})`,
  );
  const dragRef = useRef(0);

  useEffect(() => {
    rotation.set(-index * (360 / 26));
  }, [index, rotation]);

  const step = (delta: number) => {
    const next = (index + delta + 26) % 26;
    onChange(ALPHABET[next]!);
  };

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </div>

      <div className="relative">
        <motion.div
          className="absolute -inset-3 rounded-full blur-xl"
          style={{ backgroundColor: glow }}
        />

        <div className="relative h-36 w-36 rounded-full border border-white/10 bg-gradient-to-b from-zinc-800/90 to-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_40px_-20px_rgba(0,0,0,0.8)]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 144 144">
            {ALPHABET.split("").map((_, i) => {
              const a = (i / 26) * Math.PI * 2 - Math.PI / 2;
              const x1 = 72 + Math.cos(a) * 58;
              const y1 = 72 + Math.sin(a) * 58;
              const x2 = 72 + Math.cos(a) * (i % 2 === 0 ? 64 : 62);
              const y2 = 72 + Math.sin(a) * (i % 2 === 0 ? 64 : 62);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth={i % 2 === 0 ? 1.5 : 1}
                />
              );
            })}
          </svg>

          <motion.div
            className="absolute inset-3 cursor-grab active:cursor-grabbing rounded-full border border-white/5 bg-[radial-gradient(circle_at_30%_25%,#3f3f46,#18181b_55%,#09090b)]"
            style={{ rotate: spring }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0}
            dragMomentum={false}
            onDragStart={() => {
              dragRef.current = index;
            }}
            onDrag={(_, info) => {
              const delta = Math.round(-info.offset.x / 14);
              const next = (dragRef.current + delta + 2600) % 26;
              rotation.set(-next * (360 / 26));
            }}
            onDragEnd={(_, info) => {
              const delta = Math.round(-info.offset.x / 14);
              const next = (dragRef.current + delta + 2600) % 26;
              onChange(ALPHABET[next]!);
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div style={{ rotate: counter }}>
                <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl border border-amber-400/30 bg-zinc-950/80 shadow-[0_0_24px_rgba(251,191,36,0.15)]">
                  <span className="font-mono text-3xl font-bold text-amber-200">
                    {letter}
                  </span>
                </div>
              </motion.div>
            </div>

            <div className="absolute left-1/2 top-2 h-2 w-2 -translate-x-1/2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
          </motion.div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => step(-1)}
          className="h-8 w-8 rounded-lg border border-white/10 bg-zinc-900 text-zinc-300 transition hover:border-white/20 hover:bg-zinc-800"
          aria-label={`Decrement ${label}`}
        >
          −
        </button>
        <span className="w-8 text-center font-mono text-sm text-zinc-400">
          {letter}
        </span>
        <button
          type="button"
          onClick={() => step(1)}
          className="h-8 w-8 rounded-lg border border-white/10 bg-zinc-900 text-zinc-300 transition hover:border-white/20 hover:bg-zinc-800"
          aria-label={`Increment ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
