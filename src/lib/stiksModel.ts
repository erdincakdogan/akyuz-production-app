/**
 * Choco Stiks line capacity + daily OEE (separate from Choco Buns Excel RPM model).
 * Authoritative defaults: docs/choco-stiks-model.md (project store).
 */

export type StiksSkuId = '40g' | '25g';

export interface StiksSku {
  id: StiksSkuId;
  label: string;
  /** Cubuk / paket */
  sticksPerPack: number;
  /** Paket / tray (1 tray = 1 kutu on the floor) */
  packsPerTray: number;
}

export interface StiksLineConfig {
  depositors: number;
  holesPerDepositor: number;
  closedHolesPerDepositor: number;
  guillotineCutsPerMin: number;
  /** Yatay paketleme cubuk/dk (range) */
  horizontalPackMin: number;
  horizontalPackMax: number;
  /** Kutulama teorik — OEE payda temeli */
  boxingBoxesPerMin: number;
  defaultWorkHours: number;
  /** Floor assumption: 1 tray = 1 kutu */
  trayEqualsBox: true;
}

export const STIKS_LINE: StiksLineConfig = {
  depositors: 3,
  holesPerDepositor: 25,
  closedHolesPerDepositor: 8,
  guillotineCutsPerMin: 38,
  horizontalPackMin: 1000,
  horizontalPackMax: 1200,
  boxingBoxesPerMin: 60,
  defaultWorkHours: 7,
  trayEqualsBox: true,
};

export const STIKS_SKUS: Record<StiksSkuId, StiksSku> = {
  '40g': {
    id: '40g',
    label: '40 g',
    sticksPerPack: 13,
    packsPerTray: 12,
  },
  '25g': {
    id: '25g',
    label: '25 g',
    sticksPerPack: 8,
    packsPerTray: 16,
  },
};

export const STIKS_SKU_LIST: StiksSku[] = Object.values(STIKS_SKUS);

/** Aktif delik: 3 × (25 − 8) = 51 */
export function activeHoles(cfg: StiksLineConfig = STIKS_LINE): number {
  return (
    cfg.depositors *
    (cfg.holesPerDepositor - cfg.closedHolesPerDepositor)
  );
}

/** Cubuk/dk: aktif delik × giyotin = 51 × 38 = 1938 */
export function sticksPerMin(cfg: StiksLineConfig = STIKS_LINE): number {
  return activeHoles(cfg) * cfg.guillotineCutsPerMin;
}

export interface StiksCapacitySummary {
  activeHoles: number;
  sticksPerMin: number;
  horizontalPackMin: number;
  horizontalPackMax: number;
  boxingBoxesPerMin: number;
}

export function capacitySummary(
  cfg: StiksLineConfig = STIKS_LINE,
): StiksCapacitySummary {
  return {
    activeHoles: activeHoles(cfg),
    sticksPerMin: sticksPerMin(cfg),
    horizontalPackMin: cfg.horizontalPackMin,
    horizontalPackMax: cfg.horizontalPackMax,
    boxingBoxesPerMin: cfg.boxingBoxesPerMin,
  };
}

export interface StiksOeeInput {
  skuId: StiksSkuId;
  /** Üretilen tray (birincil girdi); 1 tray = 1 kutu */
  traysProduced: number;
  /** Çalışma saati (varsayılan 7) */
  hoursWorked: number;
  line?: StiksLineConfig;
}

export interface StiksOeeResult {
  sku: StiksSku;
  hoursWorked: number;
  minutesWorked: number;
  traysProduced: number;
  /** Tray = kutu varsayımı */
  boxesProduced: number;
  packsProduced: number;
  sticksProduced: number;
  /** 60 kutu/dk × dakika */
  theoreticalBoxes: number;
  theoreticalTrays: number;
  theoreticalPacks: number;
  /** performans % = gerçek paket / teorik paket */
  performancePct: number;
}

/**
 * OEE / performans: kutulama 60 kutu/dk payda.
 * 1 tray = 1 kutu → teorik tray = teorik kutu;
 * teorik paket = teorik kutu × paket/tray;
 * performans = gerçek paket / teorik paket (= tray / teorik kutu).
 */
export function computeStiksOee(input: StiksOeeInput): StiksOeeResult {
  const line = input.line ?? STIKS_LINE;
  const sku = STIKS_SKUS[input.skuId];
  const hoursWorked = Math.max(0, input.hoursWorked);
  const minutesWorked = hoursWorked * 60;
  const traysProduced = Math.max(0, input.traysProduced);

  const theoreticalBoxes = line.boxingBoxesPerMin * minutesWorked;
  const theoreticalTrays = theoreticalBoxes; // tray = kutu
  const packsPerBox = sku.packsPerTray;
  const theoreticalPacks = theoreticalBoxes * packsPerBox;

  const packsProduced = traysProduced * sku.packsPerTray;
  const boxesProduced = traysProduced;
  const sticksProduced = packsProduced * sku.sticksPerPack;

  const performancePct =
    theoreticalPacks > 0 ? (packsProduced / theoreticalPacks) * 100 : 0;

  return {
    sku,
    hoursWorked,
    minutesWorked,
    traysProduced,
    boxesProduced,
    packsProduced,
    sticksProduced,
    theoreticalBoxes,
    theoreticalTrays,
    theoreticalPacks,
    performancePct,
  };
}

export interface StiksDailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  skuId: StiksSkuId;
  traysProduced: number;
  hoursWorked: number;
  packsProduced: number;
  theoreticalBoxes: number;
  performancePct: number;
  savedAt: string; // ISO
}

export function buildDailyLog(
  date: string,
  input: StiksOeeInput,
  savedAt = new Date().toISOString(),
): StiksDailyLog {
  const result = computeStiksOee(input);
  return {
    id: `${date}_${input.skuId}_${savedAt}`,
    date,
    skuId: input.skuId,
    traysProduced: result.traysProduced,
    hoursWorked: result.hoursWorked,
    packsProduced: result.packsProduced,
    theoreticalBoxes: result.theoreticalBoxes,
    performancePct: result.performancePct,
    savedAt,
  };
}

export function todayIsoDate(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
