import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatarPreco } from '../services/dados';
import { useCarrinho } from '../contexts/CarrinhoContext';
import { C, F, R, S, SHADOW, TYPE } from '../constants/theme';
import Stepper from '../components/Stepper';
import Toast from '../components/Toast';

const TAMANHOS = [
  { id: 'p', label: 'Pequeno', extra: 0 },
  { id: 'm', label: 'Médio', extra: 3.00 },
  { id: 'g', label: 'Grande', extra: 6.00 },
];

const ADICIONAIS_MOCK = [
  { id: 'bacon',   label: 'Bacon extra',   preco: 3.50 },
  { id: 'queijo',  label: 'Queijo duplo',  preco: 2.50 },
  { id: 'molho',   label: 'Molho especial', preco: 1.50 },
  { id: 'scebola', label: 'Sem cebola',    preco: 0 },
];

const CAT_GRADIENTES = {
  entradas:   ['#D97706', '#B45309', '#1A1A2E'],
  principais: ['#E8452C', '#9A1F0D', '#1A1A2E'],
  bebidas:    ['#0891B2', '#065666', '#1A1A2E'],
  sobremesas: ['#7C3AED', '#5B21B6', '#1A1A2E'],
};

function classificarProduto(produto) {
  if (!produto?.emoji) return 'principais';
  if (['🍟', '🥟', '🥑', '🫓', '🍞', '🌭'].includes(produto.emoji)) return 'entradas';
  if (['🥤', '🍲', '🍵', '🧃'].includes(produto.emoji)) return 'bebidas';
  if (['🍮', '🍫', '🫐', '🍓', '🧁'].includes(produto.emoji)) return 'sobremesas';
  return 'principais';
}

export default function ProdutoDetalheScreen({ route, navigation }) {
  const { produto, restaurante } = route.params || {};
  const insets = useSafeAreaInsets();
  const { adicionar } = useCarrinho();
  const cat = classificarProduto(produto);

  const [tamanhoSel, setTamanhoSel] = useState('m');
  const [adicionaisSel, setAdicionaisSel] = useState([]);
  const [observacoes, setObservacoes] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [toastVisivel, setToastVisivel] = useState(false);

  const toggleAdicional = useCallback((id) => {
    setAdicionaisSel(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  const calcTotal = useMemo(() => {
    if (!produto) return 0;
    const base = produto.preco ?? 0;
    const tamanhoExtra = TAMANHOS.find(t => t.id === tamanhoSel)?.extra ?? 0;
    const adicionaisExtra = adicionaisSel.reduce((sum, id) => {
      return sum + (ADICIONAIS_MOCK.find(a => a.id === id)?.preco ?? 0);
    }, 0);
    return (base + tamanhoExtra + adicionaisExtra) * quantidade;
  }, [produto, tamanhoSel, adicionaisSel, quantidade]);

  const handleAdicionar = useCallback(() => {
    if (!produto) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const item = {
      ...produto,
      id: `${produto.id}_${Date.now()}`,
      qtd: 1,
      preco: calcTotal,
      customizacoes: {
        tamanho: tamanhoSel,
        tamanhoLabel: TAMANHOS.find(t => t.id === tamanhoSel)?.label,
        adicionais: adicionaisSel.map(id => ADICIONAIS_MOCK.find(a => a.id === id)),
        observacoes,
      },
    };
    adicionar(item);
    setToastVisivel(true);
    setTimeout(() => navigation.goBack(), 600);
  }, [produto, calcTotal, tamanhoSel, adicionaisSel, observacoes, adicionar, navigation]);

  const gradCores = CAT_GRADIENTES[cat] || [C.brand, C.brandDark, C.midnight];
  const temObs = observacoes.trim().length > 0;

  if (!produto) return null;

  return (
    <View style={s.root}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header com gradiente */}
        <View style={s.headerWrap}>
          <LinearGradient colors={gradCores} style={s.headerGrad}>
            <Text style={s.headerNome}>{produto.nome}</Text>
          </LinearGradient>

          <TouchableOpacity
            style={[s.btnFechar, { top: insets.top + S.sm }]}
            onPress={() => navigation.goBack()}
            hitSlop={12}
            accessibilityLabel="Fechar"
          >
            <X size={22} color={C.white} />
          </TouchableOpacity>
        </View>

        <View style={s.conteudo}>
          {/* Descrição */}
          <Text style={s.descricao}>{produto.descricao}</Text>

          {/* Preço base */}
          <Text style={s.precoLabel}>A partir de</Text>
          <Text style={s.precoValor}>{formatarPreco(produto.preco)}</Text>

          <View style={s.divider} />

          {/* Tamanho */}
          <Text style={s.sectionTitle}>Tamanho</Text>
          <View style={s.tamanhoRow}>
            {TAMANHOS.map(t => {
              const ativo = tamanhoSel === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[s.tamanhoBtn, ativo && s.tamanhoBtnAtivo]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setTamanhoSel(t.id);
                  }}
                  activeOpacity={0.82}
                >
                  <View style={[s.radio, ativo && s.radioAtivo]}>
                    {ativo && <View style={s.radioInner} />}
                  </View>
                  <Text style={[s.tamanhoLabel, ativo && s.tamanhoLabelAtivo]}>{t.label}</Text>
                  <Text style={s.tamanhoExtra}>
                    {t.extra === 0 ? 'Grátis' : `+${formatarPreco(t.extra)}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={s.divider} />

          {/* Adicionais */}
          <Text style={s.sectionTitle}>Adicionais</Text>
          {ADICIONAIS_MOCK.map(a => {
            const ativo = adicionaisSel.includes(a.id);
            return (
              <TouchableOpacity
                key={a.id}
                style={s.adicionalRow}
                onPress={() => {
                  Haptics.selectionAsync();
                  toggleAdicional(a.id);
                }}
                activeOpacity={0.82}
              >
                <View style={[s.checkbox, ativo && s.checkboxAtivo]}>
                  {ativo && <Check size={13} color={C.white} strokeWidth={3} />}
                </View>
                <Text style={[s.adicionalLabel, ativo && s.adicionalLabelAtivo]}>{a.label}</Text>
                <Text style={s.adicionalPreco}>
                  {a.preco === 0 ? 'Grátis' : `+${formatarPreco(a.preco)}`}
                </Text>
              </TouchableOpacity>
            );
          })}

          <View style={s.divider} />

          {/* Observações */}
          <Text style={s.sectionTitle}>Observações</Text>
          <TextInput
            style={[s.obsInput, temObs && s.obsInputFocado]}
            placeholder="Ex: sem molho, bem passado, sem cebola..."
            placeholderTextColor={C.inkLight}
            multiline
            value={observacoes}
            onChangeText={setObservacoes}
            maxLength={140}
            textAlignVertical="top"
          />
          <Text style={s.obsCounter}>{observacoes.length}/140</Text>

          <View style={s.divider} />

          {/* Quantidade */}
          <Text style={s.sectionTitle}>Quantidade</Text>
          <View style={s.stepperRow}>
            <Stepper
              quantidade={quantidade}
              cor={C.brand}
              onAdicionar={() => setQuantidade(q => q + 1)}
              onRemover={() => setQuantidade(q => Math.max(1, q - 1))}
            />
          </View>
        </View>
      </ScrollView>

      {/* CTA sticky */}
      <View style={[s.ctaWrap, { paddingBottom: insets.bottom + S.lg }]}>
        <TouchableOpacity style={s.cta} onPress={handleAdicionar} activeOpacity={0.92}>
          <Text style={s.ctaTxt}>
            Adicionar · {formatarPreco(calcTotal)}
          </Text>
        </TouchableOpacity>
      </View>

      <Toast
        tipo="sucesso"
        mensagem="Adicionado!"
        visivel={toastVisivel}
        onClose={() => setToastVisivel(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.surface,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },

  /* Header */
  headerWrap: {
    height: 220,
  },
  headerGrad: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: S.xl,
    paddingBottom: S.xl,
  },
  headerNome: {
    ...TYPE.h2,
    color: C.white,
  },
  btnFechar: {
    position: 'absolute',
    right: S.lg,
    width: 38,
    height: 38,
    borderRadius: R.full,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Conteúdo */
  conteudo: {
    padding: S.lg,
    gap: S.md,
  },
  descricao: {
    fontFamily: F.body,
    fontSize: 15,
    lineHeight: 23,
    color: C.inkMid,
  },
  precoLabel: {
    fontFamily: F.ui,
    fontSize: 12,
    color: C.inkLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  precoValor: {
    fontFamily: F.monoBold,
    fontSize: 28,
    color: C.brand,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: S.sm,
  },

  /* Section titles */
  sectionTitle: {
    fontFamily: F.uiSemi,
    fontSize: 16,
    color: C.ink,
    marginBottom: S.xs,
  },

  /* Tamanho - radio */
  tamanhoRow: {
    flexDirection: 'row',
    gap: S.sm,
  },
  tamanhoBtn: {
    flex: 1,
    paddingVertical: S.md,
    paddingHorizontal: S.sm,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surfaceAlt,
    alignItems: 'center',
    gap: 4,
  },
  tamanhoBtnAtivo: {
    borderColor: C.midnight,
    backgroundColor: C.surface,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioAtivo: {
    borderColor: C.midnight,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.midnight,
  },
  tamanhoLabel: {
    fontFamily: F.uiMedium,
    fontSize: 14,
    color: C.inkMid,
  },
  tamanhoLabelAtivo: {
    color: C.ink,
  },
  tamanhoExtra: {
    fontFamily: F.mono,
    fontSize: 11,
    color: C.inkLight,
  },

  /* Adicionais - checkbox */
  adicionalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: S.sm,
    gap: S.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: R.sm,
    borderWidth: 1.5,
    borderColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.surface,
  },
  checkboxAtivo: {
    borderColor: C.midnight,
    backgroundColor: C.midnight,
  },
  adicionalLabel: {
    flex: 1,
    fontFamily: F.body,
    fontSize: 14,
    color: C.ink,
  },
  adicionalLabelAtivo: {
    fontFamily: F.bodyMedium,
  },
  adicionalPreco: {
    fontFamily: F.mono,
    fontSize: 12,
    color: C.inkLight,
  },

  /* Observações */
  obsInput: {
    minHeight: 76,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surfaceAlt,
    padding: S.md,
    fontFamily: F.body,
    fontSize: 14,
    color: C.ink,
    lineHeight: 20,
  },
  obsInputFocado: {
    borderColor: C.brand,
  },
  obsCounter: {
    fontFamily: F.mono,
    fontSize: 11,
    color: C.inkLight,
    textAlign: 'right',
    marginTop: 4,
  },

  /* Quantity stepper */
  stepperRow: {
    alignItems: 'center',
    paddingVertical: S.sm,
  },

  /* CTA */
  ctaWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: S.lg,
    paddingTop: S.md,
    backgroundColor: C.surface,
    ...SHADOW.sheet,
  },
  cta: {
    height: 56,
    borderRadius: R.xl,
    backgroundColor: C.brand,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaTxt: {
    fontFamily: F.uiSemi,
    fontSize: 17,
    color: C.white,
  },
});
