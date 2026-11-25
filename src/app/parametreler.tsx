import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductLineBar } from '../components/ProductLineBar';
import { useAppState } from '../context/AppState';
import { formatNumber } from '../lib/formulas';
import { P03_META, PARAM_META } from '../lib/paramMeta';
import { colors } from '../lib/theme';
import type { ParamKey } from '../lib/types';

export default function ParametrelerScreen() {
  const { params, setParam, resetParams, metrics, hasDefaults } = useAppState();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ProductLineBar />

        <View style={styles.toolbar}>
          <Text style={styles.hint}>
            P-01…P-16 düzenlenebilir · P-03 hesaplanır
          </Text>
          <Pressable onPress={resetParams} style={styles.resetBtn}>
            <Text style={styles.resetText}>
              {hasDefaults ? 'Varsayılana dön' : 'Sıfırla'}
            </Text>
          </Pressable>
        </View>

        <View style={[styles.row, styles.derived]}>
          <View style={styles.rowHead}>
            <Text style={styles.code}>{P03_META.code}</Text>
            <Text style={styles.label}>{P03_META.label}</Text>
          </View>
          <Text style={styles.derivedValue}>
            {formatNumber(metrics.eyesPerRevolution, 0)} {P03_META.unit}
          </Text>
        </View>

        {PARAM_META.map((meta) => (
          <ParamRow
            key={meta.key}
            code={meta.code}
            label={meta.label}
            unit={meta.unit}
            asPercent={meta.asPercent}
            value={params[meta.key]}
            onChange={(v) => setParam(meta.key as ParamKey, v)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function ParamRow({
  code,
  label,
  unit,
  value,
  asPercent,
  onChange,
}: {
  code: string;
  label: string;
  unit: string;
  value: number;
  asPercent?: boolean;
  onChange: (v: number) => void;
}) {
  const display = asPercent ? value * 100 : value;
  const [text, setText] = useState(String(display));

  // Keep local text in sync when external value changes (product switch / reset)
  React.useEffect(() => {
    setText(String(asPercent ? value * 100 : value));
  }, [value, asPercent]);

  const commit = (raw: string) => {
    const parsed = Number(raw.replace(',', '.'));
    if (Number.isNaN(parsed)) {
      setText(String(asPercent ? value * 100 : value));
      return;
    }
    onChange(asPercent ? parsed / 100 : parsed);
  };

  return (
    <View style={styles.row}>
      <View style={styles.rowHead}>
        <Text style={styles.code}>{code}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          onBlur={() => commit(text)}
          onSubmitEditing={() => commit(text)}
          keyboardType="decimal-pad"
          returnKeyType="done"
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40, gap: 8 },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  hint: { flex: 1, fontSize: 12, color: colors.muted },
  resetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.primarySoft,
  },
  resetText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  row: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  derived: { backgroundColor: colors.primarySoft, borderColor: '#C5D9C9' },
  rowHead: { gap: 2 },
  code: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.4,
  },
  label: { fontSize: 14, color: colors.text, fontWeight: '500' },
  derivedValue: { fontSize: 16, fontWeight: '700', color: colors.text },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    backgroundColor: '#FAFBFA',
  },
  unit: { fontSize: 12, color: colors.muted, minWidth: 72 },
});
