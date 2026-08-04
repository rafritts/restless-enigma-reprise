/** Rotor start position A–Z */
export type RotorPosition = string;

/** Bidirectional plugboard map (both directions stored) */
export type PlugboardMap = Record<string, string>;

export interface EnigmaSettings {
  rotor1Position: string;
  rotor2Position: string;
  rotor3Position: string;
  plugboardSwaps: PlugboardMap;
}

export type BombeResultStatus = "SUCCESS" | "FAILURE" | "INTERRUPTED";

/** Where to continue the brute-force scan after a hit or interrupt */
export interface BombeSearchCursor {
  r1: number;
  r2: number;
  r3: number;
  plugIndex: number;
  attemptsSoFar: number;
  matchesFound: number;
  elapsedMsSoFar: number;
}

export interface BombeResult {
  decodedMessage: string;
  settings: EnigmaSettings;
  numberOfAttempts: number;
  elapsedMs: number;
  bombeResultStatus: BombeResultStatus;
  /** 1-based index of this crib hit in the current run chain (0 if none) */
  matchIndex: number;
  /**
   * Cursor for the *next* setting after this result.
   * Present on SUCCESS (continue search) and INTERRUPTED (resume).
   * Absent on FAILURE (space exhausted).
   */
  resumeCursor: BombeSearchCursor | null;
}

export interface BombeProgress {
  numberOfAttempts: number;
  totalSettings: number;
  elapsedMs: number;
  currentSetting: EnigmaSettings;
  status: "STARTED" | "IN_PROGRESS" | "COMPLETE" | "USER_INTERRUPTED";
  matchesFound: number;
}

export type BombeProgressCallback = (progress: BombeProgress) => void;
