import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  StatusBar, Platform, TouchableOpacity,
  Modal, TextInput, Alert,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getPedidos, salvarPedidos } from '../services/storage';
import { formatarPreco } from '../services/dados';
import { getAvaliacaoPedido, salvarAvaliacao } from '../services/avaliacao';
import { useApp } from '../contexts/AppContext';
import PrimaryButton from '../components/PrimaryButton';
import SkeletonShimmer from '../components/SkeletonShimmer';
import { C, F, SHADOW } from '../constants/theme';
import { haptic } from '../utils/haptics';

function formatarData(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_CONFIG = {
  confirmado:  { label: 'Confirmado', cor: C.teal, bg: C.tealLight, icon: 'check-circle' },
  preparando:  { label: 'Em preparo', cor: C.amber, bg: C.amberLight, icon: 'clock' },
  a_caminho:   { label: 'A caminho', cor: '#2563EB', bg: '#EFF6FF', icon: 'truck' },
  entregue:    { label: 'Entregue', cor: C.ink3, bg: C.bg, icon: 'package' },
};

const PROXIMO_STATUS = {
  confirmado: 'preparando',
  preparando: 'a_caminho',
  a_caminho: 'entregue',
};

const NOTA_LABELS = ['', 'Ruim 😞', 'Regular 😐', 'Bom 😊', 'Muito bom 🤩', 'Excelente 🔥'];

function PedidosSkeletonList() {
  return (
    <View>
      {[0, 1, 2].map(i => (
        <View key={i} style={s.skeletonCard}>
          <SkeletonShimmer style={s.skeletonAccent} />
          <View style={s.skeletonBody}>
            <View style={s.skeletonTop}>
              <SkeletonShimmer style={s.skeletonTitle} />
              <SkeletonShimmer style={s.skeletonBadge} />
            </View>
            <SkeletonShimmer style={s.skeletonDate} />
            <View style={s.skeletonChips}>
              <SkeletonShimmer style={s.skeletonChip} />
              <SkeletonShimmer style={s.skeletonChipSmall} />
            </View>
            <SkeletonShimmer style={s.skeletonFooter} />
          </View>
        </View>
      ))}
    </View>
  );
}

function ModalAvaliacao({ visivel, pedido, onClose }) {
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    if (visivel) {
      setNota(0);
      setComentario('');
    }
  }, [pedido?.id, visivel]);

  async function enviar() {
    if (nota === 0) {
      haptic.warning();
      Alert.alert('Atenção', 'Selecione uma nota de 1 a 5 estrelas.');
      return;
    }

    haptic.success();
    await salvarAvaliacao(pedido.id, {
      nota,
      comentario: comentario.trim(),
      restauranteNome: pedido.restaurante,
    });

    onClose();
    Alert.alert('Obrigado!', 'Sua avaliação ajuda a melhorar o Foome.');
  }

  return (
    <Modal
      visible={visivel && !!pedido}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <View style={s.modal}>
          <Text style={s.modalEmoji}>{pedido?.restauranteEmoji ?? '🍽️'}</Text>
          <Text style={s.modalTitulo}>Como foi seu pedido?</Text>
          <Text style={s.modalSub}>{pedido?.restaurante}</Text>

          <View style={s.stars}>
            {[1, 2, 3, 4, 5].map(n => (
              <TouchableOpacity
                key={n}
                onPress={() => {
                  haptic.select();
                  setNota(n);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              >
                <Ionicons
                  name={n <= nota ? 'star' : 'star-outline'}
                  size={36}
                  color={n <= nota ? C.amber : C.ink4}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.notaLabel}>{NOTA_LABELS[nota]}</Text>

          <TextInput
            style={s.input}
            placeholder="Deixe um comentário (opcional)..."
            placeholderTextColor={C.ink4}
            multiline
            value={comentario}
            onChangeText={setComentario}
            maxLength={200}
          />
          <Text style={s.charCount}>{comentario.length}/200</Text>

          <PrimaryButton label="Enviar avaliação" onPress={enviar} />
          <TouchableOpacity
            style={s.pularBtn}
            onPress={() => {
              haptic.select();
              onClose();
            }}
          >
            <Text style={s.pularTxt}>Agora não</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function PedidosScreen({ navigation }) {
  const { atualizarPedidosCount } = useApp();
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [tabAtiva, setTabAtiva] = useState('andamento');
  const [showAvaliacao, setShowAvaliacao] = useState(false);
  const [pedidoParaAvaliar, setPedidoParaAvaliar] = useState(null);
  const pedidosAvaliacaoAgendados = useRef(new Set());
  const timeoutsAvaliacao = useRef([]);

  const fecharAvaliacao = useCallback(() => {
    setShowAvaliacao(false);
    setPedidoParaAvaliar(null);
  }, []);

  const agendarAvaliacao = useCallback((pedido) => {
    if (!pedido?.id || pedidosAvaliacaoAgendados.current.has(pedido.id)) return;

    pedidosAvaliacaoAgendados.current.add(pedido.id);
    const timeout = setTimeout(async () => {
      const avaliacaoExistente = await getAvaliacaoPedido(pedido.id);
      if (avaliacaoExistente) return;

      setPedidoParaAvaliar(pedido);
      setShowAvaliacao(true);
    }, 1500);

    timeoutsAvaliacao.current.push(timeout);
  }, []);

  useFocusEffect(useCallback(() => {
    let ativo = true;
    setCarregando(true);
    getPedidos()
      .then(lista => {
        if (!ativo) return;
        setPedidos(lista);
        atualizarPedidosCount(lista);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [atualizarPedidosCount]));

  useEffect(() => {
    const interval = setInterval(() => {
      setPedidos(prev => {
        let mudou = false;
        const entregues = [];
        const novos = prev.map(pedido => {
          const statusAtual = pedido.status ?? 'confirmado';
          const novoStatus = PROXIMO_STATUS[statusAtual];
          if (!novoStatus) return pedido;

          mudou = true;
          const atualizado = { ...pedido, status: novoStatus };
          if (novoStatus === 'entregue') entregues.push(atualizado);
          return atualizado;
        });

        if (!mudou) return prev;

        salvarPedidos(novos);
        entregues.forEach(agendarAvaliacao);
        return novos;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [agendarAvaliacao]);

  useEffect(() => () => {
    timeoutsAvaliacao.current.forEach(clearTimeout);
  }, []);

  const pedidosAndamento = pedidos.filter(p => p.status !== 'entregue');
  const pedidosHistorico = pedidos.filter(p => p.status === 'entregue');
  const pedidosFiltrados = tabAtiva === 'andamento' ? pedidosAndamento : pedidosHistorico;

  useEffect(() => {
    navigation.setOptions({
      tabBarBadge: pedidos.length > 0 ? pedidos.length : undefined,
    });
  }, [navigation, pedidos.length]);

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} />

      <View style={s.header}>
        <Text style={s.titulo}>Meus Pedidos</Text>
        {pedidos.length > 0 && (
          <View style={s.contador}>
            <Text style={s.contadorTxt}>{pedidos.length}</Text>
          </View>
        )}
      </View>

      <View style={s.tabRow}>
        <TouchableOpacity
          style={[s.tabBtn, tabAtiva === 'andamento' && s.tabBtnAtiva]}
          onPress={() => { haptic.select(); setTabAtiva('andamento'); }}
          activeOpacity={0.8}
        >
          <Text style={[s.tabTxt, tabAtiva === 'andamento' && s.tabTxtAtiva]}>Em andamento</Text>
          {pedidosAndamento.length > 0 && (
            <View style={s.tabCount}>
              <Text style={s.tabCountTxt}>{pedidosAndamento.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tabBtn, tabAtiva === 'historico' && s.tabBtnAtiva]}
          onPress={() => { haptic.select(); setTabAtiva('historico'); }}
          activeOpacity={0.8}
        >
          <Text style={[s.tabTxt, tabAtiva === 'historico' && s.tabTxtAtiva]}>Histórico</Text>
          {pedidosHistorico.length > 0 && (
            <View style={s.tabCount}>
              <Text style={s.tabCountTxt}>{pedidosHistorico.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={carregando ? [] : pedidosFiltrados}
        keyExtractor={i => i.id}
        contentContainerStyle={s.lista}
        renderItem={({ item }) => {
          const status = STATUS_CONFIG[item.status ?? 'confirmado'] || STATUS_CONFIG.confirmado;

          return (
          <View style={s.card}>
            <View style={[s.accent, { backgroundColor: item.restauranteCor ?? C.brand }]} />
            <View style={s.cardBody}>
              <View style={s.cardTop}>
                <View style={s.cardTitle}>
                  <Text style={{ fontSize: 18, marginRight: 8 }}>{item.restauranteEmoji ?? '🍽️'}</Text>
                  <Text style={s.restNome}>{item.restaurante}</Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: status.bg }]}>
                  <Feather name={status.icon} size={11} color={status.cor} />
                  <Text style={[s.statusTxt, { color: status.cor }]}>{status.label}</Text>
                </View>
              </View>

              <Text style={s.cardData}>{formatarData(item.timestamp)}</Text>

              <View style={s.chips}>
                {item.itens.slice(0, 3).map(it => (
                  <View key={it.id} style={s.chip}>
                    <Text style={s.chipTxt}>{it.qtd}× {it.nome}</Text>
                  </View>
                ))}
                {item.itens.length > 3 && (
                  <View style={s.chip}>
                    <Text style={s.chipTxt}>+{item.itens.length - 3}</Text>
                  </View>
                )}
              </View>

              <View style={s.cardFooter}>
                <Text style={s.qtdLabel}>
                  {item.itens.reduce((s, i) => s + i.qtd, 0)} itens
                </Text>
                <View style={s.cardFooterRight}>
                  <TouchableOpacity
                    style={s.acompanharBtn}
                    onPress={() => {
                      haptic.select();
                      navigation.navigate('Rastreamento', { pedido: item });
                    }}
                    activeOpacity={0.8}
                  >
                    <Feather name="truck" size={13} color={C.brand} />
                    <Text style={s.acompanharTxt}>Acompanhar</Text>
                  </TouchableOpacity>
                  <Text style={[s.cardTotal, { color: item.restauranteCor ?? C.brand }]}>
                    {formatarPreco(item.total)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          );
        }}
        ListEmptyComponent={
          carregando ? (
            <PedidosSkeletonList />
          ) : (
          <View style={s.vazio}>
            <View style={s.vazioIlustracao}>
              <View style={s.vazioHalo} />
              <View style={s.vazioIcon}>
                <Feather name="package" size={38} color={C.brand} />
              </View>
              <View style={s.vazioTruck}>
                <Feather name="truck" size={18} color="#fff" />
              </View>
            </View>
            <Text style={s.vazioTitulo}>Ainda sem pedidos</Text>
            <Text style={s.vazioSub}>Finalize seu primeiro pedido para acompanhar o preparo e a entrega aqui.</Text>
            <TouchableOpacity
              style={s.vazioBtn}
              onPress={() => {
                haptic.select();
                navigation.navigate('HomeTab', { screen: 'Home' });
              }}
            >
              <Text style={s.vazioBtnTxt}>Explorar restaurantes</Text>
              <Feather name="arrow-right" size={15} color="#fff" />
            </TouchableOpacity>
          </View>
          )
        }
      />

      <ModalAvaliacao
        visivel={showAvaliacao}
        pedido={pedidoParaAvaliar}
        onClose={fecharAvaliacao}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.surface,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  titulo:   { fontFamily: F.headingLg, fontSize: 26, color: C.ink, letterSpacing: -0.8 },
  contador: {
    backgroundColor: C.brand,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 3,
    minWidth: 26,
    alignItems: 'center',
  },
  contadorTxt: { fontFamily: F.bold, fontSize: 13, color: '#fff' },

  tabRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  tabBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 10, backgroundColor: C.bg,
  },
  tabBtnAtiva: { backgroundColor: C.ink },
  tabTxt: { fontFamily: F.semibold, fontSize: 13, color: C.ink3 },
  tabTxtAtiva: { color: '#fff' },
  tabCount: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8, paddingHorizontal: 7, paddingVertical: 1,
  },
  tabCountTxt: { fontFamily: F.bold, fontSize: 11, color: '#fff' },

  lista: { padding: 16, paddingBottom: 40 },

  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderRadius: 18,
    marginBottom: 12,
    overflow: 'hidden',
    ...SHADOW.card,
  },
  skeletonAccent: { width: 5, borderRadius: 0 },
  skeletonBody: { flex: 1, padding: 14 },
  skeletonTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  skeletonTitle: { flex: 1, height: 18, borderRadius: 6 },
  skeletonBadge: { width: 92, height: 24, borderRadius: 8 },
  skeletonDate: { width: '42%', height: 12, borderRadius: 6, marginBottom: 12 },
  skeletonChips: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  skeletonChip: { width: 96, height: 24, borderRadius: 8 },
  skeletonChipSmall: { width: 68, height: 24, borderRadius: 8 },
  skeletonFooter: { width: '100%', height: 18, borderRadius: 6 },

  card: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderRadius: 18,
    marginBottom: 12,
    overflow: 'hidden',
    ...SHADOW.card,
  },
  accent:   { width: 5 },
  cardBody: { flex: 1, padding: 14 },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardTitle: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  restNome:  { fontFamily: F.headingSm, fontSize: 15, color: C.ink, letterSpacing: -0.2 },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.tealLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusTxt: { fontFamily: F.semibold, fontSize: 11, color: C.teal },

  cardData: { fontFamily: F.regular, fontSize: 12, color: C.ink3, marginBottom: 10 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  chip: {
    backgroundColor: C.bg,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipTxt: { fontFamily: F.medium, fontSize: 11, color: C.ink2 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardFooterRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtdLabel:   { fontFamily: F.regular, fontSize: 12, color: C.ink3 },
  cardTotalWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardTotal:  { fontFamily: F.headingLg, fontSize: 18 },
  acompanharBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8, backgroundColor: C.brandLight,
  },
  acompanharTxt: { fontFamily: F.semibold, fontSize: 12, color: C.brand },

  vazio: { alignItems: 'center', paddingTop: 72, paddingHorizontal: 32 },
  vazioIlustracao: {
    width: 118,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  vazioHalo: {
    position: 'absolute',
    width: 102,
    height: 78,
    borderRadius: 39,
    backgroundColor: C.brandLight,
    borderWidth: 1,
    borderColor: C.brandBorder,
  },
  vazioIcon: {
    width: 80, height: 80,
    borderRadius: 24,
    backgroundColor: C.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.brandBorder,
    ...SHADOW.card,
  },
  vazioTruck: {
    position: 'absolute',
    right: 5,
    bottom: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.brand,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: C.bg,
  },
  vazioTitulo: { fontFamily: F.heading,  fontSize: 18, color: C.ink, marginBottom: 6 },
  vazioSub:    { fontFamily: F.regular,  fontSize: 14, lineHeight: 20, color: C.ink3, textAlign: 'center', marginBottom: 24 },
  vazioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.brand,
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 13,
    ...SHADOW.float,
    shadowColor: C.brand,
    shadowOpacity: 0.3,
  },
  vazioBtnTxt: { fontFamily: F.heading, fontSize: 14, color: '#fff' },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(23,23,43,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: C.surface,
    borderRadius: 22,
    padding: 22,
    ...SHADOW.sheet,
  },
  modalEmoji: { fontSize: 44, textAlign: 'center', marginBottom: 8 },
  modalTitulo: {
    fontFamily: F.headingLg,
    fontSize: 22,
    color: C.ink,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  modalSub: {
    fontFamily: F.medium,
    fontSize: 13,
    color: C.ink3,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  notaLabel: {
    minHeight: 20,
    fontFamily: F.semibold,
    fontSize: 14,
    color: C.ink2,
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    minHeight: 92,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg,
    borderRadius: 14,
    padding: 12,
    fontFamily: F.regular,
    fontSize: 14,
    color: C.ink,
    textAlignVertical: 'top',
  },
  charCount: {
    alignSelf: 'flex-end',
    fontFamily: F.medium,
    fontSize: 11,
    color: C.ink3,
    marginTop: 6,
    marginBottom: 16,
  },
  pularBtn: { alignItems: 'center', paddingTop: 16 },
  pularTxt: { fontFamily: F.semibold, fontSize: 14, color: C.ink3 },
});
