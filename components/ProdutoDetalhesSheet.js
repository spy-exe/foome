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
} from 'react-native';
import { formatarPreco } from '../services/dados';
import { C, F, SHADOW } from '../constants/theme';
import PrimaryButton from './PrimaryButton';
import { haptic } from '../utils/haptics';

function BottomSheetSimples({ visible, onClose, onDismiss, children }) {
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
  observacoes,
  onTamanhoChange,
  onObservacoesChange,
  onAdicionar,
  onClose,
  onDismiss,
}) {
  if (!produto) return null;

  return (
    <BottomSheetSimples visible={visible} onClose={onClose} onDismiss={onDismiss}>
      <View style={s.sheetContent}>
        <Text style={s.sheetEmoji}>{produto.emoji}</Text>
        <Text style={s.sheetNome}>{produto.nome}</Text>
        <Text style={s.sheetDesc}>{produto.descricao}</Text>

        <Text style={s.sheetSection}>Tamanho</Text>
        <View style={s.tamanhoRow}>
          {['P', 'M', 'G'].map(opcao => {
            const ativo = tamanho === opcao;
            return (
              <TouchableOpacity
                key={opcao}
                style={[s.tamanhoBtn, ativo && { borderColor: cor, backgroundColor: cor + '12' }]}
                activeOpacity={0.82}
                onPress={() => {
                  haptic.select();
                  onTamanhoChange(opcao);
                }}
              >
                <Text style={[s.tamanhoTxt, ativo && { color: cor }]}>{opcao}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={s.sheetSection}>Observações</Text>
        <TextInput
          style={s.obsInput}
          placeholder="Ex: sem cebola, molho à parte..."
          placeholderTextColor={C.ink4}
          multiline
          value={observacoes}
          onChangeText={onObservacoesChange}
        />

        <PrimaryButton
          label={`Adicionar · ${formatarPreco(produto.preco)}`}
          color={cor}
          onPress={onAdicionar}
          style={s.sheetCta}
        />
      </View>
    </BottomSheetSimples>
  );
}

const s = StyleSheet.create({
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
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
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
  sheetContent: { gap: 10 },
  sheetEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 2,
  },
  sheetNome: {
    fontFamily: F.headingLg,
    fontSize: 21,
    color: C.ink,
    letterSpacing: 0,
    textAlign: 'center',
  },
  sheetDesc: {
    fontFamily: F.regular,
    fontSize: 13,
    color: C.ink2,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 4,
  },
  sheetSection: {
    fontFamily: F.headingSm,
    fontSize: 14,
    color: C.ink,
    marginTop: 8,
  },
  tamanhoRow: { flexDirection: 'row', gap: 8 },
  tamanhoBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.bg,
  },
  tamanhoTxt: {
    fontFamily: F.bold,
    fontSize: 14,
    color: C.ink2,
  },
  obsInput: {
    minHeight: 92,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg,
    padding: 14,
    fontFamily: F.regular,
    fontSize: 14,
    color: C.ink,
    textAlignVertical: 'top',
  },
  sheetCta: { marginTop: 8 },
});
