/**
 * Sanity-check: Choco Buns defaults (1B+1D) → target mold RPM ≈ 10.51
 */
import { CHOCO_BUNS_DEFAULTS } from '../src/lib/defaults';
import { computeMetrics, withScenario } from '../src/lib/formulas';
import { SCENARIOS } from '../src/lib/scenarios';

const metrics = computeMetrics(CHOCO_BUNS_DEFAULTS);
const rpm = metrics.moldRpm;
const expected = 10.51;
const ok = Math.abs(rpm - expected) < 0.02;

console.log('Choco Buns defaults (1B+1D)');
console.log(`  H-05 mold RPM = ${rpm.toFixed(4)} (expected ≈ ${expected})`);
console.log(`  H-08 bake min = ${metrics.actualBakeMin.toFixed(4)}`);
console.log(`  K-01 status   = ${metrics.bakeStatus}`);
console.log(`  Sanity        = ${ok ? 'PASS' : 'FAIL'}`);

console.log('\nHız kartı scenarios:');
for (const snr of SCENARIOS) {
  const m = computeMetrics(
    withScenario(CHOCO_BUNS_DEFAULTS, snr.cupActive, snr.vffsActive),
  );
  console.log(
    `  ${snr.code} ${snr.cupActive}B+${snr.vffsActive}D → RPM ${m.moldRpm.toFixed(2)} · bake ${m.actualBakeMin.toFixed(1)} dk · ${m.bakeStatus}`,
  );
}

if (!ok) process.exit(1);
