import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

type Props<T extends string> = {
  items: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
};

export default function FilterChips<T extends string>({ items, selected, onSelect }: Props<T>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {items.map((item) => (
        <TouchableOpacity
          key={item}
          style={[styles.chip, selected === item && styles.activeChip]}
          onPress={() => onSelect(item)}
          activeOpacity={0.88}
        >
          <Text style={[styles.chipText, selected === item && styles.activeText]}>{item}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  row: {
    paddingBottom: 14,
    gap: 10,
  },
  chip: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  activeChip: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a',
    shadowColor: '#1e3a8a',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  chipText: {
    color: '#1e3a8a',
    fontWeight: '700',
    fontSize: 14,
  },
  activeText: {
    color: '#ffffff',
  },
});