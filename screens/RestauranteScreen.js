import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Animated as RNAnimated,
} from 'react-native';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { Feather, Ionicons } from '../components/Icon';
import { formatarPreco } from '../services/dados';
import { obterRestaurante } from '../services/restaurantes';
import CategoriaIcone from '../components/CategoriaIcone';
import { getNotaMediaRestaurante } from '../services/avaliacao';
import { useCarrinho } from '../contexts/CarrinhoContext';
import { F, SHADOW } from '../constants/theme';
import RestauranteProdutoCard from '../components/RestauranteProdutoCard';
import SubcategoriaTabs from '../components/SubcategoriaTabs';
import ProdutoDetalhesSheet from '../components/ProdutoDetalhesSheet';
import { haptic } from '../utils/haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useThemedStyles } from '../utils/useThemedStyles';

const HEADER_MAX = 220;
const HEADER_MIN = 100;
const SCROLL_OFFSET = HEADER_MAX - HEADER_MIN;

const SUBCATEGORIAS = [
  { key: 'todas', label: 'Todas' },
  { key: 'entradas', label: 'Entradas' },
  { key: 'principais', label: 'Principais' },
  { key: 'bebidas', label: 'Bebidas' },
  { key: 'sobremesas', label: 'Sobremesas' },
];

function classificarProduto(produto) {
  const t = `${produto.nome} ${produto.descricao || ''}`.toLowerCase();
  if (/(suco|refrigerante|bebida|smoothie|vitamina|água|agua|cerveja|drink|shake|missoshiru)/.test(t)) return 'bebidas';
  if (/(sobremesa|tiramisu|tigela|doce|brownie|pudim|sorvete|mousse|nutella|paçoca|pacoca)/.test(t)) return 'sobremesas';
  if (/(batata|porção|porcao|entrada|bruschetta|nachos|gyoza|guacamole|fritas|linguiça|linguica)/.test(t)) return 'entradas';
  return 'principais';
}

export default function RestauranteScreen({ route, navigation }) {
  const { C } = useTheme();
  const s = useThemedStyles(makeStyles);
  const restaurante = route?.params?.restaurante;
  const { adicionar, remover, totalItens, totalPreco, itens, setRestaurante } = useCarrinho();
  const [notaMedia, setNotaMedia] = useState(null);
  const [produtos, setProdutos] = useState(restaurante?.produtos ?? []);
  const [menuLoading, setMenuLoading] = useState(true);
  const [subCat, setSubCat] = useState('todas');
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [tamanho, setTamanho] = useState('M');
  const [observacoes, setObservacoes] = useState('');
  const scrollY = useRef(new RNAnimated.Value(0)).current;
  const badgeScale = useSharedValue(1);

  useEffect(() => {
    if (restaurante) setRestaurante(restaurante);
  }, [restaurante?.id]);

  useEffect(() => {
    let ativo = true;

    async function carregarNotaMedia() {
      if (!restaurante?.nome) return;
      const media = await getNotaMediaRestaurante(restaurante.nome);
      if (ativo) setNotaMedia(media);
    }

    carregarNotaMedia();
    return () => {
      ativo = false;
    };
  }, [restaurante?.nome]);

  // O menu não vem na listagem — busca o restaurante completo pela API.
  useEffect(() => {
    let ativo = true;
    if (!restaurante?.id) return undefined;
    setMenuLoading(true);
    obterRestaurante(restaurante.id)
      .then(full => { if (ativo) setProdutos(full.produtos || []); })
      .catch(() => {})
      .finally(() => { if (ativo) setMenuLoading(false); });
    return () => { ativo = false; };
  }, [restaurante?.id]);

  useEffect(() => {
    if (totalItens > 0) {
      badgeScale.value = withSequence(
        withSpring(1.3, { damping: 8, stiffness: 220 }),
        withSpring(1, { damping: 9, stiffness: 220 }),
      );
    }
  }, [totalItens]);

  const qtd = id => itens.find(item => item.id === id)?.qtd ?? 0;
  const produtosFiltrados = useMemo(() => {
    if (subCat === 'todas') return produtos;
    return produtos.filter(produto => classificarProduto(produto) === subCat);
  }, [produtos, subCat]);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, SCROLL_OFFSET],
    outputRange: [HEADER_MAX, HEADER_MIN],
    extrapolate: 'clamp',
  });
  const emojiSize = scrollY.interpolate({
    inputRange: [0, SCROLL_OFFSET],
    outputRange: [44, 24],
    extrapolate: 'clamp',
  });
  const nomeSize = scrollY.interpolate({
    inputRange: [0, SCROLL_OFFSET],
    outputRange: [22, 16],
    extrapolate: 'clamp',
  });
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_OFFSET / 2, SCROLL_OFFSET],
    outputRange: [1, 0.5, 0.3],
    extrapolate: 'clamp',
  });
  const handleScroll = RNAnimated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false },
  );
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  function abrirDetalhes(produto) {
    haptic.select();
    setProdutoSelecionado(produto);
    setTamanho('M');
    setObservacoes('');
    setSheetVisible(true);
  }

  function fecharDetalhes() {
    haptic.select();
    setSheetVisible(false);
  }

  function descartarDetalhes() {
    setProdutoSelecionado(null);
    setObservacoes('');
    setTamanho('M');
  }

  function adicionarSelecionado() {
    if (!produtoSelecionado) return;
    haptic.light();
    adicionar(produtoSelecionado);
    setSheetVisible(false);
  }

  if (!restaurante) return null;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={restaurante.cor} />

      <RNAnimated.View style={[s.header, { backgroundColor: restaurante.cor, height: headerHeight }]}>
        <TouchableOpacity
          onPress={() => {
            haptic.select();
            navigation.goBack();
          }}
          style={s.backBtn}
        >
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>

        <RNAnimated.View style={[s.headerInfo, { opacity: headerOpacity }]}>
          <CategoriaIcone categoria={restaurante.categoria} size={32} color={C.white} />
          <RNAnimated.Text style={[s.headerNome, { fontSize: nomeSize }]}>
            {restaurante.nome}
          </RNAnimated.Text>
          <View style={s.badges}>
            <View style={s.badge}>
              <Ionicons name="star" size={11} color={C.amber} />
              <Text style={s.badgeTxt}>{(notaMedia ?? restaurante.avaliacao).toFixed(1)}</Text>
            </View>
            <View style={s.badge}>
              <Feather name="clock" size={11} color="rgba(255,255,255,0.75)" />
              <Text style={s.badgeTxt}>{restaurante.tempo}</Text>
            </View>
            <View style={[s.badge, restaurante.entrega === 'Grátis' && s.badgeWhite]}>
              {restaurante.entrega === 'Grátis' && (
                <Feather name="check" size={11} color={C.teal} />
              )}
              <Text style={[s.badgeTxt, restaurante.entrega === 'Grátis' && { color: C.teal }]}>
                {restaurante.entrega}
              </Text>
            </View>
          </View>
        </RNAnimated.View>
      </RNAnimated.View>

      <RNAnimated.FlatList
        data={produtosFiltrados}
        keyExtractor={item => item.id}
        contentContainerStyle={s.lista}
        ListHeaderComponent={(
          <SubcategoriaTabs
            tabs={SUBCATEGORIAS}
            atual={subCat}
            onChange={setSubCat}
            cor={restaurante.cor}
          />
        )}
        ListEmptyComponent={<Text style={s.emptyTxt}>Sem itens nessa categoria</Text>}
        stickyHeaderIndices={[0]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <RestauranteProdutoCard
            item={item}
            cor={restaurante.cor}
            quantidade={qtd(item.id)}
            onAdicionar={() => adicionar(item)}
            onRemover={() => remover(item.id)}
            onPress={() => abrirDetalhes(item)}
          />
        )}
      />

      {totalItens > 0 && (
        <View style={[s.cta, { backgroundColor: restaurante.cor }]}>
          <TouchableOpacity
            testID="btn-ver-carrinho"
            style={s.ctaPress}
            accessibilityRole="button"
            accessibilityLabel={`Ver carrinho, ${totalItens} itens, total ${formatarPreco(totalPreco)}`}
            onPress={() => {
              haptic.select();
              navigation.navigate('Carrinho');
            }}
            activeOpacity={0.88}
          >
            <Reanimated.View style={[s.ctaBadge, badgeStyle]}>
              <Text style={s.ctaBadgeTxt}>{totalItens}</Text>
            </Reanimated.View>
            <Text style={s.ctaLabel}>Ver carrinho</Text>
            <Text style={s.ctaTotal}>{formatarPreco(totalPreco)}</Text>
          </TouchableOpacity>
        </View>
      )}

      <ProdutoDetalhesSheet
        visible={sheetVisible}
        produto={produtoSelecionado}
        cor={restaurante.cor}
        tamanho={tamanho}
        observacoes={observacoes}
        onTamanhoChange={setTamanho}
        onObservacoesChange={setObservacoes}
        onAdicionar={adicionarSelecionado}
        onClose={fecharDetalhes}
        onDismiss={descartarDetalhes}
      />
    </View>
  );
}

const makeStyles = (C) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    paddingTop: Platform.OS === 'ios' ? 52 : 42,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 18,
    overflow: 'hidden',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    top: Platform.OS === 'ios' ? 52 : 42,
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: { alignItems: 'center' },
  headerEmoji: { marginBottom: 6 },
  headerNome: {
    fontFamily: F.headingLg,
    fontSize: 22,
    color: '#fff',
    letterSpacing: 0,
    marginBottom: 10,
  },
  badges: { flexDirection: 'row', gap: 6 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeWhite: { backgroundColor: '#fff' },
  badgeTxt: { fontFamily: F.medium, fontSize: 12, color: '#fff' },
  lista: { padding: 16, paddingBottom: 120 },
  emptyTxt: {
    fontFamily: F.medium,
    fontSize: 13,
    color: C.ink3,
    textAlign: 'center',
    paddingVertical: 26,
  },
  cta: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    borderRadius: 20,
    padding: 0,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOW.float,
  },
  ctaPress: {
    flex: 1,
    minHeight: 64,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaBadge: {
    backgroundColor: 'rgba(255,255,255,0.24)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  ctaBadgeTxt: { fontFamily: F.bold, fontSize: 13, color: '#fff' },
  ctaLabel: { fontFamily: F.heading, fontSize: 16, color: '#fff', flex: 1 },
  ctaTotal: { fontFamily: F.bold, fontSize: 16, color: '#fff' },
});
