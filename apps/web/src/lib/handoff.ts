import type { EnigmaSettings } from "@restless/enigma";

const KEY = "restless-enigma-handoff";

export interface HandoffPayload {
  ciphertext: string;
  suggestedCrib?: string;
  settings?: EnigmaSettings;
  createdAt: number;
}

export function saveHandoff(payload: Omit<HandoffPayload, "createdAt">) {
  if (typeof window === "undefined") return;
  const full: HandoffPayload = { ...payload, createdAt: Date.now() };
  sessionStorage.setItem(KEY, JSON.stringify(full));
}

export function loadHandoff(): HandoffPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as HandoffPayload;
  } catch {
    return null;
  }
}

export function clearHandoff() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
