import { describe, expect, it } from "vitest";
import {
  advanceCursor,
  breakEnigma,
  encodeMessage,
  type EnigmaSettings,
} from "./index";

const testSettings: EnigmaSettings = {
  rotor1Position: "A",
  rotor2Position: "A",
  rotor3Position: "D",
  plugboardSwaps: { A: "B", B: "A" },
};

describe("advanceCursor", () => {
  it("walks plug index then rotors", () => {
    const next = advanceCursor(
      {
        r1: 0,
        r2: 0,
        r3: 0,
        plugIndex: 0,
        attemptsSoFar: 1,
        matchesFound: 0,
        elapsedMsSoFar: 0,
      },
      2,
    );
    expect(next).toMatchObject({ r1: 0, r2: 0, r3: 0, plugIndex: 1 });
  });
});

describe("Bombe", () => {
  it("recovers plaintext for a known message", async () => {
    const plain = "This is a test message";
    const encoded = encodeMessage(plain, testSettings);
    const result = await breakEnigma({
      message: encoded,
      crib: "TEST MESSAGE",
      progressEvery: 100_000,
      yieldEvery: 50_000,
    });
    expect(result.bombeResultStatus).toBe("SUCCESS");
    expect(result.decodedMessage).toBe(plain.toUpperCase());
    expect(result.matchIndex).toBe(1);
    expect(result.resumeCursor).not.toBeNull();
  }, 120_000);

  it("can resume past a hit to find another match or exhaust", async () => {
    const plain = "Weather report clear skies over channel";
    const settings: EnigmaSettings = {
      rotor1Position: "A",
      rotor2Position: "A",
      rotor3Position: "D",
      plugboardSwaps: { A: "B", B: "A" },
    };
    const encoded = encodeMessage(plain, settings);
    const first = await breakEnigma({
      message: encoded,
      crib: "WEATHER",
      progressEvery: 100_000,
      yieldEvery: 50_000,
    });
    expect(first.bombeResultStatus).toBe("SUCCESS");
    expect(first.resumeCursor).not.toBeNull();

    // Resume should not re-return the same attempt index
    const second = await breakEnigma({
      message: encoded,
      crib: "WEATHER",
      resumeFrom: first.resumeCursor,
      progressEvery: 100_000,
      yieldEvery: 50_000,
    });
    // Either another false-positive/true later match, or failure — both ok
    expect(["SUCCESS", "FAILURE"]).toContain(second.bombeResultStatus);
    if (second.bombeResultStatus === "SUCCESS") {
      expect(second.matchIndex).toBe(2);
      expect(second.numberOfAttempts).toBeGreaterThan(first.numberOfAttempts);
    }
  }, 180_000);
});
