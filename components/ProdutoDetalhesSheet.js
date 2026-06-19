import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Animated as RNAnimated,
  Image,
} from 'react-native';
import { X } from 'lucide-react-native';
import CategoriaIcone from './CategoriaIcone';
import { formatarPreco } from '../services/dados';
import { TAMANHOS_PRODUTO, precoPorTamanho } from '../services/tamanhos';
import { F, TYPE, R, S, SHADOW } from '../constants/theme';
import { ICON_SIZE } from '../constants/icons';
import PrimaryButton from './PrimaryButton';
import { haptic } from '../utils/haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../utils/useThemedStyles';

function BottomSheetSimples({ visible, onClose, onDismiss, children }) {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
  const [mounted, setMounted] = useState(visible);
  const translateY = useRef(new RNAnimated.Value(360)).current;
  const backdropOpacity = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.setValue(360);
      backdropOpacity.setValue(0);
      requestAnimationFrame(() => {
        RNAnimated.parallel([
          RNAnimated.spring(translateY, {
            toValue: 0,
            tension: 80,
            friction: 10,
            useNativeDriver: true,
          }),
          RNAnimated.timing(backdropOpacity, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          }),
        ]).start();
      });
      return;
    }

    if (mounted) {
      RNAnimated.parallel([
        RNAnimated.timing(translateY, {
          toValue: 360,
          duration: 200,
          useNativeDriver: true,
        }),
        RNAnimated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setMounted(false);
          onDismiss?.();
        }
      });
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <Modal transparent visible={mounted} animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={s.modalRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <RNAnimated.View style={[s.sheetBackdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </RNAnimated.View>
        <RNAnimated.View style={[s.sheet, { transform: [{ translateY }] }]}>
          <View style={s.handle} />
          <TouchableOpacity
            style={s.sheetClose}
            accessibilityRole="button"
            accessibilityLabel="Fechar detalhes do produto"
            hitSlop={8}
            onPress={onClose}
          >
            <X size={ICON_SIZE.sm} color={C.inkMid} />
          </TouchableOpacity>
          {children}
        </RNAnimated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function ProdutoDetalhesSheet({
  visible,
  produto,
  cor,
  tamanho,
  precoAtual,
  observacoes,
  onTamanhoChange,
  onObservacoesChange,
  onAdicionar,
  onClose,
  onDismiss,
}) {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
  if (!produto) return null;

  return (
    <BottomSheetSimples visible={visible} onClose={onClose} onDismiss={onDismiss}>
      <View style={s.sheetContent}>
        {produto.imageUrl ? (
          <Image source={{ uri: produto.imageUrl }} style={s.sheetPhoto} />
        ) : (
          <View style={s.sheetIconFallback}>
            <CategoriaIcone categoria={produto.categoria} size={40} color={C.brand} />
          </View>
        )}
        <Text style={s.sheetNome}>{produto.nome}</Text>
        <Text style={s.sheetDesc}>{produto.descricao}</Text>

        <Text style={s.sheetSection}>Tamanho</Text>
        <View style={s.tamanhoRow}>
          {TAMANHOS_PRODUTO.map(opcao => {
            const ativo = tamanho === opcao.key;
            const preco = precoPorTamanho(produto.precoBase ?? produto.preco, opcao.key);
            return (
              <TouchableOpacity
                key={opcao.key}
                style={[s.tamanhoBtn, ativo && { borderColor: cor, backgroundColor: cor + '12' }]}
                activeOpacity={0.82}
                onPress={() => {
                  haptic.select();
                  onTamanhoChange(opcao.key);
                }}
              >
                <Text style={[s.tamanhoTxt, ativo && { color: cor }]}>{opcao.label}</Text>
                <Text style={[s.tamanhoPreco, ativo && { color: cor }]}>
                  {formatarPreco(preco)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={s.sheetSection}>Observações</Text>
        <TextInput
          style={s.obsInput}
          placeholder="Ex: sem cebola, molho à parte..."
          placeholderTextColor={C.inkLight}
          multiline
          value={observacoes}
          onChangeText={onObservacoesChange}
        />

        <PrimaryButton
          testID="btn-add-cart"
          label={`Adicionar · ${formatarPreco(precoAtual ?? produto.preco)}`}
          color={cor}
          onPress={onAdicionar}
          style={s.sheetCta}
        />
      </View>
    </BottomSheetSimples>
  );
}

const makeStyles = (C) => StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: R.xxl,
    borderTopRightRadius: R.xxl,
    paddingHorizontal: S.xl,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : 22,
    maxHeight: '84%',
    ...SHADOW.sheet,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.border,
    marginBottom: 18,
  },
  sheetClose: {
    position: 'absolute',
    top: 12,
    right: 18,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetContent: { gap: 10 },
  sheetPhoto: {
    width: '100%',
    height: 150,
    borderRadius: R.xl,
    backgroundColor: C.offWhite,
  },
  sheetIconFallback: {
    alignSelf: 'center',
    width: 74,
    height: 74,
    borderRadius: R.full,
    backgroundColor: C.brandLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 2,
  },
  sheetNome: {
    fontFamily: F.uiBold,
    fontSize: 21,
    color: C.ink,
    letterSpacing: 0,
    textAlign: 'center',
  },
  sheetDesc: {
    fontFamily: F.body,
    fontSize: 13,
    color: C.inkMid,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 4,
  },
  sheetSection: {
    fontFamily: F.uiSemi,
    fontSize: 14,
    color: C.ink,
    marginTop: S.sm,
  },
  tamanhoRow: { flexDirection: 'row', gap: S.sm },
  tamanhoBtn: {
    flex: 1,
    minHeight: 52,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.offWhite,
    gap: 3,
  },
  tamanhoTxt: {
    fontFamily: F.uiSemi,
    fontSize: 14,
    color: C.inkMid,
  },
  tamanhoPreco: {
    fontFamily: F.mono,
    fontSize: 11,
    color: C.inkMid,
  },
  obsInput: {
    minHeight: 92,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.offWhite,
    padding: S.lg,
    fontFamily: F.body,
    fontSize: 14,
    color: C.ink,
    textAlignVertical: 'top',
  },
  sheetCta: { marginTop: S.sm },
});
