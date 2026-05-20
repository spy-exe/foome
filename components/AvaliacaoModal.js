import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  Modal, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Star, Check, ArrowRight, X } from 'lucide-react-native';
import { salvarAvaliacao } from '../services/avaliacao';
import { C, F, R, S, SHADOW } from '../constants/theme';
import { ICON_SIZE } from '../constants/icons';
import { haptic } from '../utils/haptics';

const TITULOS_POR_NOTA = {
  1: 'Que pena...',
  2: 'Poderia ser melhor',
  3: 'Foi ok',
  4: 'Gostou!',
  5: 'Adorou!',
};

export default function AvaliacaoModal({ visivel, pedido, onClose }) {
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    if (visivel) {
      setNota(0);
      setComentario('');
      setEnviado(false);
    }
  }, [visivel, pedido?.id]);

  async function enviar() {
    if (nota === 0) {
      haptic.warning();
      return;
    }

    await salvarAvaliacao(pedido.id, {
      nota,
      comentario: comentario.trim(),
      restauranteNome: pedido.restaurante,
    });

    haptic.success();
    setEnviado(true);
    setTimeout(() => { onClose(); }, 1200);
  }

  if (!pedido) return null;

  const titulo = TITULOS_POR_NOTA[nota] || 'Como foi seu pedido?';

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.modal}>
          {enviado ? (
            <View style={s.enviadoWrap}>
              <View style={s.checkCircle}><Check size={ICON_SIZE.lg} color="#fff" /></View>
              <Text style={s.enviadoTxt}>Obrigado pela avaliação!</Text>
            </View>
          ) : (
            <>
              <Text style={s.titulo}>{titulo}</Text>
              <Text style={s.subtitulo}>{pedido.restaurante}</Text>

              <View style={s.stars}>
                {[1, 2, 3, 4, 5].map(n => (
                  <TouchableOpacity
                    key={n}
                    onPress={() => { haptic.select(); setNota(n); }}
                    hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                    activeOpacity={0.7}
                  >
                    <Star
                      size={40}
                      color={n <= nota ? C.warning : C.inkLight}
                      fill={n <= nota ? C.warning : 'transparent'}
                      style={n <= nota ? undefined : { opacity: 0.35 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={s.input}
                placeholder="Conte como foi (opcional)..."
                placeholderTextColor={C.inkLight}
                multiline
                value={comentario}
                onChangeText={setComentario}
                maxLength={200}
              />

              <View style={s.acoes}>
                <TouchableOpacity
                  style={[s.btnEnviar, nota === 0 && s.btnOff]}
                  onPress={enviar}
                  activeOpacity={0.85}
                  disabled={nota === 0}
                >
                  <Text style={s.btnEnviarTxt}>Enviar</Text>
                  <ArrowRight size={16} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.btnPular}
                  onPress={() => { haptic.select(); onClose(); }}
                  activeOpacity={0.7}
                >
                  <Text style={s.btnPularTxt}>Agora não</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(23,23,43,0.5)',
    justifyContent: 'center', padding: S.xl,
  },
  modal: {
    backgroundColor: C.surface, borderRadius: R.xl, padding: S.xl,
    alignItems: 'center', ...SHADOW.sheet,
  },
  titulo: { fontFamily: F.uiBold, fontSize: 24, color: C.ink, letterSpacing: -0.5, marginBottom: 4 },
  subtitulo: { fontFamily: F.body, fontSize: 13, color: C.inkLight, marginBottom: 20 },
  stars: { flexDirection: 'row', gap: S.sm, marginBottom: 20 },
  input: {
    width: '100%', minHeight: 80,
    borderWidth: 1, borderColor: C.border, borderRadius: R.md, padding: S.md,
    fontFamily: F.body, fontSize: 14, color: C.ink, textAlignVertical: 'top',
    backgroundColor: C.offWhite, marginBottom: 20,
  },
  acoes: { width: '100%', gap: S.md },
  btnEnviar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm,
    backgroundColor: C.brand, borderRadius: R.lg, height: 50,
    ...SHADOW.float, shadowColor: C.brand, shadowOpacity: 0.3,
  },
  btnOff: { opacity: 0.5 },
  btnEnviarTxt: { fontFamily: F.uiBold, fontSize: 16, color: '#fff' },
  btnPular: { alignItems: 'center', paddingVertical: S.sm },
  btnPularTxt: { fontFamily: F.uiSemi, fontSize: 14, color: C.inkLight },

  enviadoWrap: { alignItems: 'center', paddingVertical: S.lg },
  checkCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: C.success, justifyContent: 'center', alignItems: 'center', marginBottom: S.lg },
  enviadoTxt: { fontFamily: F.uiBold, fontSize: 17, color: C.success },
});
