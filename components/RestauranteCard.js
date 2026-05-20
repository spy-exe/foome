import React, { useRef } from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { C, F, SHADOW } from '../constants/theme';
import { haptic } from '../utils/haptics';

export default function RestauranteCard({ restaurante, onPress }) {
  const gratis  = restaurante.entrega === 'Grátis';
  const popular = restaurante.avaliacao >= 4.8;
  const scale = useRef(new Animated.Value(1)).current;

  function pressIn() {
    Animated.timing(scale, {
      toValue: 0.97,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }

  function pressOut() {
    Animated.timing(scale, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }

  return (
    <Animated.View style={[s.card, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={() => {
          haptic.select();
          onPress?.();
        }}
      >

      {/* ── Topo colorido com emoji ── */}
      <View style={[s.topo, { backgroundColor: restaurante.cor + '1A' }]}>
        <Text style={s.emoji}>{restaurante.emoji}</Text>
        {popular && (
          <View style={[s.badge, { backgroundColor: restaurante.cor }]}>
            <Ionicons name="star" size={9} color="#fff" />
            <Text style={s.badgeTxt}> Popular</Text>
          </View>
        )}
        <View style={[s.corTag, { backgroundColor: restaurante.cor }]} />
      </View>

      {/* ── Corpo ── */}
      <View style={s.corpo}>
        <View style={s.nomeRow}>
          <Text style={s.nome} numberOfLines={1}>{restaurante.nome}</Text>
          <View style={s.ratingPill}>
            <Ionicons name="star" size={11} color={C.amber} />
            <Text style={s.ratingTxt}> {restaurante.avaliacao}</Text>
          </View>
        </View>

        <Text style={s.cat}>{restaurante.categoria}</Text>

        <View style={s.metaRow}>
          <Feather name="clock" size={11} color={C.ink3} />
          <Text style={s.metaTxt}> {restaurante.tempo}</Text>
          <View style={s.dot} />
          <Text style={[s.metaTxt, gratis && s.gratis]}>
            {gratis ? 'Frete grátis' : restaurante.entrega}
          </Text>
          <View style={{ flex: 1 }} />
          <View style={[s.arrow, { backgroundColor: restaurante.cor + '18' }]}>
            <Feather name="chevron-right" size={14} color={restaurante.cor} />
          </View>
        </View>
      </View>

      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOW.card,
  },

  topo: {
    height: 88,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: { fontSize: 46 },

  badge: {
    position: 'absolute',
    top: 10, right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeTxt: { fontFamily: F.bold, fontSize: 10, color: '#fff' },

  corTag: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 3,
  },

  corpo: { padding: 14 },

  nomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  nome: {
    fontFamily: F.headingSm,
    fontSize: 16,
    color: C.ink,
    letterSpacing: -0.2,
    flex: 1,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.amberLight,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginLeft: 8,
  },
  ratingTxt: { fontFamily: F.bold, fontSize: 12, color: '#92530A' },

  cat: {
    fontFamily: F.regular,
    fontSize: 12,
    color: C.ink3,
    marginBottom: 10,
  },

  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaTxt: { fontFamily: F.medium, fontSize: 12, color: C.ink2 },
  dot:     { width: 3, height: 3, borderRadius: 2, backgroundColor: C.ink4, marginHorizontal: 6 },
  gratis:  { color: C.teal },

  arrow: {
    width: 30, height: 30,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
