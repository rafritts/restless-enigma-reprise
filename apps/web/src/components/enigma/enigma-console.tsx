"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  encodeMessage,
  getDefaultSettings,
  normalizePlugboard,
  type EnigmaSettings,
} from "@restless/enigma";
import { ArrowRightLeft, Copy, Check, Sparkles, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SplitFlapDisplay } from "@/components/flipboard/split-flap";
import { RotorDial } from "@/components/enigma/rotor-dial";
import { Plugboard } from "@/components/enigma/plugboard";
import { Lampboard } from "@/components/enigma/lampboard";
import { SCENARIOS } from "@/lib/scenarios";
import { saveHandoff } from "@/lib/handoff";

export function EnigmaConsole() {
  const router = useRouter();
  const defaults = getDefaultSettings();
  const [message, setMessage] = useState("Attack at dawn");
  const [settings, setSettings] = useState<EnigmaSettings>({
    rotor1Position: defaults.rotor1Position,
    rotor2Position: defaults.rotor2Position,
    rotor3Position: defaults.rotor3Position,
    plugboardSwaps: defaults.plugboardSwaps,
  });
  const [copied, setCopied] = useState(false);
  const [activeLamp, setActiveLamp] = useState<string | null>(null);
  const prevCipher = useRef("");

  const ciphertext = useMemo(
    () => (message ? encodeMessage(message, settings) : ""),
    [message, settings],
  );

  useEffect(() => {
    if (!ciphertext) {
      prevCipher.current = "";
      return;
    }
    // light the lamp for the last newly produced letter
    if (ciphertext.length >= prevCipher.current.length) {
      const last = ciphertext[ciphertext.length - 1];
      if (last && /[A-Z]/i.test(last)) setActiveLamp(last);
    }
    prevCipher.current = ciphertext;
  }, [ciphertext]);

  const setRotor = (key: keyof EnigmaSettings, letter: string) => {
    setSettings((s) => ({ ...s, [key]: letter }));
  };

  const loadScenario = (id: string) => {
    const s = SCENARIOS.find((x) => x.id === id);
    if (!s) return;
    setMessage(s.plaintext);
    setSettings({
      ...s.settings,
      plugboardSwaps: normalizePlugboard(s.settings.plugboardSwaps),
    });
  };

  const copyOut = async () => {
    await navigator.clipboard.writeText(ciphertext);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const sendToBombe = () => {
    if (!ciphertext) return;
    // Prefer a word from the plaintext as crib hint
    const word =
      message
        .toUpperCase()
        .match(/[A-Z]{4,}/)?.[0] ?? "ATTACK";
    saveHandoff({
      ciphertext,
      suggestedCrib: word,
      settings,
    });
    router.push("/bombe");
  };

  const roundTrip = ciphertext ? encodeMessage(ciphertext, settings) : "";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge className="mb-3">Live cipher</Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Enigma console
          </h1>
          <p className="mt-2 max-w-xl text-zinc-400">
            Set the rotors, patch the plugboard, and watch plaintext become
            ciphertext on the flipboard — reciprocal, letter by letter.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {SCENARIOS.map((s) => (
            <Button
              key={s.id}
              variant="secondary"
              size="sm"
              onClick={() => loadScenario(s.id)}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {s.title}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Machine settings</CardTitle>
            <CardDescription>
              Drag rotors or use steppers. Plugboard limited to one cable for
              demo-scale Bombe runs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-wrap items-start justify-center gap-8 sm:gap-10">
              <RotorDial
                label="Rotor I"
                value={settings.rotor1Position}
                onChange={(v) => setRotor("rotor1Position", v)}
              />
              <RotorDial
                label="Rotor II"
                value={settings.rotor2Position}
                onChange={(v) => setRotor("rotor2Position", v)}
              />
              <RotorDial
                label="Rotor III"
                value={settings.rotor3Position}
                onChange={(v) => setRotor("rotor3Position", v)}
              />
            </div>

            <Plugboard
              value={settings.plugboardSwaps}
              onChange={(plugboardSwaps) =>
                setSettings((s) => ({ ...s, plugboardSwaps }))
              }
              maxCables={1}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Message</CardTitle>
              <CardDescription>
                Non-letters pass through untouched; only A–Z drive the rotors.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plaintext">Plaintext</Label>
                <Textarea
                  id="plaintext"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message…"
                  className="min-h-[120px] font-medium"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Encrypted live · same settings decrypt
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>Cipher flipboard</CardTitle>
                <CardDescription>Split-flap output · updates as you type</CardDescription>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={copyOut} disabled={!ciphertext}>
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={sendToBombe}
                  disabled={!ciphertext}
                >
                  <Radar className="h-4 w-4" />
                  Break
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-xl border border-white/5 bg-black/40 p-4 sm:p-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={ciphertext || "empty"}
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: 1 }}
                  >
                    <SplitFlapDisplay
                      text={ciphertext || "READY"}
                      size="md"
                      maxChars={Math.min(Math.max(ciphertext.length, 8), 18)}
                    />
                  </motion.div>
                </AnimatePresence>
                {ciphertext.length > 18 && (
                  <p className="mt-3 break-all font-mono text-sm leading-relaxed text-amber-100/80">
                    {ciphertext}
                  </p>
                )}
              </div>

              <Lampboard activeLetter={activeLamp} />

              {roundTrip && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-4 py-3"
                >
                  <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-400/80">
                    Round-trip check
                  </div>
                  <p className="mt-1 font-mono text-sm text-emerald-100/90">{roundTrip}</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
