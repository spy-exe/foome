import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Platform, Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F } from '../constants/theme';
import { haptic } from '../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/* ───────── Confetti ───────── */
function ConfettiPiece({ delay, color, side }) {
  const x = useSharedValue(side === 'left' ? -20 : SCREEN_WIDTH + 20);
  const y = useSharedValue(-20);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const targetX = SCREEN_WIDTH / 2 + (Math.random() - 0.5) * SCREEN_WIDTH * 0.8;
    const targetY = Dimensions.get('window').height * 0.4 + Math.random() * 300;

    x.value = withDelay(delay, withTiming(targetX, { duration: 2000 }));
    y.value = withDelay(delay, withTiming(targetY, { duration: 2000 }));
    rotate.value = withDelay(delay, withRepeat(withTiming(360, { duration: 800 }), 3));
    opacity.value = withDelay(delay + 1800, withTiming(0, { duration: 400 }));
  }, [delay, x, y, rotate, opacity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { rotate: `${rotate.value}deg` }],
    opacity: opacity.value,
  }));

  const size = 6 + Math.random() * 8;
  return (
    <Animated.View
      style={[
        style,
        {
          position: 'absolute',
          width: size,
          height: size * 0.6,
          borderRadius: 2,
          backgroundColor: color,
        },
      ]}
    />
  );
}

/* ───────── Tela Principal ───────── */
export default function ConfirmacaoScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const pedido = route?.params?.pedido;
  const [mostrarConfetti, setMostrarConfetti] = useState(false);

  const restauranteTempo = pedido?.restauranteTempo || '30–40 min';
  const numeroPedido = pedido?.numero || `#F${String(Date.now()).slice(-6)}`;

  /* Animações sequenciadas */
  const circleScale = useSharedValue(0);
  const circleOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    circleScale.value = withDelay(100, withSpring(1, { damping: 8, stiffness: 100 }));
    circleOpacity.value = withDelay(100, withTiming(1, { duration: 300 }));
    checkScale.value = withDelay(400, withSpring(1, { damping: 10, stiffness: 150 }));
  }, [circleScale, circleOpacity, checkScale]);

  useEffect(() => {
    const timer = setTimeout(() => setMostrarConfetti(true), 300);
    haptic.success();
    return () => clearTimeout(timer);
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    opacity: circleOpacity.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const coresConfetti = [C.brand, C.ink, C.bg, C.teal, C.amber];

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Confetti */}
      {mostrarConfetti && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {Array.from({ length: 20 }).map((_, i) => (
            <ConfettiPiece
              key={i}
              delay={300 + i * 80}
              color={coresConfetti[i % coresConfetti.length]}
              side={i % 2 === 0 ? 'left' : 'right'}
            />
          ))}
        </View>
      )}

      {/* Conteúdo */}
      <View style={s.content}>
        {/* Círculo com check */}
        <Animated.View style={[s.checkCircle, circleStyle]}>
          <Animated.View style={checkStyle}>
            <Feather name="check" size={40} color="#fff" />
          </Animated.View>
        </Animated.View>

        {/* Textos animados */}
        <Animated.Text entering={FadeInDown.delay(700).springify()} style={s.titulo}>
          Pedido confirmado!
        </Animated.Text>

        <Animated.Text entering={FadeInDown.delay(900).springify()} style={s.sub}>
          Relaxa que a gente cuida do resto.
        </Animated.Text>

        {/* Número do pedido */}
        <Animated.View entering={FadeInDown.delay(1100).springify()} style={s.numeroBox}>
          <Text style={s.numeroLabel}>Pedido</Text>
          <Text style={s.numeroVal}>{numeroPedido}</Text>
        </Animated.View>

        {/* Tempo estimado */}
        <Animated.View entering={FadeInDown.delay(1300).springify()} style={s.tempoBox}>
          <Text style={s.tempoLabel}>Entrega prevista</Text>
          <Text style={s.tempoVal}>{restauranteTempo}</Text>
        </Animated.View>
      </View>

      {/* CTAs */}
      <View style={[s.ctaArea, { paddingBottom: insets.bottom + 24 }]}>
        <TouchableOpacity
          style={s.ctaPrimary}
          onPress={() => {
            haptic.light();
            if (pedido) {
              navigation.navigate('HomeTab', {
                screen: 'Rastreamento',
                params: { pedido },
              });
            } else {
              navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
            }
          }}
          activeOpacity={0.88}
        >
          <Feather name="eye" size={18} color="#fff" />
          <Text style={s.ctaPrimaryTxt}>Acompanhar pedido</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.ctaSecondary}
          onPress={() => {
            haptic.light();
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
          }}
          activeOpacity={0.8}
        >
          <Text style={s.ctaSecondaryTxt}>Voltar ao início</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  titulo: {
    fontFamily: F.headingLg,
    fontSize: 26,
    color: C.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  sub: {
    fontFamily: F.regular,
    fontSize: 16,
    color: C.ink2,
    textAlign: 'center',
    marginBottom: 28,
  },

  numeroBox: {
    backgroundColor: '#F0F0F8',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  numeroLabel: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.ink3,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  numeroVal: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 20,
    fontWeight: '700',
    color: C.ink,
  },

  tempoBox: {
    alignItems: 'center',
  },
  tempoLabel: {
    fontFamily: F.regular,
    fontSize: 13,
    color: C.ink3,
    marginBottom: 4,
  },
  tempoVal: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 28,
    fontWeight: '700',
    color: C.ink,
  },

  ctaArea: {
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 12,
  },
  ctaPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.ink,
    borderRadius: 16,
    height: 56,
    ...Platform.select({
      ios: {
        shadowColor: C.ink,
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      default: { elevation: 5 },
    }),
  },
  ctaPrimaryTxt: {
    fontFamily: F.semibold,
    fontSize: 16,
    color: '#fff',
  },
  ctaSecondary: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  ctaSecondaryTxt: {
    fontFamily: F.semibold,
    fontSize: 15,
    color: C.brand,
  },
});
