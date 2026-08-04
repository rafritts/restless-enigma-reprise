"use client";

import { motion } from "framer-motion";

/** Subtle CRT-style scan sweep while the Bombe is running */
export function ScanLines({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
    >
      <motion.div
        className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-amber-400/10 to-transparent"
        initial={{ top: "-30%" }}
        animate={{ top: ["-30%", "110%"] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.06) 3px)",
        }}
      />
    </div>
  );
}
