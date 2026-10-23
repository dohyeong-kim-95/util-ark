/**
 * Builds a ladder whose outcome is a uniformly random assignment.
 *
 * Placing rungs at random does not do that: with only a few rows, a line
 * mostly stays near the column it started in, so the leftmost person was far
 * more likely to land on the leftmost outcome. Instead the assignment is drawn
 * first, with a Fisher-Yates shuffle, and then drawn as a ladder: every
 * permutation can be built from swaps of neighbouring columns (the steps of a
 * bubble sort), and each such swap is one rung. Extra rungs are then added in
 * cancelling pairs — two rungs on the same gap with nothing touching that gap
 * between them undo each other — so the picture looks busy without changing
 * the result.
 *
 * A rung is stored as `"row:column"`, joining `column` and `column + 1`. No two
 * rungs touch on the same row, so every branch is unambiguous.
 */

export type Ladder = { rows: number; rungs: Set<string> };

type Random = () => number;

const randomInt = (below: number, random: Random) => Math.floor(random() * below);

/** `ends[start]` is the outcome column the line from `start` reaches. */
export function shuffledEnds(people: number, random: Random): number[] {
  const ends = Array.from({ length: people }, (_, i) => i);
  for (let i = people - 1; i > 0; i--) {
    const j = randomInt(i + 1, random);
    const kept = ends[i];
    ends[i] = ends[j];
    ends[j] = kept;
  }
  return ends;
}

/**
 * Neighbour swaps that turn the starting order into `ends`, in the order a
 * line meets them from top to bottom. Each number is the left column of a swap.
 */
export function swapsFor(ends: number[]): number[] {
  // `arrived[column]` is the start whose line must finish at that column.
  const arrived: number[] = [];
  for (let start = 0; start < ends.length; start++) arrived[ends[start]] = start;

  // Bubble-sorting `arrived` back to 0,1,2… undoes the ladder; a swap is its
  // own inverse, so the same swaps in reverse order build it.
  const swaps: number[] = [];
  for (let pass = 0; pass < arrived.length; pass++) {
    for (let column = 0; column < arrived.length - 1 - pass; column++) {
      if (arrived[column] < arrived[column + 1]) continue;
      const kept = arrived[column];
      arrived[column] = arrived[column + 1];
      arrived[column + 1] = kept;
      swaps.push(column);
    }
  }
  return swaps.reverse();
}

const touches = (rungs: Set<string>, row: number, column: number) =>
  rungs.has(`${row}:${column - 1}`) || rungs.has(`${row}:${column}`) || rungs.has(`${row}:${column + 1}`);

export function makeLadder(people: number, random: Random = Math.random): Ladder {
  const swaps = swapsFor(shuffledEnds(people, random));

  // Packs the swaps into rows. A swap goes one row below the last swap that
  // shares a column with it, which keeps their order and keeps rungs on the
  // same row apart; swaps that share no column may sit side by side in time.
  const levelOf: number[] = [];
  let levels = 0;
  for (let k = 0; k < swaps.length; k++) {
    let level = 0;
    for (let j = 0; j < k; j++) {
      if (Math.abs(swaps[j] - swaps[k]) <= 1) level = Math.max(level, levelOf[j] + 1);
    }
    levelOf.push(level);
    levels = Math.max(levels, level + 1);
  }

  // Spreads those levels over the drawn rows at random, keeping their order.
  const rows = Math.max(levels, 7, people + 4);
  const rowOfLevel = shuffledEnds(rows, random).slice(0, levels).sort((a, b) => a - b);

  const rungs = new Set<string>();
  for (let k = 0; k < swaps.length; k++) rungs.add(`${rowOfLevel[levelOf[k]]}:${swaps[k]}`);

  // Decoration: pairs of rungs on one gap with nothing touching that gap in
  // between, so the pair cancels out. Each gap gets the first try, so most
  // gaps get a pair, but a try is skipped when its rows are taken, and a few
  // ladders (about 5-15%) still end up with an empty gap. That is cosmetic:
  // the outcome comes from the swaps above, not from these pairs.
  const attempts = people * 4;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const column = attempt < people - 1 ? attempt : randomInt(people - 1, random);
    const first = randomInt(rows - 1, random);
    const last = first + 1 + randomInt(Math.min(3, rows - 1 - first), random);
    let free = true;
    for (let row = first; row <= last; row++) {
      if (touches(rungs, row, column)) free = false;
    }
    if (!free) continue;
    rungs.add(`${first}:${column}`);
    rungs.add(`${last}:${column}`);
  }

  return { rows, rungs };
}

/** The outcome column reached from `start`, following the rungs downward. */
export function endOf(ladder: Ladder, start: number): number {
  let column = start;
  for (let row = 0; row < ladder.rows; row++) {
    if (ladder.rungs.has(`${row}:${column}`)) column += 1;
    else if (ladder.rungs.has(`${row}:${column - 1}`)) column -= 1;
  }
  return column;
}
