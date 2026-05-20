# AGENT 10 — MapaScreen e Geolocalização Real
## Foome — Spec de Desenvolvimento

### Contexto

A MapaScreen atual:
- Centraliza em Vassouras/RJ (hardcoded)
- Exibe markers com emoji dos restaurantes
- Bottom sheet animado ao selecionar um marker
- Botão "Ver cardápio" que navega para RestauranteScreen
- Permissão de localização solicitada mas não usada para centralizar

Problemas:
- Localização hardcoded — não usa a localização real do usuário
- Sem botão "Minha localização"
- Sem filtro por categoria
- Markers sem diferenciação visual por categoria
- Estado de permissão negada não é bem tratado
- Sem indicador de carregamento enquanto obtém localização

### Objetivo

1. **Geolocalização real** — obter posição do usuário e centralizar mapa
2. **Botão "Minha localização"** — flutuante no mapa
3. **Markers customizados por categoria** — cor/ícone diferente por tipo de restaurante
4. **Filtro por categoria** — chips flutuantes sobre o mapa
5. **Bottom sheet melhorado** — animação suave, mais informações
6. **Tratar permissão negada** — mensagem informativa + fallback para Vassouras

### Git Workflow

```bash
git checkout main
git pull origin main
git checkout -b feat/agent-10-map

git add .
git commit -m "feat(mapa): implementar geolocalização real do usuário"
# feat(mapa): criar markers customizados por categoria
# feat(mapa): adicionar filtro por categoria com chips flutuantes
# fix(mapa): tratar permissão de localização negada

git push origin feat/agent-10-map
```

**Regras:**
- Mínimo 3 commits
- Nunca commitar direto na `main`
- Nunca fazer push forçado

### Arquivos a Modificar / Criar

#### MODIFICAR: `screens/MapaScreen.js`

**1. Geolocalização real**

```jsx
import * as Location from 'expo-location';

const [userLoc, setUserLoc] = useState(null);
const [locStatus, setLocStatus] = useState('loading'); // 'loading' | 'granted' | 'denied'
const mapRef = useRef(null);

useEffect(() => {
  (async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocStatus('denied');
        return;
      }
      setLocStatus('granted');
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLoc({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      });
      // Centralizar no usuário
      mapRef.current?.animateToRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }, 500);
    } catch (e) {
      setLocStatus('denied');
    }
  })();
}, []);
```

**Região inicial condicional:**
```jsx
const regiaoInicial = userLoc || VASSOURAS;
```

**2. Botão "Minha localização"**

```jsx
function centralizarNoUsuario() {
  if (userLoc) {
    mapRef.current?.animateToRegion(userLoc, 600);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}
```

Posicionado no canto inferior direito do mapa:
```jsx
<TouchableOpacity
  style={s.myLocBtn}
  onPress={centralizarNoUsuario}
  activeOpacity={0.85}
>
  <Feather name="crosshair" size={18} color={C.brand} />
</TouchableOpacity>
```

Estilo:
```js
myLocBtn: {
  position: 'absolute',
  bottom: 180, // acima do bottom sheet
  right: 16,
  width: 44, height: 44,
  borderRadius: 14,
  backgroundColor: C.surface,
  justifyContent: 'center',
  alignItems: 'center',
  ...SHADOW.float,
  borderWidth: 1,
  borderColor: C.border,
},
```

**3. Markers customizados por categoria**

Criar um mapeamento de cores por categoria:
```jsx
const CATEGORIA_CORES = {
  'Hambúrgueres':  '#E8452C',
  'Pizzas':        '#D97706',
  'Japonês':       '#0891B2',
  'Mexicano':      '#16A34A',
  'Saudável':      '#059669',
  'Massas':        '#7C3AED',
  'Churrasco':     '#B45309',
  'Açaí':          '#9333EA',
};
```

Marker customizado:
```jsx
<Marker
  key={rest.id}
  coordinate={{ latitude: rest.lat, longitude: rest.lng }}
  onPress={() => onPin(rest)}
  tracksViewChanges={false}
>
  <View style={s.pinWrapper}>
    <View style={[
      s.pin,
      { borderColor: CATEGORIA_CORES[rest.categoria] || C.brand },
      selecionado?.id === rest.id && {
        borderWidth: 3,
        backgroundColor: CATEGORIA_CORES[rest.categoria] + '18',
      },
    ]}>
      <Text style={{ fontSize: 20 }}>{rest.emoji}</Text>
    </View>
    {/* Pontinha do pin */}
    <View style={[
      s.pinPoint,
      { borderTopColor: CATEGORIA_CORES[rest.categoria] || C.brand },
    ]} />
  </View>
</Marker>
```

**4. Filtro por categoria (chips flutuantes)**

```jsx
const [filtroCat, setFiltroCat] = useState(null);
const [showFiltro, setShowFiltro] = useState(false);

const CATEGORIAS_MAPA = [
  { key: null,           label: 'Todos',    icon: 'apps-outline' },
  { key: 'Hambúrgueres', label: 'Burgers',  icon: 'fast-food-outline' },
  { key: 'Pizzas',       label: 'Pizza',    icon: 'pizza-outline' },
  { key: 'Japonês',      label: 'Sushi',    icon: 'fish-outline' },
  { key: 'Mexicano',     label: 'Mexicano', icon: 'flame-outline' },
  { key: 'Saudável',     label: 'Saudável', icon: 'leaf-outline' },
  { key: 'Massas',       label: 'Massas',   icon: 'restaurant-outline' },
  { key: 'Churrasco',    label: 'Churrasco',icon: 'bonfire-outline' },
  { key: 'Açaí',         label: 'Açaí',     icon: 'cafe-outline' },
];

const markersFiltrados = filtroCat
  ? RESTAURANTES.filter(r => r.categoria === filtroCat)
  : RESTAURANTES;
```

UI do filtro:
```jsx
{/* Botão de filtro */}
<TouchableOpacity
  style={[s.myLocBtn, { bottom: 232, right: 16 }]}
  onPress={() => setShowFiltro(!showFiltro)}
  activeOpacity={0.85}
>
  <Feather name="sliders" size={18} color={showFiltro ? C.brand : C.ink2} />
</TouchableOpacity>

{/* Chips de filtro */}
{showFiltro && (
  <Animated.View style={s.filtroRow} entering={FadeInUp} exiting={FadeOutDown}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
      {CATEGORIAS_MAPA.map(cat => {
        const ativo = filtroCat === cat.key;
        return (
          <TouchableOpacity
            key={cat.key || 'todos'}
            style={[s.filtroChip, ativo && s.filtroChipOn]}
            onPress={() => setFiltroCat(cat.key)}
          >
            <Ionicons name={cat.icon} size={14} color={ativo ? '#fff' : C.ink2} />
            <Text style={[s.filtroTxt, ativo && s.filtroTxtOn]}>{cat.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </Animated.View>
)}
```

**5. Tratar permissão negada**

```jsx
if (locStatus === 'denied') {
  // Banner informativo no topo (não bloqueia o mapa)
  // O mapa ainda funciona centrado em Vassouras
}
```

Banner de permissão negada:
```jsx
{locStatus === 'denied' && (
  <View style={s.permBanner}>
    <Feather name="map-pin" size={14} color={C.amber} />
    <Text style={s.permTxt}>
      Localização desativada. Mostrando restaurantes em Vassouras/RJ.
    </Text>
    <TouchableOpacity onPress={() => {
      // Tentar solicitar permissão novamente
      Location.requestForegroundPermissionsAsync().then(({ status }) => {
        if (status === 'granted') setLocStatus('granted');
      });
    }}>
      <Text style={s.permBtn}>Ativar</Text>
    </TouchableOpacity>
  </View>
)}
```

**6. Estado de carregamento**

Enquanto obtém localização, mostrar ActivityIndicator no header:
```jsx
{locStatus === 'loading' && (
  <ActivityIndicator size="small" color={C.brand} style={{ marginLeft: 8 }} />
)}
```

**7. Ajustes no bottom sheet**

Melhorar a seleção:
- Adicionar imagem/placeholder do restaurante
- Aumentar touch target do botão "Ver cardápio"
- Animação de entrada com spring (já existe, manter)

**8. Navegação para RestauranteScreen a partir do Mapa**

A MapaScreen está na tab "Mapa", e RestauranteScreen está no Stack aninhado dentro da tab "Home". A navegação correta é:

```jsx
// No botão "Ver cardápio":
navigation.navigate('HomeTab', {
  screen: 'Restaurante',
  params: { restaurante: selecionado },
});
```

Isso navega para a tab Home, e dentro do Stack dela, para a tela Restaurante.

### Requisitos Técnicos

- `expo-location` ~19.0.8 — já instalado
- `react-native-maps` 1.20.1 — já instalado
- Reanimated 4.1.1 — já instalado
- `expo-haptics` — instalado pelo AGENT 05
- Compatível com `CarrinhoContext` (chamar `setRestaurante` antes de navegar)

### Critérios de Entrega

- [ ] Geolocalização real obtida ao montar a tela
- [ ] Mapa centraliza na posição do usuário se permissão concedida
- [ ] Botão "Minha localização" (crosshair) funcional
- [ ] Botão "Filtro" (sliders) abre chips horizontais de categoria
- [ ] Chips de filtro filtrando markers no mapa
- [ ] Markers com cores diferentes por categoria
- [ ] Marker selecionado destacado (borda mais grossa, fundo colorido)
- [ ] Permissão negada: banner informativo, mapa centrado em Vassouras
- [ ] Loading state enquanto obtém localização
- [ ] Bottom sheet com informações completas do restaurante
- [ ] Navegação "Ver cardápio" → RestauranteScreen funcional via HomeTab
- [ ] `setRestaurante()` do CarrinhoContext chamado antes de navegar

### Não Faça

- **Não calcule rota até o restaurante** — apenas mostre a localização no mapa
- **Não implemente tracking em tempo real do usuário** — só posição inicial
- **Não crie geocoding reverso** — endereço "Vassouras/RJ" permanece hardcoded
- **Não altere a estrutura dos dados dos restaurantes** — lat/lng já existem em `services/dados.js`
- **Não use Google Maps Directions API** — sem chamadas externas
