import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text,
  TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MapPin, Plus, ChevronRight, Trash2, X, AlertCircle } from 'lucide-react-native';
import { listarEnderecos, adicionarEndereco, removerEndereco, definirEnderecoPadrao } from '../services/enderecos';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { F, R, S, SHADOW } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../utils/useThemedStyles';

const APELIDOS = ['Casa', 'Trabalho', 'Outro'];

export default function EnderecoScreen({ navigation }) {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const [enderecos, setEnderecos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [apelido, setApelido] = useState('Casa');
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [referencia, setReferencia] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      setEnderecos(await listarEnderecos());
    } catch {
      setErro('Não foi possível carregar seus endereços. Verifique sua conexão.');
      setEnderecos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  function formatarCEP(texto) {
    const d = texto.replace(/\D/g, '').slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  }

  function handleCepBlur() {
    if (cep.replace(/\D/g, '').length === 8) {
      if (!bairro) setBairro('Centro');
    }
  }

  function abrirModal() {
    setApelido('Casa'); setCep(''); setRua(''); setNumero(''); setComplemento(''); setBairro(''); setReferencia('');
    setModalVisible(true);
  }

  async function handleSalvar() {
    if (!rua.trim() || !numero.trim()) return Alert.alert('Atenção', 'Preencha rua e número.');
    setSalvando(true);
    try {
      await adicionarEndereco({
        apelido, cep, rua, numero, complemento, bairro, referencia,
        default: enderecos.length === 0,
      });
      await carregar();
      setModalVisible(false);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o endereço. Tente de novo.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleRemover(id) {
    const anterior = enderecos;
    setEnderecos((prev) => prev.filter((e) => e.id !== id));
    try {
      await removerEndereco(id);
    } catch {
      setEnderecos(anterior);
      Alert.alert('Erro', 'Não foi possível remover o endereço.');
    }
  }

  async function handleSetPadrao(id) {
    setEnderecos((prev) => prev.map((e) => ({ ...e, default: e.id === id })));
    try {
      await definirEnderecoPadrao(id);
    } catch {
      carregar();
    }
  }

  return (
    <View style={[s.root, { backgroundColor: C.offWhite }]}>
      <View style={[s.header, { backgroundColor: C.surface, paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={16}>
          <X size={22} color={C.ink} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Meus Endereços</Text>
        <TouchableOpacity onPress={abrirModal} hitSlop={16}>
          <Plus size={22} color={C.brand} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color={C.brand} /></View>
      ) : erro ? (
        <View style={s.center}>
          <AlertCircle size={48} color={C.error} strokeWidth={1.6} />
          <Text style={s.emptyTitulo}>Ops!</Text>
          <Text style={s.emptySub}>{erro}</Text>
          <TouchableOpacity style={s.emptyCta} onPress={carregar} activeOpacity={0.85}>
            <Text style={s.emptyCtaTxt}>Tentar de novo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll}>
          {enderecos.length === 0 ? (
            <View style={s.empty}>
              <MapPin size={56} color={C.inkLight} strokeWidth={1.5} />
              <Text style={s.emptyTitulo}>Nenhum endereço salvo</Text>
              <Text style={s.emptySub}>Adicione um endereço para facilitar seus pedidos</Text>
              <TouchableOpacity style={s.emptyCta} onPress={abrirModal} activeOpacity={0.85}>
                <Plus size={18} color={C.white} /><Text style={s.emptyCtaTxt}>Adicionar endereço</Text>
              </TouchableOpacity>
            </View>
          ) : enderecos.map((end) => (
            <View key={end.id} style={[s.card, end.default && s.cardDefault]}>
              <TouchableOpacity style={s.cardBody} onPress={() => handleSetPadrao(end.id)} activeOpacity={0.75}>
                <MapPin size={20} color={C.brand} />
                <View style={s.cardInfo}>
                  <View style={s.cardTopRow}>
                    <Text style={s.cardRua} numberOfLines={1}>
                      {end.apelido ? `${end.apelido} · ` : ''}{end.rua}, {end.numero}
                    </Text>
                    {end.default && <View style={s.badgePadrao}><Text style={s.badgePadraoTxt}>Padrão</Text></View>}
                  </View>
                  <Text style={s.cardComplemento} numberOfLines={1}>{[end.complemento, end.bairro].filter(Boolean).join(' — ')}</Text>
                  <Text style={s.cardCidade}>{end.cep ? `CEP ${end.cep} · ` : ''}Vassouras, RJ</Text>
                </View>
                <ChevronRight size={18} color={C.inkLight} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleRemover(end.id)} hitSlop={12}>
                <Trash2 size={18} color={C.error} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.modalOverlay}>
          <View style={[s.modalCard, { backgroundColor: C.surface, paddingBottom: insets.bottom + 16 }]}>
            <View style={s.modalHeader}>
              <Text style={[s.modalTitle, { color: C.ink }]}>Adicionar endereço</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={16}>
                <X size={20} color={C.inkLight} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false}>
              <Text style={s.inputLabel}>APELIDO</Text>
              <View style={s.apelidoRow}>
                {APELIDOS.map((a) => {
                  const sel = apelido === a;
                  return (
                    <TouchableOpacity key={a} style={[s.apelidoChip, sel && { backgroundColor: C.brandLight, borderColor: C.brand }]} onPress={() => setApelido(a)} activeOpacity={0.85}>
                      <Text style={[s.apelidoTxt, sel && { color: C.brand }]}>{a}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={s.inputLabel}>CEP</Text>
              <TextInput style={[s.input, { backgroundColor: C.offWhite, color: C.ink, fontFamily: F.mono }]} placeholder="00000-000" placeholderTextColor={C.inkLight} keyboardType="number-pad" maxLength={9} value={cep} onChangeText={t => setCep(formatarCEP(t))} onBlur={handleCepBlur} />
              <Text style={s.inputLabel}>RUA</Text>
              <TextInput style={[s.input, { backgroundColor: C.offWhite, color: C.ink }]} placeholder="Nome da rua" placeholderTextColor={C.inkLight} value={rua} onChangeText={setRua} />
              <View style={s.row2}>
                <View style={{ flex: 1 }}>
                  <Text style={s.inputLabel}>NÚMERO</Text>
                  <TextInput style={[s.input, { backgroundColor: C.offWhite, color: C.ink }]} placeholder="Nº" placeholderTextColor={C.inkLight} keyboardType="number-pad" value={numero} onChangeText={setNumero} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.inputLabel}>COMPLEMENTO</Text>
                  <TextInput style={[s.input, { backgroundColor: C.offWhite, color: C.ink }]} placeholder="Apto / Bloco" placeholderTextColor={C.inkLight} value={complemento} onChangeText={setComplemento} />
                </View>
              </View>
              <Text style={s.inputLabel}>BAIRRO</Text>
              <TextInput style={[s.input, { backgroundColor: C.offWhite, color: C.ink }]} placeholder="Seu bairro" placeholderTextColor={C.inkLight} value={bairro} onChangeText={setBairro} />
              <Text style={s.inputLabel}>PONTO DE REFERÊNCIA <Text style={{ color: C.inkLight, fontFamily: F.body }}>(opcional)</Text></Text>
              <TextInput style={[s.input, { backgroundColor: C.offWhite, color: C.ink }]} placeholder="Ex: Próximo ao mercado X" placeholderTextColor={C.inkLight} value={referencia} onChangeText={setReferencia} />
              <TouchableOpacity style={[s.btnSalvar, { backgroundColor: C.brand, opacity: salvando ? 0.6 : 1 }]} onPress={handleSalvar} disabled={salvando}>
                <Text style={s.btnSalvarTxt}>{salvando ? 'Salvando...' : 'Salvar endereço'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const makeStyles = (C) => StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: S.lg, paddingBottom: S.md, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTitle: { fontFamily: F.uiBold, fontSize: 18, color: C.ink },
  scroll: { padding: S.lg, paddingBottom: 42 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: S.xl, gap: S.sm },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: S.xl },
  emptyTitulo: { fontFamily: F.uiSemi, fontSize: 17, color: C.ink, marginTop: S.lg },
  emptySub: { fontFamily: F.body, fontSize: 14, color: C.inkLight, textAlign: 'center', marginTop: S.sm, lineHeight: 20 },
  emptyCta: { flexDirection: 'row', alignItems: 'center', gap: S.sm, backgroundColor: C.brand, borderRadius: R.md, paddingHorizontal: S.xl, paddingVertical: S.md, marginTop: S.xl },
  emptyCtaTxt: { fontFamily: F.uiSemi, fontSize: 15, color: C.white },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: R.lg, padding: S.lg, marginBottom: S.md, ...SHADOW.card },
  cardDefault: { borderWidth: 2, borderColor: C.midnight },
  cardBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: S.md },
  cardInfo: { flex: 1 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  cardRua: { fontFamily: F.uiSemi, fontSize: 14, color: C.ink, flex: 1 },
  badgePadrao: { backgroundColor: C.midnightLight, borderRadius: R.sm, paddingHorizontal: 8, paddingVertical: 2 },
  badgePadraoTxt: { fontFamily: F.uiSemi, fontSize: 10, color: C.midnight },
  cardComplemento: { fontFamily: F.body, fontSize: 12, color: C.inkMid, marginTop: 2 },
  cardCidade: { fontFamily: F.body, fontSize: 12, color: C.inkLight, marginTop: 1 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalCard: { borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, paddingHorizontal: S.lg, paddingTop: 18, paddingBottom: S.xl, ...SHADOW.sheet, maxHeight: '88%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  modalTitle: { fontFamily: F.uiBold, fontSize: 21 },
  inputLabel: { fontFamily: F.uiSemi, fontSize: 10, letterSpacing: 1.1, marginBottom: S.sm, marginTop: S.md, color: C.inkLight },
  input: { minHeight: 48, borderRadius: R.md, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, fontFamily: F.body, fontSize: 15 },
  row2: { flexDirection: 'row', gap: S.md },
  apelidoRow: { flexDirection: 'row', gap: S.sm },
  apelidoChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: R.md, borderWidth: 1.5, borderColor: C.border },
  apelidoTxt: { fontFamily: F.uiSemi, fontSize: 13, color: C.inkMid },
  btnSalvar: { height: 52, borderRadius: R.lg, alignItems: 'center', justifyContent: 'center', marginTop: S.xl },
  btnSalvarTxt: { fontFamily: F.uiBold, fontSize: 16, color: C.white },
});
