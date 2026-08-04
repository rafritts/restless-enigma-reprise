import { describe, expect, it } from "vitest";
import {
  breakEnigma,
  DEFAULT_CRIB,
  encodeMessageWithCrib,
  type EnigmaSettings,
} from "./index";

const testSettings: EnigmaSettings = {
  rotor1Position: "A",
  rotor2Position: "A",
  rotor3Position: "D",
  plugboardSwaps: { A: "B", B: "A" },
};

describe("Bombe", () => {
  it("recovers settings with default crib (short)", async () => {
    const encoded = encodeMessageWithCrib(
      "This is a test message",
      DEFAULT_CRIB,
      testSettings,
    );
    const result = await breakEnigma({
      message: encoded,
      crib: DEFAULT_CRIB,
      progressEvery: 100_000,
      yieldEvery: 50_000,
    });
    expect(result.bombeResultStatus).toBe("SUCCESS");
    expect(result.settings.rotor1Position).toBe("A");
    expect(result.settings.rotor2Position).toBe("A");
    expect(result.settings.rotor3Position).toBe("D");
    expect(result.settings.plugboardSwaps.A).toBe("B");
  }, 120_000);

  it("recovers with user crib", async () => {
    const encoded = encodeMessageWithCrib(
      "This is a test message",
      DEFAULT_CRIB,
      testSettings,
    );
    const result = await breakEnigma({
      message: encoded,
      crib: "TEST MESSAGE",
      progressEvery: 100_000,
      yieldEvery: 50_000,
    });
    expect(result.bombeResultStatus).toBe("SUCCESS");
    expect(result.settings.rotor3Position).toBe("D");
  }, 120_000);
});
