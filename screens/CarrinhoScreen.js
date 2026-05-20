import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, StatusBar, Platform,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { verificarBiometria } from '../services/biometria';
import { salvarPedidos, getPedidos } from '../services/storage';
import { formatarPreco } from '../services/dados';
import { useApp } from '../contexts/AppContext';
import { useCarrinho } from '../contexts/CarrinhoContext';
import { C, F, SHADOW } from '../constants/theme';

export default function CarrinhoScreen({ navigation }) {
  const { usuario } = useApp();
  const { itens, restaurante, totalPreco, totalItens, limpar } = useCarrinho();
  const [confirmando, setConfirmando] = useState(false);

  if (!restaurante) return null;

  const subtotal    = totalPreco;
  const taxaEntrega = restaurante.entrega === 'Grátis'
    ? 0
    : parseFloat(restaurante.entrega.replace('R$ ', '').replace(',', '.'));
  const total = subtotal + taxaEntrega;

  async function confirmarPedido() {
    if (totalItens === 0 || !usuario) return;

    setConfirmando(true);
    const result = await verificarBiometria();
    setConfirmando(false);
    if (!result.sucesso) {
      Alert.alert('Biometria necessária', 'Confirme sua identidade para finalizar.');
      return;
    }
    const pedido = {
      id: Date.now().toString(),
      restaurante:       restaurante.nome,
      restauranteCor:    restaurante.cor,
      restauranteEmoji:  restaurante.emoji,
      itens: itens.map(item => ({ ...item })),
      total,
      timestamp: new Date().toISOString(),
      status: 'confirmado',
    };
    const anteriores = await getPedidos();
    await salvarPedidos([pedido, ...anteriores]);
    limpar();
    Alert.alert(
      'Pedido confirmado!',
      `${restaurante.nome} · ${formatarPreco(total)}`,
      [{ text: 'Ver pedidos', onPress: () => navigation.navigate('Pedidos') }],
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={C.ink} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.titulo}>Carrinho</Text>
          <Text style={s.restLabel}>{restaurante.emoji}  {restaurante.nome}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Itens ── */}
      <FlatList
        data={itens}
        keyExtractor={i => i.id}
        contentContainerStyle={s.lista}
        ItemSeparatorComponent={() => <View style={s.sep} />}
        renderItem={({ item }) => (
          <View style={s.item}>
            <Text style={{ fontSize: 24, marginRight: 12 }}>{item.emoji}</Text>
            <View style={s.itemInfo}>
              <Text style={s.itemNome}>{item.nome}</Text>
              <Text style={s.itemUnit}>{formatarPreco(item.preco)} / un.</Text>
            </View>
            <View style={s.qtdChip}>
              <Text style={s.qtdTxt}>{item.qtd}×</Text>
            </View>
            <Text style={[s.itemTotal, { color: restaurante.cor }]}>
              {formatarPreco(item.preco * item.qtd)}
            </Text>
          </View>
        )}
      />

      {/* ── Resumo + CTA ── */}
      <View style={s.footer}>
        <View style={s.resumo}>
          <View style={s.linha}>
            <Text style={s.linhaLabel}>Subtotal</Text>
            <Text style={s.linhaVal}>{formatarPreco(subtotal)}</Text>
          </View>
          <View style={s.linha}>
            <Text style={s.linhaLabel}>Entrega</Text>
            <Text style={[s.linhaVal, taxaEntrega === 0 && s.gratis]}>
              {taxaEntrega === 0 ? 'Grátis' : formatarPreco(taxaEntrega)}
            </Text>
          </View>
          <View style={[s.linha, s.totalRow]}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={[s.totalVal, { color: restaurante.cor }]}>{formatarPreco(total)}</Text>
          </View>
        </View>

        <View style={s.bioHint}>
          <Ionicons name="finger-print" size={17} color={C.amber} />
          <Text style={s.bioHintTxt}>Confirmação segura por biometria</Text>
        </View>

        <TouchableOpacity
          style={[s.btn, { backgroundColor: restaurante.cor }, confirmando && s.btnOff]}
          onPress={confirmarPedido}
          disabled={confirmando || totalItens === 0}
          activeOpacity={0.85}
        >
          {!confirmando && (
            <Ionicons name="finger-print" size={20} color="#fff" style={{ marginRight: 10 }} />
          )}
          <Text style={s.btnTxt}>
            {confirmando ? 'Aguardando...' : 'Confirmar pedido'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.surface,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: 13,
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  headerCenter: { alignItems: 'center' },
  titulo:    { fontFamily: F.heading,  fontSize: 17, color: C.ink },
  restLabel: { fontFamily: F.regular,  fontSize: 12, color: C.ink3, marginTop: 2 },

  lista: { padding: 16 },
  sep:   { height: 8 },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 14,
    ...SHADOW.card,
  },
  itemInfo: { flex: 1 },
  itemNome: { fontFamily: F.semibold, fontSize: 14, color: C.ink },
  itemUnit: { fontFamily: F.regular,  fontSize: 12, color: C.ink3, marginTop: 2 },
  qtdChip: {
    backgroundColor: C.bg,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  qtdTxt:   { fontFamily: F.bold, fontSize: 13, color: C.ink2 },
  itemTotal: { fontFamily: F.bold, fontSize: 15, minWidth: 72, textAlign: 'right' },

  footer: {
    backgroundColor: C.surface,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  resumo: { marginBottom: 14 },
  linha:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  linhaLabel: { fontFamily: F.regular, fontSize: 14, color: C.ink3 },
  linhaVal:   { fontFamily: F.semibold, fontSize: 14, color: C.ink2 },
  gratis:     { color: C.teal },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: { fontFamily: F.heading,  fontSize: 16, color: C.ink },
  totalVal:   { fontFamily: F.headingLg, fontSize: 22 },

  bioHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.amberLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FFD9A8',
  },
  bioHintTxt: { fontFamily: F.medium, fontSize: 12, color: '#92530A', flex: 1 },

  btn: {
    flexDirection: 'row',
    borderRadius: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.float,
  },
  btnTxt: { fontFamily: F.heading, fontSize: 16, color: '#fff' },
  btnOff: { opacity: 0.55 },
});
