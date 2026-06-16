import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, StatusBar, Image, Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Feather, Ionicons } from '../components/Icon';
import { cadastrar } from '../services/auth';
import { useApp } from '../contexts/AppContext';
import { F, SHADOW } from '../constants/theme';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import { haptic } from '../utils/haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../utils/useThemedStyles';

const ETAPAS = ['form', 'camera', 'preview'];

function getEtapaIndex(etapa) {
  return Math.max(0, ETAPAS.indexOf(etapa));
}

function ProgressBar({ etapa, dark }) {
  const s = useThemedStyles(makeStyles);
  const width = useSharedValue((getEtapaIndex(etapa) + 1) / ETAPAS.length);

  useEffect(() => {
    width.value = withTiming((getEtapaIndex(etapa) + 1) / ETAPAS.length, { duration: 400 });
  }, [etapa]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View style={[s.progressBar, dark && s.progressBarDark]}>
      <Animated.View style={[s.progressFill, barStyle]} />
    </View>
  );
}

function StepIndicator({ etapa, dark, style }) {
  const s = useThemedStyles(makeStyles);
  const idx = getEtapaIndex(etapa);

  return (
    <View style={[s.stepWrap, style]}>
      <Text style={[s.etapaLabel, dark && s.etapaLabelDark]}>Etapa {idx + 1} de 3</Text>
      <ProgressBar etapa={etapa} dark={dark} />
    </View>
  );
}

function CameraOverlay() {
  const s = useThemedStyles(makeStyles);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 350 });
  }, []);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[s.camOverlay, fadeStyle]}>
      <View style={s.camMask}>
        <View style={s.camFrame}>
          <View style={[s.camCorner, s.camCornerTL]} />
          <View style={[s.camCorner, s.camCornerTR]} />
          <View style={[s.camCorner, s.camCornerBL]} />
          <View style={[s.camCorner, s.camCornerBR]} />
        </View>
      </View>
      <Text style={s.camHint}>Centralize seu rosto</Text>
    </Animated.View>
  );
}

function AnimatedPreviewImage({ uri }) {
  const s = useThemedStyles(makeStyles);
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 220 });
    scale.value = withSpring(1, { damping: 12, stiffness: 130 });
  }, [uri]);

  const imageStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return <Animated.Image source={{ uri }} style={[s.previewImg, imageStyle]} />;
}

function AnimatedCheckIcon() {
  const scale = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 160 });
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={iconStyle}>
      <Feather name="check" size={18} color="#fff" />
    </Animated.View>
  );
}

export default function CadastroScreen({ navigation }) {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
  const { login } = useApp();
  const [etapa, setEtapa]         = useState('form');
  const [nome, setNome]           = useState('');
  const [email, setEmail]         = useState('');
  const [senha, setSenha]         = useState('');
  const [verSenha, setVerSenha]   = useState(false);
  const [fotoUri, setFotoUri]     = useState(null);
  const [salvando, setSalvando]   = useState(false);
  const [erros, setErros]         = useState({ nome: '', email: '', senha: '' });
  const [fotoErro, setFotoErro]   = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  function validarCampo(campo, valor) {
    switch (campo) {
      case 'nome':
        return valor.trim().length < 3 ? 'Nome muito curto' : '';
      case 'email':
        if (!valor.trim()) return 'Informe seu e-mail';
        return !valor.includes('@') ? 'E-mail inválido' : '';
      case 'senha':
        return valor.trim().length < 6 ? 'Mínimo 6 caracteres' : '';
      default:
        return '';
    }
  }

  function validarFormulario() {
    const proximosErros = {
      nome: validarCampo('nome', nome),
      email: validarCampo('email', email),
      senha: validarCampo('senha', senha),
    };

    setErros(proximosErros);
    return !proximosErros.nome && !proximosErros.email && !proximosErros.senha;
  }

  function handleNomeChange(valor) {
    setNome(valor);
    setErros(prev => ({ ...prev, nome: validarCampo('nome', valor) }));
  }

  function handleEmailChange(valor) {
    setEmail(valor);
    setErros(prev => ({ ...prev, email: validarCampo('email', valor) }));
  }

  function handleSenhaChange(valor) {
    setSenha(valor);
    setErros(prev => ({ ...prev, senha: validarCampo('senha', valor) }));
  }

  function abrirCamera() {
    haptic.select();
    setFotoErro('');
    setEtapa('camera');
  }

  async function tirarFoto() {
    if (!cameraRef.current) {
      haptic.error();
      return;
    }
    const foto = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    setFotoErro('');
    haptic.light();
    setFotoUri(foto.uri);
    setEtapa('preview');
  }

  async function finalizar() {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      validarFormulario();
      haptic.error();
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (senha.trim().length < 6) {
      setErros(prev => ({ ...prev, senha: 'Mínimo 6 caracteres' }));
      haptic.error();
      Alert.alert('Senha curta', 'A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (!validarFormulario()) {
      haptic.error();
      return;
    }
    // Foto de perfil é opcional (pode ser adicionada depois no Perfil).

    setSalvando(true);
    try {
      const resultado = await cadastrar({ nome, email, senha, fotoUri });

      if (!resultado.sucesso) {
        haptic.error();
        if (resultado.erro === 'email_duplicado') {
          setErros(prev => ({ ...prev, email: 'E-mail já cadastrado' }));
          Alert.alert(
            'E-mail já cadastrado',
            'Este e-mail já está em uso. Faça login ou use outro e-mail.'
          );
        } else {
          Alert.alert(
            'Não foi possível criar a conta',
            resultado.mensagem || 'Tente novamente em instantes.'
          );
        }
        return;
      }

      haptic.success();
      login(resultado.usuario);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch {
      haptic.error();
      Alert.alert('Cadastro', 'Não foi possível criar sua conta. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  // ── Câmera: permissão negada ──
  if (etapa === 'camera' && !permission?.granted) {
    return (
      <View style={s.center}>
        <StatusBar barStyle="dark-content" backgroundColor={C.surface} />
        <View style={s.permIcon}>
          <Feather name="camera-off" size={32} color={C.ink3} />
        </View>
        <Text style={s.permTitulo}>Câmera bloqueada</Text>
        <Text style={s.permSub}>Precisamos de acesso para sua foto de perfil</Text>
        <PrimaryButton label="Permitir câmera" onPress={requestPermission} />
      </View>
    );
  }

  // ── Câmera ──
  if (etapa === 'camera') {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <StatusBar barStyle="light-content" />
        <View style={s.camHeader}>
          <TouchableOpacity
            onPress={() => {
              haptic.select();
              setEtapa('form');
            }}
            style={s.camBackBtn}
          >
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={s.camTitle}>Foto de perfil</Text>
          <View style={{ width: 40 }} />
        </View>
        <StepIndicator etapa={etapa} dark style={s.camStepWrap} />
        <View style={{ flex: 1 }}>
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="front" />
          <View style={[StyleSheet.absoluteFill, s.camOverlay]}>
            <CameraOverlay />
          </View>
        </View>
        <View style={s.camBottom}>
          <TouchableOpacity style={s.captureBtn} onPress={tirarFoto}>
            <View style={s.captureInner} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Preview ──
  if (etapa === 'preview') {
    return (
      <View style={s.previewScreen}>
        <StatusBar barStyle="dark-content" backgroundColor={C.surface} />
        <StepIndicator etapa={etapa} style={s.previewStep} />
        <Text style={s.previewTitle}>Ficou boa?</Text>
        <Text style={s.previewSub}>Você pode tirar outra se quiser</Text>
        <AnimatedPreviewImage uri={fotoUri} />
        <PrimaryButton
          label="Usar esta foto"
          onPress={() => {
            haptic.success();
            setEtapa('form');
          }}
          style={{ marginTop: 28 }}
          leftIcon={<AnimatedCheckIcon />}
        />
        <TouchableOpacity
          style={s.linkBtn}
          onPress={() => {
            haptic.select();
            setEtapa('camera');
          }}
        >
          <Text style={s.linkTxt}>Tirar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Formulário ──
  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={s.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StatusBar barStyle="dark-content" backgroundColor={C.surface} />

      <TouchableOpacity
        onPress={() => {
          haptic.select();
          navigation.goBack();
        }}
        style={s.backRow}
      >
        <Feather name="arrow-left" size={18} color={C.brand} />
        <Text style={s.backTxt}>Voltar</Text>
      </TouchableOpacity>

      <Text style={s.titulo}>Criar conta</Text>
      <Text style={s.sub}>Rápido e grátis.</Text>
      <StepIndicator etapa={etapa} />

      {/* Avatar picker */}
      <TouchableOpacity
        style={[s.avatarBtn, fotoErro && s.avatarBtnErro]}
        onPress={abrirCamera}
      >
        {fotoUri ? (
          <Image source={{ uri: fotoUri }} style={s.avatar} />
        ) : (
          <View style={s.avatarPlaceholder}>
            <Feather name="camera" size={26} color={C.brand} />
            <Text style={s.avatarLabel}>Adicionar foto</Text>
          </View>
        )}
        {fotoUri && (
          <View style={s.avatarEdit}>
            <Feather name="edit-2" size={12} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
      {fotoErro ? <Text style={s.fotoErroTxt}>{fotoErro}</Text> : null}

      {/* Nome */}
      <Text style={s.label}>NOME COMPLETO</Text>
      <InputField
        testID="input-nome"
        icon={<Feather name="user" size={16} color={C.ink3} />}
        placeholder="João Silva"
        value={nome}
        erro={erros.nome}
        onFocus={() => erros.nome && haptic.select()}
        onChangeText={handleNomeChange}
      />

      {/* Email */}
      <Text style={[s.label, { marginTop: 14 }]}>E-MAIL</Text>
      <InputField
        testID="input-email"
        icon={<Feather name="mail" size={16} color={C.ink3} />}
        placeholder="joao@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
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
        placeholder="Mínimo 6 caracteres"
        secureTextEntry={!verSenha}
        textContentType="newPassword"
        value={senha}
        erro={erros.senha}
        onFocus={() => erros.senha && haptic.select()}
        onChangeText={handleSenhaChange}
      />

        <PrimaryButton
          testID="btn-cadastrar"
          label="Criar conta"
          onPress={finalizar}
          loading={salvando}
          style={{ marginTop: 28 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (C) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.surface },
  body: { padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 48, paddingBottom: 48 },
  center: { flex: 1, backgroundColor: C.surface, justifyContent: 'center', alignItems: 'center', padding: 32 },
  previewScreen: { flex: 1, backgroundColor: C.surface, justifyContent: 'center', alignItems: 'center', padding: 32 },

  backRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  backTxt: { fontFamily: F.semibold, fontSize: 15, color: C.brand },

  titulo: { fontFamily: F.headingLg, fontSize: 30, color: C.ink, letterSpacing: -0.8 },
  sub:    { fontFamily: F.regular,   fontSize: 15, color: C.ink3, marginTop: 5, marginBottom: 16 },

  // Progresso
  stepWrap: { alignSelf: 'stretch', marginBottom: 24 },
  etapaLabel: {
    fontFamily: F.semibold,
    fontSize: 12,
    color: C.ink3,
    marginBottom: 8,
  },
  etapaLabelDark: { color: 'rgba(255,255,255,0.78)' },
  progressBar: {
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarDark: { backgroundColor: 'rgba(255,255,255,0.18)' },
  progressFill: {
    height: '100%',
    backgroundColor: C.brand,
    borderRadius: 2,
  },

  // Avatar
  avatarBtn:         { alignSelf: 'center', marginBottom: 32, position: 'relative' },
  avatarBtnErro:     { borderRadius: 52, shadowColor: C.brand, shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  avatar:            { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: C.brand },
  avatarPlaceholder: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: C.brandLight,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: C.brandBorder,
    borderStyle: 'dashed',
    gap: 4,
  },
  avatarLabel: { fontFamily: F.semibold, fontSize: 10, color: C.brand, letterSpacing: 0.3 },
  fotoErroTxt: {
    alignSelf: 'center',
    fontFamily: F.medium,
    fontSize: 11,
    color: C.brand,
    marginTop: -22,
    marginBottom: 20,
  },
  avatarEdit: {
    position: 'absolute', bottom: 2, right: 2,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: C.brand,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: C.surface,
  },

  // Inputs
  label: {
    fontFamily: F.semibold,
    fontSize: 10,
    color: C.ink3,
    letterSpacing: 1.2,
    marginBottom: 8,
  },

  linkBtn: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  linkTxt: { fontFamily: F.semibold, fontSize: 14, color: C.brand },
  fieldIconBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -10,
  },

  // Permissão
  permIcon:   { width: 72, height: 72, borderRadius: 22, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  permTitulo: { fontFamily: F.heading, fontSize: 20, color: C.ink, marginBottom: 8 },
  permSub:    { fontFamily: F.regular, fontSize: 14, color: C.ink3, textAlign: 'center', marginBottom: 24 },

  // Câmera
  camHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 42,
    paddingBottom: 10,
  },
  camBackBtn: {
    width: 44, height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camTitle: { fontFamily: F.headingSm, fontSize: 16, color: '#fff' },
  camStepWrap: { backgroundColor: '#000', paddingHorizontal: 16, paddingBottom: 14, marginBottom: 0 },
  camOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  camMask: {
    width: 264,
    height: 320,
    borderRadius: 132,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  camFrame: {
    width: 238,
    height: 292,
    borderRadius: 119,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
  },
  camCorner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderColor: C.brand,
    borderWidth: 3,
  },
  camCornerTL: { top: 12, left: 18, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 18 },
  camCornerTR: { top: 12, right: 18, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 18 },
  camCornerBL: { bottom: 12, left: 18, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 18 },
  camCornerBR: { bottom: 12, right: 18, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 18 },
  camHint: {
    marginTop: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.54)',
    color: '#fff',
    fontFamily: F.semibold,
    fontSize: 13,
    textAlign: 'center',
  },
  camBottom: { backgroundColor: '#000', height: 120, justifyContent: 'center', alignItems: 'center' },
  captureBtn: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 3, borderColor: C.brand,
    justifyContent: 'center', alignItems: 'center',
  },
  captureInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.brand },

  // Preview
  previewStep: { marginBottom: 28 },
  previewTitle: { fontFamily: F.headingLg, fontSize: 26, color: C.ink, marginBottom: 6 },
  previewSub:   { fontFamily: F.regular,   fontSize: 14, color: C.ink3, marginBottom: 28 },
  previewImg:   { width: 220, height: 220, borderRadius: 110, borderWidth: 4, borderColor: C.brand },
});
