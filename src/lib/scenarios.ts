import type { Scenario } from './types';

/** SNR-01…08 — packing combinations from Excel hız kartı. */
export const SCENARIOS: Scenario[] = [
  {
    id: 'snr-01',
    code: 'SNR-01',
    label: 'Sadece 1 Bardak',
    cupActive: 1,
    vffsActive: 0,
  },
  {
    id: 'snr-02',
    code: 'SNR-02',
    label: 'Sadece 1 Dikey',
    cupActive: 0,
    vffsActive: 1,
  },
  {
    id: 'snr-03',
    code: 'SNR-03',
    label: '2 Bardak',
    cupActive: 2,
    vffsActive: 0,
  },
  {
    id: 'snr-04',
    code: 'SNR-04',
    label: '1B+1D (varsayılan)',
    cupActive: 1,
    vffsActive: 1,
  },
  {
    id: 'snr-05',
    code: 'SNR-05',
    label: '2 Dikey',
    cupActive: 0,
    vffsActive: 2,
  },
  {
    id: 'snr-06',
    code: 'SNR-06',
    label: '2B+1D',
    cupActive: 2,
    vffsActive: 1,
  },
  {
    id: 'snr-07',
    code: 'SNR-07',
    label: '1B+2D',
    cupActive: 1,
    vffsActive: 2,
  },
  {
    id: 'snr-08',
    code: 'SNR-08',
    label: '2B+2D tam',
    cupActive: 2,
    vffsActive: 2,
  },
];
