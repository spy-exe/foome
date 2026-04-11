import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Image, Platform, TextInput,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { RESTAURANTES } from '../services/dados';
import { C, F, SHADOW } from '../constants/theme';
import RestauranteCard from '../components/RestauranteCard';

const CATEGORIAS = [
  { key: 'Hambúrgueres', label: 'Burgers',    icon: 'fast-food-outline'  },
  { key: 'Pizzas',       label: 'Pizza',     icon: 'pizza-outline'      },
  { key: 'Japonês',      label: 'Sushi',     icon: 'fish-outline'       },
  { key: 'Mexicano',     label: 'Mexicano',  icon: 'flame-outline'      },
  { key: 'Saudável',     label: 'Saudável',  icon: 'leaf-outline'       },
  { key: 'Massas',       label: 'Massas',    icon: 'restaurant-outline' },
  { key: 'Churrasco',    label: 'Churrasco', icon: 'bonfire-outline'    },
  { key: 'Açaí',         label: 'Açaí',      icon: 'cafe-outline'       },
];

export default function HomeScreen({ navigation, route }) {
  const usuario = route?.params?.usuario || {};
  const [busca, setBusca]     = useState('');
  const [catAtiva, setCatAtiva] = useState(null);

  const lista = RESTAURANTES.filter(r => {
    if (catAtiva && r.categoria !== catAtiva) return false;
    if (!busca) return true;
    const q = busca.toLowerCase();
    return r.nome.toLowerCase().includes(q) || r.categoria.toLowerCase().includes(q);
  });

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} />

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <View>
            <Text style={s.greeting}>
              Olá, {usuario.nome?.split(' ')[0] || 'visitante'}
            </Text>
            <View style={s.locRow}>
              <Feather name="map-pin" size={11} color={C.ink3} />
              <Text style={s.loc}>Vassouras, RJ</Text>
            </View>
          </View>
          {usuario.fotoUri
            ? <Image source={{ uri: usuario.fotoUri }} style={s.avatar} />
            : (
              <View style={[s.avatar, s.avatarFallback]}>
                <Feather name="user" size={18} color={C.ink3} />
              </View>
            )
          }
        </View>

        <View style={s.searchRow}>
          <View style={s.searchBar}>
            <Feather name="search" size={16} color={C.ink3} />
            <TextInput
              style={s.searchInput}
              placeholder="Restaurantes ou pratos..."
              placeholderTextColor={C.ink4}
              value={busca}
              onChangeText={setBusca}
              returnKeyType="search"
            />
            {busca.length > 0 && (
              <TouchableOpacity
                onPress={() => setBusca('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="x" size={15} color={C.ink3} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={s.mapaBtn}
            onPress={() => navigation.navigate('Mapa', { usuario })}
          >
            <Feather name="map" size={18} color={C.brand} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Banner promo ── */}
        {!busca && (
          <View style={s.banner}>
            <View>
              <Text style={s.bannerTag}>OFERTA DO DIA</Text>
              <Text style={s.bannerTitle}>Frete grátis</Text>
              <Text style={s.bannerSub}>Em pedidos acima de R$ 30</Text>
            </View>
            <Feather name="truck" size={52} color="rgba(255,255,255,0.25)" />
          </View>
        )}

        {/* ── Categorias ── */}
        {!busca && (
          <>
            <Text style={s.sectionLabel}>O que você quer?</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.catRow}
            >
              {CATEGORIAS.map(cat => {
                const ativa = catAtiva === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    style={[s.catChip, ativa && s.catChipOn]}
                    onPress={() => setCatAtiva(ativa ? null : cat.key)}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={16}
                      color={ativa ? C.brand : C.ink3}
                    />
                    <Text style={[s.catTxt, ativa && s.catTxtOn]}>{cat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* ── Lista de restaurantes ── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionLabel}>
            {busca
              ? `Resultados (${lista.length})`
              : catAtiva
                ? CATEGORIAS.find(c => c.key === catAtiva)?.label ?? catAtiva
                : 'Perto de você'}
          </Text>
          {!busca && (
            <TouchableOpacity
              style={s.mapaLink}
              onPress={() => navigation.navigate('Mapa', { usuario })}
            >
              <Feather name="map-pin" size={12} color={C.brand} />
              <Text style={s.mapaLinkTxt}>Ver no mapa</Text>
            </TouchableOpacity>
          )}
        </View>

        {lista.length === 0 && (
          <View style={s.vazio}>
            <Feather name="search" size={40} color={C.ink4} />
            <Text style={s.vazioTitulo}>Nenhum resultado</Text>
            <Text style={s.vazioSub}>Tente outro nome ou categoria</Text>
          </View>
        )}

        {lista.map(rest => (
          <RestauranteCard
            key={rest.id}
            restaurante={rest}
            onPress={() => navigation.navigate('Restaurante', { restaurante: rest, usuario })}
          />
        ))}

        <View style={{ height: 36 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    backgroundColor: C.surface,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    ...SHADOW.card,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  greeting: { fontFamily: F.headingLg, fontSize: 20, color: C.ink, letterSpacing: -0.5 },
  locRow:   { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  loc:      { fontFamily: F.medium, fontSize: 12, color: C.ink3 },

  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2.5, borderColor: C.brand },
  avatarFallback: {
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: C.border,
    borderWidth: 1.5,
  },

  searchRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  searchInput: { flex: 1, fontFamily: F.regular, fontSize: 14, color: C.ink, paddingVertical: 0 },
  mapaBtn: {
    width: 46, height: 46,
    borderRadius: 14,
    backgroundColor: C.brandLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.brandBorder,
  },

  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
    backgroundColor: C.brand,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 22,
    overflow: 'hidden',
    ...SHADOW.float,
    shadowColor: C.brand,
    shadowOpacity: 0.35,
  },
  bannerTag:   { fontFamily: F.semibold, fontSize: 10, color: 'rgba(255,255,255,0.65)', letterSpacing: 1.4, marginBottom: 4 },
  bannerTitle: { fontFamily: F.headingLg, fontSize: 24, color: '#fff', letterSpacing: -0.5 },
  bannerSub:   { fontFamily: F.regular, fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 3 },

  sectionLabel: {
    fontFamily: F.heading,
    fontSize: 17,
    color: C.ink,
    paddingHorizontal: 16,
    marginBottom: 10,
    letterSpacing: -0.2,
  },

  catRow: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.surface,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: C.border,
  },
  catChipOn: { backgroundColor: C.brandLight, borderColor: C.brandBorder },
  catTxt:    { fontFamily: F.medium, fontSize: 13, color: C.ink2 },
  catTxtOn:  { color: C.brand },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
    marginBottom: 4,
  },
  mapaLink:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mapaLinkTxt: { fontFamily: F.semibold, fontSize: 13, color: C.brand },

  vazio: { alignItems: 'center', paddingTop: 64, gap: 10 },
  vazioTitulo: { fontFamily: F.heading,  fontSize: 17, color: C.ink2 },
  vazioSub:    { fontFamily: F.regular,  fontSize: 13, color: C.ink3 },
});
