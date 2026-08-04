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

export interface BombeResult {
  decodedMessage: string;
  settings: EnigmaSettings;
  numberOfAttempts: number;
  elapsedMs: number;
  bombeResultStatus: BombeResultStatus;
}

export interface BombeProgress {
  numberOfAttempts: number;
  totalSettings: number;
  elapsedMs: number;
  currentSetting: EnigmaSettings;
  status: "STARTED" | "IN_PROGRESS" | "COMPLETE" | "USER_INTERRUPTED";
}

export type BombeProgressCallback = (progress: BombeProgress) => void;
