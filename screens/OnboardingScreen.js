import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Compass, Zap, Bike } from 'lucide-react-native';
import Logo from '../components/Logo';
import { F, SHADOW } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../utils/useThemedStyles';

const { width, height } = Dimensions.get('window');

const makeSlides = (C) => ([
  {
    id: '1',
    Icone: Compass,
    titulo: 'Descubra restaurantes\nperto de você',
    subtitulo: 'Explore os melhores estabelecimentos da sua região com apenas alguns toques.',
    cor: C.brand,
    fundo: C.brandLight,
  },
  {
    id: '2',
    Icone: Zap,
    titulo: 'Peça com\num toque',
    subtitulo: 'Do cardápio ao pedido confirmado em segundos. Simples e rápido.',
    cor: C.amber,
    fundo: C.amberLight,
  },
  {
    id: '3',
    Icone: Bike,
    titulo: 'Acompanhe\nseu pedido',
    subtitulo: 'Acompanhe o status em tempo real e receba notificações a cada etapa.',
    cor: C.teal,
    fundo: C.tealLight,
  },
]);

export default function OnboardingScreen({ onFinish }) {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
  const slides = makeSlides(C);
  const [slideAtivo, setSlideAtivo] = useState(0);
  const flatRef = useRef(null);
  const emojiOpacity = useRef(new Animated.Value(0)).current;
  const emojiScale = useRef(new Animated.Value(0.75)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  const slideAtual = slides[slideAtivo];
  const ultimoSlide = slideAtivo === slides.length - 1;

  useEffect(() => {
    emojiOpacity.setValue(0);
    emojiScale.setValue(0.75);
    titleAnim.setValue(0);
    buttonAnim.setValue(0);

    Animated.stagger(110, [
      Animated.parallel([
        Animated.timing(emojiOpacity, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.spring(emojiScale, {
          toValue: 1,
          tension: 70,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [buttonAnim, emojiOpacity, emojiScale, slideAtivo, titleAnim]);

  async function finalizar() {
    await AsyncStorage.setItem('@foome_onboarding_done', 'true');
    onFinish();
  }

  function next() {
    if (!ultimoSlide) {
      flatRef.current?.scrollToIndex({ index: slideAtivo + 1, animated: true });
      return;
    }

    finalizar();
  }

  function onMomentumScrollEnd(event) {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setSlideAtivo(index);
  }

  function renderSlide({ item, index }) {
    const ativo = index === slideAtivo;
    const emojiStyle = ativo
      ? {
          opacity: emojiOpacity,
          transform: [{ scale: emojiScale }],
        }
      : null;

    const titleStyle = ativo
      ? {
          opacity: titleAnim,
          backgroundColor: 'transparent',
          transform: [
            {
              translateY: titleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0],
              }),
            },
          ],
        }
      : null;

    return (
      <View style={s.slide}>
        <View style={[s.emojiHalo, { backgroundColor: item.fundo }]}>
          <Animated.View style={emojiStyle}>
            <item.Icone size={76} color={item.cor} strokeWidth={1.6} />
          </Animated.View>
        </View>
        <Animated.View style={titleStyle}>
          <Text style={s.titulo}>{item.titulo}</Text>
          <Text style={s.subtitulo}>{item.subtitulo}</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} />

      <View style={{ alignItems: 'center', paddingTop: 56, marginBottom: -4 }}>
        <Logo variant="full" size={22} />
      </View>

      {!ultimoSlide && (
        <TouchableOpacity style={s.skipBtn} onPress={finalizar} activeOpacity={0.75}>
          <Text style={s.skipTxt}>Pular</Text>
        </TouchableOpacity>
      )}

      <FlatList
        ref={flatRef}
        data={slides}
        keyExtractor={item => item.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        snapToInterval={width}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
      />

      <View style={s.footer}>
        <View style={s.dots}>
          {slides.map((item, index) => (
            <View
              key={item.id}
              style={[
                s.dot,
                index === slideAtivo && [s.dotAtivo, { backgroundColor: slideAtual.cor }],
              ]}
            />
          ))}
        </View>

        <Animated.View style={{ opacity: buttonAnim }}>
          <TouchableOpacity
            style={[s.nextBtn, { backgroundColor: slideAtual.cor }]}
            onPress={next}
            activeOpacity={0.86}
          >
            <Text style={s.nextTxt}>{ultimoSlide ? 'Começar' : 'Próximo'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const makeStyles = (C) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.surface,
  },
  skipBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 58 : 42,
    right: 24,
    zIndex: 2,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  skipTxt: {
    fontFamily: F.semibold,
    fontSize: 14,
    color: C.ink3,
  },
  slide: {
    width,
    minHeight: height * 0.62,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'ios' ? 76 : 58,
    overflow: 'hidden',
  },
  emojiHalo: {
    width: 152,
    height: 152,
    borderRadius: 76,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 42,
  },
  emoji: {
    fontSize: 80,
    lineHeight: 96,
  },
  titulo: {
    fontFamily: F.heading,
    fontSize: 28,
    lineHeight: 36,
    color: C.ink,
    textAlign: 'center',
  },
  subtitulo: {
    maxWidth: 320,
    marginTop: 14,
    fontFamily: F.regular,
    fontSize: 15,
    lineHeight: 23,
    color: C.ink2,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: C.ink4,
  },
  dotAtivo: {
    width: 24,
  },
  nextBtn: {
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.float,
  },
  nextTxt: {
    fontFamily: F.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
