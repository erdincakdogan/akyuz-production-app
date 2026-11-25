import type { Params, ProductId, ProductProfile } from './types';

/** Excel v4 Choco Buns operator defaults (1B+1D → ~10.51 RPM). */
export const CHOCO_BUNS_DEFAULTS: Params = {
  eyesAcross: 30, // P-01
  eyesAround: 17, // P-02
  pitchMm: 40, // P-04
  rawWeightG: 2.75, // P-05
  tunnelLengthM: 60, // P-06
  targetBakeMin: 8, // P-07
  moistureRate: 0.15, // P-08
  scrapRate: 0.03, // P-09
  cupActiveMachines: 1, // P-10
  cupSpeedCupsPerMin: 60, // P-11
  cupBiscuitsPerCup: 40, // P-12
  vffsActiveMachines: 1, // P-13
  vffsSpeedPacksPerMin: 280, // P-14
  vffsBiscuitsPerPack: 10, // P-15
  targetUtilization: 1.0, // P-16
};

/** Empty placeholder set for products without Excel defaults yet. */
export const EMPTY_PARAMS: Params = {
  eyesAcross: 0,
  eyesAround: 0,
  pitchMm: 0,
  rawWeightG: 0,
  tunnelLengthM: 0,
  targetBakeMin: 0,
  moistureRate: 0,
  scrapRate: 0,
  cupActiveMachines: 0,
  cupSpeedCupsPerMin: 0,
  cupBiscuitsPerCup: 0,
  vffsActiveMachines: 0,
  vffsSpeedPacksPerMin: 0,
  vffsBiscuitsPerPack: 0,
  targetUtilization: 0,
};

export const PRODUCTS: ProductProfile[] = [
  {
    id: 'choco-biss',
    name: 'Choco Biss',
    hasDefaults: false,
    params: { ...EMPTY_PARAMS },
  },
  {
    id: 'choco-buns',
    name: 'Choco Buns',
    hasDefaults: true,
    params: { ...CHOCO_BUNS_DEFAULTS },
  },
  {
    id: 'choco-stiks',
    name: 'Choco Stiks',
    hasDefaults: false,
    params: { ...EMPTY_PARAMS },
  },
];

export const PRODUCT_MAP: Record<ProductId, ProductProfile> = Object.fromEntries(
  PRODUCTS.map((p) => [p.id, p]),
) as Record<ProductId, ProductProfile>;

export const LINES = [
  { id: 'firin' as const, name: 'Fırın' },
  { id: 'paketleme' as const, name: 'Paketleme' },
];

export const DEFAULT_PRODUCT: ProductId = 'choco-buns';
export const DEFAULT_LINE = 'firin' as const;
