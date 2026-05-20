import React, { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, Trash2, X, QrCode, CreditCard, DollarSign } from 'lucide-react-native';
import { getPagamentos, adicionarPagamento, removerPagamento } from '../services/storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F, R, S, SHADOW } from '../constants/theme';

const DEFAULT_PAGAMENTOS = [{ id: '1', tipo: 'pix', label: 'PIX', sub: 'Chave: seu@email.com', default: true }];

const TIPO_CONFIG = {
  pix: { icon: QrCode, cor: C.success, bg: C.successLight, label: 'PIX' },
  credito: { icon: CreditCard, cor: C.midnight, bg: C.midnightLight, label: 'Crédito' },
  debito: { icon: CreditCard, cor: C.midnight, bg: C.midnightLight, label: 'Débito' },
  dinheiro: { icon: DollarSign, cor: C.warning, bg: C.warningLight, label: 'Dinheiro' },
};

export default function PagamentosScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [pagamentos, setPagamentos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState('pix');
  const [chavePix, setChavePix] = useState('');
  const [numeroCartao, setNumeroCartao] = useState('');
  const [nomeCartao, setNomeCartao] = useState('');
  const [validade, setValidade] = useState('');
  const [cvv, setCvv] = useState('');
  const [salvando, setSalvando] = useState(false);

  useFocusEffect(useCallback(() => { carregar(); }, []));

  async function carregar() {
    let lista = await getPagamentos();
    if (lista.length === 0) {
      for (const p of DEFAULT_PAGAMENTOS) await adicionarPagamento({ tipo: p.tipo, label: p.label, sub: p.sub, default: true });
      lista = await getPagamentos();
    }
    setPagamentos(lista);
  }

  function abrirModal() {
    setTipoSelecionado('pix'); setChavePix(''); setNumeroCartao(''); setNomeCartao(''); setValidade(''); setCvv('');
    setModalVisible(true);
  }

  function formatarNumeroCartao(texto) {
    const d = texto.replace(/\D/g, '').slice(0, 16);
    return d.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  function formatarValidade(texto) {
    const d = texto.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  }

  async function handleAdicionar() {
    if (tipoSelecionado === 'pix') {
      if (!chavePix.trim()) return Alert.alert('Atenção', 'Informe a chave PIX.');
      setSalvando(true);
      await adicionarPagamento({ tipo: 'pix', label: 'PIX', sub: `Chave: ${chavePix.trim()}`, default: false });
    } else {
      if (!numeroCartao.trim() || !nomeCartao.trim() || !validade.trim()) return Alert.alert('Atenção', 'Preencha todos os campos.');
      setSalvando(true);
      await adicionarPagamento({ tipo: tipoSelecionado, label: nomeCartao.trim(), sub: `Final ${numeroCartao.replace(/\D/g, '').slice(-4)}`, default: false });
    }
    setPagamentos(await getPagamentos());
    setSalvando(false);
    setModalVisible(false);
  }

  async function handleRemover(id) {
    await removerPagamento(id);
    setPagamentos(prev => prev.filter(p => p.id !== id));
  }

  return (
    <View style={[s.root, { backgroundColor: C.offWhite }]}>
      <View style={[s.header, { backgroundColor: C.surface, paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={16}><X size={22} color={C.ink} /></TouchableOpacity>
        <Text style={s.headerTitle}>Métodos de Pagamento</Text>
        <TouchableOpacity onPress={abrirModal} hitSlop={16}><Plus size={22} color={C.brand} /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {pagamentos.map(pag => {
          const cfg = TIPO_CONFIG[pag.tipo] || TIPO_CONFIG.credito;
          const IconComp = cfg.icon;
          return (
            <View key={pag.id} style={[s.card, { backgroundColor: C.surface }]}>
              <View style={[s.cardIcon, { backgroundColor: cfg.bg }]}><IconComp size={24} color={cfg.cor} /></View>
              <View style={s.cardInfo}>
                <View style={s.cardTopRow}>
                  <Text style={s.cardLabel}>{pag.label}</Text>
                  {pag.default && <View style={s.badgePadrao}><Text style={s.badgePadraoTxt}>Padrão</Text></View>}
                </View>
                <Text style={s.cardSub}>{pag.sub}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemover(pag.id)} hitSlop={12}><Trash2 size={18} color={C.error} /></TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.modalOverlay}>
          <View style={[s.modalCard, { backgroundColor: C.surface, paddingBottom: insets.bottom + 16 }]}>
            <View style={s.modalHeader}>
              <Text style={[s.modalTitle, { color: C.ink }]}>Adicionar método</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={16}><X size={20} color={C.inkLight} /></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              <Text style={s.inputLabel}>TIPO</Text>
              <View style={s.tiposRow}>
                {['pix', 'credito', 'debito'].map(tipo => {
                  const cfg = TIPO_CONFIG[tipo];
                  const selected = tipoSelecionado === tipo;
                  return (
                    <TouchableOpacity key={tipo} style={[s.tipoBtn, selected && s.tipoBtnSelected, { borderColor: selected ? cfg.cor : C.border }]} onPress={() => setTipoSelecionado(tipo)}>
                      <cfg.icon size={20} color={selected ? cfg.cor : C.inkLight} />
                      <Text style={[s.tipoLabel, { color: selected ? cfg.cor : C.inkMid }]}>{cfg.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {tipoSelecionado === 'pix' ? (
                <>
                  <Text style={s.inputLabel}>CHAVE PIX</Text>
                  <TextInput style={[s.input, { backgroundColor: C.offWhite, color: C.ink, fontFamily: F.mono }]} placeholder="CPF / E-mail / Telefone" placeholderTextColor={C.inkLight} value={chavePix} onChangeText={setChavePix} autoCapitalize="none" />
                </>
              ) : (
                <>
                  <Text style={s.inputLabel}>NÚMERO DO CARTÃO</Text>
                  <TextInput style={[s.input, { backgroundColor: C.offWhite, color: C.ink, fontFamily: F.mono }]} placeholder="0000 0000 0000 0000" placeholderTextColor={C.inkLight} keyboardType="number-pad" maxLength={19} value={numeroCartao} onChangeText={t => setNumeroCartao(formatarNumeroCartao(t))} />
                  <Text style={s.inputLabel}>NOME NO CARTÃO</Text>
                  <TextInput style={[s.input, { backgroundColor: C.offWhite, color: C.ink }]} placeholder="Como está no cartão" placeholderTextColor={C.inkLight} value={nomeCartao} onChangeText={setNomeCartao} autoCapitalize="characters" />
                  <View style={s.row2}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.inputLabel}>VALIDADE</Text>
                      <TextInput style={[s.input, { backgroundColor: C.offWhite, color: C.ink, fontFamily: F.mono }]} placeholder="MM/AA" placeholderTextColor={C.inkLight} keyboardType="number-pad" maxLength={5} value={validade} onChangeText={t => setValidade(formatarValidade(t))} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.inputLabel}>CVV</Text>
                      <TextInput style={[s.input, { backgroundColor: C.offWhite, color: C.ink, fontFamily: F.mono }]} placeholder="123" placeholderTextColor={C.inkLight} keyboardType="number-pad" maxLength={4} value={cvv} onChangeText={setCvv} />
                    </View>
                  </View>
                </>
              )}
              <TouchableOpacity style={[s.btnAdicionar, { backgroundColor: C.brand, opacity: salvando ? 0.6 : 1 }]} onPress={handleAdicionar} disabled={salvando}>
                <Text style={s.btnAdicionarTxt}>{salvando ? 'Salvando...' : 'Adicionar'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: S.lg, paddingBottom: S.md, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTitle: { fontFamily: F.uiBold, fontSize: 18, color: C.ink },
  scroll: { padding: S.lg, paddingBottom: 42 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: R.lg, padding: S.lg, marginBottom: S.md, ...SHADOW.card },
  cardIcon: { width: 48, height: 48, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', marginRight: S.md },
  cardInfo: { flex: 1 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  cardLabel: { fontFamily: F.uiSemi, fontSize: 15, color: C.ink },
  badgePadrao: { backgroundColor: C.midnightLight, borderRadius: R.sm, paddingHorizontal: 8, paddingVertical: 2 },
  badgePadraoTxt: { fontFamily: F.uiSemi, fontSize: 10, color: C.midnight },
  cardSub: { fontFamily: F.body, fontSize: 13, color: C.inkMid, marginTop: 2 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalCard: { borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, paddingHorizontal: S.lg, paddingTop: 18, paddingBottom: S.xl, ...SHADOW.sheet, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  modalTitle: { fontFamily: F.uiBold, fontSize: 21 },
  inputLabel: { fontFamily: F.uiSemi, fontSize: 10, letterSpacing: 1.1, marginBottom: S.sm, marginTop: S.md, color: C.inkLight },
  input: { minHeight: 48, borderRadius: R.md, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, fontFamily: F.body, fontSize: 15 },
  row2: { flexDirection: 'row', gap: S.md },
  tiposRow: { flexDirection: 'row', gap: S.sm },
  tipoBtn: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: S.md, borderRadius: R.md, borderWidth: 1.5 },
  tipoBtnSelected: { borderWidth: 2 },
  tipoLabel: { fontFamily: F.uiSemi, fontSize: 12 },
  btnAdicionar: { height: 52, borderRadius: R.lg, alignItems: 'center', justifyContent: 'center', marginTop: S.xl },
  btnAdicionarTxt: { fontFamily: F.uiBold, fontSize: 16, color: C.white },
});
