import type { EnigmaSettings } from "./types";

/** Known-plaintext prefix used by the original demo Bombe */
export const DEFAULT_CRIB = "LNXLWSOSBQ ";

/**
 * Demo defaults intentionally use few plugboard cables so a full
 * Bombe sweep stays interactive in the browser.
 */
export function getDefaultSettings(): EnigmaSettings {
  // Single plugboard cable — matches Bombe search space (MAX_PLUGBOARD_CABLES).
  return {
    rotor1Position: "G",
    rotor2Position: "E",
    rotor3Position: "M",
    plugboardSwaps: {
      A: "T",
      T: "A",
    },
  };
}

/** Max plugboard cables explored by the Bombe (1 cable = demo-scale). */
export const MAX_PLUGBOARD_CABLES = 1;
