import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { formatarPreco } from '../services/dados';
import { F, R, S, SHADOW } from '../constants/theme';
import Stepper from './Stepper';
import CategoriaIcone from './CategoriaIcone';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../utils/useThemedStyles';

export default function ProdutoCard({ produto, cor, quantidade, onPress, onAdicionar, onRemover, categoria }) {
  const s = useThemedStyles(makeStyles);
  const gradCores = CORES_CATEGORIA[categoria] || [cor, cor + '88'];

  return (
    <View style={s.card}>
      <TouchableOpacity
        style={s.press}
        activeOpacity={0.86}
        onPress={onPress}
      >
        <LinearGradient colors={gradCores} style={s.foto}>
          <CategoriaIcone categoria={produto.categoria || categoria} size={32} color="#FFFFFF" />
        </LinearGradient>
        <View style={s.info}>
          <Text style={s.nome} numberOfLines={1}>{produto.nome}</Text>
          <Text style={s.desc} numberOfLines={2}>{produto.descricao}</Text>
          <Text style={s.preco}>{formatarPreco(produto.preco)}</Text>
        </View>
      </TouchableOpacity>
      <Stepper
        quantidade={quantidade}
        cor={cor}
        onAdicionar={onAdicionar}
        onRemover={onRemover}
      />
    </View>
  );
}

const CORES_CATEGORIA = {
  destaques:  ['#E8452C', '#9A1F0D'],
  entradas:   ['#D97706', '#92400E'],
  principais: ['#E8452C', '#9A1F0D'],
  bebidas:    ['#0891B2', '#065666'],
  sobremesas: ['#7C3AED', '#4C1D95'],
};

const makeStyles = (C) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: R.lg,
    padding: S.sm,
    marginBottom: S.sm,
    gap: S.md,
    ...SHADOW.card,
  },
  press: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
  },
  foto: {
    width: 90,
    height: 90,
    borderRadius: R.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: { fontSize: 34 },
  info: { flex: 1, gap: 3 },
  nome: {
    fontFamily: F.uiSemi,
    fontSize: 15,
    color: C.ink,
    letterSpacing: 0,
  },
  desc: {
    fontFamily: F.body,
    fontSize: 13,
    color: C.inkLight,
    lineHeight: 18,
  },
  preco: {
    fontFamily: F.monoBold,
    fontSize: 15,
    color: C.brand,
    marginTop: 2,
  },
});
