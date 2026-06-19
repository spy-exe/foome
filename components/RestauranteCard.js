import React, { memo, useRef } from 'react';
import { Animated, ImageBackground, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, Clock, ChefHat, Truck } from 'lucide-react-native';
import { F, TYPE, R, S, SHADOW } from '../constants/theme';
import { ICON_SIZE } from '../constants/icons';
import CategoriaIcone from './CategoriaIcone';
import { haptic } from '../utils/haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../utils/useThemedStyles';

const RestauranteCard = memo(function RestauranteCard({ restaurante, onPress }) {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
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
        testID={`card-restaurant-${restaurante.id}`}
        activeOpacity={1}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={() => {
          haptic.select();
          onPress?.();
        }}
      >
        {restaurante.imageUrl ? (
          <ImageBackground
            source={{ uri: restaurante.imageUrl }}
            style={s.topo}
            imageStyle={s.topoImg}
          >
            <LinearGradient
              colors={['rgba(11,18,32,0.08)', 'rgba(11,18,32,0.70)']}
              style={s.topoOverlay}
            >
              <Text style={s.coverTitle}>{restaurante.categoria}</Text>
              {popular && (
                <View style={s.badge}>
                  <Text style={s.badgeTxt}>POPULAR</Text>
                </View>
              )}
            </LinearGradient>
          </ImageBackground>
        ) : (
          <LinearGradient
            colors={[C.midnight, restaurante.cor + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.topo}
          >
            <View style={[s.iconWrap, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <CategoriaIcone categoria={restaurante.categoria} size={34} color={C.white} />
            </View>

            {popular && (
              <View style={s.badge}>
                <Text style={s.badgeTxt}>POPULAR</Text>
              </View>
            )}
          </LinearGradient>
        )}

        {/* ── Corpo ── */}
        <View style={s.corpo}>
          <View style={s.nomeRow}>
            <Text style={s.nome} numberOfLines={1}>{restaurante.nome}</Text>
            <View style={s.ratingPill}>
              <Star size={12} color={C.warning} fill={C.warning} />
              <Text style={s.ratingTxt}> {restaurante.avaliacao}</Text>
            </View>
          </View>

          <Text style={s.cat}>{restaurante.categoria}</Text>

          <View style={s.metaRow}>
            <Clock size={12} color={C.inkLight} />
            <Text style={s.metaTxt}> {restaurante.tempo}</Text>
            <View style={s.dot} />
            <Truck size={12} color={gratis ? C.success : C.inkLight} />
            <Text style={[s.metaTxt, gratis && s.gratis]}>
              {' '}{gratis ? 'Frete grátis' : restaurante.entrega}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const makeStyles = (C) => StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    marginHorizontal: S.lg,
    marginBottom: S.md,
    borderRadius: R.xl,
    overflow: 'hidden',
    ...SHADOW.card,
  },

  topo: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topoImg: {
    resizeMode: 'cover',
  },
  topoOverlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    padding: S.lg,
  },
  coverTitle: {
    fontFamily: F.uiBold,
    fontSize: 13,
    color: C.white,
    letterSpacing: 0,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: R.full,
    justifyContent: 'center',
    alignItems: 'center',
  },

  badge: {
    position: 'absolute',
    top: 10, right: 10,
    backgroundColor: C.brand,
    borderRadius: R.full,
    paddingHorizontal: S.sm,
    paddingVertical: S.xs - 1,
  },
  badgeTxt: {
    ...TYPE.badge,
    color: C.white,
  },

  corpo: { padding: S.lg },

  nomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  nome: {
    ...TYPE.h4,
    flex: 1,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.warningLight,
    borderRadius: R.sm,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginLeft: 8,
  },
  ratingTxt: {
    ...TYPE.rating,
    color: C.ink,
  },

  cat: {
    ...TYPE.caption,
    color: C.inkLight,
    marginBottom: 10,
  },

  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaTxt: { fontFamily: F.mono, fontSize: 13, color: C.inkMid },
  dot:     { width: 3, height: 3, borderRadius: 2, backgroundColor: C.border, marginHorizontal: 6 },
  gratis:  { color: C.success },
});

export default RestauranteCard;
