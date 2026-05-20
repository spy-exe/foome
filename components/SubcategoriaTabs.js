import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { C, F } from '../constants/theme';

export default function SubcategoriaTabs({ tabs, atual, onChange, cor }) {
  return (
    <View style={s.subTabBar}>
      <FlatList
        horizontal
        data={tabs}
        keyExtractor={item => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.subTabRow}
        renderItem={({ item }) => {
          const ativa = atual === item.key;
          return (
            <TouchableOpacity
              style={[s.subTab, ativa && { backgroundColor: cor + '14', borderColor: cor }]}
              activeOpacity={0.82}
              onPress={() => onChange(item.key)}
            >
              <Text style={[s.subTabTxt, ativa && { color: cor }]}>{item.label}</Text>
              {ativa && <View style={[s.subTabLine, { backgroundColor: cor }]} />}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  subTabBar: {
    backgroundColor: C.bg,
    paddingBottom: 12,
    marginBottom: 4,
  },
  subTabRow: { gap: 8, paddingRight: 4 },
  subTab: {
    minWidth: 92,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subTabTxt: { fontFamily: F.semibold, fontSize: 13, color: C.ink2 },
  subTabLine: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 5,
    height: 2,
    borderRadius: 1,
  },
});
