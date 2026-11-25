import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductLineBar } from '../components/ProductLineBar';
import { useAppState } from '../context/AppState';
import { LINES, PRODUCT_MAP } from '../lib/defaults';
import { colors } from '../lib/theme';

export default function NotlarScreen() {
  const { notes, setNotes, notesReady, productId, lineId } = useAppState();
  const product = PRODUCT_MAP[productId];
  const line = LINES.find((l) => l.id === lineId)!;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ProductLineBar />
        <Text style={styles.context}>
          Bağlam: {product.name} · {line.name} (notlar cihazda saklanır)
        </Text>
        <View style={styles.box}>
          <TextInput
            style={styles.input}
            multiline
            textAlignVertical="top"
            placeholder="Vardiya notları, arıza, gözlem…"
            placeholderTextColor={colors.muted}
            value={notes}
            editable={notesReady}
            onChangeText={setNotes}
          />
        </View>
        <Text style={styles.hint}>
          {notesReady
            ? 'Otomatik kaydedilir (AsyncStorage).'
            : 'Notlar yükleniyor…'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40, flexGrow: 1 },
  context: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 12,
    fontWeight: '500',
  },
  box: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 280,
  },
  input: {
    flex: 1,
    minHeight: 280,
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  hint: {
    marginTop: 10,
    fontSize: 12,
    color: colors.muted,
  },
});
