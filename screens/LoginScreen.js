import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Alert, StatusBar, Image,
  Platform, KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { verificarBiometria } from '../services/biometria';
import { useApp } from '../contexts/AppContext';
import { C, F, SHADOW } from '../constants/theme';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';

export default function LoginScreen({ navigation }) {
  const [email, setEmail]           = useState('');
  const [senha, setSenha]           = useState('');
  const [verSenha, setVerSenha]     = useState(false);
  const { usuario, login } = useApp();

  async function loginComBiometria() {
    if (!usuario) { Alert.alert('Sem conta', 'Crie uma conta primeiro.'); return; }
    const r = await verificarBiometria();
    if (r.sucesso) login(usuario);
    else Alert.alert('Biometria', r.erro || 'Não foi possível autenticar.');
  }

  function loginComSenha() {
    if (!usuario) { Alert.alert('Sem conta', 'Crie uma conta primeiro.'); return; }
    if (email.trim() !== usuario.email || senha !== usuario.senha) {
      Alert.alert('Dados incorretos', 'E-mail ou senha inválidos.');
      return;
    }
    login(usuario);
  }

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} />

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Marca ── */}
        <View style={s.brand}>
          <View style={s.logoMark}>
            <Ionicons name="restaurant-outline" size={30} color={C.brand} />
          </View>
          <Text style={s.logoTxt}>Foome</Text>
          <Text style={s.tagline}>Comida boa, na hora certa.</Text>

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
          {usuario && (
            <TouchableOpacity style={s.bioBtn} onPress={loginComBiometria} activeOpacity={0.8}>
              <View style={s.bioBtnIcon}>
                <Ionicons name="finger-print" size={26} color={C.brand} />
              </View>
              <View style={s.bioBtnTxt}>
                <Text style={s.bioBtnTitle}>Entrar com biometria</Text>
                <Text style={s.bioBtnSub}>Digital ou Face ID</Text>
              </View>
              <Feather name="chevron-right" size={18} color={C.brandBorder} />
            </TouchableOpacity>
          )}

          <View style={s.divider}>
            <View style={s.divLine} />
            <Text style={s.divTxt}>ou continue com e-mail</Text>
            <View style={s.divLine} />
          </View>

          {/* Email */}
          <Text style={s.label}>E-MAIL</Text>
          <InputField
            icon={<Feather name="mail" size={16} color={C.ink3} />}
            placeholder="seu@email.com"
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
            placeholder="••••••••"
            secureTextEntry={!verSenha}
            value={senha}
            onChangeText={setSenha}
          />

          <PrimaryButton label="Entrar" onPress={loginComSenha} style={{ marginTop: 22 }} />

          <View style={s.linkRow}>
            <Text style={s.linkTxt}>Não tem conta?  </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
              <Text style={s.linkAcao}>Cadastre-se grátis</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
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
  bioBtnIcon: {
    width: 46, height: 46,
    borderRadius: 14,
    backgroundColor: C.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.brandBorder,
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

  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  linkTxt:  { fontFamily: F.regular,  fontSize: 14, color: C.ink3 },
  linkAcao: { fontFamily: F.semibold, fontSize: 14, color: C.brand },
});
