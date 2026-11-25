import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  DEFAULT_LINE,
  DEFAULT_PRODUCT,
  PRODUCT_MAP,
  PRODUCTS,
} from '../lib/defaults';
import { computeMetrics } from '../lib/formulas';
import type {
  LineId,
  Metrics,
  ParamKey,
  Params,
  ProductId,
} from '../lib/types';

const NOTES_KEY = '@akyuz/notes';

type ParamsByProduct = Record<ProductId, Params>;

function initialParamsByProduct(): ParamsByProduct {
  return {
    'choco-biss': { ...PRODUCT_MAP['choco-biss'].params },
    'choco-buns': { ...PRODUCT_MAP['choco-buns'].params },
    'choco-stiks': { ...PRODUCT_MAP['choco-stiks'].params },
  };
}

interface AppStateValue {
  productId: ProductId;
  setProductId: (id: ProductId) => void;
  lineId: LineId;
  setLineId: (id: LineId) => void;
  params: Params;
  setParam: (key: ParamKey, value: number) => void;
  resetParams: () => void;
  metrics: Metrics;
  hasDefaults: boolean;
  notes: string;
  setNotes: (text: string) => void;
  notesReady: boolean;
  applyScenario: (cupActive: number, vffsActive: number) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [productId, setProductId] = useState<ProductId>(DEFAULT_PRODUCT);
  const [lineId, setLineId] = useState<LineId>(DEFAULT_LINE);
  const [paramsByProduct, setParamsByProduct] = useState<ParamsByProduct>(
    initialParamsByProduct,
  );
  const [notes, setNotesState] = useState('');
  const [notesReady, setNotesReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(NOTES_KEY);
        if (!cancelled && stored != null) setNotesState(stored);
      } catch {
        // ignore — notes stay empty
      } finally {
        if (!cancelled) setNotesReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setNotes = useCallback((text: string) => {
    setNotesState(text);
    void AsyncStorage.setItem(NOTES_KEY, text).catch(() => {
      // ignore persistence errors in MVP
    });
  }, []);

  const params = paramsByProduct[productId];
  const hasDefaults =
    PRODUCTS.find((p) => p.id === productId)?.hasDefaults ?? false;

  const setParam = useCallback(
    (key: ParamKey, value: number) => {
      setParamsByProduct((prev) => ({
        ...prev,
        [productId]: { ...prev[productId], [key]: value },
      }));
    },
    [productId],
  );

  const resetParams = useCallback(() => {
    const defaults = PRODUCT_MAP[productId].params;
    setParamsByProduct((prev) => ({
      ...prev,
      [productId]: { ...defaults },
    }));
  }, [productId]);

  const applyScenario = useCallback(
    (cupActive: number, vffsActive: number) => {
      setParamsByProduct((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          cupActiveMachines: cupActive,
          vffsActiveMachines: vffsActive,
        },
      }));
    },
    [productId],
  );

  const metrics = useMemo(() => computeMetrics(params), [params]);

  const value = useMemo<AppStateValue>(
    () => ({
      productId,
      setProductId,
      lineId,
      setLineId,
      params,
      setParam,
      resetParams,
      metrics,
      hasDefaults,
      notes,
      setNotes,
      notesReady,
      applyScenario,
    }),
    [
      productId,
      lineId,
      params,
      setParam,
      resetParams,
      metrics,
      hasDefaults,
      notes,
      setNotes,
      notesReady,
      applyScenario,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
