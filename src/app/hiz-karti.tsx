import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductLineBar } from '../components/ProductLineBar';
import { useAppState } from '../context/AppState';
import { computeMetrics, formatNumber, withScenario } from '../lib/formulas';
import { SCENARIOS } from '../lib/scenarios';
import { colors } from '../lib/theme';

export default function HizKartiScreen() {
  const { params, applyScenario, productId } = useAppState();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProductLineBar />
        <Text style={styles.intro}>
          SNR-01…08 paketleme kombinasyonları. Satıra dokunarak aktif makine
          sayılarını (P-10 / P-13) uygular.
        </Text>

        {SCENARIOS.map((snr) => {
          const m = computeMetrics(
            withScenario(params, snr.cupActive, snr.vffsActive),
          );
          const active =
            params.cupActiveMachines === snr.cupActive &&
            params.vffsActiveMachines === snr.vffsActive;
          const ok = m.bakeStatus === 'UYGUN';

          return (
            <Pressable
              key={snr.id}
              onPress={() => applyScenario(snr.cupActive, snr.vffsActive)}
              style={[styles.card, active && styles.cardActive]}
            >
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.code}>{snr.code}</Text>
                  <Text style={styles.label}>{snr.label}</Text>
                  <Text style={styles.combo}>
                    {snr.cupActive}B + {snr.vffsActive}D
                  </Text>
                </View>
                <View style={styles.rpmBlock}>
                  <Text style={styles.rpmValue}>
                    {formatNumber(m.moldRpm, 2)}
                  </Text>
                  <Text style={styles.rpmUnit}>RPM</Text>
                </View>
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.meta}>
                  Pişme {formatNumber(m.actualBakeMin, 1)} dk · Net{' '}
                  {formatNumber(m.netTonsPerShift, 2)} t/vardiya
                </Text>
                <View
                  style={[styles.pill, ok ? styles.pillOk : styles.pillWarn]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      ok ? styles.pillTextOk : styles.pillTextWarn,
                    ]}
                  >
                    {ok ? 'UYGUN' : 'HIZ YÜKSEK'}
                  </Text>
                </View>
              </View>
              {active && (
                <Text style={styles.activeHint}>
                  Aktif · {productId === 'choco-buns' ? 'parametrelere uygulandı' : 'uygulandı'}
                </Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40, gap: 10 },
  intro: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
    marginBottom: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  cardActive: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primarySoft,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  code: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.4,
  },
  label: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 2 },
  combo: { fontSize: 12, color: colors.muted, marginTop: 2 },
  rpmBlock: { alignItems: 'flex-end' },
  rpmValue: { fontSize: 28, fontWeight: '800', color: colors.text },
  rpmUnit: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  meta: { flex: 1, fontSize: 12, color: colors.muted },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pillOk: { backgroundColor: colors.okBg },
  pillWarn: { backgroundColor: colors.warnBg },
  pillText: { fontSize: 11, fontWeight: '700' },
  pillTextOk: { color: colors.ok },
  pillTextWarn: { color: colors.warn },
  activeHint: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
});
