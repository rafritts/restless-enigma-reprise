import { MAX_PLUGBOARD_CABLES } from "./defaults";
import type { PlugboardMap } from "./types";
import { ALPHABET } from "./rotors";

/** Ensure both directions of every cable exist. */
export function normalizePlugboard(swaps: PlugboardMap): PlugboardMap {
  const result: PlugboardMap = {};
  for (const [from, to] of Object.entries(swaps)) {
    const a = from.toUpperCase();
    const b = to.toUpperCase();
    if (a.length !== 1 || b.length !== 1) continue;
    if (a === b) continue;
    result[a] = b;
    result[b] = a;
  }
  return result;
}

export function applyPlugboard(char: string, swaps: PlugboardMap): string {
  return swaps[char] ?? char;
}

/** All letter pairs for 1 cable (unordered combinations). */
function generateLetterPairs(): [string, string][] {
  const pairs: [string, string][] = [];
  for (let i = 0; i < ALPHABET.length; i++) {
    for (let j = i + 1; j < ALPHABET.length; j++) {
      pairs.push([ALPHABET[i]!, ALPHABET[j]!]);
    }
  }
  return pairs;
}

function combinePairs(
  allPairs: [string, string][],
  numCables: number,
  start: number,
  current: PlugboardMap,
): PlugboardMap[] {
  if (numCables === 0) {
    return [{ ...current }];
  }

  const combinations: PlugboardMap[] = [];
  for (let i = start; i <= allPairs.length - numCables; i++) {
    const pair = allPairs[i]!;
    // Skip if either letter already used
    if (current[pair[0]] || current[pair[1]]) continue;
    const next: PlugboardMap = { ...current, [pair[0]]: pair[1], [pair[1]]: pair[0] };
    combinations.push(...combinePairs(allPairs, numCables - 1, i + 1, next));
  }
  return combinations;
}

let cache: PlugboardMap[] | null = null;

/**
 * All plugboard maps with 0..MAX_PLUGBOARD_CABLES cables.
 * Includes the empty board so messages encrypted without a cable still break.
 */
export function generatePlugboardSettings(): PlugboardMap[] {
  if (cache) return cache;
  const allPairs = generateLetterPairs();
  const all: PlugboardMap[] = [{}]; // zero cables
  for (let n = 1; n <= MAX_PLUGBOARD_CABLES; n++) {
    all.push(
      ...combinePairs(allPairs, n, 0, {}).filter(
        (m) => Object.keys(m).length === n * 2,
      ),
    );
  }
  cache = all;
  return cache;
}

/** Total Bombe search space size (rotor positions × plugboards). */
export function totalBombeSettings(): number {
  return 26 * 26 * 26 * generatePlugboardSettings().length;
}
