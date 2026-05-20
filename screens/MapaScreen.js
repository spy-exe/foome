import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Animated, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { RESTAURANTES } from '../services/dados';
import { useCarrinho } from '../contexts/CarrinhoContext';
import { C, F, SHADOW } from '../constants/theme';
import { haptic } from '../utils/haptics';

const CARD_H   = 320;
const VASSOURAS = { latitude: -22.4033, longitude: -43.6617, latitudeDelta: 0.04, longitudeDelta: 0.04 };

const CATEGORIAS_MAPA = [
  { id: null, label: 'Todos' },
  { id: 'Hambúrgueres', label: '🍔 Hambúrgueres' },
  { id: 'Pizzas', label: '🍕 Pizzas' },
  { id: 'Japonês', label: '🍣 Japonês' },
  { id: 'Mexicano', label: '🌮 Mexicano' },
  { id: 'Saudável', label: '🥗 Saudável' },
  { id: 'Massas', label: '🍝 Massas' },
  { id: 'Churrasco', label: '🥩 Churrasco' },
  { id: 'Açaí', label: '🍇 Açaí' },
];

const EMOJI_CATEGORIA = {
  'Hambúrgueres': '🍔',
  'Pizzas':       '🍕',
  'Japonês':      '🍣',
  'Mexicano':     '🌮',
  'Saudável':     '🥗',
  'Massas':       '🍝',
  'Churrasco':    '🥩',
  'Açaí':         '🍇',
};

const CORES_CATEGORIA = {
  'Hambúrgueres': '#E8452C',
  'Pizzas':       '#F59E0B',
  'Japonês':      '#8B5CF6',
  'Mexicano':     '#10B981',
  'Saudável':     '#06B6D4',
  'Massas':       '#F97316',
  'Churrasco':    '#EF4444',
  'Açaí':         '#6D28D9',
};

export default function MapaScreen({ navigation }) {
  const { setRestaurante } = useCarrinho();
  const [locOk,    setLocOk]    = useState(false);
  const [buscando, setBuscando] = useState(true);
  const [selecionado, setSelecionado] = useState(null);
  const [filtroCat, setFiltroCat] = useState(null);
  const [userLoc, setUserLoc] = useState(null);
  const [locStatus, setLocStatus] = useState('loading');
  const [showFiltro, setShowFiltro] = useState(false);
  const slideY = useRef(new Animated.Value(CARD_H + 60)).current;
  const mapRef = useRef(null);
  const markersFiltrados = filtroCat
    ? RESTAURANTES.filter(r => r.categoria === filtroCat)
    : RESTAURANTES;
  const regiaoInicial = userLoc || VASSOURAS;

  useEffect(() => {
    obterLocalizacao();
  }, []);

  async function obterLocalizacao() {
    setLocStatus('loading');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setUserLoc(null);
        setLocStatus('denied');
        mapRef.current?.animateToRegion(VASSOURAS, 500);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      };

      setUserLoc(region);
      setLocStatus('granted');
      mapRef.current?.animateToRegion(region, 500);
    } catch (e) {
      setUserLoc(null);
      setLocStatus('denied');
      mapRef.current?.animateToRegion(VASSOURAS, 500);
    }
  }

  function centralizarNoUsuario() {
    if (userLoc) {
      mapRef.current?.animateToRegion(userLoc, 600);
      return;
    }
    obterLocalizacao();
  }

  function onPin(rest) {
    haptic.select();
    setSelecionado(rest);
    Animated.spring(slideY, {
      toValue: 0,
      tension: 80,
      friction: 8,
      useNativeDriver: true,
    }).start();
    mapRef.current?.animateToRegion(
      { latitude: rest.lat - 0.009, longitude: rest.lng, latitudeDelta: 0.022, longitudeDelta: 0.022 },
      450,
    );
  }

  function fechar() {
    if (!selecionado) return;
    haptic.select();
    Animated.timing(slideY, {
      toValue: CARD_H + 60,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setSelecionado(null));
  }

  function escolherFiltro(catKey) {
    setFiltroCat(catKey);
    if (catKey && selecionado?.categoria !== catKey) fechar();
  }

  function abrirCardapio() {
    if (!selecionado) return;
    setRestaurante(selecionado);
    const routeNames = navigation.getState?.()?.routeNames || [];
    if (routeNames.includes('HomeTab')) {
      navigation.navigate('HomeTab', {
        screen: 'Restaurante',
        params: { restaurante: selecionado },
      });
      return;
    }
    navigation.navigate('Restaurante', { restaurante: selecionado, usuario });
  }

  return (
    <View style={s.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={regiaoInicial}
        showsMyLocationButton={false}
        onPress={fechar}
      >
        {markersFiltrados.map(rest => (
          <Marker
            key={rest.id}
            coordinate={{ latitude: rest.lat, longitude: rest.lng }}
            onPress={() => onPin(rest)}
          >
            <View style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: CORES_CATEGORIA[rest.categoria] ?? '#E8452C',
              borderWidth: 3,
              borderColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}>
              <Text style={{ fontSize: 20 }}>
                {EMOJI_CATEGORIA[rest.categoria] ?? '🍽️'}
              </Text>
            </View>
          </Marker>
        ))}

        {userLoc && locStatus === 'granted' && (
          <Marker coordinate={{ latitude: userLoc.latitude, longitude: userLoc.longitude }}>
            <View style={{
              width: 20, height: 20, borderRadius: 10,
              backgroundColor: '#2563EB',
              borderWidth: 3, borderColor: '#FFFFFF',
              elevation: 6,
            }} />
          </Marker>
        )}
      </MapView>

      {/* ── Header flutuante ── */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => {
            haptic.select();
            navigation.navigate('HomeTab');
          }}
          style={s.backBtn}
        >
          <Feather name="arrow-left" size={20} color={C.ink} />
        </TouchableOpacity>
        <View style={s.headerText}>
          <Text style={s.headerTitle}>Perto de você</Text>
          <View style={s.headerSubRow}>
            <Feather name="map-pin" size={11} color={C.ink3} />
            <Text style={s.headerSub}>
              Vassouras, RJ · {markersFiltrados.length} locais
            </Text>
          </View>
        </View>
        {locStatus === 'loading' && <ActivityIndicator size="small" color={C.brand} />}
      </View>

      {locStatus === 'denied' && (
        <View style={s.permBanner}>
          <Feather name="map-pin" size={14} color={C.amber} />
          <Text style={s.permTxt}>
            Localização desativada. Mostrando restaurantes em Vassouras/RJ.
          </Text>
          <TouchableOpacity onPress={obterLocalizacao} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={s.permBtn}>Ativar</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[s.myLocBtn, selecionado && s.myLocBtnRaised, !userLoc && s.myLocBtnOff]}
        onPress={centralizarNoUsuario}
        activeOpacity={0.85}
      >
        <Feather name="crosshair" size={18} color={C.brand} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.myLocBtn, s.filterBtn, selecionado && s.filterBtnRaised]}
        onPress={() => setShowFiltro(v => !v)}
        activeOpacity={0.85}
      >
        <Feather name="sliders" size={18} color={showFiltro ? C.brand : C.ink2} />
      </TouchableOpacity>

      {showFiltro && (
        <View style={[s.filtroRow, locStatus === 'denied' && s.filtroRowWithBanner]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filtroContent}
          >
            {CATEGORIAS_MAPA.map(cat => {
              const ativo = filtroCat === cat.id;
              return (
                <TouchableOpacity
                  key={String(cat.id ?? 'todos')}
                  style={[s.filtroChip, ativo && s.filtroChipOn]}
                  onPress={() => escolherFiltro(cat.id)}
                  activeOpacity={0.85}
                >
                  <Ionicons name={cat.icon} size={14} color={ativo ? '#fff' : C.ink2} />
                  <Text style={[s.filtroTxt, ativo && s.filtroTxtOn]}>{cat.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ── Bottom sheet animado ── */}
      <Animated.View
        style={[s.sheet, { transform: [{ translateY: slideY }] }]}
        pointerEvents={selecionado ? 'auto' : 'none'}
      >
        {selecionado && (
          <>
            <View style={s.handle} />
            <View style={[s.sheetCover, { backgroundColor: `${selecionado.cor}18` }]}>
              <Text style={s.sheetCoverEmoji}>{selecionado.emoji}</Text>
              <View style={[s.sheetCoverBadge, { backgroundColor: selecionado.cor }]}>
                <Text style={s.sheetCoverBadgeTxt}>{selecionado.categoria}</Text>
              </View>
            </View>
            <View style={s.sheetRow}>
              <View style={[s.sheetIcon, { backgroundColor: selecionado.cor + '18' }]}>
                <Text style={{ fontSize: 32 }}>{selecionado.emoji}</Text>
              </View>
              <View style={s.sheetInfo}>
                <Text style={s.sheetNome}>{selecionado.nome}</Text>
                <Text style={s.sheetCat}>{selecionado.categoria}</Text>
                <View style={s.sheetMeta}>
                  <Ionicons name="star" size={11} color={C.amber} />
                  <Text style={s.metaTxt}> {selecionado.avaliacao}</Text>
                  <View style={s.dot} />
                  <Feather name="clock" size={11} color={C.ink3} />
                  <Text style={s.metaTxt}> {selecionado.tempo}</Text>
                  <View style={s.dot} />
                  <Text style={[s.metaTxt, selecionado.entrega === 'Grátis' && s.gratis]}>
                    {selecionado.entrega}
                  </Text>
                </View>
                <View style={s.sheetAddress}>
                  <Feather name="map-pin" size={11} color={C.ink3} />
                  <Text style={s.metaTxt}>Vassouras/RJ</Text>
                  <View style={s.dot} />
                  <Text style={s.metaTxt}>{selecionado.produtos.length} itens</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={[s.sheetBtn, { backgroundColor: selecionado.cor }]}
              onPress={() => {
                haptic.light();
                setRestaurante(selecionado);
                navigation.navigate('HomeTab', {
                  screen: 'Restaurante',
                  params: { restaurante: selecionado },
                });
              }}
              activeOpacity={0.85}
            >
              <Text style={s.sheetBtnTxt}>Ver cardápio</Text>
              <Feather name="arrow-right" size={16} color="#fff" />
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },

  header: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.surface,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 44,
    paddingBottom: 14,
    ...SHADOW.float,
    shadowOffset: { width: 0, height: 2 },
  },
  backBtn: {
    width: 42, height: 42,
    borderRadius: 13,
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  headerText:   { flex: 1 },
  headerTitle:  { fontFamily: F.heading,  fontSize: 17, color: C.ink, letterSpacing: -0.3 },
  headerSubRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  headerSub:    { fontFamily: F.regular,  fontSize: 12, color: C.ink3 },

  permBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 118 : 108,
    left: 16,
    right: 16,
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: '#FFD9A8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...SHADOW.float,
  },
  permTxt: { flex: 1, fontFamily: F.medium, fontSize: 12, color: C.ink2, lineHeight: 16 },
  permBtn: { fontFamily: F.heading, fontSize: 12, color: C.brand },

  myLocBtn: {
    position: 'absolute',
    bottom: 180,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    ...SHADOW.float,
  },
  myLocBtnOff: { opacity: 0.72 },
  myLocBtnRaised: { bottom: CARD_H + 20 },
  filterBtn: { bottom: 232 },
  filterBtnRaised: { bottom: CARD_H + 72 },

  filtroRow: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 118 : 108,
    left: 0,
    right: 0,
    paddingLeft: 16,
    paddingRight: 76,
  },
  filtroRowWithBanner: {
    top: Platform.OS === 'ios' ? 172 : 162,
  },
  filtroContent: { gap: 6, paddingRight: 16 },
  filtroChip: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 18,
    paddingHorizontal: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    ...SHADOW.card,
  },
  filtroChipOn: { backgroundColor: C.brand, borderColor: C.brand },
  filtroTxt: { fontFamily: F.medium, fontSize: 12, color: C.ink2 },
  filtroTxtOn: { color: '#fff' },

  pinWrapper: {
    padding: 6, // espaço para o shadow não ser clipado pelo Marker
    alignItems: 'center',
  },
  pin: {
    width: 50, height: 50,
    borderRadius: 25,
    backgroundColor: C.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
    shadowColor: '#17172B',
    shadowOpacity: 0.14,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  pinEmoji: { fontSize: 20 },
  pinPoint: {
    width: 0,
    height: 0,
    marginTop: -1,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },

  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: C.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 42 : 26,
    ...SHADOW.sheet,
  },
  handle: {
    width: 44, height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetCover: {
    height: 76,
    borderRadius: 18,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sheetCoverEmoji: { fontSize: 44 },
  sheetCoverBadge: {
    position: 'absolute',
    right: 12,
    bottom: 10,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sheetCoverBadgeTxt: { fontFamily: F.heading, fontSize: 11, color: '#fff' },
  sheetRow:  { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  sheetIcon: { width: 68, height: 68, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sheetInfo: { flex: 1 },
  sheetNome: { fontFamily: F.headingLg, fontSize: 18, color: C.ink, letterSpacing: -0.4 },
  sheetCat:  { fontFamily: F.regular,   fontSize: 13, color: C.ink3, marginTop: 2 },
  sheetMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 7 },
  metaTxt:   { fontFamily: F.medium,    fontSize: 12, color: C.ink2 },
  dot:       { width: 3, height: 3, borderRadius: 2, backgroundColor: C.ink4, marginHorizontal: 6 },
  gratis:    { color: C.teal },
  sheetAddress: { flexDirection: 'row', alignItems: 'center', marginTop: 7 },

  sheetBtn: {
    flexDirection: 'row',
    borderRadius: 18,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  sheetBtnTxt: { fontFamily: F.heading, fontSize: 16, color: '#fff' },
});
