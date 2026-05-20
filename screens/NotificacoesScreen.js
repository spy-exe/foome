import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Bell, Package, Tag, CheckCheck } from 'lucide-react-native';
import { Feather } from '@expo/vector-icons';
import { getNotificacoes, salvarNotificacoes, marcarNotificacaoLida, marcarTodasLidas } from '../services/storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F, R, S, SHADOW } from '../constants/theme';

const NOTIF_MOCK = [
  { id: '1', tipo: 'entregue', titulo: 'Pedido entregue!', corpo: 'Seu pedido do Burger Supreme chegou. Bom apetite!', lida: false, ts: Date.now() - 300000 },
  { id: '2', tipo: 'promo', titulo: 'Oferta relâmpago', corpo: 'Pizza Napoli com 20% off por 2 horas. Aproveite!', lida: false, ts: Date.now() - 7200000 },
  { id: '3', tipo: 'confirmado', titulo: 'Pedido confirmado', corpo: 'Sushi Zen confirmou seu pedido.', lida: true, ts: Date.now() - 86400000 },
];

const TIPO_CONFIG = {
  entregue: { icon: Package, cor: C.success },
  promo: { icon: Tag, cor: C.warning },
  confirmado: { icon: CheckCheck, cor: C.brand },
};

function formatarTempo(ts) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min} min atrás`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h atrás`;
  return `${Math.floor(h / 24)}d atrás`;
}

export default function NotificacoesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [notificacoes, setNotificacoes] = useState([]);
  const [prefs, setPrefs] = useState({ pedidos: true, promocoes: true, novos: false });

  useFocusEffect(useCallback(() => { carregar(); }, []));

  async function carregar() {
    let lista = await getNotificacoes();
    if (lista.length === 0) { await salvarNotificacoes(NOTIF_MOCK); lista = NOTIF_MOCK; }
    setNotificacoes(lista);
  }

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  async function handleMarcarTodasLidas() {
    await marcarTodasLidas();
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
  }

  async function handleToggleLida(id) {
    await marcarNotificacaoLida(id);
    setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
  }

  return (
    <View style={[s.root, { backgroundColor: C.offWhite }]}>
      <View style={[s.header, { backgroundColor: C.surface, paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={16}><Feather name="x" size={22} color={C.ink} /></TouchableOpacity>
        <Text style={s.headerTitle}>Notificações</Text>
        {naoLidas > 0 ? <TouchableOpacity onPress={handleMarcarTodasLidas}><Text style={s.marcarTodasTxt}>Marcar todas como lidas</Text></TouchableOpacity> : <View style={{ width: 100 }} />}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {notificacoes.length === 0 ? (
          <View style={s.empty}>
            <Bell size={56} color={C.inkLight} strokeWidth={1.5} />
            <Text style={s.emptyTitulo}>Nenhuma notificação</Text>
            <Text style={s.emptySub}>Você está em dia!</Text>
          </View>
        ) : (
          <>
            {notificacoes.map(notif => {
              const cfg = TIPO_CONFIG[notif.tipo] || TIPO_CONFIG.confirmado;
              const IconComp = cfg.icon;
              return (
                <TouchableOpacity key={notif.id} style={[s.notifCard, { backgroundColor: notif.lida ? C.surface : C.brandLight }]} onPress={() => handleToggleLida(notif.id)} activeOpacity={0.8}>
                  <View style={s.notifLeft}>
                    {!notif.lida && <View style={s.naoLidaDot} />}
                    <View style={[s.notifIcon, { backgroundColor: cfg.cor + '18' }]}><IconComp size={20} color={cfg.cor} /></View>
                  </View>
                  <View style={s.notifContent}>
                    <Text style={[s.notifTitulo, !notif.lida && s.notifTituloNaoLida]}>{notif.titulo}</Text>
                    <Text style={s.notifCorpo} numberOfLines={2}>{notif.corpo}</Text>
                    <Text style={s.notifTempo}>{formatarTempo(notif.ts)}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            <Text style={s.sectionTitulo}>Preferências</Text>
            <View style={[s.prefsCard, { backgroundColor: C.surface }]}>
              <View style={s.prefRow}>
                <Text style={s.prefLabel}>Pedidos e entregas</Text>
                <Switch value={prefs.pedidos} onValueChange={() => setPrefs(p => ({ ...p, pedidos: !p.pedidos }))} trackColor={{ false: C.border, true: C.brandLight }} thumbColor={prefs.pedidos ? C.brand : C.inkLight} />
              </View>
              <View style={s.prefDivider} />
              <View style={s.prefRow}>
                <Text style={s.prefLabel}>Promoções e ofertas</Text>
                <Switch value={prefs.promocoes} onValueChange={() => setPrefs(p => ({ ...p, promocoes: !p.promocoes }))} trackColor={{ false: C.border, true: C.brandLight }} thumbColor={prefs.promocoes ? C.brand : C.inkLight} />
              </View>
              <View style={s.prefDivider} />
              <View style={s.prefRow}>
                <Text style={s.prefLabel}>Novos restaurantes</Text>
                <Switch value={prefs.novos} onValueChange={() => setPrefs(p => ({ ...p, novos: !p.novos }))} trackColor={{ false: C.border, true: C.brandLight }} thumbColor={prefs.novos ? C.brand : C.inkLight} />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: S.lg, paddingBottom: S.md, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTitle: { fontFamily: F.uiBold, fontSize: 18, color: C.ink },
  marcarTodasTxt: { fontFamily: F.uiMedium, fontSize: 13, color: C.brand },
  scroll: { padding: S.lg, paddingBottom: 42 },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: S.xl },
  emptyTitulo: { fontFamily: F.uiSemi, fontSize: 17, color: C.ink, marginTop: S.lg },
  emptySub: { fontFamily: F.body, fontSize: 14, color: C.inkLight, textAlign: 'center', marginTop: S.sm, lineHeight: 20 },
  notifCard: { flexDirection: 'row', borderRadius: R.md, padding: S.md, marginBottom: S.sm },
  notifLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: S.sm, width: 52 },
  naoLidaDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.brand, marginTop: 6 },
  notifIcon: { width: 36, height: 36, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center' },
  notifContent: { flex: 1 },
  notifTitulo: { fontFamily: F.uiSemi, fontSize: 14, color: C.ink },
  notifTituloNaoLida: { fontFamily: F.uiBold },
  notifCorpo: { fontFamily: F.body, fontSize: 13, color: C.inkMid, marginTop: 2, lineHeight: 18 },
  notifTempo: { fontFamily: F.mono, fontSize: 11, color: C.inkLight, marginTop: 4 },
  sectionTitulo: { fontFamily: F.uiBold, fontSize: 16, color: C.ink, marginTop: S.xl, marginBottom: S.md, marginLeft: 2 },
  prefsCard: { borderRadius: R.lg, ...SHADOW.card },
  prefRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: S.lg, height: 52 },
  prefLabel: { fontFamily: F.uiMedium, fontSize: 14, color: C.ink },
  prefDivider: { height: 1, backgroundColor: C.border, marginLeft: S.lg },
});
