import { getDefaultSettings } from "./defaults";
import { RotorStateMachine } from "./rotor-machine";
import type { EnigmaSettings } from "./types";

function encodeDecode(message: string, userSettings?: EnigmaSettings | null): string {
  const settings = userSettings ?? getDefaultSettings();
  const machine = new RotorStateMachine(settings);
  const upper = message.toUpperCase();
  let out = "";
  for (const ch of upper) {
    if (/[A-Z]/.test(ch)) {
      out += machine.resolveCharacter(ch);
    } else {
      out += ch;
    }
  }
  machine.resetSettings();
  return out;
}

/** Encrypt or decrypt (Enigma is reciprocal). */
export function encodeMessage(
  message: string,
  settings?: EnigmaSettings | null,
): string {
  return encodeDecode(message, settings);
}

export function encodeMessageWithCrib(
  message: string,
  crib: string,
  settings?: EnigmaSettings | null,
): string {
  return encodeDecode(crib + message, settings);
}

export function decodeMessageStripCrib(
  message: string,
  crib: string,
  settings?: EnigmaSettings | null,
): string {
  return encodeDecode(message, settings).replace(crib, "");
}
