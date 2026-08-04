"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import {
  encodeMessage,
  totalBombeSettings,
  type BombeProgress,
  type BombeResult,
  type EnigmaSettings,
} from "@restless/enigma";
import {
  Loader2,
  Play,
  Square,
  Radar,
  CheckCircle2,
  XCircle,
  PauseCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SplitFlapDisplay } from "@/components/flipboard/split-flap";
import { SCENARIOS } from "@/lib/scenarios";
import { formatDuration, formatNumber } from "@/lib/utils";
import { clearHandoff, loadHandoff } from "@/lib/handoff";
import type { BombeWorkerIn, BombeWorkerOut } from "@/workers/bombe.worker";
import type { ReactNode } from "react";
import { ScanLines } from "@/components/bombe/scan-lines";

function SettingsPills({ settings }: { settings: EnigmaSettings }) {
  const plugs = Object.entries(settings.plugboardSwaps)
    .filter(([a, b]) => a < b)
    .map(([a, b]) => `${a}↔${b}`)
    .join(" ");
  return (
    <div className="flex flex-wrap gap-2 font-mono text-sm">
      <span className="rounded-lg border border-white/10 bg-zinc-950/60 px-2.5 py-1 text-amber-200">
        {settings.rotor1Position}
        {settings.rotor2Position}
        {settings.rotor3Position}
      </span>
      {plugs && (
        <span className="rounded-lg border border-white/10 bg-zinc-950/60 px-2.5 py-1 text-sky-200">
          {plugs}
        </span>
      )}
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative h-36 w-36">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-2xl font-semibold text-zinc-50">
          {pct.toFixed(1)}%
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          searched
        </span>
      </div>
    </div>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => formatNumber(Math.round(v)));
  const [text, setText] = useState(formatNumber(value));

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: 0.35,
      ease: "easeOut",
    });
    const unsub = display.on("change", setText);
    return () => {
      controls.stop();
      unsub();
    };
  }, [value, mv, display]);

  return <span className="tabular-nums">{text}</span>;
}

export function BombeConsole() {
  const total = useMemo(() => totalBombeSettings(), []);
  const [encodedMessage, setEncodedMessage] = useState("");
  const [crib, setCrib] = useState("WEATHER");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<BombeProgress | null>(null);
  const [result, setResult] = useState<BombeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const handoff = loadHandoff();
    if (handoff?.ciphertext) {
      setEncodedMessage(handoff.ciphertext);
      if (handoff.suggestedCrib) setCrib(handoff.suggestedCrib);
      clearHandoff();
    }
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const ensureWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current;
    const worker = new Worker(
      new URL("../../workers/bombe.worker.ts", import.meta.url),
    );
    worker.onmessage = (ev: MessageEvent<BombeWorkerOut>) => {
      const data = ev.data;
      if (data.type === "progress") {
        setProgress(data.progress);
      } else if (data.type === "done") {
        setResult(data.result);
        setProgress((p) =>
          p
            ? {
                ...p,
                numberOfAttempts: data.result.numberOfAttempts,
                elapsedMs: data.result.elapsedMs,
                status:
                  data.result.bombeResultStatus === "INTERRUPTED"
                    ? "USER_INTERRUPTED"
                    : "COMPLETE",
                currentSetting: data.result.settings,
              }
            : p,
        );
        setRunning(false);
      } else if (data.type === "error") {
        setError(data.message);
        setRunning(false);
      }
    };
    workerRef.current = worker;
    return worker;
  }, []);

  const loadScenario = (id: string) => {
    const s = SCENARIOS.find((x) => x.id === id);
    if (!s) return;
    // Encode plaintext only — do not prepend the historical DEFAULT_CRIB.
    // That prefix made every "success" decode look like garbage at the start.
    const encoded = encodeMessage(s.plaintext, s.settings);
    setEncodedMessage(encoded);
    setCrib(s.suggestedCrib);
    setResult(null);
    setProgress(null);
    setError(null);
  };

  const start = () => {
    if (!encodedMessage.trim()) {
      setError("Paste or load an encoded message first.");
      return;
    }
    const letters = (crib.match(/[A-Za-z]/g) ?? []).length;
    if (letters > 0 && letters < 4) {
      setError(
        "Crib is too short — use at least 4 letters to avoid false positives.",
      );
      return;
    }
    if (!crib.trim()) {
      setError("Enter a search crib (known plaintext fragment).");
      return;
    }
    setError(null);
    setResult(null);
    setProgress({
      numberOfAttempts: 0,
      totalSettings: total,
      elapsedMs: 0,
      currentSetting: {
        rotor1Position: "A",
        rotor2Position: "A",
        rotor3Position: "A",
        plugboardSwaps: {},
      },
      status: "STARTED",
    });
    setRunning(true);
    const worker = ensureWorker();
    const msg: BombeWorkerIn = {
      type: "start",
      message: encodedMessage,
      crib: crib.trim(),
    };
    worker.postMessage(msg);
  };

  const interrupt = () => {
    workerRef.current?.postMessage({ type: "cancel" } satisfies BombeWorkerIn);
  };

  const pct = progress
    ? (progress.numberOfAttempts / progress.totalSettings) * 100
    : 0;

  const statusBadge = (() => {
    if (running) return <Badge variant="live">Searching</Badge>;
    if (result?.bombeResultStatus === "SUCCESS")
      return <Badge variant="success">Broken</Badge>;
    if (result?.bombeResultStatus === "INTERRUPTED")
      return <Badge variant="muted">Interrupted</Badge>;
    if (result?.bombeResultStatus === "FAILURE")
      return <Badge variant="danger">No hit</Badge>;
    return <Badge variant="muted">Idle</Badge>;
  })();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge className="mb-3">Web Worker · in-browser</Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Bombe console
          </h1>
          <p className="mt-2 max-w-xl text-zinc-400">
            Brute-force rotor positions and a single plugboard cable until a
            known crib appears — progress streams from a dedicated worker
            thread.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {SCENARIOS.map((s) => (
            <Button
              key={s.id}
              variant="secondary"
              size="sm"
              onClick={() => loadScenario(s.id)}
              disabled={running}
            >
              {s.title}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Intercept</CardTitle>
            <CardDescription>
              Ciphertext plus a crib (known plaintext fragment). Default
              historical crib works if the message was encoded with it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cipher">Encoded message</Label>
              <Textarea
                id="cipher"
                value={encodedMessage}
                onChange={(e) => setEncodedMessage(e.target.value)}
                placeholder="Load a scenario or paste ciphertext…"
                className="min-h-[140px] font-mono text-[13px]"
                disabled={running}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crib">Search crib</Label>
              <Input
                id="crib"
                value={crib}
                onChange={(e) => setCrib(e.target.value.toUpperCase())}
                placeholder="e.g. WEATHER"
                className="font-mono uppercase"
                disabled={running}
              />
              <p className="text-[11px] text-zinc-600">
                Known plaintext inside the message · 4+ letters recommended
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {!running ? (
                <Button onClick={start} size="lg">
                  <Play className="h-4 w-4" />
                  Run Bombe
                </Button>
              ) : (
                <Button onClick={interrupt} variant="danger" size="lg">
                  <Square className="h-4 w-4" />
                  Interrupt
                </Button>
              )}
            </div>

            {error && (
              <p className="text-sm text-rose-300" role="alert">
                {error}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />
          <ScanLines active={running} />
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Radar className="h-4 w-4 text-amber-300" />
                Search telemetry
              </CardTitle>
              <CardDescription>
                {formatNumber(total)} candidate settings in the demo space
              </CardDescription>
            </div>
            {statusBadge}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
              <ProgressRing value={pct} />
              <div className="grid flex-1 grid-cols-2 gap-3">
                <Stat
                  label="Attempts"
                  value={
                    <AnimatedNumber value={progress?.numberOfAttempts ?? 0} />
                  }
                />
                <Stat
                  label="Elapsed"
                  value={formatDuration(progress?.elapsedMs ?? 0)}
                />
                <Stat
                  label="Rate"
                  value={
                    progress && progress.elapsedMs > 0
                      ? `${formatNumber(Math.round((progress.numberOfAttempts / progress.elapsedMs) * 1000))}/s`
                      : "—"
                  }
                />
                <Stat
                  label="Status"
                  value={
                    running ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Live
                      </span>
                    ) : (
                      result?.bombeResultStatus ?? "Idle"
                    )
                  }
                />
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-black/30 p-4">
              <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                Current candidate
              </div>
              {progress ? (
                <>
                  <SplitFlapDisplay
                    text={`${progress.currentSetting.rotor1Position}${progress.currentSetting.rotor2Position}${progress.currentSetting.rotor3Position}`}
                    size="lg"
                    staggerMs={40}
                  />
                  <div className="mt-4">
                    <SettingsPills settings={progress.currentSetting} />
                  </div>
                </>
              ) : (
                <p className="text-sm text-zinc-500">
                  Waiting to start — load a scenario for a one-click demo.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
        >
          <Card
            className={
              result.bombeResultStatus === "SUCCESS"
                ? "border-emerald-400/20 bg-emerald-500/[0.04]"
                : result.bombeResultStatus === "INTERRUPTED"
                  ? "border-amber-400/15"
                  : "border-rose-400/15"
            }
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                {result.bombeResultStatus === "SUCCESS" && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                )}
                {result.bombeResultStatus === "FAILURE" && (
                  <XCircle className="h-5 w-5 text-rose-400" />
                )}
                {result.bombeResultStatus === "INTERRUPTED" && (
                  <PauseCircle className="h-5 w-5 text-amber-300" />
                )}
                <CardTitle>
                  {result.bombeResultStatus === "SUCCESS"
                    ? "Settings recovered"
                    : result.bombeResultStatus === "INTERRUPTED"
                      ? "Search interrupted"
                      : "Crib never appeared"}
                </CardTitle>
              </div>
              <CardDescription>
                {formatNumber(result.numberOfAttempts)} attempts ·{" "}
                {formatDuration(result.elapsedMs)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <SettingsPills settings={result.settings} />
              <div>
                <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                  Decoded message
                </div>
                <div className="rounded-xl border border-white/5 bg-black/30 p-4">
                  <SplitFlapDisplay
                    text={result.decodedMessage.slice(0, 24)}
                    size="md"
                  />
                  <p className="mt-3 break-words font-mono text-sm leading-relaxed text-zinc-200">
                    {result.decodedMessage}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-950/50 px-3 py-2.5">
      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </div>
      <div className="mt-1 font-mono text-sm text-zinc-100">{value}</div>
    </div>
  );
}
