import type { BakeStatus, Metrics, Params } from './types';

/**
 * Reverse-capacity formulas matching Excel v4 summary
 * (Biskuvi_Uretim_Tersine_Kapasite_Modeli-v4).
 */
export function computeMetrics(p: Params): Metrics {
  const eyesPerRevolution = p.eyesAcross * p.eyesAround; // P-03

  const cupBiscuitsPerMin =
    p.cupActiveMachines * p.cupSpeedCupsPerMin * p.cupBiscuitsPerCup; // H-01
  const vffsBiscuitsPerMin =
    p.vffsActiveMachines * p.vffsSpeedPacksPerMin * p.vffsBiscuitsPerPack; // H-02
  const solidBiscuitsPerMin =
    (cupBiscuitsPerMin + vffsBiscuitsPerMin) * p.targetUtilization; // H-03

  const scrapDenom = 1 - p.scrapRate;
  const grossOvenOutPerMin =
    scrapDenom > 0 ? solidBiscuitsPerMin / scrapDenom : 0; // H-04

  const moldRpm =
    eyesPerRevolution > 0 ? grossOvenOutPerMin / eyesPerRevolution : 0; // H-05

  const circumferenceM = (p.eyesAround * p.pitchMm) / 1000; // H-06
  const beltSpeedMPerMin = moldRpm * circumferenceM; // H-07
  const actualBakeMin =
    beltSpeedMPerMin > 0 ? p.tunnelLengthM / beltSpeedMPerMin : Infinity; // H-08

  const bakedWeightG = p.rawWeightG * (1 - p.moistureRate); // H-09
  const rawDoughKgPerHour = (grossOvenOutPerMin * p.rawWeightG * 60) / 1000; // H-10
  const bakedGrossKgPerHour = rawDoughKgPerHour * (1 - p.moistureRate); // H-11
  const scrapKgPerHour = bakedGrossKgPerHour * p.scrapRate; // H-12
  const netPackedKgPerHour = bakedGrossKgPerHour * (1 - p.scrapRate); // H-13
  const netTonsPerShift = (netPackedKgPerHour * 8) / 1000; // H-14
  const netTonsPerDay = netTonsPerShift * 3; // H-15

  const bakeStatus: BakeStatus =
    actualBakeMin >= p.targetBakeMin ? 'UYGUN' : 'YETERSIZ'; // K-01
  const bakeDeltaMin = actualBakeMin - p.targetBakeMin; // K-02
  const cupNetWeightG = p.cupBiscuitsPerCup * bakedWeightG; // K-03
  const packNetWeightG = p.vffsBiscuitsPerPack * bakedWeightG; // K-04

  return {
    eyesPerRevolution,
    cupBiscuitsPerMin,
    vffsBiscuitsPerMin,
    solidBiscuitsPerMin,
    grossOvenOutPerMin,
    moldRpm,
    circumferenceM,
    beltSpeedMPerMin,
    actualBakeMin,
    bakedWeightG,
    rawDoughKgPerHour,
    bakedGrossKgPerHour,
    scrapKgPerHour,
    netPackedKgPerHour,
    netTonsPerShift,
    netTonsPerDay,
    bakeStatus,
    bakeDeltaMin,
    cupNetWeightG,
    packNetWeightG,
  };
}

/** Apply a hız-kartı scenario (active cup / VFFS machine counts) onto params. */
export function withScenario(
  params: Params,
  cupActive: number,
  vffsActive: number,
): Params {
  return {
    ...params,
    cupActiveMachines: cupActive,
    vffsActiveMachines: vffsActive,
  };
}

export function formatNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString('tr-TR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
