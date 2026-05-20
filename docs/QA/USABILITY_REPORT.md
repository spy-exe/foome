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

## 4. Sugestoes de UX

### 4.1 Alta prioridade

1. **Unificar autenticacao no servico `auth`.** O app ja tem `services/auth.js` com hash e mensagens de erro, mas `LoginScreen` e `CadastroScreen` nao usam esse servico. Isso reduz risco de seguranca e evita divergencia entre usuarios com `senha` e `senhaHash`.
2. **Adicionar validacao inline de cadastro.** Email invalido, senha curta e foto ausente so aparecem no submit ou nem aparecem. Validacao em tempo real evita tentativa frustrada no fim do fluxo.
3. **Implementar Perfil real antes da avaliacao.** A tela esta exposta no avatar da Home, mas so mostra placeholder. Para prova, isso parece funcionalidade quebrada.
4. **Trocar Stack-only por navegacao principal clara.** O roteiro do produto espera tabs para Home, Pedidos, Mapa e Perfil. Sem tabs, o usuario depende de CTAs contextuais e algumas telas ficam escondidas.
5. **Resolver tema escuro ponta a ponta.** `ThemeProvider` existe, mas a UI consome tema estatico. Ou remover promessa de dark mode do roteiro, ou conectar telas ao contexto.

### 4.2 Media prioridade

6. **Centralizar mapa na localizacao real quando permitido.** Hoje a permissao so ativa o ponto do usuario; nao ha `getCurrentPositionAsync` nem botao de recenter.
7. **Criar tela de detalhe/timeline do pedido.** A lista mostra status, mas nao ha acompanhamento detalhado. Isso e uma parte forte da experiencia de delivery.
8. **Melhorar feedback de falha biometrica.** Exibir motivo especifico ajuda quando o usuario cancela, nao tem biometria ou o sensor falha.
9. **Criar confirmacao ao trocar de restaurante com carrinho cheio.** O contexto limpa itens automaticamente ao mudar de restaurante; o usuario pode perder carrinho sem entender.
10. **Aumentar touch targets do Stepper.** O controle e central para compra e esta abaixo do minimo recomendado.

### 4.3 Baixa prioridade

11. **Adicionar imagem/logo no splash.** O app inicia com fundo branco generico; uma marca visual reduz sensacao de template.
12. **Adicionar debounce na busca.** Hoje o dataset e pequeno, mas a busca por tecla nao escala.
13. **Padronizar cor do adaptive icon.** `app.json` usa uma cor diferente da marca.
14. **Revisar contraste de captions e textos verdes.** Alguns textos pequenos podem falhar WCAG AA.
15. **Adicionar empty states acionaveis no mapa e carrinho.** Quando um estado invalido acontece, a tela deve orientar o proximo passo em vez de retornar `null`.

## 5. Casos de Teste por Tela

### 5.1 LoginScreen

| ID | Caso de teste | Passos | Resultado esperado |
|---|---|---|---|
| LT01 | Abrir sem conta | Limpar storage e abrir app | Ver login sem card de retorno e sem botao biometrico. |
| LT02 | Biometria sem conta | Abrir sem conta e tentar acesso biometrico se botao estiver disponivel | Alerta "Crie uma conta primeiro"; no estado atual o botao nao aparece sem usuario. |
| LT03 | Login com senha correta | Criar conta, sair/reabrir, preencher email e senha iguais aos salvos | Navegar para Home. |
| LT04 | Login com senha errada | Preencher email correto e senha errada | Alerta "Dados incorretos". |
| LT05 | Login com email em caixa diferente | Cadastrar email com maiuscula e tentar login em minuscula | Deve permitir, mas o estado atual tende a falhar. |
| LT06 | Biometria com conta salva | Abrir com usuario salvo e tocar "Entrar com biometria" | Autenticar e entrar na Home, ou exibir alerta especifico do sensor. |
| LT07 | Toggle de senha | Tocar icone de olho no campo senha | Campo alterna entre texto visivel e seguro. |

### 5.2 CadastroScreen

| ID | Caso de teste | Passos | Resultado esperado |
|---|---|---|---|
| CT01 | Cadastro completo | Preencher nome/email/senha, tirar foto e tocar "Criar conta" | Usuario salvo e app entra na Home. |
| CT02 | Campos vazios | Tocar "Criar conta" sem preencher | Alerta "Preencha todos os campos". |
| CT03 | Sem foto | Preencher campos sem foto e enviar | Alerta "Foto obrigatoria". |
| CT04 | Email invalido | Usar email sem `@`, senha e foto validas | Deveria bloquear; estado atual permite. |
| CT05 | Senha curta | Usar senha com menos de 6 caracteres | Deveria bloquear; estado atual permite. |
| CT06 | Permissao de camera negada | Tocar avatar e negar permissao | Tela "Camera bloqueada" com botao "Permitir camera". |
| CT07 | Refazer foto | Tirar foto, tocar "Tirar novamente" | Voltar para camera frontal. |

### 5.3 HomeScreen

| ID | Caso de teste | Passos | Resultado esperado |
|---|---|---|---|
| HT01 | Lista inicial | Entrar na Home | Ver banner, categorias e restaurantes. |
| HT02 | Filtro por categoria | Tocar chip "Burgers" | Mostrar somente restaurantes da categoria correspondente. |
| HT03 | Desmarcar categoria | Tocar chip ativo novamente | Voltar lista completa. |
| HT04 | Busca por restaurante | Digitar "Pizza" | Mostrar resultados correspondentes e esconder banner/categorias. |
| HT05 | Busca sem resultado | Digitar termo inexistente | Ver empty state "Nenhum resultado". |
| HT06 | Limpar busca | Tocar X no campo | Campo limpa e lista completa volta. |
| HT07 | Navegar restaurante | Tocar card de restaurante | Ir para `RestauranteScreen`. |
| HT08 | Abrir mapa | Tocar botao de mapa/header ou link "Ver no mapa" | Ir para `MapaScreen`. |
| HT09 | Repetir pedido | Fazer pedido, voltar a Home e tocar FAB de repeat | Carrinho deve ser populado com ultimo pedido. |

### 5.4 RestauranteScreen

| ID | Caso de teste | Passos | Resultado esperado |
|---|---|---|---|
| RT01 | Abrir cardapio | Navegar a partir da Home | Ver header do restaurante e lista de produtos. |
| RT02 | Adicionar item | Tocar `+` em produto | Stepper mostra quantidade 1 e CTA aparece. |
| RT03 | Incrementar item | Tocar `+` novamente | Quantidade e total aumentam. |
| RT04 | Decrementar item | Tocar `-` | Quantidade diminui. |
| RT05 | Remover ultimo item | Tocar `-` quando quantidade e 1 | Produto volta ao botao `+`; CTA some se carrinho zerar. |
| RT06 | Multiplos itens | Adicionar produtos diferentes | CTA mostra quantidade total e soma correta. |
| RT07 | Ver carrinho | Tocar CTA flutuante | Navegar para `CarrinhoScreen` com itens preservados. |
| RT08 | Abrir sem params | Navegar para Restaurante sem `route.params.restaurante` | Estado atual retorna `null`; deveria mostrar fallback. |

### 5.5 CarrinhoScreen

| ID | Caso de teste | Passos | Resultado esperado |
|---|---|---|---|
| CA01 | Visualizar carrinho | Abrir com itens | Ver itens, subtotal, entrega, cupom, endereco, pagamento e total. |
| CA02 | Remover por swipe | Deslizar item para esquerda e tocar "Remover" | Item sai completamente do carrinho. |
| CA03 | Cupom valido | Digitar `FOOME10` e aplicar | Mostrar 10% de desconto e total reduzido. |
| CA04 | Cupom invalido | Digitar qualquer outro codigo | Mostrar mensagem de cupom invalido. |
| CA05 | Entrega gratis | Usar restaurante com entrega "Gratis/Grátis" | Entrega deve ser R$ 0,00 e exibida como "Grátis". |
| CA06 | Entrega paga | Usar restaurante com "R$ 5,00" | Total deve incluir taxa. |
| CA07 | Confirmar com biometria | Tocar "Confirmar pedido" e autenticar | Pedido salvo, carrinho limpo, toast exibido e navegacao para Pedidos. |
| CA08 | Cancelar biometria | Tocar confirmar e cancelar autenticacao | Overlay fecha e alerta informa que biometria e necessaria. |
| CA09 | Carrinho vazio | Remover todos os itens | Empty state visivel e botao confirmar desabilitado. |

### 5.6 PedidosScreen

| ID | Caso de teste | Passos | Resultado esperado |
|---|---|---|---|
| PT01 | Sem pedidos | Abrir tela sem pedidos salvos | Empty state com botao "Explorar restaurantes". |
| PT02 | Lista de pedidos | Confirmar pedido e abrir tela | Card aparece com restaurante, itens, data, total e status. |
| PT03 | Avanco de status | Manter tela aberta por 30s | Status avanca ate "Entregue". |
| PT04 | Modal de avaliacao | Aguardar pedido chegar em entregue | Modal abre para nota/comentario. |
| PT05 | Enviar sem nota | Tocar "Enviar avaliacao" sem estrela | Alerta pedindo nota. |
| PT06 | Enviar avaliacao | Selecionar estrela e enviar | Avaliacao salva e alerta de agradecimento aparece. |
| PT07 | Detalhe do pedido | Tocar no card do pedido | Deveria abrir detalhes/timeline; estado atual nao faz nada. |

### 5.7 MapaScreen

| ID | Caso de teste | Passos | Resultado esperado |
|---|---|---|---|
| MT01 | Abrir mapa | Navegar a partir da Home | Ver Vassouras/RJ e markers dos restaurantes. |
| MT02 | Permissao negada | Negar localizacao | Mapa continua em Vassouras sem travar. |
| MT03 | Permissao concedida | Permitir localizacao | Deve mostrar ponto do usuario; estado atual nao centraliza automaticamente. |
| MT04 | Selecionar marker | Tocar marker | Bottom sheet sobe com dados do restaurante. |
| MT05 | Fechar sheet | Tocar no mapa fora do sheet | Bottom sheet fecha. |
| MT06 | Ver cardapio | Tocar "Ver cardapio" | Navegar para `RestauranteScreen`. |
| MT07 | Filtro de categoria | Procurar botao de filtro | Estado atual nao implementa filtro no mapa. |
| MT08 | Recenter | Procurar botao de localizacao | Estado atual nao implementa botao de recenter. |

### 5.8 PerfilScreen

| ID | Caso de teste | Passos | Resultado esperado |
|---|---|---|---|
| PF01 | Abrir perfil | Tocar avatar na Home | Estado atual mostra apenas "Perfil" e "Em breve...". |
| PF02 | Ver dados do usuario | Procurar nome/email/foto | Nao implementado. |
| PF03 | Alternar dark mode | Procurar toggle de tema | Nao implementado na UI. |
| PF04 | Alterar senha | Procurar acao de senha | Nao implementado. |
| PF05 | Sair da conta | Procurar logout | Nao implementado. |
