import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Crown, Check, Gift, ShoppingBag, Wallet } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getStatusClube, NIVEIS, LIMIARES } from '../services/clube';
import { formatarPreco } from '../services/dados';
import { useApp } from '../contexts/AppContext';
import { F, R, S, SHADOW } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../utils/useThemedStyles';
import Glass from '../components/Glass';

export default function ClubeScreen({ navigation }) {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { usuario } = useApp();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let ativo = true;
    setLoading(true);
    getStatusClube()
      .then((st) => { if (ativo) { setStatus(st); setLoading(false); } })
      .catch(() => { if (ativo) setLoading(false); });
    return () => { ativo = false; };
  }, []));

  const primeiroNome = usuario?.nome?.split(' ')[0] || 'você';

  return (
    <View style={[s.root, { backgroundColor: C.offWhite }]}>
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={16}>
          <ChevronLeft size={24} color={C.ink} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Foome Club</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading || !status ? (
        <View style={s.center}><ActivityIndicator color={C.brand} /></View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero do nível */}
          <LinearGradient
            colors={[status.cor, '#141422']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.hero}
          >
            <View style={s.heroTop}>
              <Text style={s.heroKicker}>FOOME CLUB</Text>
              <View style={s.heroCrown}>
                <Crown size={16} color="#fff" fill="#fff" />
              </View>
            </View>
            <Text style={s.heroNivel}>{status.nivel}</Text>
            <Text style={s.heroNome}>Olá, {primeiroNome}</Text>

            <View style={s.heroPontosRow}>
              <Text style={s.heroPontos}>{status.pontos}</Text>
              <Text style={s.heroPontosLabel}>pontos</Text>
            </View>

            <View style={s.progressoTrack}>
              <View style={[s.progressoFill, { width: `${Math.round(status.progresso * 100)}%` }]} />
            </View>
            <Text style={s.heroFooter}>
              {status.proximoNivel
                ? `Faltam ${status.faltamPontos} pts para ${status.proximoNivel}`
                : 'Você chegou ao topo do clube! 👑'}
            </Text>
          </LinearGradient>

          {/* Cupom exclusivo do clube */}
          {status.cupomClube ? (
            <Glass style={s.cupomCard} tint="light" radius={18}>
              <View style={[s.cupomIcon, { backgroundColor: C.brandLight }]}>
                <Gift size={22} color={C.brand} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.cupomTitle}>Cupom do clube liberado</Text>
                <Text style={s.cupomSub}>Use <Text style={s.cupomCodigo}>{status.cupomClube}</Text> no carrinho · 15% OFF</Text>
              </View>
            </Glass>
          ) : (
            <View style={s.lockCard}>
              <Gift size={20} color={C.inkLight} />
              <Text style={s.lockTxt}>
                Chegue ao nível <Text style={{ fontFamily: F.uiBold, color: C.ink }}>Prata</Text> para
                desbloquear o cupom exclusivo de 15% OFF.
              </Text>
            </View>
          )}

          {/* Benefícios do nível atual */}
          <Text style={s.sectionTitle}>Seus benefícios</Text>
          <View style={s.card}>
            {status.beneficios.map((b, i) => (
              <View key={b} style={[s.beneficioRow, i > 0 && s.beneficioDivider]}>
                <View style={[s.beneficioCheck, { backgroundColor: C.successLight }]}>
                  <Check size={13} color={C.success} strokeWidth={3} />
                </View>
                <Text style={s.beneficioTxt}>{b}</Text>
              </View>
            ))}
          </View>

          {/* Trilha de níveis */}
          <Text style={s.sectionTitle}>Níveis do clube</Text>
          <View style={s.niveisRow}>
            {NIVEIS.map((n) => {
              const atingido = NIVEIS.indexOf(n) <= NIVEIS.indexOf(status.nivel);
              const atual = n === status.nivel;
              return (
                <View key={n} style={[s.nivelPill, atingido && { borderColor: C.brand, backgroundColor: C.brandLight }, atual && s.nivelPillAtual]}>
                  <Crown size={15} color={atingido ? C.brand : C.inkLight} fill={atingido ? C.brand : 'transparent'} />
                  <Text style={[s.nivelNome, atingido && { color: C.brand }]}>{n}</Text>
                  <Text style={s.nivelPts}>{LIMIARES[n]} pts</Text>
                </View>
              );
            })}
          </View>

          {/* Estatísticas */}
          <View style={s.statsRow}>
            <View style={s.statCard}>
              <ShoppingBag size={18} color={C.brand} />
              <Text style={s.statNum}>{status.totalPedidos}</Text>
              <Text style={s.statLabel}>pedidos</Text>
            </View>
            <View style={s.statCard}>
              <Wallet size={18} color={C.brand} />
              <Text style={s.statNum}>{formatarPreco(status.totalGasto)}</Text>
              <Text style={s.statLabel}>acumulado</Text>
            </View>
          </View>

          <Text style={s.rodape}>Você ganha 1 ponto a cada R$ 1 gasto em pedidos no Foome.</Text>
        </ScrollView>
      )}
    </View>
  );
}

const makeStyles = (C) => StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: S.lg, paddingBottom: S.md, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTitle: { fontFamily: F.uiBold, fontSize: 18, color: C.ink },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: S.lg, paddingBottom: 42 },

  hero: { borderRadius: R.xl, padding: S.xl, overflow: 'hidden', ...SHADOW.float },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroKicker: { fontFamily: F.monoBold, fontSize: 11, color: 'rgba(255,255,255,0.8)', letterSpacing: 2 },
  heroCrown: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  heroNivel: { fontFamily: F.headingLg, fontSize: 34, color: '#fff', letterSpacing: -0.5, marginTop: 14 },
  heroNome: { fontFamily: F.body, fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  heroPontosRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 18 },
  heroPontos: { fontFamily: F.monoBold, fontSize: 30, color: '#fff' },
  heroPontosLabel: { fontFamily: F.body, fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 5 },
  progressoTrack: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.22)', marginTop: 12, overflow: 'hidden' },
  progressoFill: { height: 8, borderRadius: 4, backgroundColor: '#fff' },
  heroFooter: { fontFamily: F.uiMedium, fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 8 },

  cupomCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginTop: S.lg },
  cupomIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cupomTitle: { fontFamily: F.uiSemi, fontSize: 14, color: C.ink },
  cupomSub: { fontFamily: F.body, fontSize: 13, color: C.inkMid, marginTop: 2 },
  cupomCodigo: { fontFamily: F.monoBold, color: C.brand },
  lockCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surfaceAlt, borderRadius: R.lg, padding: 14, marginTop: S.lg, borderWidth: 1, borderColor: C.border },
  lockTxt: { flex: 1, fontFamily: F.body, fontSize: 13, color: C.inkMid, lineHeight: 19 },

  sectionTitle: { fontFamily: F.uiBold, fontSize: 16, color: C.ink, marginTop: S.xl, marginBottom: S.md },
  card: { backgroundColor: C.surface, borderRadius: R.lg, paddingHorizontal: S.lg, ...SHADOW.card },
  beneficioRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  beneficioDivider: { borderTopWidth: 1, borderTopColor: C.border },
  beneficioCheck: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  beneficioTxt: { flex: 1, fontFamily: F.body, fontSize: 14, color: C.ink },

  niveisRow: { flexDirection: 'row', gap: S.sm },
  nivelPill: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 12, borderRadius: R.md, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.surface },
  nivelPillAtual: { borderWidth: 2.5 },
  nivelNome: { fontFamily: F.uiSemi, fontSize: 12, color: C.inkMid },
  nivelPts: { fontFamily: F.mono, fontSize: 10, color: C.inkLight },

  statsRow: { flexDirection: 'row', gap: S.md, marginTop: S.xl },
  statCard: { flex: 1, alignItems: 'center', gap: 4, backgroundColor: C.surface, borderRadius: R.lg, paddingVertical: S.lg, ...SHADOW.card },
  statNum: { fontFamily: F.monoBold, fontSize: 18, color: C.ink, marginTop: 4 },
  statLabel: { fontFamily: F.body, fontSize: 12, color: C.inkLight },

  rodape: { fontFamily: F.body, fontSize: 12, color: C.inkLight, textAlign: 'center', marginTop: S.xl, lineHeight: 18 },
});
