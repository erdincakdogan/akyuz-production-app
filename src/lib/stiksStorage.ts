import AsyncStorage from '@react-native-async-storage/async-storage';

import type { StiksDailyLog } from './stiksModel';

const LOGS_KEY = '@akyuz/stiks-daily-logs';

export async function loadStiksLogs(): Promise<StiksDailyLog[]> {
  try {
    const raw = await AsyncStorage.getItem(LOGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StiksDailyLog[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export async function saveStiksLogs(logs: StiksDailyLog[]): Promise<void> {
  await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

/** Upsert by date+sku (latest wins for that day/SKU). */
export async function upsertStiksLog(
  log: StiksDailyLog,
): Promise<StiksDailyLog[]> {
  const existing = await loadStiksLogs();
  const filtered = existing.filter(
    (l) => !(l.date === log.date && l.skuId === log.skuId),
  );
  const next = [log, ...filtered].sort((a, b) =>
    a.date === b.date
      ? b.savedAt.localeCompare(a.savedAt)
      : b.date.localeCompare(a.date),
  );
  await saveStiksLogs(next);
  return next;
}

export async function deleteStiksLog(id: string): Promise<StiksDailyLog[]> {
  const existing = await loadStiksLogs();
  const next = existing.filter((l) => l.id !== id);
  await saveStiksLogs(next);
  return next;
}
