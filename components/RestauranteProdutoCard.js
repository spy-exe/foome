import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { formatarPreco } from '../services/dados';
import { F, TYPE, R, S, SHADOW } from '../constants/theme';
import Stepper from './Stepper';
import CategoriaIcone from './CategoriaIcone';
import { haptic } from '../utils/haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../utils/useThemedStyles';

const RestauranteProdutoCard = memo(function RestauranteProdutoCard({
  item,
  cor,
  quantidade,
  onAdicionar,
  onRemover,
  onPress,
}) {
  const s = useThemedStyles(makeStyles);
  const addScale = useSharedValue(1);
  const addY = useSharedValue(0);
  const addOpacity = useSharedValue(1);

  function handleAdicionar() {
    haptic.light();
    addScale.value = withSequence(
      withTiming(0.86, { duration: 80 }),
      withSpring(1, { damping: 12, stiffness: 210 }),
    );
    addY.value = withSequence(
      withTiming(-10, { duration: 90 }),
      withTiming(16, { duration: 150 }),
      withSpring(0, { damping: 13, stiffness: 190 }),
    );
    addOpacity.value = withSequence(
      withTiming(0.72, { duration: 90 }),
      withTiming(1, { duration: 180 }),
    );
    onAdicionar();
  }

  function handleRemover() {
    haptic.select();
    onRemover();
  }

  const emojiStyle = useAnimatedStyle(() => ({
    opacity: addOpacity.value,
    transform: [
      { translateY: addY.value },
      { scale: addScale.value },
    ],
  }));

  return (
    <View style={s.card}>
      <TouchableOpacity
        style={s.cardPressArea}
        activeOpacity={0.86}
        accessibilityRole="button"
        accessibilityLabel={`${item.nome}, ${formatarPreco(item.preco)}`}
        hitSlop={4}
        onPress={onPress}
      >
        <Reanimated.View style={[s.prodImg, { backgroundColor: cor + '18' }, emojiStyle]}>
          <CategoriaIcone categoria={item.categoria} size={28} color={cor} />
        </Reanimated.View>
        <View style={s.prodInfo}>
          <Text style={s.prodNome}>{item.nome}</Text>
          <Text style={s.prodDesc} numberOfLines={2}>{item.descricao}</Text>
          <Text style={[s.prodPreco, { color: cor }]}>{formatarPreco(item.preco)}</Text>
        </View>
      </TouchableOpacity>

      <Stepper
        quantidade={quantidade}
        cor={cor}
        onAdicionar={handleAdicionar}
        onRemover={handleRemover}
      />
    </View>
  );
});

const makeStyles = (C) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: R.lg,
    padding: S.lg,
    marginBottom: 10,
    gap: S.md,
    ...SHADOW.card,
  },
  cardPressArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
  },
  prodImg: {
    width: 52,
    height: 52,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prodEmoji: { fontSize: 34 },
  prodInfo: { flex: 1 },
  prodNome: { fontFamily: F.uiSemi, fontSize: 15, color: C.ink, letterSpacing: 0 },
  prodDesc: { fontFamily: F.body, fontSize: 12, color: C.inkLight, marginTop: 3, lineHeight: 17 },
  prodPreco: { ...TYPE.priceS, marginTop: 6 },
});

export default RestauranteProdutoCard;
