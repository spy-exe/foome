import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Animated, Platform, ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { RESTAURANTES } from '../services/dados';
import { C, F, SHADOW } from '../constants/theme';

const CARD_H   = 210;
const VASSOURAS = { latitude: -22.4033, longitude: -43.6617, latitudeDelta: 0.04, longitudeDelta: 0.04 };

export default function MapaScreen({ navigation, route }) {
  const usuario = route?.params?.usuario || {};
  const [locOk,    setLocOk]    = useState(false);
  const [buscando, setBuscando] = useState(true);
  const [selecionado, setSelecionado] = useState(null);
  const slideY = useRef(new Animated.Value(CARD_H + 60)).current;
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocOk(status === 'granted');
      setBuscando(false);
    })();
  }, []);

  function onPin(rest) {
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
    Animated.timing(slideY, {
      toValue: CARD_H + 60,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setSelecionado(null));
  }

  return (
    <View style={s.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={VASSOURAS}
        showsUserLocation={locOk}
        showsMyLocationButton={false}
        onPress={fechar}
      >
        {RESTAURANTES.map(rest => (
          <Marker
            key={rest.id}
            coordinate={{ latitude: rest.lat, longitude: rest.lng }}
            onPress={() => onPin(rest)}
            tracksViewChanges={false}
          >
            {/* pinWrapper dá espaço pro shadow não ser cortado pelo Marker */}
            <View style={s.pinWrapper}>
              <View style={[
                s.pin,
                selecionado?.id === rest.id && { borderColor: rest.cor, borderWidth: 2.5 },
              ]}>
                <Text style={{ fontSize: 20 }}>{rest.emoji}</Text>
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* ── Header flutuante ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={C.ink} />
        </TouchableOpacity>
        <View style={s.headerText}>
          <Text style={s.headerTitle}>Perto de você</Text>
          <View style={s.headerSubRow}>
            <Feather name="map-pin" size={11} color={C.ink3} />
            <Text style={s.headerSub}>Vassouras, RJ · {RESTAURANTES.length} locais</Text>
          </View>
        </View>
        {buscando && <ActivityIndicator size="small" color={C.brand} />}
      </View>

      {/* ── Bottom sheet animado ── */}
      <Animated.View
        style={[s.sheet, { transform: [{ translateY: slideY }] }]}
        pointerEvents={selecionado ? 'auto' : 'none'}
      >
        {selecionado && (
          <>
            <View style={s.handle} />
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
              </View>
            </View>
            <TouchableOpacity
              style={[s.sheetBtn, { backgroundColor: selecionado.cor }]}
              onPress={() => navigation.navigate('Restaurante', { restaurante: selecionado, usuario })}
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

  pinWrapper: {
    padding: 6, // espaço para o shadow não ser clipado pelo Marker
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
  sheetRow:  { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  sheetIcon: { width: 68, height: 68, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sheetInfo: { flex: 1 },
  sheetNome: { fontFamily: F.headingLg, fontSize: 18, color: C.ink, letterSpacing: -0.4 },
  sheetCat:  { fontFamily: F.regular,   fontSize: 13, color: C.ink3, marginTop: 2 },
  sheetMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 7 },
  metaTxt:   { fontFamily: F.medium,    fontSize: 12, color: C.ink2 },
  dot:       { width: 3, height: 3, borderRadius: 2, backgroundColor: C.ink4, marginHorizontal: 6 },
  gratis:    { color: C.teal },

  sheetBtn: {
    flexDirection: 'row',
    borderRadius: 18,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sheetBtnTxt: { fontFamily: F.heading, fontSize: 16, color: '#fff' },
});
