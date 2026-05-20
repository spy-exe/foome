import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Plus, Minus } from 'lucide-react-native';
import { C, F, R } from '../constants/theme';
import { ICON_SIZE } from '../constants/icons';

export default function Stepper({ quantidade, cor, onAdicionar, onRemover }) {
  const slideY = useSharedValue(0);
  const prevQtd = useSharedValue(quantidade);

  useEffect(() => {
    if (quantidade > prevQtd.value) {
      slideY.value = withSequence(
        withTiming(-8, { duration: 95 }),
        withTiming(0, { duration: 115 }),
      );
    } else if (quantidade < prevQtd.value && quantidade > 0) {
      slideY.value = withSequence(
        withTiming(8, { duration: 95 }),
        withTiming(0, { duration: 115 }),
      );
    }
    prevQtd.value = quantidade;
  }, [quantidade]);

  const countStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideY.value }],
  }));

  if (quantidade === 0) {
    return (
      <TouchableOpacity
        style={[s.addBtn, { backgroundColor: C.brand }]}
        onPress={onAdicionar}
      >
        <Plus size={ICON_SIZE.sm} color={C.white} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={[s.row, { backgroundColor: C.midnight }]}>
      <TouchableOpacity
        style={s.stepBtn}
        onPress={onRemover}
      >
        <Minus size={14} color={C.white} />
      </TouchableOpacity>
      <Animated.Text style={[s.count, countStyle]}>
        {quantidade}
      </Animated.Text>
      <TouchableOpacity
        style={s.stepBtn}
        onPress={onAdicionar}
      >
        <Plus size={14} color={C.white} />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  addBtn: {
    width: 36, height: 36,
    borderRadius: R.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: R.full,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  stepBtn: {
    width: 32, height: 32,
    borderRadius: R.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  count: {
    fontFamily: F.monoBold,
    fontSize: 14,
    color: C.white,
    minWidth: 20,
    textAlign: 'center',
  },
});
