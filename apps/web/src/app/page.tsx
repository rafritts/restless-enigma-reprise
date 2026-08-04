"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Cpu,
  Lock,
  Radio,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SplitFlapDisplay } from "@/components/flipboard/split-flap";
import { useEffect, useState } from "react";
import { encodeMessage, getDefaultSettings, totalBombeSettings } from "@restless/enigma";
import { formatNumber } from "@/lib/utils";
import { HERO_PHRASES } from "@/lib/phrases";

export default function HomePage() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [cipher, setCipher] = useState("");
  const total = totalBombeSettings();

  useEffect(() => {
    const settings = getDefaultSettings();
    setCipher(encodeMessage(HERO_PHRASES[phraseIdx]!, settings));
  }, [phraseIdx]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPhraseIdx((i) => (i + 1) % HERO_PHRASES.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="space-y-20">
      <section className="relative">
        <div className="animate-rise flex flex-col items-start gap-6">
          <Badge variant="live" className="gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky-400" />
            </span>
            Client-side crypto lab
          </Badge>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-50 sm:text-6xl sm:leading-[1.05]">
            Encrypt like 1940.
            <span className="block bg-gradient-to-r from-amber-200 via-amber-100 to-sky-200 bg-clip-text text-transparent">
              Break like Turing.
            </span>
          </h1>

          <p className="max-w-2xl text-lg leading-relaxed text-zinc-400">
            Restless Enigma Reprise is a polished rebuild of the first app I
            ever shipped with an LLM — a working Enigma machine and crib-based
            Bombe, now as a high-end TypeScript product that runs entirely in
            your browser.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/enigma">
                Open Enigma
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/bombe">Run the Bombe</Link>
            </Button>
          </div>

          <div className="flex flex-wrap gap-6 pt-2 text-sm text-zinc-500">
            <div>
              <span className="font-mono text-zinc-200">{formatNumber(total)}</span>{" "}
              demo settings
            </div>
            <div>
              <span className="font-mono text-zinc-200">0</span> servers required
            </div>
            <div>
              <span className="font-mono text-zinc-200">100%</span> TypeScript
            </div>
          </div>
        </div>

        <motion.div
          className="mt-12 overflow-hidden rounded-3xl border border-white/[0.07] bg-zinc-900/40 p-6 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
              <Radio className="h-3.5 w-3.5 text-amber-300" />
              Live intercept board
            </div>
            <div className="font-mono text-xs text-zinc-500">
              plain → cipher · default day key
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="mb-2 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                Plaintext
              </div>
              <SplitFlapDisplay
                text={HERO_PHRASES[phraseIdx]!}
                size="lg"
                maxChars={22}
                staggerMs={28}
              />
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div>
              <div className="mb-2 text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                Ciphertext
              </div>
              <SplitFlapDisplay
                text={cipher || "······················"}
                size="lg"
                maxChars={22}
                staggerMs={28}
              />
            </div>
          </div>
        </motion.div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            icon: Lock,
            title: "Faithful cipher core",
            body: "Three rotors, reflector, plugboard — ported from the original Java engine with the same test vectors.",
          },
          {
            icon: Cpu,
            title: "In-browser Bombe",
            body: "Millions of candidate settings swept in a Web Worker with live attempt rates and interrupt support.",
          },
          {
            icon: Zap,
            title: "Motion as interface",
            body: "Split-flap boards, spring-loaded rotors, lampboard flashes, animated plugboard cables.",
          },
        ].map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
          >
            <Card className="group h-full transition duration-300 hover:border-white/10">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-400/10 text-amber-300 transition group-hover:scale-105">
                  <f.icon className="h-4 w-4" />
                </div>
                <CardTitle>{f.title}</CardTitle>
                <CardDescription>{f.body}</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Badge variant="muted" className="mb-2 w-fit">
              Path A
            </Badge>
            <CardTitle className="text-xl">1. Compose on Enigma</CardTitle>
            <CardDescription>
              Dial in rotor positions, patch a plugboard cable, type a message.
              Ciphertext updates on the flipboard as you go — then hand it to
              the Bombe in one click.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/enigma">
                Go to Enigma
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge variant="muted" className="mb-2 w-fit">
              Path B
            </Badge>
            <CardTitle className="text-xl">2. Recover with Bombe</CardTitle>
            <CardDescription>
              Feed ciphertext and a known crib. Watch candidate settings race
              across the board until the plaintext snaps into place.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/bombe">
                Go to Bombe
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-amber-400/15 bg-gradient-to-br from-amber-400/10 via-zinc-900/40 to-sky-500/10 p-8 sm:p-12">
        <div className="relative z-10 max-w-xl">
          <div className="mb-3 flex items-center gap-2 text-amber-200">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-[0.18em]">
              From GPT-4 prototype to reprise
            </span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
            Same idea. Far higher craft.
          </h2>
          <p className="mt-3 text-zinc-400">
            The 2023 original was Spring Boot + a scaffolded Svelte UI. This
            reprise is a monorepo cipher package, Web Worker Bombe, and a UI
            that treats every interaction as a moment.
          </p>
          <div className="mt-6">
            <Button asChild size="lg">
              <Link href="/enigma">Start encrypting</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
