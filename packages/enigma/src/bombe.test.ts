import { describe, expect, it } from "vitest";
import {
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

describe("Bombe", () => {
  it("recovers settings and exact plaintext", async () => {
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
    expect(result.settings.rotor1Position).toBe("A");
    expect(result.settings.rotor2Position).toBe("A");
    expect(result.settings.rotor3Position).toBe("D");
    expect(result.settings.plugboardSwaps.A).toBe("B");
  }, 120_000);

  it("recovers weather report scenario", async () => {
    const plain =
      "Weather report Biscay clear skies light wind visibility good";
    const settings: EnigmaSettings = {
      rotor1Position: "A",
      rotor2Position: "A",
      rotor3Position: "C",
      plugboardSwaps: { A: "B", B: "A" },
    };
    const encoded = encodeMessage(plain, settings);
    const result = await breakEnigma({
      message: encoded,
      crib: "WEATHER",
      progressEvery: 100_000,
      yieldEvery: 50_000,
    });
    expect(result.bombeResultStatus).toBe("SUCCESS");
    expect(result.decodedMessage).toBe(plain.toUpperCase());
    expect(result.settings.rotor3Position).toBe("C");
  }, 120_000);
});
