/** Parameter codes P-01…P-16 (operator inputs). */
export type ParamKey =
  | 'eyesAcross' // P-01
  | 'eyesAround' // P-02
  | 'pitchMm' // P-04
  | 'rawWeightG' // P-05
  | 'tunnelLengthM' // P-06
  | 'targetBakeMin' // P-07
  | 'moistureRate' // P-08
  | 'scrapRate' // P-09
  | 'cupActiveMachines' // P-10
  | 'cupSpeedCupsPerMin' // P-11
  | 'cupBiscuitsPerCup' // P-12
  | 'vffsActiveMachines' // P-13
  | 'vffsSpeedPacksPerMin' // P-14
  | 'vffsBiscuitsPerPack' // P-15
  | 'targetUtilization'; // P-16

export type Params = Record<ParamKey, number>;

export type ProductId = 'choco-biss' | 'choco-buns' | 'choco-stiks';
export type LineId = 'firin' | 'paketleme';

export type BakeStatus = 'UYGUN' | 'YETERSIZ';

export interface Metrics {
  /** P-03 = eyesAcross × eyesAround */
  eyesPerRevolution: number;
  /** H-01 */
  cupBiscuitsPerMin: number;
  /** H-02 */
  vffsBiscuitsPerMin: number;
  /** H-03 */
  solidBiscuitsPerMin: number;
  /** H-04 */
  grossOvenOutPerMin: number;
  /** H-05 */
  moldRpm: number;
  /** H-06 */
  circumferenceM: number;
  /** H-07 */
  beltSpeedMPerMin: number;
  /** H-08 */
  actualBakeMin: number;
  /** H-09 */
  bakedWeightG: number;
  /** H-10 */
  rawDoughKgPerHour: number;
  /** H-11 */
  bakedGrossKgPerHour: number;
  /** H-12 */
  scrapKgPerHour: number;
  /** H-13 */
  netPackedKgPerHour: number;
  /** H-14 — 8h shift */
  netTonsPerShift: number;
  /** H-15 — 3 shifts */
  netTonsPerDay: number;
  /** K-01 */
  bakeStatus: BakeStatus;
  /** K-02 */
  bakeDeltaMin: number;
  /** K-03 */
  cupNetWeightG: number;
  /** K-04 */
  packNetWeightG: number;
}

export interface Scenario {
  id: string;
  code: string;
  label: string;
  cupActive: number;
  vffsActive: number;
}

export interface ParamMeta {
  key: ParamKey;
  code: string;
  label: string;
  unit: string;
  /** Show as percent in UI when true (stored as 0–1 ratio). */
  asPercent?: boolean;
  min?: number;
  max?: number;
  step?: number;
  /** Derived read-only (P-03). */
  derived?: boolean;
}

export interface ProductProfile {
  id: ProductId;
  name: string;
  /** false = placeholders only; formulas still run but values are empty/zero. */
  hasDefaults: boolean;
  params: Params;
}
