import { DEFAULT_CRIB } from "./defaults";
import { encodeMessage } from "./machine";
import {
  generatePlugboardSettings,
  totalBombeSettings,
} from "./plugboard";
import type {
  BombeProgressCallback,
  BombeResult,
  EnigmaSettings,
} from "./types";

export interface BombeOptions {
  message: string;
  crib?: string;
  /** Called roughly every `progressEvery` attempts */
  onProgress?: BombeProgressCallback;
  progressEvery?: number;
  /** Cooperative cancel — return true to stop */
  shouldCancel?: () => boolean;
  /**
   * Yield to the event loop every N attempts so the UI/worker stays responsive.
   * Defaults to 2000 in browser contexts.
   */
  yieldEvery?: number;
}

function posChar(n: number): string {
  return String.fromCharCode(65 + n);
}

/**
 * Brute-force rotor positions + single plugboard cable for a known crib.
 * Async so callers can stream progress and cancel.
 */
export async function breakEnigma(options: BombeOptions): Promise<BombeResult> {
  const crib = (options.crib?.trim() ? options.crib : DEFAULT_CRIB).toUpperCase();
  const message = options.message;
  const progressEvery = options.progressEvery ?? 25_000;
  const yieldEvery = options.yieldEvery ?? 2_000;
  const plugboards = generatePlugboardSettings();
  const total = totalBombeSettings();
  const started = performance.now();

  let attempts = 0;
  let testSettings: EnigmaSettings = {
    rotor1Position: "A",
    rotor2Position: "A",
    rotor3Position: "A",
    plugboardSwaps: {},
  };

  const emit = (
    status: BombeResult["bombeResultStatus"] | "STARTED" | "IN_PROGRESS",
  ) => {
    options.onProgress?.({
      numberOfAttempts: attempts,
      totalSettings: total,
      elapsedMs: performance.now() - started,
      currentSetting: { ...testSettings, plugboardSwaps: { ...testSettings.plugboardSwaps } },
      status:
        status === "SUCCESS" || status === "FAILURE"
          ? "COMPLETE"
          : status === "INTERRUPTED"
            ? "USER_INTERRUPTED"
            : status,
    });
  };

  emit("STARTED");

  for (let r1 = 0; r1 < 26; r1++) {
    for (let r2 = 0; r2 < 26; r2++) {
      for (let r3 = 0; r3 < 26; r3++) {
        for (const plug of plugboards) {
          if (options.shouldCancel?.()) {
            emit("INTERRUPTED");
            return {
              decodedMessage: encodeMessage(message, testSettings),
              settings: testSettings,
              numberOfAttempts: attempts,
              elapsedMs: performance.now() - started,
              bombeResultStatus: "INTERRUPTED",
            };
          }

          testSettings = {
            rotor1Position: posChar(r1),
            rotor2Position: posChar(r2),
            rotor3Position: posChar(r3),
            plugboardSwaps: plug,
          };

          const decoded = encodeMessage(message, testSettings);
          attempts++;

          if (decoded.includes(crib)) {
            emit("SUCCESS");
            return {
              decodedMessage: decoded,
              settings: testSettings,
              numberOfAttempts: attempts,
              elapsedMs: performance.now() - started,
              bombeResultStatus: "SUCCESS",
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
    elapsedMs: performance.now() - started,
    bombeResultStatus: "FAILURE",
  };
}

export { totalBombeSettings };
