import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { F } from '../constants/theme';

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
        style={[s.addBtn, { backgroundColor: cor }]}
        onPress={onAdicionar}
      >
        <Feather name="plus" size={18} color="#fff" />
      </TouchableOpacity>
    );
  }

  return (
    <View style={s.row}>
      <TouchableOpacity
        style={[s.stepBtn, { borderColor: cor }]}
        onPress={onRemover}
      >
        <Feather name="minus" size={14} color={cor} />
      </TouchableOpacity>
      <Animated.Text style={[s.count, { color: cor }, countStyle]}>
        {quantidade}
      </Animated.Text>
      <TouchableOpacity
        style={[s.stepBtn, { backgroundColor: cor, borderColor: cor }]}
        onPress={onAdicionar}
      >
        <Feather name="plus" size={14} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  addBtn: {
    width: 36, height: 36,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepBtn: {
    width: 32, height: 32,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  count: {
    fontFamily: F.bold,
    fontSize: 15,
    minWidth: 20,
    textAlign: 'center',
  },
});
