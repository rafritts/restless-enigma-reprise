import { DEFAULT_CRIB } from "./defaults";
import { encodeMessage } from "./machine";
import {
  generatePlugboardSettings,
  totalBombeSettings,
} from "./plugboard";
import type {
  BombeProgressCallback,
  BombeResult,
  BombeSearchCursor,
  EnigmaSettings,
} from "./types";

export interface BombeOptions {
  message: string;
  crib?: string;
  /** Resume scanning from this cursor (after a previous hit or interrupt) */
  resumeFrom?: BombeSearchCursor | null;
  onProgress?: BombeProgressCallback;
  progressEvery?: number;
  shouldCancel?: () => boolean;
  yieldEvery?: number;
}

function posChar(n: number): string {
  return String.fromCharCode(65 + n);
}

function emptyCursor(): BombeSearchCursor {
  return {
    r1: 0,
    r2: 0,
    r3: 0,
    plugIndex: 0,
    attemptsSoFar: 0,
    matchesFound: 0,
    elapsedMsSoFar: 0,
  };
}

/** Advance past the current (r1,r2,r3,plugIndex) slot. Null if search space is done. */
export function advanceCursor(
  cursor: BombeSearchCursor,
  plugCount: number,
): BombeSearchCursor | null {
  let { r1, r2, r3, plugIndex } = cursor;
  plugIndex += 1;
  if (plugIndex >= plugCount) {
    plugIndex = 0;
    r3 += 1;
    if (r3 >= 26) {
      r3 = 0;
      r2 += 1;
      if (r2 >= 26) {
        r2 = 0;
        r1 += 1;
        if (r1 >= 26) return null;
      }
    }
  }
  return { ...cursor, r1, r2, r3, plugIndex };
}

/**
 * Brute-force rotor positions + plugboard for a known crib substring.
 * Stops at the first hit; call again with `resumeFrom` to find the next.
 */
export async function breakEnigma(options: BombeOptions): Promise<BombeResult> {
  const crib = (options.crib?.trim() ? options.crib : DEFAULT_CRIB).toUpperCase();
  const message = options.message.toUpperCase();
  const progressEvery = options.progressEvery ?? 25_000;
  const yieldEvery = options.yieldEvery ?? 2_000;
  const plugboards = generatePlugboardSettings();
  const plugCount = plugboards.length;
  const total = totalBombeSettings();

  const startCursor = options.resumeFrom ?? emptyCursor();
  const started = performance.now();
  let attempts = startCursor.attemptsSoFar;
  let matchesFound = startCursor.matchesFound;

  let testSettings: EnigmaSettings = {
    rotor1Position: posChar(startCursor.r1),
    rotor2Position: posChar(startCursor.r2),
    rotor3Position: posChar(startCursor.r3),
    plugboardSwaps: plugboards[Math.min(startCursor.plugIndex, plugCount - 1)] ?? {},
  };

  const elapsed = () =>
    startCursor.elapsedMsSoFar + (performance.now() - started);

  const emit = (
    status: BombeResult["bombeResultStatus"] | "STARTED" | "IN_PROGRESS",
  ) => {
    options.onProgress?.({
      numberOfAttempts: attempts,
      totalSettings: total,
      elapsedMs: elapsed(),
      currentSetting: {
        ...testSettings,
        plugboardSwaps: { ...testSettings.plugboardSwaps },
      },
      matchesFound,
      status:
        status === "SUCCESS" || status === "FAILURE"
          ? "COMPLETE"
          : status === "INTERRUPTED"
            ? "USER_INTERRUPTED"
            : status,
    });
  };

  emit("STARTED");

  for (let r1 = startCursor.r1; r1 < 26; r1++) {
    const r2Start = r1 === startCursor.r1 ? startCursor.r2 : 0;
    for (let r2 = r2Start; r2 < 26; r2++) {
      const r3Start =
        r1 === startCursor.r1 && r2 === startCursor.r2 ? startCursor.r3 : 0;
      for (let r3 = r3Start; r3 < 26; r3++) {
        const plugStart =
          r1 === startCursor.r1 &&
          r2 === startCursor.r2 &&
          r3 === startCursor.r3
            ? startCursor.plugIndex
            : 0;
        for (let plugIndex = plugStart; plugIndex < plugCount; plugIndex++) {
          if (options.shouldCancel?.()) {
            const cur: BombeSearchCursor = {
              r1,
              r2,
              r3,
              plugIndex,
              attemptsSoFar: attempts,
              matchesFound,
              elapsedMsSoFar: elapsed(),
            };
            emit("INTERRUPTED");
            return {
              decodedMessage: encodeMessage(message, testSettings),
              settings: testSettings,
              numberOfAttempts: attempts,
              elapsedMs: elapsed(),
              bombeResultStatus: "INTERRUPTED",
              matchIndex: matchesFound,
              resumeCursor: cur,
            };
          }

          const plug = plugboards[plugIndex]!;
          testSettings = {
            rotor1Position: posChar(r1),
            rotor2Position: posChar(r2),
            rotor3Position: posChar(r3),
            plugboardSwaps: plug,
          };

          const decoded = encodeMessage(message, testSettings);
          attempts++;

          if (decoded.includes(crib)) {
            matchesFound += 1;
            const next = advanceCursor(
              {
                r1,
                r2,
                r3,
                plugIndex,
                attemptsSoFar: attempts,
                matchesFound,
                elapsedMsSoFar: elapsed(),
              },
              plugCount,
            );
            emit("SUCCESS");
            return {
              decodedMessage: decoded,
              settings: testSettings,
              numberOfAttempts: attempts,
              elapsedMs: elapsed(),
              bombeResultStatus: "SUCCESS",
              matchIndex: matchesFound,
              resumeCursor: next,
            };
          }

          if (attempts % progressEvery === 0) {
            emit("IN_PROGRESS");
          }

          if (attempts % yieldEvery === 0) {
            await new Promise<void>((r) => setTimeout(r, 0));
          }
        }
      }
    }
  }

  emit("FAILURE");
  return {
    decodedMessage: message,
    settings: testSettings,
    numberOfAttempts: attempts,
    elapsedMs: elapsed(),
    bombeResultStatus: "FAILURE",
    matchIndex: matchesFound,
    resumeCursor: null,
  };
}

export { totalBombeSettings };
