import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Platform, Animated,
} from 'react-native';
import { Feather, Ionicons } from '../components/Icon';
import CategoriaIcone from '../components/CategoriaIcone';
import { formatarPreco } from '../services/dados';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { F, SHADOW } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../utils/useThemedStyles';

const makeEtapas = (C) => ([
  { key: 'confirmado', label: 'Confirmado', icon: 'check-circle', cor: C.teal },
  { key: 'preparando', label: 'Em preparo', icon: 'clock', cor: C.amber },
  { key: 'a_caminho', label: 'A caminho', icon: 'truck', cor: '#2563EB' },
  { key: 'entregue', label: 'Entregue', icon: 'package', cor: C.ink3 },
]);

const ETAPA_KEYS = ['confirmado', 'preparando', 'a_caminho', 'entregue'];

function indiceStatus(status) {
  const idx = ETAPA_KEYS.indexOf(status);
  return idx === -1 ? 0 : idx;
}

function formatarDataCompleta(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DetalhePedidoScreen({ route, navigation }) {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
  const ETAPAS = makeEtapas(C);
  const insets = useSafeAreaInsets();
  const pedido = route.params.pedido;
  const [status, setStatus] = useState(
    ETAPAS.some(etapa => etapa.key === pedido.status) ? pedido.status : 'confirmado',
  );
  const progressAnims = useRef(ETAPAS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const idx = indiceStatus(prev);
        if (idx >= ETAPAS.length - 1) return prev;
        return ETAPAS[idx + 1].key;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const idxAtual = indiceStatus(status);

    ETAPAS.forEach((_, idx) => {
      Animated.timing(progressAnims[idx], {
        toValue: idx <= idxAtual ? 1 : 0,
        duration: 360,
        delay: idx <= idxAtual ? idx * 90 : 0,
        useNativeDriver: true,
      }).start();
    });
  }, [progressAnims, status]);

  const idxAtual = indiceStatus(status);

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} />

      <View style={[s.header, { paddingTop: insets.top + 14 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={C.ink} />
        </TouchableOpacity>
        <Text style={s.titulo}>Detalhes do pedido</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.restCard}>
          <CategoriaIcone categoria={pedido.restauranteCategoria} size={34} color={pedido.restauranteCor || C.brand} />
          <Text style={s.restNome}>{pedido.restaurante}</Text>
          <Text style={s.restData}>{formatarDataCompleta(pedido.timestamp)}</Text>
        </View>

        <View style={s.timeline}>
          {ETAPAS.map((etapa, idx) => {
            const finalizada = idx < idxAtual;
            const atual = idx === idxAtual;
            const ativa = idx <= idxAtual;
            const dotScale = progressAnims[idx].interpolate({
              inputRange: [0, 1],
              outputRange: [0.92, atual ? 1.14 : 1],
            });

            return (
              <View key={etapa.key} style={s.timelineItem}>
                {idx < ETAPAS.length - 1 && (
                  <View style={[s.timelineLine, finalizada && { backgroundColor: etapa.cor }]} />
                )}

                <Animated.View
                  style={[
                    s.timelineDot,
                    ativa && { backgroundColor: etapa.cor, borderColor: etapa.cor },
                    { transform: [{ scale: dotScale }] },
                  ]}
                >
                  <Feather
                    name={finalizada ? 'check' : etapa.icon}
                    size={16}
                    color={ativa ? '#fff' : C.ink4}
                  />
                </Animated.View>

                <View style={s.timelineInfo}>
                  <Text
                    style={[
                      s.timelineLabel,
                      ativa && { color: etapa.cor, fontFamily: F.bold },
                    ]}
                  >
                    {etapa.label}
                  </Text>
                  {atual && status !== 'entregue' && (
                    <Text style={s.timelineHint}>Atualizando automaticamente</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <Text style={s.sectionLabel}>Itens do pedido</Text>
        {pedido.itens.map(item => (
          <View key={item.id} style={s.itemCard}>
            <CategoriaIcone categoria={item.categoria} size={24} color={pedido.restauranteCor || C.brand} />
            <View style={s.itemInfo}>
              <Text style={s.itemNome}>{item.nome}</Text>
              <Text style={s.itemQtd}>{item.qtd}× {formatarPreco(item.preco)}</Text>
            </View>
            <Text style={[s.itemTotal, { color: pedido.restauranteCor || C.brand }]}>
              {formatarPreco(item.preco * item.qtd)}
            </Text>
          </View>
        ))}

        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.totalVal}>{formatarPreco(pedido.total)}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.surface,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  titulo: { fontFamily: F.heading, fontSize: 17, color: C.ink },

  scroll: { padding: 16, paddingBottom: 40 },

  restCard: {
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    ...SHADOW.card,
  },
  restEmoji: { fontSize: 44, marginBottom: 8 },
  restNome: { fontFamily: F.headingLg, fontSize: 20, color: C.ink, letterSpacing: -0.4 },
  restData: { fontFamily: F.regular, fontSize: 12, color: C.ink3, marginTop: 4 },

  timeline: {
    backgroundColor: C.surface,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 20,
    ...SHADOW.card,
  },
  timelineItem: {
    minHeight: 62,
    flexDirection: 'row',
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 17,
    top: 34,
    bottom: -4,
    width: 2,
    backgroundColor: C.border,
  },
  timelineDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: C.border,
    backgroundColor: C.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    zIndex: 2,
  },
  timelineInfo: { flex: 1, paddingTop: 2 },
  timelineLabel: { fontFamily: F.semibold, fontSize: 15, color: C.ink2 },
  timelineHint: { fontFamily: F.regular, fontSize: 12, color: C.ink3, marginTop: 3 },

  sectionLabel: {
    fontFamily: F.heading,
    fontSize: 16,
    color: C.ink,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    ...SHADOW.card,
  },
  itemEmoji: { fontSize: 28, marginRight: 12 },
  itemInfo: { flex: 1 },
  itemNome: { fontFamily: F.semibold, fontSize: 14, color: C.ink },
  itemQtd: { fontFamily: F.regular, fontSize: 12, color: C.ink3, marginTop: 2 },
  itemTotal: { fontFamily: F.bold, fontSize: 14, minWidth: 72, textAlign: 'right' },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 6,
    ...SHADOW.card,
  },
  totalLabel: { fontFamily: F.heading, fontSize: 16, color: C.ink },
  totalVal: { fontFamily: F.headingLg, fontSize: 22, color: C.brand },
});
