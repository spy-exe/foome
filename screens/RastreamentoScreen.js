import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  SlideInDown,
} from 'react-native-reanimated';
import { getPedidos, salvarPedidos } from '../services/storage';
import { getAvaliacaoPedido } from '../services/avaliacao';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F, SHADOW } from '../constants/theme';
import { haptic } from '../utils/haptics';
import AvaliacaoModal from '../components/AvaliacaoModal';

const STATUS_DISPLAY = {
  confirmado: { label: 'Pedido confirmado',  icon: 'check-circle',  cor: C.teal   },
  preparando: { label: 'Em preparo',         icon: 'clock',         cor: C.amber  },
  a_caminho:  { label: 'Saiu para entrega',  icon: 'truck',         cor: C.brand  },
  entregue:   { label: 'Pedido entregue!',   icon: 'home',          cor: C.teal   },
};

const STATUS_BG = {
  confirmado: C.tealLight,
  preparando: C.amberLight,
  a_caminho:  C.brandLight,
  entregue:   C.tealLight,
};

const STATUS_SUBTEXTO = {
  confirmado: 'Aguardando o restaurante confirmar seu pedido',
  preparando: 'O restaurante está preparando seu pedido',
  a_caminho:  'Seu pedido está a caminho!',
  entregue:   'Aproveite! Bom apetite.',
};

const STATUS_ORDEM = ['confirmado', 'preparando', 'a_caminho', 'entregue'];

function usePulseAnim(ativo) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!ativo) {
      scale.value = withTiming(1, { duration: 200 });
      return;
    }
    scale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [ativo, scale]);

  return useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
}

function EtapaIcon({ concluido, ativo, icon }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (ativo) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.18, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    } else {
      scale.value = withTiming(1, { duration: 150 });
    }
  }, [ativo, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const dotBg = concluido ? C.teal : ativo ? C.brand : C.surface;
  const dotBorder = concluido ? C.teal : ativo ? C.brand : C.border;
  const iconName = concluido ? 'check' : icon;
  const iconColor = (concluido || ativo) ? '#fff' : C.ink4;

  return (
    <Animated.View style={[s.etapaDot, { backgroundColor: dotBg, borderColor: dotBorder }, ativo ? animStyle : undefined]}>
      <Feather name={iconName} size={16} color={iconColor} />
    </Animated.View>
  );
}

function EtapaLinha({ concluida }) {
  const largura = useSharedValue(0);

  useEffect(() => {
    largura.value = withTiming(concluida ? 2 : 0, {
      duration: 300, easing: Easing.out(Easing.ease),
    });
  }, [concluida, largura]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: largura.value > 0 ? 1 : 0.3,
    backgroundColor: concluida ? C.teal : C.border,
  }));

  return (
    <View style={s.etapaLinhaBg}>
      <Animated.View style={[s.etapaLinhaFilled, animStyle]} />
    </View>
  );
}

export default function RastreamentoScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const pedido = route.params.pedido;
  const [status, setStatus] = useState(pedido.status || 'confirmado');
  const [showAvaliacao, setShowAvaliacao] = useState(false);
  const [entregadorVisivel, setEntregadorVisivel] = useState(status === 'a_caminho' || status === 'entregue');
  const [timestamps, setTimestamps] = useState({});
  const avaliacaoVerificada = useRef(false);

  const idxAtual = STATUS_ORDEM.indexOf(status);
  const statusCfg = STATUS_DISPLAY[status] || STATUS_DISPLAY.confirmado;
  const statusBg = STATUS_BG[status] || STATUS_BG.confirmado;
  const pulseAnim = usePulseAnim(status !== 'entregue');

  useEffect(() => {
    if (status === 'a_caminho' && !entregadorVisivel) {
      setEntregadorVisivel(true);
    }
  }, [status, entregadorVisivel]);

  useEffect(() => {
    if (status === 'entregue' && !avaliacaoVerificada.current) {
      avaliacaoVerificada.current = true;
      const timer = setTimeout(async () => {
        const existente = await getAvaliacaoPedido(pedido.id);
        if (!existente) setShowAvaliacao(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, pedido.id]);

  async function salvarPedidoAtualizado() {
    try {
      const pedidos = await getPedidos();
      await salvarPedidos(pedidos.map(p =>
        p.id === pedido.id ? { ...p, status } : p,
      ));
    } catch {}
  }

  function handleSimularAvancar(novoStatus) {
    const agora = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit', minute: '2-digit',
    });
    setStatus(novoStatus);
    setTimestamps(prev => ({ ...prev, [novoStatus]: agora }));
    haptic.medium();
    if (novoStatus === 'entregue') salvarPedidoAtualizado();
  }

  useEffect(() => {
    if (status === 'entregue') return;

    const timers = [];
    const duracaoMap = {
      confirmado: 30000,
      preparando: 60000,
      a_caminho:  45000,
    };

    const t = setTimeout(() => {
      const map = { confirmado: 'preparando', preparando: 'a_caminho', a_caminho: 'entregue' };
      const prox = map[status];
      if (prox) handleSimularAvancar(prox);
    }, duracaoMap[status] || 30000);

    timers.push(t);
    return () => timers.forEach(clearTimeout);
  }, [status]);

  const pedidoId = `#${String(pedido.id).slice(-6)}`;
  const restLat = pedido.restauranteLat ?? -22.4012;
  const restLng = pedido.restauranteLng ?? -43.6589;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.ink} />

      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.8}>
          <Feather name="arrow-left" size={22} color={C.ink4} />
        </TouchableOpacity>
        <View style={s.headerInfo}>
          <Text style={s.pedidoId}>{pedidoId}</Text>
          <Text style={s.restNome}>{pedido.restaurante}</Text>
        </View>
      </View>

      <View style={s.mapaWrap}>
        <MapView
          style={s.mapa}
          initialRegion={{
            latitude: restLat,
            longitude: restLng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          <Marker coordinate={{ latitude: restLat, longitude: restLng }} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={s.markerRest}>
              <Feather name="map-pin" size={18} color="#fff" />
            </View>
          </Marker>
          <Marker coordinate={{ latitude: restLat + 0.003, longitude: restLng + 0.002 }} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={s.markerUser}>
              <Feather name="navigation" size={16} color="#fff" />
            </View>
          </Marker>
        </MapView>
        <View style={s.mapaBottomCurve} />
      </View>

      <View style={[s.statusCard, { backgroundColor: statusBg }]}>
        <Animated.View style={[s.statusIconWrap, { backgroundColor: statusCfg.cor }, pulseAnim]}>
          <Feather name={statusCfg.icon} size={24} color="#fff" />
        </Animated.View>
        <Text style={[s.statusLabel, { color: statusCfg.cor }]}>{statusCfg.label}</Text>
        <Text style={s.statusSub}>{STATUS_SUBTEXTO[status]}</Text>
      </View>

      {status !== 'entregue' && (
        <>
          <Text style={s.tempoRestante}>15\u201325 min</Text>
          <Text style={s.tempoLabel}>tempo estimado</Text>
        </>
      )}

      <View style={s.timelineWrap}>
        {STATUS_ORDEM.map((etapaKey, idx) => {
          const concluido = idx < idxAtual;
          const ativo = idx === idxAtual;
          const pendente = idx > idxAtual;
          const cfg = STATUS_DISPLAY[etapaKey];
          const ts = timestamps[etapaKey];

          return (
            <View key={etapaKey}>
              <View style={s.etapaRow}>
                <View style={s.etapaColLeft}>
                  <EtapaIcon concluido={concluido} ativo={ativo} icon={cfg.icon} />
                </View>
                <View style={s.etapaInfo}>
                  <Text style={[s.etapaLabel, { color: pendente ? C.ink3 : C.ink }]}>
                    {cfg.label}
                  </Text>
                  {ts ? (
                    <Text style={s.etapaTs}>{'\u00E0s'} {ts}</Text>
                  ) : pendente ? (
                    <Text style={s.etapaTs}>—</Text>
                  ) : null}
                </View>
              </View>
              {idx < STATUS_ORDEM.length - 1 && (
                <EtapaLinha concluida={concluido} />
              )}
            </View>
          );
        })}
      </View>

      {entregadorVisivel && (
        <Animated.View style={s.entregadorCard} entering={SlideInDown.duration(400).springify().damping(14)}>
          <View style={s.entregadorAvatar}>
            <Text style={s.entregadorIniciais}>CS</Text>
          </View>
          <View style={s.entregadorInfo}>
            <Text style={s.entregadorNome}>Carlos Silva</Text>
            <Text style={s.entregadorTag}>Entregador parceiro</Text>
          </View>
          <View style={s.entregadorRating}>
            <Feather name="star" size={14} color={C.amber} />
            <Text style={s.entregadorNota}>4.9</Text>
          </View>
        </Animated.View>
      )}

      <AvaliacaoModal
        visivel={showAvaliacao}
        pedido={pedido}
        onClose={() => setShowAvaliacao(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.ink, paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerInfo: { flex: 1 },
  pedidoId: {
    fontFamily: F.mono, fontSize: 14,
    color: '#fff', letterSpacing: 0.5,
  },
  restNome: { fontFamily: F.regular, fontSize: 13, color: C.ink3, marginTop: 2 },

  mapaWrap: { height: 200, position: 'relative' },
  mapa: {
    flex: 1,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  mapaBottomCurve: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 24, backgroundColor: C.bg,
  },
  markerRest: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: C.brand,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff', ...SHADOW.float,
  },
  markerUser: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: C.ink,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff', ...SHADOW.float,
  },

  statusCard: {
    marginHorizontal: 16, marginTop: -12, borderRadius: 20,
    padding: 20, alignItems: 'center', zIndex: 10, ...SHADOW.card,
  },
  statusIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  statusLabel: { fontFamily: F.semibold, fontSize: 17, marginBottom: 4, letterSpacing: -0.2 },
  statusSub: { fontFamily: F.regular, fontSize: 14, color: C.ink2, textAlign: 'center', lineHeight: 18 },

  tempoRestante: {
    fontFamily: F.monoBold, fontSize: 32,
    color: C.ink, textAlign: 'center', marginTop: 20, marginBottom: 2,
  },
  tempoLabel: {
    fontFamily: F.regular, fontSize: 12, color: C.ink3, textAlign: 'center',
  },

  timelineWrap: {
    backgroundColor: C.surface, marginHorizontal: 16, marginTop: 16,
    borderRadius: 20, paddingVertical: 16, paddingHorizontal: 12, ...SHADOW.card,
  },
  etapaRow: { flexDirection: 'row', alignItems: 'center', minHeight: 48 },
  etapaColLeft: { width: 40, alignItems: 'center', justifyContent: 'center' },
  etapaDot: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  etapaInfo: { flex: 1, marginLeft: 10 },
  etapaLabel: { fontFamily: F.semibold, fontSize: 15 },
  etapaTs: { fontFamily: F.mono, fontSize: 11, color: C.ink3, marginTop: 2 },

  etapaLinhaBg: {
    width: 2, height: 30, backgroundColor: C.border,
    marginLeft: 19, marginVertical: 2,
  },
  etapaLinhaFilled: { height: '100%' },

  entregadorCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, marginHorizontal: 16, marginTop: 14,
    borderRadius: 18, padding: 14, ...SHADOW.card,
  },
  entregadorAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: C.ink, justifyContent: 'center', alignItems: 'center',
  },
  entregadorIniciais: { fontFamily: F.bold, fontSize: 16, color: '#fff' },
  entregadorInfo: { flex: 1, marginLeft: 12 },
  entregadorNome: { fontFamily: F.semibold, fontSize: 15, color: C.ink },
  entregadorTag: { fontFamily: F.regular, fontSize: 12, color: C.ink3, marginTop: 2 },
  entregadorRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  entregadorNota: { fontFamily: F.monoMedium, fontSize: 14, color: C.ink },
});
