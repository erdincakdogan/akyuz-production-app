import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LINES, PRODUCTS } from '../lib/defaults';
import { useAppState } from '../context/AppState';
import type { LineId, ProductId } from '../lib/types';
import { colors } from '../lib/theme';

export function ProductLineBar() {
  const { productId, setProductId, lineId, setLineId } = useAppState();

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionLabel}>Ürün</Text>
      <View style={styles.row}>
        {PRODUCTS.map((p) => {
          const active = p.id === productId;
          return (
            <Pressable
              key={p.id}
              onPress={() => setProductId(p.id as ProductId)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {p.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.sectionLabel}>Hat</Text>
      <View style={styles.row}>
        {LINES.map((l) => {
          const active = l.id === lineId;
          return (
            <Pressable
              key={l.id}
              onPress={() => setLineId(l.id as LineId)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {l.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
  },
});
