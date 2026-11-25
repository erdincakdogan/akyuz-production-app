import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatNumber } from '../lib/formulas';
import {
  STIKS_LINE,
  STIKS_SKU_LIST,
  type StiksDailyLog,
  type StiksSkuId,
  buildDailyLog,
  capacitySummary,
  computeStiksOee,
  todayIsoDate,
} from '../lib/stiksModel';
import {
  deleteStiksLog,
  loadStiksLogs,
  upsertStiksLog,
} from '../lib/stiksStorage';
import { colors } from '../lib/theme';

export default function StiksOeeScreen() {
  const [date, setDate] = useState(todayIsoDate);
  const [skuId, setSkuId] = useState<StiksSkuId>('40g');
  const [traysText, setTraysText] = useState('');
  const [hoursText, setHoursText] = useState(
    String(STIKS_LINE.defaultWorkHours),
  );
  const [logs, setLogs] = useState<StiksDailyLog[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadStiksLogs();
      if (!cancelled) {
        setLogs(stored);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const traysProduced = parseNonNeg(traysText);
  const hoursWorked = parseNonNeg(hoursText, STIKS_LINE.defaultWorkHours);

  const oee = useMemo(
    () =>
      computeStiksOee({
        skuId,
        traysProduced,
        hoursWorked,
      }),
    [skuId, traysProduced, hoursWorked],
  );

  const capacity = useMemo(() => capacitySummary(), []);

  const onSave = useCallback(async () => {
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert('Tarih', 'Tarih YYYY-AA-GG formatında olmalı.');
      return;
    }
    const log = buildDailyLog(date, {
      skuId,
      traysProduced,
      hoursWorked,
    });
    const next = await upsertStiksLog(log);
    setLogs(next);
    Alert.alert('Kaydedildi', `${date} · ${oee.sku.label} günlüğü güncellendi.`);
  }, [date, skuId, traysProduced, hoursWorked, oee.sku.label]);

  const onDelete = useCallback(async (id: string) => {
    const next = await deleteStiksLog(id);
    setLogs(next);
  }, []);

  const onLoadLog = useCallback((log: StiksDailyLog) => {
    setDate(log.date);
    setSkuId(log.skuId);
    setTraysText(String(log.traysProduced));
    setHoursText(String(log.hoursWorked));
  }, []);

  const perfColor =
    oee.performancePct >= 85
      ? colors.ok
      : oee.performancePct >= 60
        ? colors.accent
        : colors.warn;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.eyebrow}>Choco Stiks · ayrı kapasite modeli</Text>
        <Text style={styles.title}>Günlük OEE</Text>
        <Text style={styles.sub}>
          Payda: kutulama {STIKS_LINE.boxingBoxesPerMin} kutu/dk. Tray = kutu.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Tarih (YYYY-AA-GG)</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="2026-11-26"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.label, styles.labelGap]}>Ürün (SKU)</Text>
          <View style={styles.row}>
            {STIKS_SKU_LIST.map((sku) => {
              const active = sku.id === skuId;
              return (
                <Pressable
                  key={sku.id}
                  onPress={() => setSkuId(sku.id)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {sku.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.hint}>
            {oee.sku.sticksPerPack} çubuk/paket · {oee.sku.packsPerTray}{' '}
            paket/tray
          </Text>

          <Text style={[styles.label, styles.labelGap]}>
            Üretilen tray (koli)
          </Text>
          <TextInput
            style={styles.input}
            value={traysText}
            onChangeText={setTraysText}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.muted}
          />

          <Text style={[styles.label, styles.labelGap]}>
            Çalışma süresi (saat)
          </Text>
          <TextInput
            style={styles.input}
            value={hoursText}
            onChangeText={setHoursText}
            keyboardType="decimal-pad"
            placeholder={String(STIKS_LINE.defaultWorkHours)}
            placeholderTextColor={colors.muted}
          />
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Günlük performans (OEE)</Text>
          <Text style={[styles.heroValue, { color: perfColor }]}>
            {formatNumber(oee.performancePct, 1)}%
          </Text>
          <Text style={styles.heroUnit}>
            {formatNumber(oee.packsProduced, 0)} /{' '}
            {formatNumber(oee.theoreticalPacks, 0)} paket
          </Text>
        </View>

        <View style={styles.grid}>
          <Metric
            label="Teorik kutu"
            value={formatNumber(oee.theoreticalBoxes, 0)}
          />
          <Metric
            label="Gerçek tray/kutu"
            value={formatNumber(oee.boxesProduced, 0)}
          />
          <Metric
            label="Gerçek paket"
            value={formatNumber(oee.packsProduced, 0)}
          />
          <Metric
            label="Gerçek çubuk"
            value={formatNumber(oee.sticksProduced, 0)}
          />
        </View>

        <Text style={styles.formulaHint}>
          Teorik kutu = {STIKS_LINE.boxingBoxesPerMin} × {formatNumber(oee.hoursWorked, 1)}{' '}
          saat × 60 = {formatNumber(oee.theoreticalBoxes, 0)}
          {oee.hoursWorked === 7
            ? ' (örnek: 60×60×7 = 25.200)'
            : ''}
        </Text>

        <Pressable style={styles.saveBtn} onPress={onSave}>
          <Text style={styles.saveBtnText}>Günü kaydet</Text>
        </Pressable>

        <View style={styles.capacityBlock}>
          <Text style={styles.sectionTitle}>Hat kapasitesi (Stiks)</Text>
          <Text style={styles.capacityNote}>
            Choco Buns Excel RPM modelinden bağımsız.
          </Text>
          <DetailRow
            label="Aktif delik"
            value={`${capacity.activeHoles} (3×25 − 3×8)`}
          />
          <DetailRow
            label="Giyotin"
            value={`${STIKS_LINE.guillotineCutsPerMin}/dk`}
          />
          <DetailRow
            label="Çubuk/dk"
            value={`${formatNumber(capacity.sticksPerMin, 0)} (${capacity.activeHoles}×${STIKS_LINE.guillotineCutsPerMin})`}
          />
          <DetailRow
            label="Yatay paketleme"
            value={`${capacity.horizontalPackMin}–${capacity.horizontalPackMax} çubuk/dk`}
          />
          <DetailRow
            label="Kutulama (OEE payda)"
            value={`${capacity.boxingBoxesPerMin} kutu/dk`}
          />
        </View>

        <View style={styles.logsBlock}>
          <Text style={styles.sectionTitle}>Kayıtlı günler</Text>
          {!ready && <Text style={styles.hint}>Yükleniyor…</Text>}
          {ready && logs.length === 0 && (
            <Text style={styles.hint}>Henüz kayıt yok.</Text>
          )}
          {logs.map((log) => (
            <View key={log.id} style={styles.logRow}>
              <Pressable
                style={styles.logMain}
                onPress={() => onLoadLog(log)}
              >
                <Text style={styles.logDate}>
                  {log.date} · {STIKS_SKU_LIST.find((s) => s.id === log.skuId)?.label}
                </Text>
                <Text style={styles.logMeta}>
                  {formatNumber(log.traysProduced, 0)} tray ·{' '}
                  {formatNumber(log.hoursWorked, 1)} sa ·{' '}
                  {formatNumber(log.performancePct, 1)}%
                </Text>
              </Pressable>
              <Pressable
                onPress={() => onDelete(log.id)}
                hitSlop={8}
                style={styles.logDelete}
              >
                <Text style={styles.logDeleteText}>Sil</Text>
              </Pressable>
            </View>
          ))}
          <Text style={styles.hint}>
            Kayıtlar cihazda saklanır (AsyncStorage).
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function parseNonNeg(text: string, fallback = 0): number {
  const n = Number(String(text).replace(',', '.'));
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  eyebrow: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginTop: 4,
  },
  sub: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 18,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  labelGap: { marginTop: 14 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.bg,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.text },
  chipTextActive: { color: '#fff' },
  hint: { fontSize: 12, color: colors.muted, marginTop: 8, lineHeight: 17 },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroLabel: { fontSize: 13, fontWeight: '600', color: colors.muted },
  heroValue: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 4,
  },
  heroUnit: { fontSize: 13, color: colors.muted, marginTop: 4 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  metric: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricLabel: { fontSize: 11, color: colors.muted, marginBottom: 4 },
  metricValue: { fontSize: 16, fontWeight: '700', color: colors.text },
  formulaHint: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 12,
    lineHeight: 17,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  capacityBlock: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  capacityNote: { fontSize: 12, color: colors.muted, marginBottom: 4 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  detailLabel: { fontSize: 13, color: colors.muted, flex: 1 },
  detailValue: { fontSize: 13, fontWeight: '600', color: colors.text },
  logsBlock: { gap: 8 },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  logMain: { flex: 1 },
  logDate: { fontSize: 14, fontWeight: '700', color: colors.text },
  logMeta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  logDelete: { paddingLeft: 12 },
  logDeleteText: { color: colors.warn, fontWeight: '600', fontSize: 13 },
});
