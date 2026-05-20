# Foome - Relatorio de Usabilidade e QA

## Escopo e metodo

Esta auditoria foi feita por leitura estatica do codigo-fonte em 20/05/2026, sem executar o app, conforme a spec do Agent 15. O relatorio considera o estado atual do worktree, incluindo arquivos ainda nao versionados de agentes anteriores.

## 1. Mapeamento de Fluxos

### 1.1 Fluxo de Autenticacao

**Happy path - cadastro atual:**
1. Usuario abre o app sem sessao salva e ve `LoginScreen`.
2. Toca em "Cadastre-se gratis" e navega para `CadastroScreen`.
3. Preenche nome, email e senha.
4. Toca no placeholder de avatar e abre a camera frontal.
5. Concede permissao de camera, tira foto e ve preview.
6. Toca em "Usar esta foto" e retorna ao formulario com foto visivel.
7. Toca em "Criar conta".
8. O app salva o usuario no `AsyncStorage` e chama `login(usuario)`.
9. Como `App.js` troca o stack quando existe usuario, o app entra direto na `HomeScreen`.

**Divergencia relevante:** a spec esperava voltar para `LoginScreen` apos criar conta, mas `screens/CadastroScreen.js:48-51` autentica o usuario imediatamente.

**Happy path - login com biometria:**
1. Usuario com conta salva abre o app.
2. Ve o card "Bem-vindo de volta" e o botao "Entrar com biometria".
3. Toca no botao biometrico.
4. `services/biometria.js` valida hardware, cadastro biometrico e chama `authenticateAsync`.
5. Se `success`, `LoginScreen` chama `login(usuario)` e o app navega para `HomeScreen`.

**Happy path - login com senha:**
1. Usuario preenche email e senha.
2. Toca em "Entrar".
3. `LoginScreen` compara `email.trim()` e `senha` com o usuario salvo.
4. Se os valores forem identicos, chama `login(usuario)`.
5. Se algum valor divergir, mostra alerta "Dados incorretos".

**Edge cases:**
- [ ] Usuario sem conta salva toca biometria: alerta "Crie uma conta primeiro".
- [ ] Dispositivo sem hardware biometrico: alerta vindo de `services/biometria.js`.
- [ ] Usuario sem biometria cadastrada: alerta "Nenhuma biometria cadastrada no dispositivo".
- [ ] Permissao de camera negada: tela bloqueada com botao "Permitir camera".
- [ ] Campos vazios no cadastro: alerta "Preencha todos os campos".
- [ ] Foto ausente no cadastro: alerta "Foto obrigatoria".
- [ ] Email sem `@`: nao ha validacao.
- [ ] Senha com menos de 6 caracteres: placeholder fala "Minimo 6 caracteres", mas nao ha validacao.
- [ ] Email com maiusculas/minusculas diferentes: cadastro salva como digitado e login compara sem normalizar.

### 1.2 Fluxo de Navegacao Principal

**Estado atual da navegacao:**
1. `App.js` usa apenas Stack Navigator.
2. O app nao tem Tab Navigator, embora `@react-navigation/bottom-tabs` esteja em `package.json`.
3. Quando `usuario` existe, as rotas disponiveis sao `Home`, `Restaurante`, `Carrinho`, `Pedidos`, `Mapa`, `Perfil` e `Cadastro`.
4. Quando `usuario` nao existe, as rotas disponiveis sao `Login` e `Cadastro`.

**Happy path - pedido completo:**
1. `HomeScreen` mostra header, busca, banner, categorias, favoritos se existirem e lista de restaurantes.
2. Usuario toca num restaurante.
3. `HomeScreen` define o restaurante no `CarrinhoContext` e navega para `RestauranteScreen`.
4. Usuario adiciona itens com `Stepper`.
5. CTA flutuante aparece quando `totalItens > 0`.
6. Usuario toca "Ver carrinho" e navega para `CarrinhoScreen`.
7. Carrinho mostra itens, subtotal, entrega, cupom, endereco, pagamento e total.
8. Usuario pode aplicar `FOOME10` para 10% de desconto.
9. Usuario toca "Confirmar pedido".
10. App exige biometria, salva pedido no `AsyncStorage`, limpa carrinho, exibe toast e navega para `PedidosScreen`.
11. `PedidosScreen` mostra pedido com status inicial "Confirmado".

**Edge cases:**
- [ ] Carrinho sem restaurante: `CarrinhoScreen` retorna `null`, gerando tela em branco.
- [ ] Carrinho vazio com restaurante preservado: empty state aparece e botao de confirmar fica desabilitado.
- [ ] Remover todos os itens por swipe: o footer continua com subtotal/entrega/total zerados.
- [ ] Trocar de restaurante no meio do pedido: `CarrinhoContext` limpa itens do restaurante anterior.
- [ ] Repetir ultimo pedido: FAB aparece apenas quando existe pedido salvo.
- [ ] Sem pedidos: `PedidosScreen` mostra empty state com CTA para `Home`.

### 1.3 Fluxo de Mapa

**Happy path atual:**
1. Usuario toca no botao de mapa na `HomeScreen`.
2. `MapaScreen` abre com `initialRegion` fixa em Vassouras/RJ.
3. App pede permissao de localizacao.
4. Se permissao for concedida, `showsUserLocation` fica ativo.
5. Usuario toca num marker e bottom sheet sobe.
6. Usuario toca "Ver cardapio", o restaurante e definido no `CarrinhoContext` e o app navega para `RestauranteScreen`.

**Edge cases:**
- [ ] Permissao negada: mapa continua funcionando em Vassouras/RJ.
- [ ] Permissao concedida: mostra localizacao do usuario, mas nao centraliza no usuario.
- [ ] GPS desligado: nao ha tentativa de buscar coordenadas, logo o fallback continua sendo Vassouras.
- [ ] Tocar fora do bottom sheet: `onPress` do mapa fecha o sheet.
- [ ] Filtro por categoria no mapa: nao existe no codigo atual.
- [ ] Botao de centralizar localizacao: nao existe no codigo atual.

### 1.4 Fluxo de Pedidos e Avaliacao

**Happy path atual:**
1. Apos confirmar um pedido, o app salva o pedido com status `confirmado`.
2. `PedidosScreen` carrega pedidos via `getPedidos`.
3. A cada 10 segundos, todos os pedidos avancam um status: `confirmado` -> `preparando` -> `a_caminho` -> `entregue`.
4. Quando um pedido chega em `entregue`, o app agenda modal de avaliacao.
5. Usuario escolhe 1 a 5 estrelas, escreve comentario opcional e envia.
6. Avaliacao e salva em `@foome_avaliacoes`.

**Edge cases:**
- [ ] Pedidos antigos tambem avancam quando a tela fica aberta.
- [ ] Nao ha tela de detalhe do pedido nem timeline visual dedicada.
- [ ] Se `salvarPedidos` falhar durante avanco automatico, a falha nao e tratada.
- [ ] Modal de avaliacao exige nota, mas comentario e opcional.

### 1.5 Fluxo de Perfil e Configuracoes

**Estado atual:**
1. `HomeScreen` permite tocar no avatar e navegar para `Perfil`.
2. `PerfilScreen` existe, mas mostra apenas "Perfil" e "Em breve...".
3. Nao ha edicao de dados, dark mode via UI, alterar senha ou logout pela tela.

## 2. Checklist Mobile (WCAG e Boas Praticas)

### 2.1 Touch targets

| Componente | Local | Medida observada | Conforme? | Observacao |
|---|---|---:|---|---|
| PrimaryButton | `components/PrimaryButton.js:32-40` | 54px altura | Sim | Atende minimo de 44px. |
| InputField | `components/InputField.js:20-29` | 52px altura | Sim | Atende minimo de 44px. |
| Stepper adicionar inicial | `components/Stepper.js:68-73` | 36x36 | Nao | Abaixo de 44x44. |
| Stepper +/- | `components/Stepper.js:75-81` | 32x32 | Nao | Abaixo de 44x44. |
| Back do restaurante | `screens/RestauranteScreen.js:193-202` | 40x40 | Nao | Abaixo de 44x44. |
| Back do carrinho | `screens/CarrinhoScreen.js:534-542` | 40x40 | Nao | Abaixo de 44x44. |
| Back do mapa | `screens/MapaScreen.js:180-188` | 42x42 | Quase | 2px abaixo do minimo. |
| Chips de categoria | `screens/HomeScreen.js:525-535` | altura variavel | Atencao | Padding vertical 9; precisa validar no device. |
| Botao de biometria | `screens/LoginScreen.js:261-270` | padding 16 + icone 46 | Sim | Area confortavel. |

### 2.2 Contraste de cores

| Combinacao | Local principal | Contraste estimado | Conforme? | Observacao |
|---|---|---:|---|---|
| `#E8452C` + branco | CTAs principais | ~4.0:1 | Atencao | Pode falhar para texto pequeno; melhor escurecer brand ou aumentar peso/tamanho. |
| `#17172B` + branco | Texto principal | ~16:1 | Sim | Excelente. |
| `#4A4A6A` + `#F5F5FA` | Texto secundario | ~7:1 | Sim | Adequado. |
| `#9494B2` + `#F5F5FA` | captions/placeholders | ~2.5:1 | Nao | `ink3` e fraco para texto informativo. |
| `#00BE99` + branco | sucesso/frete gratis | ~2.3:1 | Nao | Verde atual deve ser reservado a elementos grandes ou escurecido. |
| `#FF9B3D` + `#FFF4E8` | avisos/estrelas | baixo | Atencao | Usar com icones grandes ou texto escuro associado. |

### 2.3 Keyboard avoiding e formularios

| Tela | KeyboardAvoidingView | ScrollView/FlatList | Conforme? | Observacao |
|---|---|---|---|---|
| LoginScreen | Sim | Sim | Sim | `KeyboardAvoidingView` envolve `ScrollView`. |
| CadastroScreen | Nao | Sim | Atencao | Em telas pequenas, senha/botao podem ficar sob teclado. |
| CarrinhoScreen | Nao | FlatList + TextInput de cupom | Atencao | Campo de cupom fica no meio da lista; footer fixo pode competir com teclado. |
| PedidosScreen | Nao | Modal com TextInput | Atencao | Modal de avaliacao nao evita teclado explicitamente. |

### 2.4 Scroll, performance e estado

- [x] Markers do mapa usam `tracksViewChanges={false}` em `screens/MapaScreen.js:73-78`.
- [x] Listas principais de restaurante/produto usam dimensoes estaveis em cards.
- [x] Home tem pull-to-refresh com shimmer visual.
- [ ] `RestauranteScreen` usa `FlatList`, mas sem `getItemLayout`.
- [ ] `CarrinhoScreen` usa `FlatList`, mas footer fixo pode reduzir area util em telas menores.
- [ ] `PedidosScreen` atualiza todos os pedidos a cada 10s enquanto a tela esta aberta.
- [ ] `HomeScreen` filtra busca a cada tecla sem debounce; aceitavel com 8 restaurantes, mas nao escala.

## 3. Relatorio de Bugs

### 3.1 Criticos

| ID | Arquivo | Linha | Descricao | Severidade |
|---|---|---:|---|---|
| B01 | `screens/CadastroScreen.js` | 48-49 | Cadastro salva `senha` em texto puro no `AsyncStorage`, apesar de existir `services/auth.js` com hash. | Critico |
| B02 | `screens/LoginScreen.js` | 103 | Login compara senha em texto puro (`senha !== usuario.senha`) e ignora `senhaHash`; quebra usuarios migrados/hasheados. | Critico |
| B03 | `screens/PerfilScreen.js` | 6-11 | Rota `Perfil` esta exposta em `App.js`, mas a tela e apenas placeholder "Em breve..."; fluxo de perfil/logout/dark mode fica indisponivel. | Critico |

### 3.2 Altos

| ID | Arquivo | Linha | Descricao | Severidade |
|---|---|---:|---|---|
| B04 | `screens/CadastroScreen.js` | 37-51 | Cadastro nao usa `services/auth.cadastrar`, nao valida formato de email, nao valida senha minima e faz login direto. | Alto |
| B05 | `screens/LoginScreen.js` | 103 | Email de login nao e normalizado para minusculas, mas o teclado permite maiusculas/variações; pode bloquear login valido. | Alto |
| B06 | `App.js` | 41-77 | App usa Stack Navigator puro; nao ha Tab Navigator para Home/Pedidos/Mapa/Perfil, embora o roteiro de teste espere tabs. | Alto |
| B07 | `screens/MapaScreen.js` | 27-32 | Permissao de localizacao so liga `showsUserLocation`; o mapa nao busca coordenadas nem centraliza no usuario. | Alto |
| B08 | `screens/PedidosScreen.js` | 247-286 | Cards de pedido nao sao `Touchable` e nao levam para detalhes/timeline, apesar do fluxo de acompanhamento exigir isso. | Alto |
| B09 | `contexts/ThemeContext.js` | 36-85 | ThemeProvider existe, mas as telas importam `C` estatico de `constants/theme`; alternancia de tema nao propaga para UI. | Alto |
| B10 | `app.json` | 20-21 | Android declara camera/biometria, mas nao declara permissao de localizacao apesar de usar `expo-location`. | Alto |

### 3.3 Medios

| ID | Arquivo | Linha | Descricao | Severidade |
|---|---|---:|---|---|
| B11 | `screens/CarrinhoScreen.js` | 154-155 | Se `CarrinhoScreen` abrir sem restaurante no contexto/snapshot, retorna `null` e gera tela em branco. | Medio |
| B12 | `screens/CarrinhoScreen.js` | 211-232 | Falha biometrica mostra mensagem generica e nao preserva motivo (`r.erro`) para o usuario. | Medio |
| B13 | `screens/CarrinhoScreen.js` | 157-164 | Total e taxa dependem de parse de string de entrega; mudancas de formato quebram calculo. | Medio |
| B14 | `screens/PedidosScreen.js` | 196-218 | Status de todos os pedidos avanca automaticamente por tela aberta, sem base em timestamp individual. | Medio |
| B15 | `screens/PedidosScreen.js` | 214 | `salvarPedidos(novos)` e chamado sem `await` e sem `catch`. | Medio |
| B16 | `screens/HomeScreen.js` | 178-183 | Busca sem debounce; hoje aceitavel, mas degrada com catalogo maior. | Medio |
| B17 | `screens/MapaScreen.js` | 141-156 | "Ver cardapio" apenas retorna silenciosamente se `usuario` nao existir; nao ha alerta ou redirecionamento. | Medio |
| B18 | `services/storage.js` | 7-9, 20-22 | `JSON.parse` nao tem tratamento de erro; storage corrompido derruba carregamento de usuario/pedidos. | Medio |

### 3.4 Baixos e cosmeticos

| ID | Arquivo | Linha | Descricao | Severidade |
|---|---|---:|---|---|
| B19 | `components/Stepper.js` | 68-81 | Touch targets de 36px/32px ficam abaixo do minimo recomendado de 44px. | Baixo |
| B20 | `screens/RestauranteScreen.js` | 193-202 | Back button de 40x40 fica abaixo do minimo recomendado. | Baixo |
| B21 | `app.json` | 8-10 | Splash usa apenas background branco e nao referencia imagem/logo. | Baixo |
| B22 | `app.json` | 20 | `adaptiveIcon.backgroundColor` usa `#FF4757`, diferente da marca `#E8452C`. | Baixo |
| B23 | `constants/theme.js` | 21-33 | `ink3` e `teal` tem contraste baixo em texto pequeno. | Baixo |
| B24 | `screens/LoginScreen.js` | 232 | `letterSpacing: -1.5` no logo pode reduzir legibilidade em devices menores. | Baixo |
