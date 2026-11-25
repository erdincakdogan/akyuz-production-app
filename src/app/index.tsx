import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductLineBar } from '../components/ProductLineBar';
import { useAppState } from '../context/AppState';
import { LINES, PRODUCT_MAP } from '../lib/defaults';
import { formatNumber } from '../lib/formulas';
import { colors } from '../lib/theme';

export default function OzetScreen() {
  const { productId, lineId, metrics, hasDefaults, params } = useAppState();
  const product = PRODUCT_MAP[productId];
  const line = LINES.find((l) => l.id === lineId)!;
  const ok = metrics.bakeStatus === 'UYGUN';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProductLineBar />

        {!hasDefaults && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              {product.name} için Excel varsayılanları henüz tanımlı değil.
              Parametreleri elle girin veya Choco Buns seçin.
            </Text>
          </View>
        )}

        <Text style={styles.context}>
          {product.name} · {line.name} · {params.cupActiveMachines}B+
          {params.vffsActiveMachines}D
        </Text>

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Hedef kalıp RPM (H-05)</Text>
          <Text style={styles.heroValue}>{formatNumber(metrics.moldRpm, 2)}</Text>
          <Text style={styles.heroUnit}>devir/dk</Text>
        </View>

        <View style={[styles.badge, ok ? styles.badgeOk : styles.badgeWarn]}>
          <Text style={[styles.badgeText, ok ? styles.badgeTextOk : styles.badgeTextWarn]}>
            {ok
              ? 'UYGUN (TAM PİŞME)'
              : 'YETERSİZ PİŞME SÜRESİ / HIZ YÜKSEK'}
          </Text>
        </View>

        <View style={styles.grid}>
          <Metric
            label="Bant hızı (H-07)"
            value={`${formatNumber(metrics.beltSpeedMPerMin, 2)} m/dk`}
          />
          <Metric
            label="Gerçek pişme (H-08)"
            value={`${formatNumber(metrics.actualBakeMin, 2)} dk`}
          />
          <Metric
            label="Net kg/saat (H-13)"
            value={`${formatNumber(metrics.netPackedKgPerHour, 1)} kg`}
          />
          <Metric
            label="Ton/vardiya (H-14)"
            value={`${formatNumber(metrics.netTonsPerShift, 2)} t`}
          />
          <Metric
            label="Ton/gün (H-15)"
            value={`${formatNumber(metrics.netTonsPerDay, 2)} t`}
          />
          <Metric
            label="Iskarta (H-12)"
            value={`${formatNumber(metrics.scrapKgPerHour, 1)} kg/saat`}
          />
        </View>

        <View style={styles.detailBlock}>
          <Text style={styles.detailTitle}>Talep özeti</Text>
          <DetailRow
            label="Bardak ihtiyacı (H-01)"
            value={`${formatNumber(metrics.cupBiscuitsPerMin, 0)} adet/dk`}
          />
          <DetailRow
            label="Dikey ihtiyacı (H-02)"
            value={`${formatNumber(metrics.vffsBiscuitsPerMin, 0)} adet/dk`}
          />
          <DetailRow
            label="Sağlam paketleme (H-03)"
            value={`${formatNumber(metrics.solidBiscuitsPerMin, 0)} adet/dk`}
          />
          <DetailRow
            label="Brüt fırın çıkış (H-04)"
            value={`${formatNumber(metrics.grossOvenOutPerMin, 0)} adet/dk`}
          />
          <DetailRow
            label="Pişme farkı (K-02)"
            value={`${formatNumber(metrics.bakeDeltaMin, 2)} dk`}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
  content: { padding: 16, paddingBottom: 32 },
  banner: {
    backgroundColor: colors.warnBg,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  bannerText: { color: colors.warn, fontSize: 13, lineHeight: 18 },
  context: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '500',
  },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  heroLabel: { color: '#D8E8DB', fontSize: 13, fontWeight: '600' },
  heroValue: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 4,
  },
  heroUnit: { color: '#B7D0BC', fontSize: 13, marginTop: 2 },
  badge: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeOk: { backgroundColor: colors.okBg },
  badgeWarn: { backgroundColor: colors.warnBg },
  badgeText: { fontWeight: '700', fontSize: 13 },
  badgeTextOk: { color: colors.ok },
  badgeTextWarn: { color: colors.warn },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
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
  detailBlock: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  detailLabel: { fontSize: 13, color: colors.muted, flex: 1 },
  detailValue: { fontSize: 13, fontWeight: '600', color: colors.text },
});
