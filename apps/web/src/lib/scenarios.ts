import type { EnigmaSettings } from "@restless/enigma";

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  plaintext: string;
  settings: EnigmaSettings;
  suggestedCrib: string;
}

/**
 * One-click demos for Enigma + Bombe.
 * Early rotor positions break quickly; later ones take longer (good for telemetry).
 */
export const SCENARIOS: Scenario[] = [
  {
    id: "weather-biscay",
    title: "Weather report (film)",
    subtitle: "Imitation Game crib · easy break",
    plaintext:
      "Weather report Biscay clear skies light wind visibility good",
    settings: {
      rotor1Position: "A",
      rotor2Position: "A",
      rotor3Position: "C",
      plugboardSwaps: { A: "B", B: "A" },
    },
    suggestedCrib: "WEATHER",
  },
  {
    id: "morning-intercept",
    title: "Morning intercept",
    subtitle: "Short weather traffic · easy",
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
    id: "nothing-to-report",
    title: "Quiet sector",
    subtitle: "Routine status · easy",
    plaintext: "Sector four nothing to report overnight",
    settings: {
      rotor1Position: "A",
      rotor2Position: "A",
      rotor3Position: "E",
      plugboardSwaps: { M: "N", N: "M" },
    },
    suggestedCrib: "NOTHING",
  },
  {
    id: "convoy",
    title: "Convoy sighted",
    subtitle: "U-boat traffic · easy-medium",
    plaintext: "Convoy sighted bearing two seven zero speed eight knots",
    settings: {
      rotor1Position: "A",
      rotor2Position: "C",
      rotor3Position: "F",
      plugboardSwaps: { U: "V", V: "U" },
    },
    suggestedCrib: "CONVOY",
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
    id: "hut-eight",
    title: "Hut 8 flash",
    subtitle: "Naval Enigma desk · medium",
    plaintext: "Hut eight requests all intercepts before midnight",
    settings: {
      rotor1Position: "D",
      rotor2Position: "G",
      rotor3Position: "K",
      plugboardSwaps: { H: "U", U: "H" },
    },
    suggestedCrib: "INTERCEPTS",
  },
  {
    id: "dover-fog",
    title: "Channel fog",
    subtitle: "Coastal weather · medium",
    plaintext: "Fog over Dover harbour ships delayed until noon",
    settings: {
      rotor1Position: "E",
      rotor2Position: "E",
      rotor3Position: "L",
      plugboardSwaps: { F: "G", G: "F" },
    },
    suggestedCrib: "DOVER",
  },
  {
    id: "night-train",
    title: "Night train",
    subtitle: "Courier traffic · medium-hard",
    plaintext: "The package arrives on the night train",
    settings: {
      rotor1Position: "J",
      rotor2Position: "P",
      rotor3Position: "T",
      plugboardSwaps: { P: "Q", Q: "P" },
    },
    suggestedCrib: "PACKAGE",
  },
  {
    id: "deep-search",
    title: "Deep search",
    subtitle: "Later rotors · longer run",
    plaintext: "Abort mission and burn all code sheets immediately",
    settings: {
      rotor1Position: "R",
      rotor2Position: "K",
      rotor3Position: "W",
      plugboardSwaps: { E: "N", N: "E" },
    },
    suggestedCrib: "ABORT",
  },
  {
    id: "fleet-underway",
    title: "Fleet underway",
    subtitle: "Naval order · longer run",
    plaintext: "Fleet underway at zero four hundred hold radio silence",
    settings: {
      rotor1Position: "T",
      rotor2Position: "M",
      rotor3Position: "Y",
      plugboardSwaps: { R: "S", S: "R" },
    },
    suggestedCrib: "FLEET",
  },
  {
    id: "storm-front",
    title: "Storm front",
    subtitle: "Met office intercept · longer run",
    plaintext: "Storm approaching from west delay all air operations",
    settings: {
      rotor1Position: "V",
      rotor2Position: "Q",
      rotor3Position: "Z",
      plugboardSwaps: { W: "X", X: "W" },
    },
    suggestedCrib: "STORM",
  },
];

