/**
 * Sanity: Choco Stiks capacity (51×38) + OEE boxing denominator.
 */
import {
  STIKS_LINE,
  activeHoles,
  computeStiksOee,
  sticksPerMin,
} from '../src/lib/stiksModel';

let failed = 0;

function assert(label: string, actual: number, expected: number, tol = 0.01) {
  const ok = Math.abs(actual - expected) <= tol;
  console.log(
    `  ${ok ? 'PASS' : 'FAIL'} ${label}: ${actual} (expected ${expected})`,
  );
  if (!ok) failed += 1;
}

console.log('Choco Stiks capacity');
assert('active holes', activeHoles(STIKS_LINE), 51);
assert('sticks/min (51×38)', sticksPerMin(STIKS_LINE), 1938);

console.log('\nOEE — 7h theoretical boxes');
const sevenH = computeStiksOee({
  skuId: '40g',
  traysProduced: 0,
  hoursWorked: 7,
});
assert('60×60×7 boxes', sevenH.theoreticalBoxes, 25200);
assert('theoretical trays (= boxes)', sevenH.theoreticalTrays, 25200);
assert('theoretical packs 40g (×12)', sevenH.theoreticalPacks, 25200 * 12);

console.log('\nOEE — performance (tray = box)');
const half = computeStiksOee({
  skuId: '40g',
  traysProduced: 12600, // half of 25200
  hoursWorked: 7,
});
assert('performance % at 50%', half.performancePct, 50);
assert('packs produced', half.packsProduced, 12600 * 12);

const full25 = computeStiksOee({
  skuId: '25g',
  traysProduced: 25200,
  hoursWorked: 7,
});
assert('100% at full trays 25g', full25.performancePct, 100);
assert('packs 25g (×16)', full25.packsProduced, 25200 * 16);

console.log(`\nSanity = ${failed === 0 ? 'PASS' : 'FAIL'} (${failed} failed)`);
if (failed > 0) process.exit(1);
