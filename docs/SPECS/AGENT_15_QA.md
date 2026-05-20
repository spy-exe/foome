# AGENT 15 — Testes de Usabilidade e QA Manual
## Foome — Spec de Desenvolvimento

### Contexto

Você **NÃO vai escrever código de produção**. Seu papel é garantia de qualidade:
- Auditar o código atual em busca de bugs
- Criar um relatório completo de usabilidade
- Mapear todos os fluxos do app (happy paths + edge cases)
- Criar uma checklist de qualidade mobile
- Criar um guia passo a passo para o professor testar na prova

Seus entregáveis são documentos markdown em `docs/QA/`.

### Objetivo

1. `docs/QA/USABILITY_REPORT.md` — relatório completo de usabilidade e bugs
2. `docs/QA/GUIA_PROFESSOR.md` — passo a passo para o professor testar

### Git Workflow

```bash
git checkout main
git pull origin main
git checkout -b feat/agent-15-qa

git add .
git commit -m "docs(qa): mapear fluxos do app e criar relatório de usabilidade"
# docs(qa): documentar bugs com severidade e localização
# docs(qa): criar guia do professor para teste em celular

git push origin feat/agent-15-qa
```

**Regras:**
- Mínimo 3 commits
- Nunca commitar direto na `main`
- Nunca fazer push forçado
- Commits são de documentação: use prefixo `docs(qa):`

### Arquivos a Criar

#### NOVO: `docs/QA/USABILITY_REPORT.md`

Este é o documento principal. Deve conter:

---

```markdown
# Foome — Relatório de Usabilidade e QA

## 1. Mapeamento de Fluxos

### 1.1 Fluxo de Autenticação

**Happy Path — Cadastro:**
1. Usuário abre o app → vê LoginScreen
2. Toca "Cadastre-se grátis" → navega para CadastroScreen
3. Preenche nome, email, senha
4. Toca no avatar placeholder → abre câmera
5. Concede permissão de câmera (se primeiro acesso)
6. Tira foto → vê preview
7. Confirma foto → volta ao formulário com foto visível
8. Toca "Criar conta" → conta salva, navega para LoginScreen
9. Faz login

**Happy Path — Login com biometria:**
1. Usuário com conta existente abre o app
2. Vê card "Bem-vindo de volta" + botão biométrico
3. Toca "Entrar com biometria"
4. Autentica com digital/Face ID
5. App navega para HomeScreen

**Happy Path — Login com senha:**
1. Usuário preenche email e senha
2. Toca "Entrar"
3. Se credenciais corretas → HomeScreen
4. Se incorretas → alerta de erro

**Edge Cases:**
- [ ] Usuário sem biometria cadastrada → alerta
- [ ] Usuário nega permissão de câmera → tela de permissão bloqueada com botão "Permitir"
- [ ] Campos vazios no submit → alerta
- [ ] Email sem @ → sem validação (BUG em potencial)
- [ ] Senha com menos de 6 caracteres → sem validação (BUG em potencial)

### 1.2 Fluxo de Navegação Principal

**Happy Path — Pedido completo:**
1. HomeScreen → scrolla categorias, vê restaurantes
2. Toca num restaurante → RestauranteScreen
3. Adiciona itens ao carrinho via Stepper
4. CTA flutuante mostra quantidade e valor
5. Toca "Ver carrinho" → CarrinhoScreen
6. Revisa itens, total, taxa de entrega
7. Toca "Confirmar pedido" → autenticação biométrica
8. Pedido confirmado → alerta, navega para PedidosScreen
9. Vê pedido com status "Confirmado"

**Edge Cases:**
- [ ] Carrinho vazio → como o usuário chega na CarrinhoScreen? (CTA só aparece com itens)
- [ ] Todos os itens removidos → CTA desaparece
- [ ] Voltar da CarrinhoScreen → itens mantidos? (BUG: com route.params, o estado volta ao sair)
- [ ] Navegar para MapaScreen → selecionar restaurante → "Ver cardápio" → RestauranteScreen funcional?
- [ ] PedidosScreen sem pedidos → empty state visível

### 1.3 Fluxo de Mapa

**Happy Path:**
1. HomeScreen → toca ícone de mapa ou "Ver no mapa"
2. MapaScreen abre centralizado em Vassouras/RJ
3. Usuário vê markers de restaurantes
4. Toca num marker → bottom sheet sobe com info
5. Toca "Ver cardápio" → RestauranteScreen

**Edge Cases:**
- [ ] Permissão de localização negada → mapa ainda funciona (Vassouras)
- [ ] Permissão concedida → centraliza no usuário
- [ ] GPS desligado → fallback para Vassouras
- [ ] Bottom sheet fecha ao tocar fora (no mapa)

## 2. Checklist Mobile (WCAG e Boas Práticas)

### 2.1 Touch Targets (mínimo 44px)

| Componente | Touch Target | Conforme? |
|-----------|-------------|-----------|
| Botão "Entrar" (PrimaryButton) | height: 54 | ✅ |
| InputField | height: 52 | ✅ |
| Stepper (+/-) | 32x32 | ❌ Muito pequeno! |
| Back button (restaurante) | 40x40 | ❌ Abaixo do mínimo |
| Chips de categoria | paddingVertical: 9 | ⚠️ No limite |
| Botão biométrico | padding: 16 | ✅ |

### 2.2 Contraste de Cores (WCAG AA)

| Combinação | Contraste estimado | Conforme? |
|-----------|-------------------|-----------|
| brand (#E8452C) + texto branco | ~5.5:1 | ✅ |
| ink (#17172B) + surface (branco) | ~15:1 | ✅ |
| ink3 (#9494B2) + bg (#F5F5FA) | ~3:1 | ❌ Abaixo de 4.5:1 |
| teal (#00BE99) + fundo branco | ~3.2:1 | ❌ Abaixo de 4.5:1 |

### 2.3 Keyboard Avoiding

| Tela | KeyboardAvoidingView? | ScrollView? | Conforme? |
|------|----------------------|-------------|-----------|
| LoginScreen | ✅ | ✅ | ✅ |
| CadastroScreen | ❌ (ScrollView sem KAV) | ✅ | ⚠️ |
| CarrinhoScreen | N/A (sem inputs) | FlatList | ✅ |

### 2.4 Scroll e Performance

- [ ] FlatList com `getItemLayout` para performance?
- [ ] `tracksViewChanges={false}` nos Markers (MapaScreen)? ✅
- [ ] Imagens com dimensões fixas? ✅

## 3. Relatório de Bugs

### 3.1 Bugs Críticos (impedem funcionalidade)

| ID | Arquivo | Linha | Descrição | Severidade |
|----|---------|-------|-----------|------------|
| B01 | App.js | 55-56 | Rota duplicada "App" e "Home" para HomeScreen | Crítico |
| B02 | LoginScreen.js | 31 | Senha comparada em texto puro (`senha !== usuario.senha`) | Crítico |
| B03 | CadastroScreen.js | 39 | Senha salva em texto puro no AsyncStorage | Crítico |

### 3.2 Bugs Altos (degradam experiência)

| ID | Arquivo | Linha | Descrição | Severidade |
|----|---------|-------|-----------|------------|
| B04 | HomeScreen.js | 17 | `usuario = route?.params?.usuario \|\| {}` — se params vier sem usuario, app quebra silenciosamente | Alto |
| B05 | CarrinhoScreen.js | 13 | Carrinho recebido via `route.params` — desaparece se usuário der back e voltar | Alto |
| B06 | MapaScreen.js | 66-83 | Markers sem `tracksViewChanges={false}` — podem causar re-render a cada frame | Alto |
| B07 | app.json | 20 | `adaptiveIcon.backgroundColor: "#FF4757"` — cor errada, deveria ser #E8452C | Alto |

### 3.3 Bugs Médios (inconvenientes)

| ID | Arquivo | Linha | Descrição | Severidade |
|----|---------|-------|-----------|------------|
| B08 | LoginScreen.js | 30-36 | Mensagem de erro genérica — não diferencia email não cadastrado de senha errada | Médio |
| B09 | PedidosScreen.js | 55 | Status fixo "Confirmado" no badge — todos os pedidos mostram o mesmo status | Médio |
| B10 | HomeScreen.js | 64-68 | Busca sem debounce — filtra a cada tecla, pode causar lentidão | Médio |
| B11 | RestauranteScreen.js | 71-96 | FlatList sem `getItemLayout` — performance subótima | Médio |
| B12 | CadastroScreen.js | 36-37 | Foto obrigatória, mas validação só ocorre no submit — sem feedback antecipado | Médio |

### 3.4 Bugs Baixos (cosméticos)

| ID | Arquivo | Linha | Descrição | Severidade |
|----|---------|-------|-----------|------------|
| B13 | app.json | 9 | `"backgroundColor": "#ffffff"` — splash usa branco puro em vez de tema | Baixo |
| B14 | Stepper.js | 37-57 | Touch target de 32px — abaixo do mínimo recomendado de 44px | Baixo |
| B15 | LoginScreen.js | 20 | `useEffect(() => { getUsuario().then(setUsuario); }, [])` — sem tratamento de erro | Baixo |

## 4. Sugestões de UX

### 4.1 Alta Prioridade
1. **Confirmação de saída do carrinho:** Se o usuário der back com itens no carrinho, perguntar se quer descartar
2. **Feedback ao adicionar item:** Nenhum feedback visual além do Stepper mudar — poderia ter badge animado
3. **Splash screen:** Atualmente genérica — poderia ter animação da marca Foome

### 4.2 Média Prioridade
4. **Skeleton loading:** Lista de restaurantes aparece instantânea — poderia ter shimmer enquanto "carrega"
5. **Pull-to-refresh:** Usuário pode querer atualizar a lista
6. **Header do RestauranteScreen:** Emoji grande ocupa muito espaço — poderia ter parallax

### 4.3 Baixa Prioridade
7. **Onboarding:** Primeiro acesso vai direto pro Login — poderia ter tour guiado
8. **Dark mode:** App é apenas light — não acompanha preferência do sistema
9. **Haptic feedback:** Nenhum feedback tátil em momento algum

## 5. Casos de Teste por Tela

### 5.1 LoginScreen

| ID | Caso de Teste | Passos | Resultado Esperado |
|----|--------------|--------|-------------------|
| LT01 | Login com biometria (usuário existe) | 1. Abrir app com conta salva 2. Tocar "Entrar com biometria" | Autenticar e navegar para Home |
| LT02 | Login com biometria (sem digital) | 1. Abrir app 2. Tocar biometria sem digital cadastrada | Alerta: "Nenhuma biometria cadastrada" |
| LT03 | Login com senha correta | 1. Preencher email e senha corretos 2. Tocar "Entrar" | Navegar para Home |
| LT04 | Login com senha incorreta | 1. Preencher email correto, senha errada 2. Tocar "Entrar" | Alerta de erro |
| LT05 | Login sem conta | 1. Abrir app sem conta salva 2. Tocar biometria | Alerta: "Crie uma conta primeiro" |
| LT06 | Campos vazios | 1. Tocar "Entrar" sem preencher nada | Alerta ou validação inline |

### 5.2 CadastroScreen

| ID | Caso de Teste | Passos | Resultado Esperado |
|----|--------------|--------|-------------------|
| CT01 | Cadastro completo | 1. Preencher todos os campos 2. Tirar foto 3. Tocar "Criar conta" | Conta salva, navegar para Login |
| CT02 | Sem foto | 1. Preencher campos 2. Não tirar foto 3. Tocar "Criar conta" | Alerta: "Foto obrigatória" |
| CT03 | Campos vazios | 1. Não preencher nada 2. Tocar "Criar conta" | Alerta: "Preencha todos os campos" |
| CT04 | Permissão de câmera negada | 1. Tocar no avatar 2. Negar permissão | Tela de permissão bloqueada com botão |
| CT05 | Refazer foto | 1. Tirar foto 2. Na preview, tocar "Tirar novamente" | Voltar para câmera |

### 5.3 HomeScreen

| ID | Caso de Teste | Passos | Resultado Esperado |
|----|--------------|--------|-------------------|
| HT01 | Lista completa | Abrir HomeScreen | Ver todos os restaurantes |
| HT02 | Filtrar por categoria | Tocar chip "Burgers" | Mostrar só hambúrgueres |
| HT03 | Desmarcar categoria | Tocar chip ativo novamente | Mostrar todos |
| HT04 | Buscar restaurante | Digitar "Pizza" na busca | Filtrar resultados |
| HT05 | Busca sem resultados | Digitar termo inexistente | Ver empty state |
| HT06 | Limpar busca | Tocar X na busca | Voltar lista completa |
| HT07 | Navegar para restaurante | Tocar num RestauranteCard | Ir para RestauranteScreen |
| HT08 | Navegar para mapa | Tocar "Ver no mapa" ou ícone | Ir para MapaScreen |

### 5.4 RestauranteScreen

| ID | Caso de Teste | Passos | Resultado Esperado |
|----|--------------|--------|-------------------|
| RT01 | Adicionar item | Tocar "+" num produto | Stepper mostra 1, CTA aparece |
| RT02 | Incrementar item | Tocar "+" de novo | Quantidade aumenta |
| RT03 | Decrementar item | Tocar "-" | Quantidade diminui |
| RT04 | Remover item | Tocar "-" quando qtd=1 | Item volta ao estado inicial |
| RT05 | Múltiplos itens | Adicionar 2+ produtos diferentes | CTA mostra total correto |
| RT06 | Ver carrinho | Tocar CTA flutuante | Navegar para CarrinhoScreen |
| RT07 | Voltar da Home | Tocar back | Voltar para HomeScreen |

### 5.5 CarrinhoScreen

| ID | Caso de Teste | Passos | Resultado Esperado |
|----|--------------|--------|-------------------|
| CT01 | Visualizar itens | Abrir carrinho com itens | Ver lista, subtotal, entrega, total |
| CT02 | Confirmar com biometria | Tocar "Confirmar pedido" | Biometria → pedido salvo |
| CT03 | Biometria falha | Cancelar biometria | Alerta de falha |
| CT04 | Entrega grátis | Restaurante com frete grátis | Mostrar "Grátis" em verde |
| CT05 | Entrega paga | Restaurante com taxa | Mostrar valor da taxa |

### 5.6 PedidosScreen

| ID | Caso de Teste | Passos | Resultado Esperado |
|----|--------------|--------|-------------------|
| PT01 | Lista de pedidos | Abrir após confirmar pedido | Ver card do pedido |
| PT02 | Sem pedidos | Abrir sem ter feito pedido | Ver empty state |
| PT03 | Múltiplos pedidos | Fazer 2+ pedidos | Ver lista com todos |
| PT04 | Status do pedido | Ver badge de status | "Confirmado" em verde |

### 5.7 MapaScreen

| ID | Caso de Teste | Passos | Resultado Esperado |
|----|--------------|--------|-------------------|
| MT01 | Abrir mapa | Navegar para MapaScreen | Ver mapa com markers |
| MT02 | Selecionar restaurante | Tocar num marker | Bottom sheet sobe |
| MT03 | Fechar bottom sheet | Tocar no mapa (fora do sheet) | Sheet desce |
| MT04 | Ver cardápio | Tocar "Ver cardápio" no sheet | Navegar para RestauranteScreen |
| MT05 | Localização permitida | Conceder permissão | Mapa centraliza no usuário |
| MT06 | Localização negada | Negar permissão | Mapa centraliza Vassouras |
```

---

#### NOVO: `docs/QA/GUIA_PROFESSOR.md`

```markdown
# Foome — Guia do Professor
## Roteiro de Teste em Celular

### Preparação
1. Acesse o repositório: [URL DO REPO]
2. Clone: `git clone [URL]`
3. Instale: `npm install`
4. Inicie: `npx expo start`
5. Escaneie o QR Code com Expo Go no celular

### ⚠️ Importante
- O app foi projetado para **celular real** — testar no dispositivo, não no emulador
- Algumas funcionalidades (biometria, câmera) exigem dispositivo físico
- Mantenha o celular na **vertical** (portrait)

---

## Fluxo 1: Primeiro Acesso (5 min)

### 1.1 Splash e Onboarding
1. **Abra o Foome** → splash screen animada com logo
2. **Onboarding** → 3 telas: "Descubra restaurantes", "Peça com um toque", "Acompanhe seu pedido"
3. **Deslize** ou toque "Próximo" para avançar
4. Toque **"Começar"** no último slide

### 1.2 Cadastro
5. Você está na **tela de cadastro** (se não estiver, toque "Cadastre-se grátis")
6. Preencha: **nome**, **e-mail**, **senha** (mínimo 6 caracteres)
7. Toque no **círculo da foto** → câmera abre
8. **Permita** o acesso à câmera
9. **Tire uma selfie** → preview aparece
10. Toque **"Usar esta foto"**
11. Toque **"Criar conta"**
12. ✅ Conta criada! Você volta para o Login

### 1.3 Login
13. Seu **nome aparece** no card "Bem-vindo de volta"
14. Toque **"Entrar com biometria"** (se disponível) OU
15. Digite seu e-mail e senha → toque **"Entrar"**
16. ✅ Você está na **HomeScreen**

---

## Fluxo 2: Fazer um Pedido (7 min)

### 2.1 Explorar Restaurantes
1. Na HomeScreen, veja: banner promocional, chips de categoria, lista de restaurantes
2. **Toque num chip** de categoria (ex: Burgers) → filtra restaurantes
3. **Toque novamente** → desmarca filtro
4. **Digite na busca** (ex: "Pizza") → resultados filtram com destaque
5. Toque no **X** para limpar busca

### 2.2 Cardápio
6. **Toque num restaurante** (ex: Burger Supreme)
7. Header colorido com emoji, nome, avaliação ⭐, tempo 🕐, entrega 🛵
8. **Deslize para baixo** na lista → header colapsa (parallax)
9. Veja as **abas de subcategoria** (Todas, Principais, Bebidas, Sobremesas)

### 2.3 Adicionar Itens
10. Toque **"+"** num produto → Stepper mostra 1
11. Toque **"+"** de novo → incrementa
12. Toque **"-"** → decrementa
13. **CTA flutuante** aparece no rodapé com quantidade e valor total
14. Toque **no card do produto** → Bottom Sheet com detalhes, tamanho (P/M/G), observações
15. Adicione **mais produtos** de tipos diferentes

### 2.4 Carrinho
16. Toque **"Ver carrinho"** no CTA
17. Revise: itens, quantidades, subtotal, entrega, total
18. **Deslize um item para a esquerda** → botão vermelho "Remover"
19. Toque no campo **"Cupom de desconto"** → digite `FOOME10` → toque "Aplicar"
20. ✅ 10% de desconto aplicado (verde)

### 2.5 Checkout
21. Selecione um **endereço** de entrega (Casa, Trabalho ou Faculdade)
22. Selecione **forma de pagamento** (PIX, Crédito ou Débito)
23. Toque **"Confirmar pedido"**
24. Overlay escurece → ícone de digital pulsa → **Autentique com biometria**
25. ✅ Check verde animado → Toast "Pedido confirmado! 🎉"

---

## Fluxo 3: Acompanhar Pedido (3 min)

1. Toque na **tab Pedidos 📋** no rodapé
2. Veja seu pedido com status colorido
3. Toque **no card do pedido** → tela de detalhes
4. **Timeline animada** mostra as 4 etapas
5. **Aguarde** ~30 segundos → status avança automaticamente:
   - Confirmado ✅ → Em preparo 🕐 → A caminho 🛵 → Entregue 📦
6. Quando chega em **"Entregue"**, modal de **avaliação** aparece
7. Toque nas **estrelas** (1 a 5) → rótulo muda
8. Escreva um **comentário** (opcional)
9. Toque **"Enviar avaliação"**
10. ✅ "Obrigado! Sua avaliação ajuda a melhorar o Foome."

---

## Fluxo 4: Mapa (2 min)

1. Toque na **tab Mapa 🗺️** no rodapé
2. **Permita localização** se solicitado
3. Mapa centraliza na sua posição (ou Vassouras/RJ)
4. Veja os **markers coloridos** por categoria
5. Toque no **botão de filtro** (sliders) → chips de categoria aparecem
6. Selecione "Sushi" → só restaurantes japoneses visíveis
7. Toque num **marker** → bottom sheet sobe
8. Veja: emoji, nome, avaliação, tempo de entrega
9. Toque **"Ver cardápio"** → RestauranteScreen
10. Toque no **botão de localização** (crosshair) → centraliza em você

---

## Fluxo 5: Perfil e Configurações (2 min)

1. Toque na **tab Perfil 👤** no rodapé
2. Veja: foto, nome, e-mail
3. **Ative o Dark Mode** (toggle) 🌙
4. Veja o app escurecer
5. Toque **"Alterar senha"** → modal abre
6. Preencha senha atual, nova, confirmar → "Salvar nova senha"
7. Toque **"Sair da conta"** → Alert de confirmação
8. Confirme → volta para Login

---

## Fluxo 6: Features Especiais (2 min)

### 6.1 Favoritos 🔥
1. Faça login novamente
2. Na HomeScreen, seção **"Favoritos seus 🔥"** com itens mais pedidos
3. Cards com emoji, nome, preço, "Nx pedido"

### 6.2 Repetir Último Pedido
4. No canto inferior direito, **FAB laranja** com ícone de repeat
5. Toque → carrinho populado automaticamente com último pedido
6. Navega direto para CarrinhoScreen

---

## Checklist de Avaliação

| Critério | Peso | Nota |
|----------|------|------|
| Fluxo de cadastro funciona | 10% | /10 |
| Fluxo de login (senha + biometria) | 10% | /10 |
| Navegação entre telas (tabs + stack) | 10% | /10 |
| Adicionar/remover itens do carrinho | 10% | /10 |
| Confirmar pedido com biometria | 10% | /10 |
| Acompanhamento do pedido (timeline) | 10% | /10 |
| Mapa com markers e filtro | 10% | /10 |
| Cupom de desconto funcional | 5% | /5 |
| Avaliação pós-entrega | 5% | /5 |
| Dark mode funcional | 5% | /5 |
| Onboarding + splash screen | 5% | /5 |
| Features inovadoras (favoritos, FAB) | 5% | /5 |
| Qualidade visual e animações | 5% | /5 |
| **TOTAL** | **100%** | **/100** |

---

## Observações para o Professor

- **Teste em celular real** — o app usa câmera, biometria e GPS, que não funcionam bem no emulador
- **Teste com internet** — o Expo Go precisa de conexão para carregar o bundle
- **Toque com calma** — as animações são intencionais, não são lag
- **Se algo quebrar**, anote o passo exato e o que aconteceu
```

### Critérios de Entrega

- [ ] `docs/QA/USABILITY_REPORT.md` com todos os 6 itens:
  1. Mapeamento de fluxos (happy path + edge cases)
  2. Checklist mobile (touch targets, contraste, keyboard, scroll)
  3. Relatório de bugs (arquivo + linha + descrição + severidade)
  4. Sugestões de UX com justificativa
  5. Casos de teste por tela (o que testar, como, resultado esperado)
- [ ] `docs/QA/GUIA_PROFESSOR.md` com:
  1. Instruções de preparação (clone, install, start)
  2. 6 fluxos de teste com passos numerados
  3. Checklist de avaliação com pesos
  4. Observações importantes

### Não Faça

- **Não corrija bugs** — apenas documente
- **Não modifique código de produção**
- **Não crie branches de Feature, Bug ou Fix** — sua branch é só docs
- **Não execute o app** — apenas analise o código fonte e documente
- **Não crie testes automatizados** — AGENT 16 fará isso
