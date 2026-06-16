import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Alert, StatusBar, Image,
  Platform, KeyboardAvoidingView, ScrollView,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Feather, Ionicons } from '../components/Icon';
import { autenticar } from '../services/auth';
import { verificarBiometria, biometriaAtiva } from '../services/biometria';
import { validarSessao } from '../services/auth';
import { getToken } from '../services/api';
import { useApp } from '../contexts/AppContext';
import { F, SHADOW } from '../constants/theme';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import Logo from '../components/Logo';
import { haptic } from '../utils/haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../utils/useThemedStyles';

function BioButton({ onPress, loading }) {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
  const pulse = useSharedValue(1);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    pulse.value = loading
      ? withTiming(0.98, { duration: 180 })
      : withRepeat(
          withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        );
    shimmer.value = withRepeat(withTiming(1, { duration: 1450 }), -1, true);

    return () => {
      cancelAnimation(pulse);
      cancelAnimation(shimmer);
    };
  }, [loading]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: 0.74 + shimmer.value * 0.26,
    transform: [{ scale: 0.96 + shimmer.value * 0.05 }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: 0.16 + shimmer.value * 0.18,
    transform: [
      { translateX: interpolate(shimmer.value, [0, 1], [-22, 28]) },
      { rotate: '18deg' },
    ],
  }));

  return (
    <Animated.View style={pulseStyle}>
      <TouchableOpacity
        style={[s.bioBtn, loading && s.bioBtnLoading]}
        onPress={onPress}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Animated.View style={[s.bioBtnIcon, iconStyle]}>
          <Animated.View style={[s.bioShimmer, shimmerStyle]} />
          <Ionicons name="finger-print" size={26} color={C.brand} />
        </Animated.View>
        <View style={s.bioBtnTxt}>
          <Text style={s.bioBtnTitle}>Entrar com biometria</Text>
          <Text style={s.bioBtnSub}>{loading ? 'Autenticando...' : 'Digital ou Face ID'}</Text>
        </View>
        <Feather name="chevron-right" size={18} color={C.brandBorder} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function LoginScreen({ navigation }) {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
  const [email, setEmail]           = useState('');
  const [senha, setSenha]           = useState('');
  const [verSenha, setVerSenha]     = useState(false);
  const [erros, setErros]           = useState({ email: '', senha: '' });
  const [bioLoading, setBioLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [bioPodeLogar, setBioPodeLogar] = useState(false);
  const { usuario, login } = useApp();

  useEffect(() => {
    (async () => {
      const ativa = await biometriaAtiva();
      const token = await getToken();
      setBioPodeLogar(ativa && !!token);
    })();
  }, []);

  function validarEmail(valor) {
    if (!valor.trim()) return 'Informe seu e-mail';
    if (!valor.includes('@')) return 'E-mail inválido';
    return '';
  }

  function validarSenha(valor) {
    if (!valor.trim()) return 'Informe sua senha';
    return '';
  }

  function validar() {
    const proximosErros = {
      email: validarEmail(email),
      senha: validarSenha(senha),
    };

    setErros(proximosErros);
    return !proximosErros.email && !proximosErros.senha;
  }

  function handleEmailChange(valor) {
    setEmail(valor);
    if (erros.email) {
      setErros(prev => ({ ...prev, email: validarEmail(valor) }));
    }
  }

  function handleSenhaChange(valor) {
    setSenha(valor);
    if (erros.senha) {
      setErros(prev => ({ ...prev, senha: validarSenha(valor) }));
    }
  }

  function handleEsqueciSenha() {
    haptic.select();
    Alert.alert(
      'Recuperar senha',
      'Entre em contato pelo e-mail suporte@foome.app para redefinir sua senha.'
    );
  }

  async function loginComBiometria() {
    haptic.light();
    setBioLoading(true);
    try {
      const r = await verificarBiometria();
      if (!r.sucesso) {
        haptic.error();
        Alert.alert('Biometria', typeof r.erro === 'string' && r.erro ? r.erro : 'Não foi possível autenticar.');
        return;
      }
      const u = await validarSessao();
      if (u) {
        haptic.success();
        login(u);
      } else {
        haptic.error();
        setBioPodeLogar(false);
        Alert.alert('Sessão expirada', 'Entre com seu e-mail e senha novamente.');
      }
    } catch {
      haptic.error();
      Alert.alert('Biometria', 'Não foi possível autenticar.');
    } finally {
      setBioLoading(false);
    }
  }

  async function loginComSenha() {
    if (!validar()) {
      haptic.error();
      return;
    }

    setLoginLoading(true);
    try {
      const resultado = await autenticar(email, senha);

      if (!resultado.sucesso) {
        haptic.error();
        if (resultado.erro === 'credenciais') {
          setErros(prev => ({ ...prev, email: ' ', senha: 'E-mail ou senha incorretos' }));
          Alert.alert(
            'Não foi possível entrar',
            'E-mail ou senha incorretos. Verifique seus dados ou crie uma conta.'
          );
        } else {
          Alert.alert(
            'Não foi possível entrar',
            resultado.mensagem || 'Tente novamente em instantes.'
          );
        }
        return;
      }

      haptic.success();
      setErros({ email: '', senha: '' });
      login(resultado.usuario);
    } catch {
      haptic.error();
      Alert.alert('Login', 'Não foi possível entrar agora. Tente novamente.');
    } finally {
      setLoginLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} />

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Marca ── */}
        <View style={s.brand}>
          <Logo variant="symbol" size={68} />
          <Text style={s.logoTxt}>Foome</Text>
          <Text style={s.tagline}>A fome que fala.</Text>

          {usuario && (
            <View style={s.returnCard}>
              {usuario.fotoUri
                ? <Image source={{ uri: usuario.fotoUri }} style={s.avatar} />
                : <View style={[s.avatar, s.avatarFallback]}><Feather name="user" size={22} color={C.ink3} /></View>
              }
              <View>
                <Text style={s.returnSub}>Bem-vindo de volta</Text>
                <Text style={s.returnName}>{usuario.nome.split(' ')[0]}</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Formulário ── */}
        <View style={s.form}>

          {/* Biometria */}
          {bioPodeLogar && (
            <BioButton onPress={loginComBiometria} loading={bioLoading} />
          )}

          <View style={s.divider}>
            <View style={s.divLine} />
            <Text style={s.divTxt}>ou continue com e-mail</Text>
            <View style={s.divLine} />
          </View>

          {/* Email */}
          <Text style={s.label}>E-MAIL</Text>
          <InputField
            testID="input-email"
            icon={<Feather name="mail" size={16} color={C.ink3} />}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            textContentType="emailAddress"
            value={email}
            erro={erros.email}
            onFocus={() => erros.email && haptic.select()}
            onChangeText={handleEmailChange}
          />

          {/* Senha */}
          <Text style={[s.label, { marginTop: 14 }]}>SENHA</Text>
          <InputField
            icon={<Feather name="lock" size={16} color={C.ink3} />}
            rightElement={
              <TouchableOpacity
                onPress={() => {
                  haptic.select();
                  setVerSenha(v => !v);
                }}
                style={s.fieldIconBtn}
              >
                <Feather name={verSenha ? 'eye-off' : 'eye'} size={16} color={C.ink3} />
              </TouchableOpacity>
            }
            testID="input-senha"
            placeholder="••••••••"
            secureTextEntry={!verSenha}
            textContentType="password"
            value={senha}
            erro={erros.senha}
            onFocus={() => erros.senha && haptic.select()}
            onChangeText={handleSenhaChange}
          />

          <TouchableOpacity
            onPress={handleEsqueciSenha}
            style={s.forgotBtn}
          >
            <Text style={s.forgotTxt}>Esqueci a senha?</Text>
          </TouchableOpacity>

          <PrimaryButton
            testID="btn-entrar"
            label="Entrar"
            onPress={loginComSenha}
            loading={loginLoading}
            style={{ marginTop: 18 }}
          />

          <View style={s.linkRow}>
            <Text style={s.linkTxt}>Não tem conta?  </Text>
            <TouchableOpacity
              testID="link-cadastro"
              onPress={() => {
                haptic.select();
                navigation.navigate('Cadastro');
              }}
              style={s.linkActionBtn}
            >
              <Text style={s.linkAcao}>Cadastre-se grátis</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (C) => StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.surface },
  scroll: { flexGrow: 1 },

  // Marca
  brand: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 72 : 56,
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  logoMark: {
    width: 68, height: 68,
    borderRadius: 22,
    backgroundColor: C.brandLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.brandBorder,
    ...SHADOW.card,
    shadowColor: C.brand,
  },
  logoTxt: { fontFamily: F.headingLg, fontSize: 40, color: C.brand, letterSpacing: -1.5 },
  tagline: { fontFamily: F.regular, fontSize: 14, color: C.ink3, marginTop: 5 },

  returnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 28,
    backgroundColor: C.bg,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    alignSelf: 'stretch',
    ...SHADOW.card,
  },
  avatar: { width: 54, height: 54, borderRadius: 27, borderWidth: 2, borderColor: C.brandBorder },
  avatarFallback: { backgroundColor: C.border, justifyContent: 'center', alignItems: 'center' },
  returnSub:  { fontFamily: F.medium, fontSize: 11, color: C.ink3, letterSpacing: 0.4 },
  returnName: { fontFamily: F.heading, fontSize: 18, color: C.ink, marginTop: 1 },

  // Formulário
  form: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 24,
  },

  bioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: C.brandLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.brandBorder,
  },
  bioBtnLoading: { opacity: 0.78 },
  bioBtnIcon: {
    width: 46, height: 46,
    borderRadius: 14,
    backgroundColor: C.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.brandBorder,
    overflow: 'hidden',
  },
  bioShimmer: {
    position: 'absolute',
    top: -8,
    bottom: -8,
    width: 15,
    backgroundColor: C.brand,
  },
  bioBtnTxt:   { flex: 1 },
  bioBtnTitle: { fontFamily: F.semibold, fontSize: 15, color: C.brand },
  bioBtnSub:   { fontFamily: F.regular,  fontSize: 12, color: C.brandBorder, marginTop: 2 },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 22, gap: 10 },
  divLine: { flex: 1, height: 1, backgroundColor: C.border },
  divTxt:  { fontFamily: F.regular, fontSize: 12, color: C.ink3 },

  label: {
    fontFamily: F.semibold,
    fontSize: 10,
    color: C.ink3,
    letterSpacing: 1.2,
    marginBottom: 8,
  },

  linkRow: { minHeight: 44, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 14 },
  linkTxt:  { fontFamily: F.regular,  fontSize: 14, color: C.ink3 },
  linkActionBtn: { minHeight: 44, justifyContent: 'center' },
  linkAcao: { fontFamily: F.semibold, fontSize: 14, color: C.brand },
  fieldIconBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -10,
  },
  forgotBtn: {
    minHeight: 44,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 2,
  },
  forgotTxt: { fontFamily: F.medium, fontSize: 12, color: C.ink3 },
});
