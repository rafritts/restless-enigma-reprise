export interface Rotor {
  mappings: readonly string[];
  notch: string;
}

/** Historical-inspired wirings (same as original Restless Enigma) */
export const ROTOR_1: Rotor = {
  mappings: "UQBOJHWZIKDVASTELRMPFGNYXC".split(""),
  notch: "Q",
};

export const ROTOR_2: Rotor = {
  mappings: "XUAPIEJKYLTBFZNHVDGCMRWSOQ".split(""),
  notch: "E",
};

export const ROTOR_3: Rotor = {
  mappings: "JZNSAIOCPTHBWXRYFGUMKVEDQL".split(""),
  notch: "V",
};

/** Reflector mapping indexed by A=0 (matches original Restless Enigma) */
export const REFLECTOR: readonly string[] =
  "YRUHQSLDPXNGOKMIEBFZCWVJAT".split("");

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
