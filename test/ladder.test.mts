import assert from 'node:assert/strict';
import test from 'node:test';

import { endOf, makeLadder, shuffledEnds, swapsFor } from '../src/lib/ladder.ts';

test('the rungs reproduce the assignment they were built from', () => {
  for (let trial = 0; trial < 2000; trial++) {
    const people = 2 + (trial % 7);
    const ends = shuffledEnds(people, Math.random);
    const swaps = swapsFor(ends);
    const at = Array.from({ length: people }, (_, i) => i);
    for (const column of swaps) {
      const kept = at[column];
      at[column] = at[column + 1];
      at[column + 1] = kept;
    }
    for (let start = 0; start < people; start++) assert.equal(at[ends[start]], start);
  }
});

test('no two rungs touch on the same row, and every outcome is reached once', () => {
  for (let trial = 0; trial < 2000; trial++) {
    const people = 2 + (trial % 7);
    const ladder = makeLadder(people);
    for (const rung of ladder.rungs) {
      const [row, column] = rung.split(':').map(Number);
      assert.ok(column >= 0 && column < people - 1, `rung ${rung} is outside the ladder`);
      assert.ok(row >= 0 && row < ladder.rows, `rung ${rung} is outside the ladder`);
      assert.equal(ladder.rungs.has(`${row}:${column + 1}`), false, `rung ${rung} has a neighbour`);
    }
    const reached = new Set<number>();
    for (let start = 0; start < people; start++) reached.add(endOf(ladder, start));
    assert.equal(reached.size, people);
  }
});

test('every start reaches every outcome equally often', () => {
  const people = 8;
  const runs = 200_000;
  const counts = Array.from({ length: people }, () => new Array(people).fill(0));
  for (let run = 0; run < runs; run++) {
    const ladder = makeLadder(people);
    for (let start = 0; start < people; start++) counts[start][endOf(ladder, start)] += 1;
  }
  // Expected 12.5%; one standard deviation at this count is about 0.074 points.
  for (let start = 0; start < people; start++) {
    for (let end = 0; end < people; end++) {
      const share = counts[start][end] / runs;
      assert.ok(Math.abs(share - 1 / people) < 0.005, `${start}→${end} is ${(share * 100).toFixed(2)}%`);
    }
  }
});
