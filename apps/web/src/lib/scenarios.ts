import type { EnigmaSettings } from "@restless/enigma";

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  plaintext: string;
  settings: EnigmaSettings;
  suggestedCrib: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "morning-intercept",
    title: "Morning intercept",
    subtitle: "Short weather traffic · easy break",
    plaintext: "Weather report clear skies over channel",
    settings: {
      rotor1Position: "A",
      rotor2Position: "A",
      rotor3Position: "D",
      plugboardSwaps: { A: "B", B: "A" },
    },
    suggestedCrib: "WEATHER",
  },
  {
    id: "bletchley",
    title: "Bletchley memo",
    subtitle: "Known station phrase · medium",
    plaintext: "Meeting at Bletchley Park tomorrow at dawn",
    settings: {
      rotor1Position: "C",
      rotor2Position: "H",
      rotor3Position: "M",
      plugboardSwaps: { S: "T", T: "S" },
    },
    suggestedCrib: "BLETCHLEY",
  },
  {
    id: "deep-search",
    title: "Deep search",
    subtitle: "Later rotor positions · longer run",
    plaintext: "The package arrives on the night train",
    settings: {
      rotor1Position: "R",
      rotor2Position: "K",
      rotor3Position: "W",
      plugboardSwaps: { E: "N", N: "E" },
    },
    suggestedCrib: "PACKAGE",
  },
];
