"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/enigma", label: "Enigma" },
  { href: "/bombe", label: "Bombe" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-zinc-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-amber-400/20 bg-amber-400/10">
            <span className="font-mono text-xs font-bold text-amber-300">RE</span>
            <span className="absolute -inset-px rounded-lg bg-gradient-to-br from-amber-400/20 to-transparent opacity-0 transition group-hover:opacity-100" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight text-zinc-50">
              Restless Enigma
            </div>
            <div className="text-[11px] text-zinc-500">Reprise</div>
          </div>
        </Link>

        <nav className="flex items-center gap-1 rounded-full border border-white/[0.06] bg-zinc-900/50 p-1">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 text-sm transition-colors",
                  active ? "text-zinc-50" : "text-zinc-400 hover:text-zinc-200",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-white/8 border border-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
