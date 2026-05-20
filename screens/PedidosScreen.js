import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  StatusBar, Platform, TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getPedidos, salvarPedidos } from '../services/storage';
import { formatarPreco } from '../services/dados';
import { C, F, SHADOW } from '../constants/theme';

const STATUS_CONFIG = {
  confirmado: { label: 'Confirmado', cor: C.teal, bg: C.tealLight, icon: 'check-circle' },
  preparando: { label: 'Em preparo', cor: C.amber, bg: C.amberLight, icon: 'clock' },
  a_caminho: { label: 'A caminho', cor: '#2563EB', bg: '#EFF6FF', icon: 'truck' },
  entregue: { label: 'Entregue', cor: C.ink3, bg: C.bg, icon: 'package' },
};

const PROXIMO_STATUS = {
  confirmado: 'preparando',
  preparando: 'a_caminho',
  a_caminho: 'entregue',
};

function formatarData(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function PedidosScreen({ navigation, route }) {
  const usuario = route?.params?.usuario || {};
  const [pedidos, setPedidos] = useState([]);

  useFocusEffect(useCallback(() => {
    getPedidos().then(setPedidos);
  }, []));

  useEffect(() => {
    navigation.setOptions({
      tabBarBadge: pedidos.length > 0 ? pedidos.length : undefined,
    });
  }, [navigation, pedidos.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPedidos(prev => {
        let mudou = false;
        const novos = prev.map(pedido => {
          const statusAtual = pedido.status || 'confirmado';
          const proximo = PROXIMO_STATUS[statusAtual];

          if (!proximo) return pedido;
          mudou = true;
          return { ...pedido, status: proximo };
        });

        if (!mudou) return prev;
        salvarPedidos(novos).catch(() => {});
        return novos;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

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

      <FlatList
        data={pedidos}
        keyExtractor={i => i.id}
        contentContainerStyle={s.lista}
        renderItem={({ item }) => {
          const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.confirmado;

          return (
            <TouchableOpacity
              style={s.card}
              onPress={() => navigation.navigate('DetalhePedido', { pedido: item })}
              activeOpacity={0.9}
            >
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
                  <Text style={[s.cardTotal, { color: item.restauranteCor ?? C.brand }]}>
                    {formatarPreco(item.total)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
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
              onPress={() => navigation.navigate('Home', { usuario })}
              activeOpacity={0.88}
            >
              <Text style={s.vazioBtnTxt}>Explorar restaurantes</Text>
              <Feather name="arrow-right" size={15} color="#fff" />
            </TouchableOpacity>
          </View>
        }
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

  lista: { padding: 16, paddingBottom: 40 },

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
  qtdLabel:   { fontFamily: F.regular, fontSize: 12, color: C.ink3 },
  cardTotal:  { fontFamily: F.headingLg, fontSize: 18 },

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
});
