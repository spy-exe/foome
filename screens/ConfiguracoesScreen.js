import React, { useState, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Moon, Type, Bell, FileText, Shield, Trash2, ChevronRight, Fingerprint } from 'lucide-react-native';
import { biometriaDisponivel, biometriaAtiva, setBiometriaAtiva, verificarBiometria } from '../services/biometria';
import { haptic } from '../utils/haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { useCarrinho } from '../contexts/CarrinhoContext';
import { limparTodosDadosFoome } from '../services/storage';
import { logout as authLogout } from '../services/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { F, R, S, SHADOW } from '../constants/theme';
import { useThemedStyles } from '../utils/useThemedStyles';

const TERMOS_USO = `1. Aceitação dos Termos\nAo usar o Foome, você concorda com estes termos.\n\n2. Serviços\nO Foome conecta usuários a restaurantes parceiros para entrega de alimentos.\n\n3. Responsabilidades\nOs pedidos são de responsabilidade dos restaurantes parceiros.\n\n4. Cancelamentos\nCancelamentos podem ser feitos em até 5 minutos após a confirmação.`;

const POLITICA_PRIVACIDADE = `1. Coleta de Dados\nColetamos nome, e-mail, endereço e dados de uso para melhorar sua experiência.\n\n2. Uso dos Dados\nSeus dados são usados para processar pedidos e recomendar restaurantes.\n\n3. Compartilhamento\nCompartilhamos dados apenas com restaurantes parceiros para viabilizar entregas.\n\n4. Segurança\nUtilizamos criptografia para proteger suas informações.`;

export default function ConfiguracoesScreen({ navigation }) {
  const { C, isDark, toggle } = useTheme();
  const s = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { logout } = useApp();
  const { limpar } = useCarrinho();
  const [fonteGrande, setFonteGrande] = useState(false);
  const [pushAtivo, setPushAtivo] = useState(true);
  const [bioAtiva, setBioAtiva] = useState(false);
  const [bioDisponivel, setBioDisponivel] = useState(false);

  useEffect(() => {
    (async () => {
      setBioDisponivel(await biometriaDisponivel());
      setBioAtiva(await biometriaAtiva());
    })();
  }, []);

  async function handleToggleBio(valor) {
    if (valor) {
      const r = await verificarBiometria();
      if (!r.sucesso) {
        haptic.error();
        Alert.alert('Biometria', 'Não foi possível ativar. Verifique a biometria cadastrada no aparelho.');
        return;
      }
      await setBiometriaAtiva(true);
      setBioAtiva(true);
      haptic.success();
    } else {
      await setBiometriaAtiva(false);
      setBioAtiva(false);
      haptic.select();
    }
  }

  function handleExcluirConta() {
    Alert.alert('Excluir conta?', 'Todos os seus dados serão removidos permanentemente. Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        await limparTodosDadosFoome();
        limpar();
        await authLogout();
        logout();
      }},
    ]);
  }

  return (
    <View style={[s.root, { backgroundColor: C.offWhite }]}>
      <View style={[s.header, { backgroundColor: C.surface, paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={16}>
          <ChevronRight size={22} color={C.ink} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Configurações</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionTitulo}>APARÊNCIA</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <View style={s.prefRow}>
            <View style={s.prefLeft}><View style={s.prefIcon}><Moon size={18} color={C.midnight} /></View><Text style={s.prefLabel}>Modo escuro</Text></View>
            <Switch testID="switch-tema" value={isDark} onValueChange={toggle} trackColor={{ false: C.border, true: C.brandLight }} thumbColor={isDark ? C.brand : C.inkLight} />
          </View>
          <View style={s.divider} />
          <View style={s.prefRow}>
            <View style={s.prefLeft}><View style={s.prefIcon}><Type size={18} color={C.midnight} /></View><Text style={s.prefLabel}>Tamanho de fonte</Text></View>
            <Switch value={fonteGrande} onValueChange={() => setFonteGrande(p => !p)} trackColor={{ false: C.border, true: C.brandLight }} thumbColor={fonteGrande ? C.brand : C.inkLight} />
          </View>
        </View>

        <Text style={s.sectionTitulo}>NOTIFICAÇÕES</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <View style={s.prefRow}>
            <View style={s.prefLeft}><View style={s.prefIcon}><Bell size={18} color={C.midnight} /></View><Text style={s.prefLabel}>Notificações push</Text></View>
            <Switch value={pushAtivo} onValueChange={() => setPushAtivo(p => !p)} trackColor={{ false: C.border, true: C.brandLight }} thumbColor={pushAtivo ? C.brand : C.inkLight} />
          </View>
        </View>

        <Text style={s.sectionTitulo}>SEGURANÇA</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <View style={s.prefRow}>
            <View style={s.prefLeft}><View style={s.prefIcon}><Fingerprint size={18} color={C.midnight} /></View><Text style={s.prefLabel}>Login por biometria</Text></View>
            <Switch testID="switch-biometria" value={bioAtiva} onValueChange={handleToggleBio} disabled={!bioDisponivel} trackColor={{ false: C.border, true: C.brandLight }} thumbColor={bioAtiva ? C.brand : C.inkLight} />
          </View>
          {!bioDisponivel && (
            <Text style={{ fontFamily: F.body, fontSize: 12, color: C.inkLight, paddingHorizontal: S.lg, paddingBottom: S.md }}>
              Cadastre uma biometria no seu aparelho para ativar.
            </Text>
          )}
        </View>

        <Text style={s.sectionTitulo}>PRIVACIDADE E CONTA</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <TouchableOpacity style={s.navRow} onPress={() => Alert.alert('Termos de Uso', TERMOS_USO)} activeOpacity={0.75}>
            <View style={s.prefLeft}><View style={s.prefIcon}><FileText size={18} color={C.midnight} /></View><Text style={s.prefLabel}>Termos de uso</Text></View>
            <ChevronRight size={18} color={C.inkLight} />
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity style={s.navRow} onPress={() => Alert.alert('Política de Privacidade', POLITICA_PRIVACIDADE)} activeOpacity={0.75}>
            <View style={s.prefLeft}><View style={s.prefIcon}><Shield size={18} color={C.midnight} /></View><Text style={s.prefLabel}>Política de privacidade</Text></View>
            <ChevronRight size={18} color={C.inkLight} />
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity testID="btn-excluir-conta" style={s.navRow} onPress={handleExcluirConta} activeOpacity={0.75}>
            <View style={s.prefLeft}><View style={[s.prefIcon, { backgroundColor: C.errorLight }]}><Trash2 size={18} color={C.error} /></View><Text style={[s.prefLabel, { color: C.error }]}>Excluir conta</Text></View>
            <ChevronRight size={18} color={C.error} />
          </TouchableOpacity>
        </View>

        <View style={s.footer}>
          <Text style={s.footerNome}>Foome</Text>
          <Text style={s.footerVersao}>Versão 2.0.0 (Wave 2)</Text>
          <Text style={s.footerTagline}>Feito com carinho no Sul Fluminense</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C) => StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: S.lg, paddingBottom: S.md, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTitle: { fontFamily: F.uiBold, fontSize: 18, color: C.ink },
  scroll: { paddingBottom: 42 },
  sectionTitulo: { fontFamily: F.uiSemi, fontSize: 12, letterSpacing: 1, color: C.inkLight, marginTop: S.xl, marginBottom: S.md, paddingHorizontal: S.lg },
  card: { marginHorizontal: S.lg, borderRadius: R.lg, ...SHADOW.card },
  divider: { height: 1, backgroundColor: C.border, marginLeft: 60 },
  prefRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: S.lg, height: 54 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: S.lg, height: 54 },
  prefLeft: { flexDirection: 'row', alignItems: 'center', gap: S.md },
  prefIcon: { width: 36, height: 36, borderRadius: R.sm, backgroundColor: C.offWhite, alignItems: 'center', justifyContent: 'center' },
  prefLabel: { fontFamily: F.uiMedium, fontSize: 15, color: C.ink },
  footer: { alignItems: 'center', paddingTop: S.xxl, paddingBottom: S.xl },
  footerNome: { fontFamily: F.uiBold, fontSize: 16, color: C.inkLight },
  footerVersao: { fontFamily: F.mono, fontSize: 12, color: C.inkLight, marginTop: S.xs },
  footerTagline: { fontFamily: F.body, fontSize: 12, color: C.inkLight, marginTop: S.xs },
});
