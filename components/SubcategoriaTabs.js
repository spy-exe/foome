import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { C, F, R, S } from '../constants/theme';

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
              accessibilityRole="tab"
              accessibilityState={{ selected: ativa }}
              accessibilityLabel={`Categoria ${item.label}`}
              hitSlop={6}
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
    backgroundColor: C.offWhite,
    paddingBottom: S.md,
    marginBottom: 4,
  },
  subTabRow: { gap: S.sm, paddingRight: 4 },
  subTab: {
    minWidth: 92,
    height: 40,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    paddingHorizontal: S.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subTabTxt: { fontFamily: F.uiSemi, fontSize: 13, color: C.inkMid },
  subTabLine: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 5,
    height: 2,
    borderRadius: 1,
  },
});
