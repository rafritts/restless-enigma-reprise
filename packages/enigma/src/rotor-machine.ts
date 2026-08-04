import { REFLECTOR, ROTOR_1, ROTOR_2, ROTOR_3, type Rotor } from "./rotors";
import { applyPlugboard, normalizePlugboard } from "./plugboard";
import type { EnigmaSettings } from "./types";

export class RotorStateMachine {
  private readonly rotor1: Rotor = ROTOR_1;
  private readonly rotor2: Rotor = ROTOR_2;
  private readonly rotor3: Rotor = ROTOR_3;
  private readonly settings: EnigmaSettings;
  private rotor1offset: number;
  private rotor2offset: number;
  private rotor3offset: number;

  constructor(settings: EnigmaSettings) {
    this.settings = {
      ...settings,
      plugboardSwaps: normalizePlugboard(settings.plugboardSwaps),
      rotor1Position: settings.rotor1Position.toUpperCase(),
      rotor2Position: settings.rotor2Position.toUpperCase(),
      rotor3Position: settings.rotor3Position.toUpperCase(),
    };
    this.rotor1offset = 0;
    this.rotor2offset = 0;
    this.rotor3offset = 0;
    this.calibrateOffsets();
  }

  resetSettings(): void {
    this.calibrateOffsets();
  }

  resolveCharacter(input: string): string {
    const upper = input.toUpperCase();
    const afterPlug = applyPlugboard(upper, this.settings.plugboardSwaps);
    const forward = this.resolveForwards(afterPlug);
    const reflected = REFLECTOR[forward.charCodeAt(0) - 65]!;
    const backwards = this.resolveBackwards(reflected);
    const resolved = applyPlugboard(backwards, this.settings.plugboardSwaps);
    this.rotateRotors();
    return resolved;
  }

  private resolveForwards(input: string): string {
    const r1 =
      this.rotor1.mappings[
        (input.charCodeAt(0) - 65 + this.rotor1offset) % 26
      ]!;
    const r2 =
      this.rotor2.mappings[
        (r1.charCodeAt(0) - 65 + this.rotor2offset) % 26
      ]!;
    return this.rotor3.mappings[
      (r2.charCodeAt(0) - 65 + this.rotor3offset) % 26
    ]!;
  }

  private resolveBackwards(input: string): string {
    const i3 = this.findIndex(this.rotor3.mappings, input);
    const r3 = String.fromCharCode(((i3 - this.rotor3offset + 26) % 26) + 65);

    const i2 = this.findIndex(this.rotor2.mappings, r3);
    const r2 = String.fromCharCode(((i2 - this.rotor2offset + 26) % 26) + 65);

    const i1 = this.findIndex(this.rotor1.mappings, r2);
    return String.fromCharCode(((i1 - this.rotor1offset + 26) % 26) + 65);
  }

  private findIndex(mapping: readonly string[], c: string): number {
    const idx = mapping.indexOf(c);
    if (idx === -1) {
      throw new Error(`Character ${c} not found in rotor mapping`);
    }
    return idx;
  }

  private rotateRotors(): void {
    this.rotor3offset = (this.rotor3offset + 1) % 26;
    if (this.rotor3offset === this.rotor3.notch.charCodeAt(0) - 65) {
      this.rotor2offset = (this.rotor2offset + 1) % 26;
      if (this.rotor2offset === this.rotor2.notch.charCodeAt(0) - 65) {
        this.rotor1offset = (this.rotor1offset + 1) % 26;
      }
    }
  }

  private calibrateOffsets(): void {
    this.rotor1offset = this.settings.rotor1Position.charCodeAt(0) - 65;
    this.rotor2offset = this.settings.rotor2Position.charCodeAt(0) - 65;
    this.rotor3offset = this.settings.rotor3Position.charCodeAt(0) - 65;
  }
}
