import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, StatusBar, Image, Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Feather } from '@expo/vector-icons';
import { salvarUsuario } from '../services/storage';
import { useApp } from '../contexts/AppContext';
import { C, F, SHADOW } from '../constants/theme';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';

export default function CadastroScreen({ navigation }) {
  const [etapa, setEtapa]         = useState('form');
  const [nome, setNome]           = useState('');
  const [email, setEmail]         = useState('');
  const [senha, setSenha]         = useState('');
  const [verSenha, setVerSenha]   = useState(false);
  const [fotoUri, setFotoUri]     = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const { login } = useApp();

  async function tirarFoto() {
    if (!cameraRef.current) return;
    const foto = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    setFotoUri(foto.uri);
    setEtapa('preview');
  }

  async function finalizar() {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (!fotoUri) {
      Alert.alert('Foto obrigatória', 'Tire uma foto de perfil para continuar.');
      return;
    }
    const usuario = { nome, email, senha, fotoUri, criadoEm: new Date().toISOString() };
    await salvarUsuario(usuario);
    login(usuario);
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
          <TouchableOpacity onPress={() => setEtapa('form')} style={s.camBackBtn}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={s.camTitle}>Foto de perfil</Text>
          <View style={{ width: 40 }} />
        </View>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front">
          <View style={s.camGuideWrap}>
            <View style={s.camGuide} />
            <Text style={s.camGuideHint}>Encaixe seu rosto no círculo</Text>
          </View>
        </CameraView>
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
      <View style={s.center}>
        <StatusBar barStyle="dark-content" backgroundColor={C.surface} />
        <Text style={s.previewTitle}>Ficou boa?</Text>
        <Text style={s.previewSub}>Você pode tirar outra se quiser</Text>
        <Image source={{ uri: fotoUri }} style={s.previewImg} />
        <PrimaryButton
          label="Usar esta foto"
          onPress={() => setEtapa('form')}
          style={{ marginTop: 28 }}
          leftIcon={<Feather name="check" size={18} color="#fff" />}
        />
        <TouchableOpacity style={s.linkBtn} onPress={() => setEtapa('camera')}>
          <Text style={s.linkTxt}>Tirar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Formulário ──
  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.body}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} />

      <TouchableOpacity onPress={() => navigation.goBack()} style={s.backRow}>
        <Feather name="arrow-left" size={18} color={C.brand} />
        <Text style={s.backTxt}>Voltar</Text>
      </TouchableOpacity>

      <Text style={s.titulo}>Criar conta</Text>
      <Text style={s.sub}>Rápido e grátis.</Text>

      {/* Avatar picker */}
      <TouchableOpacity style={s.avatarBtn} onPress={() => setEtapa('camera')}>
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

      {/* Nome */}
      <Text style={s.label}>NOME COMPLETO</Text>
      <InputField
        icon={<Feather name="user" size={16} color={C.ink3} />}
        placeholder="João Silva"
        value={nome}
        onChangeText={setNome}
      />

      {/* Email */}
      <Text style={[s.label, { marginTop: 14 }]}>E-MAIL</Text>
      <InputField
        icon={<Feather name="mail" size={16} color={C.ink3} />}
        placeholder="joao@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* Senha */}
      <Text style={[s.label, { marginTop: 14 }]}>SENHA</Text>
      <InputField
        icon={<Feather name="lock" size={16} color={C.ink3} />}
        rightElement={
          <TouchableOpacity onPress={() => setVerSenha(v => !v)} style={{ padding: 4 }}>
            <Feather name={verSenha ? 'eye-off' : 'eye'} size={16} color={C.ink3} />
          </TouchableOpacity>
        }
        placeholder="Mínimo 6 caracteres"
        secureTextEntry={!verSenha}
        value={senha}
        onChangeText={setSenha}
      />

      <PrimaryButton label="Criar conta" onPress={finalizar} style={{ marginTop: 28 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.surface },
  body: { padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 48, paddingBottom: 48 },
  center: { flex: 1, backgroundColor: C.surface, justifyContent: 'center', alignItems: 'center', padding: 32 },

  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 28 },
  backTxt: { fontFamily: F.semibold, fontSize: 15, color: C.brand },

  titulo: { fontFamily: F.headingLg, fontSize: 30, color: C.ink, letterSpacing: -0.8 },
  sub:    { fontFamily: F.regular,   fontSize: 15, color: C.ink3, marginTop: 5, marginBottom: 28 },

  // Avatar
  avatarBtn:         { alignSelf: 'center', marginBottom: 32, position: 'relative' },
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

  linkBtn: { alignItems: 'center', marginTop: 16 },
  linkTxt: { fontFamily: F.regular, fontSize: 14, color: C.ink3 },

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
    paddingBottom: 14,
  },
  camBackBtn: {
    width: 40, height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camTitle: { fontFamily: F.headingSm, fontSize: 16, color: '#fff' },
  camGuideWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  camGuide: {
    width: 210, height: 210,
    borderRadius: 105,
    borderWidth: 2,
    borderColor: C.brand,
    borderStyle: 'dashed',
  },
  camGuideHint: { fontFamily: F.medium, fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  camBottom: { backgroundColor: '#000', height: 120, justifyContent: 'center', alignItems: 'center' },
  captureBtn: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 3, borderColor: C.brand,
    justifyContent: 'center', alignItems: 'center',
  },
  captureInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.brand },

  // Preview
  previewTitle: { fontFamily: F.headingLg, fontSize: 26, color: C.ink, marginBottom: 6 },
  previewSub:   { fontFamily: F.regular,   fontSize: 14, color: C.ink3, marginBottom: 28 },
  previewImg:   { width: 220, height: 220, borderRadius: 110, borderWidth: 4, borderColor: C.brand },
});
