import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, StatusBar, Platform,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { formatarPreco } from '../services/dados';
import { C, F, SHADOW } from '../constants/theme';
import Stepper from '../components/Stepper';

export default function RestauranteScreen({ route, navigation }) {
  const { restaurante, usuario } = route.params;
  const [carrinho, setCarrinho] = useState([]);

  const totalItens = carrinho.reduce((s, i) => s + i.qtd, 0);
  const totalPreco = carrinho.reduce((s, i) => s + i.preco * i.qtd, 0);

  function adicionar(produto) {
    setCarrinho(prev => {
      const existe = prev.find(i => i.id === produto.id);
      if (existe) return prev.map(i => i.id === produto.id ? { ...i, qtd: i.qtd + 1 } : i);
      return [...prev, { ...produto, qtd: 1 }];
    });
  }

  function remover(produto) {
    setCarrinho(prev => {
      const item = prev.find(i => i.id === produto.id);
      if (!item) return prev;
      if (item.qtd === 1) return prev.filter(i => i.id !== produto.id);
      return prev.map(i => i.id === produto.id ? { ...i, qtd: i.qtd - 1 } : i);
    });
  }

  const qtd = (id) => carrinho.find(i => i.id === id)?.qtd ?? 0;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={restaurante.cor} />

      {/* ── Header ── */}
      <View style={[s.header, { backgroundColor: restaurante.cor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerInfo}>
          <Text style={{ fontSize: 44, marginBottom: 6 }}>{restaurante.emoji}</Text>
          <Text style={s.headerNome}>{restaurante.nome}</Text>
          <View style={s.badges}>
            <View style={s.badge}>
              <Ionicons name="star" size={11} color={C.amber} />
              <Text style={s.badgeTxt}>{restaurante.avaliacao}</Text>
            </View>
            <View style={s.badge}>
              <Feather name="clock" size={11} color="rgba(255,255,255,0.75)" />
              <Text style={s.badgeTxt}>{restaurante.tempo}</Text>
            </View>
            <View style={[s.badge, restaurante.entrega === 'Grátis' && s.badgeWhite]}>
              {restaurante.entrega === 'Grátis' && (
                <Feather name="check" size={11} color={C.teal} />
              )}
              <Text style={[s.badgeTxt, restaurante.entrega === 'Grátis' && { color: C.teal }]}>
                {restaurante.entrega}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── Produtos ── */}
      <FlatList
        data={restaurante.produtos}
        keyExtractor={i => i.id}
        contentContainerStyle={s.lista}
        renderItem={({ item }) => {
          const n = qtd(item.id);
          return (
            <View style={s.card}>
              <Text style={{ fontSize: 36 }}>{item.emoji}</Text>
              <View style={s.prodInfo}>
                <Text style={s.prodNome}>{item.nome}</Text>
                <Text style={s.prodDesc} numberOfLines={2}>{item.descricao}</Text>
                <Text style={[s.prodPreco, { color: restaurante.cor }]}>
                  {formatarPreco(item.preco)}
                </Text>
              </View>

              <Stepper
                quantidade={n}
                cor={restaurante.cor}
                onAdicionar={() => adicionar(item)}
                onRemover={() => remover(item)}
              />
            </View>
          );
        }}
      />

      {/* ── CTA flutuante ── */}
      {totalItens > 0 && (
        <TouchableOpacity
          style={[s.cta, { backgroundColor: restaurante.cor }]}
          onPress={() => navigation.navigate('Carrinho', { carrinho, restaurante, usuario })}
          activeOpacity={0.88}
        >
          <View style={s.ctaBadge}>
            <Text style={s.ctaBadgeTxt}>{totalItens}</Text>
          </View>
          <Text style={s.ctaLabel}>Ver carrinho</Text>
          <Text style={s.ctaTotal}>{formatarPreco(totalPreco)}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    paddingTop: Platform.OS === 'ios' ? 52 : 42,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    top: Platform.OS === 'ios' ? 52 : 42,
    width: 40, height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: { alignItems: 'center', marginTop: 4 },
  headerNome: { fontFamily: F.headingLg, fontSize: 22, color: '#fff', letterSpacing: -0.6, marginBottom: 10 },
  badges: { flexDirection: 'row', gap: 6 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeWhite: { backgroundColor: '#fff' },
  badgeTxt: { fontFamily: F.medium, fontSize: 12, color: '#fff' },

  lista: { padding: 16, paddingBottom: 110 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    ...SHADOW.card,
  },
  prodInfo:  { flex: 1 },
  prodNome:  { fontFamily: F.headingSm, fontSize: 15, color: C.ink, letterSpacing: -0.2 },
  prodDesc:  { fontFamily: F.regular,   fontSize: 12, color: C.ink3, marginTop: 3, lineHeight: 17 },
  prodPreco: { fontFamily: F.bold,      fontSize: 16, marginTop: 6 },

  cta: {
    position: 'absolute',
    bottom: 24, left: 16, right: 16,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOW.float,
  },
  ctaBadge: {
    backgroundColor: 'rgba(255,255,255,0.24)',
    width: 28, height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  ctaBadgeTxt: { fontFamily: F.bold,    fontSize: 13, color: '#fff' },
  ctaLabel:    { fontFamily: F.heading, fontSize: 16, color: '#fff', flex: 1 },
  ctaTotal:    { fontFamily: F.bold,    fontSize: 16, color: '#fff' },
});
