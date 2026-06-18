# Inventário de Telas — Foome

> Documentação completa de todas as 23 telas do aplicativo.
> Cada tela inclui: objetivo, entrada/saída, dados, estados e ações.

> ⚠️ **Status (pós-faxina):** este documento é o *spec de design* original.
> O app implementado tem **19 telas reais**. Diferenças: `RecuperarSenhaScreen`
> e `AvaliacaoScreen` não foram implementadas; `BuscaScreen`, `CategoriasScreen`
> e `ProdutoDetalheScreen` foram **removidas** (a busca é inline na Home; o
> detalhe do produto virou um *bottom sheet*); o **Mapa** mostra restaurantes
> próximos (não rastreio do entregador). **Novo:** `ClubeScreen` (Foome Club).
> Endereços agora são **reais** (backend `/addresses`) e há **motor de cupons**.
> Veja `docs/DEMO.md`.

---

## 1. SplashScreen

| Campo | Descrição |
|-------|-----------|
| **Objetivo** | Exibir identidade visual do Foome enquanto recursos iniciais são carregados. |
| **Entrada** | Abertura do app. |
| **Saída** | OnboardingScreen (primeiro uso) / LoginScreen (já viu onboarding) / HomeScreen (logado). |
| **Dados necessários** | Verificação de onboarding_complete + token de acesso no AsyncStorage. |
| **Estados** | `carregando`: logo + animação por 2s. `offline`: segue fluxo normal com dados locais. |
| **Ações** | Nenhuma (automático, sem interação). |

---

## 2. OnboardingScreen

| Campo | Descrição |
|-------|-----------|
| **Objetivo** | Apresentar o valor do Foome em 3 slides e iniciar cadastro ou login. |
| **Entrada** | SplashScreen (primeiro uso). |
| **Saída** | LoginScreen ("Já conheço") / CadastroScreen ("Criar minha conta"). |
| **Dados necessários** | Nenhum. |
| **Estados** | `carregando`: skeleton do slide. `sucesso`: slide visível com navegação. `erro`: mensagem de falha ao carregar + retry. |
| **Ações** | Swipe horizontal entre slides. Tap "Começar" / "Continuar". Tap "Já conheço" (skip). Tap "Criar minha conta" (último slide). |

---

## 3. LoginScreen

| Campo | Descrição |
|-------|-----------|
| **Objetivo** | Autenticar usuário existente com email + senha ou biometria. |
| **Entrada** | SplashScreen (tem conta) / OnboardingScreen (skip) / Sessão expirada. |
| **Saída** | HomeScreen (sucesso) / RecuperarSenhaScreen / CadastroScreen. |
| **Dados necessários** | Nenhum (inputs do usuário). |
| **Estados** | `vazio`: campos limpos. `carregando`: botão "Entrando...". `sucesso`: navega para Home. `erro`: mensagens de erro específicas por campo. `offline`: "Sem conexão". |
| **Ações** | Digitar email. Digitar senha. Tap "Entrar". Tap "Esqueci minha senha". Tap "Criar conta". Tap biometria (se disponível). |

---

## 4. CadastroScreen

| Campo | Descrição |
|-------|-----------|
| **Objetivo** | Registrar novo usuário em 3 etapas (dados → foto → confirmação). |
| **Entrada** | OnboardingScreen ("Criar minha conta") / LoginScreen ("Criar conta"). |
| **Saída** | HomeScreen (cadastro completo + login automático) / LoginScreen (cancelar). |
| **Dados necessários** | Nenhum (coletados durante fluxo). |
| **Estados** | `vazio`: etapa inicial. `carregando`: formulário sendo enviado. `sucesso`: navega para Home. `erro`: mensagens por campo. `offline`: alerta de conexão. |
| **Ações** | Etapa 1: preencher nome/email/senha, tap "Continuar". Etapa 2: tap "Tirar foto", tap "Escolher da galeria", tap "Refazer", tap "Continuar". Etapa 3: revisar dados, tap "Criar conta". Tap "Voltar" entre etapas. |

---

## 5. RecuperarSenhaScreen

| Campo | Descrição |
|-------|-----------|
| **Objetivo** | Enviar link de redefinição de senha para o email do usuário. |
| **Entrada** | LoginScreen ("Esqueci minha senha"). |
| **Saída** | LoginScreen (email enviado ou cancelar). |
| **Dados necessários** | Nenhum (input do usuário). |
| **Estados** | `vazio`: campo email limpo. `carregando`: "Enviando...". `sucesso`: "Email enviado!". `erro`: email não encontrado / erro ao enviar. |
| **Ações** | Digitar email. Tap "Enviar link". Tap "Voltar". |

---

## 6. HomeScreen

| Campo | Descrição |
|-------|-----------|
| **Objetivo** | Apresentar feed de restaurantes, ofertas e conteúdo personalizado. |
| **Entrada** | Cadastro completo (login automático) / Login / Tab "Home". |
| **Saída** | RestauranteScreen / BuscaScreen / CategoriasScreen / PerfilScreen (tab). |
| **Dados necessários** | Lista de restaurantes, ofertas relâmpago, histórico do usuário, localização. |
| **Estados** | `vazio`: nenhum restaurante na região. `carregando`: shimmer skeletons. `sucesso`: feed completo. `erro`: mensagem de erro + pull-to-refresh. `offline`: banner + dados em cache. |
| **Ações** | Tap restaurante card. Tap oferta relâmpago. Tap categoria. Tap busca (foco). Tap FAB "Repetir último pedido" (se disponível). Tap notificações (header). Pull-to-refresh. Scroll vertical. |

---

## 7. BuscaScreen

| Campo | Descrição |
|-------|-----------|
| **Objetivo** | Buscar restaurantes e pratos por nome, com filtros e histórico. |
| **Entrada** | HomeScreen (foco na busca) / Tab "Busca". |
| **Saída** | RestauranteScreen / HomeScreen (cancelar). |
| **Dados necessários** | Histórico de buscas, resultados em tempo real, categorias/filtros. |
| **Estados** | `vazio`: nenhuma busca feita ainda + busca recente. `carregando`: spinner enquanto busca. `sucesso`: lista de resultados. `vazio resultados`: "Nada por aqui". `erro`: "Não conseguimos buscar agora". `offline`: histórico local apenas. |
| **Ações** | Digitar termo (debounce 300ms). Tap resultado. Tap filtro → BottomSheet. Tap "Aplicar" filtros. Limpar busca. Tap cancelar. |

---

## 8. CategoriasScreen

| Campo | Descrição |
|-------|-----------|
| **Objetivo** | Navegar restaurantes por categoria (pizza, japonês, brasileira, etc.). |
| **Entrada** | HomeScreen (categoria) / BuscaScreen (filtro categoria). |
| **Saída** | RestauranteScreen / HomeScreen (voltar). |
| **Dados necessários** | Lista de restaurantes da categoria selecionada. |
| **Estados** | `vazio`: nenhum restaurante nessa categoria. `carregando`: shimmer. `sucesso`: grid/lista de cards. `erro`: mensagem + retry. |
| **Ações** | Tap restaurante card. Scroll vertical. Tap voltar. |

---

## 9. RestauranteScreen

| Campo | Descrição |
|-------|-----------|
| **Objetivo** | Visualizar cardápio do restaurante e adicionar itens ao carrinho. |
| **Entrada** | HomeScreen / BuscaScreen / CategoriasScreen / FavoritosScreen. |
| **Saída** | ProdutoDetalheScreen / CarrinhoScreen (CTA flutuante) / HomeScreen (voltar). |
| **Dados necessários** | Dados do restaurante, cardápio (categorias + itens), status (aberto/fechado). |
| **Estados** | `carregando`: skeleton. `sucesso`: cardápio completo. `erro`: "Não conseguimos carregar o cardápio" + retry. `vazio cardápio`: "Nenhum item disponível". `restaurante fechado`: overlay + mensagem. |
| **Ações** | Tap produto. Tap tab de categoria. Tap FAB carrinho flutuante. Tap ♥ favoritar. Scroll vertical. Tap voltar. |

---

## 10. ProdutoDetalheScreen

| Campo | Descrição |
|-------|-----------|
| **Objetivo** | Personalizar item (tamanho, adicionais, observações) e adicionar ao carrinho. |
| **Entrada** | RestauranteScreen (tap produto). |
| **Saída** | RestauranteScreen (adicionado ao carrinho / voltar). |
| **Dados necessários** | Dados do produto (preços, tamanhos, adicionais disponíveis). |
| **Estados** | `carregando`: spinner. `sucesso`: formulário completo. `erro`: "Não foi possível carregar" + retry. `indisponível`: "Esse item acabou :(". |
| **Ações** | Selecionar tamanho (se obrigatório). Selecionar adicionais. Digitar observação. Tap "Adicionar — R$". Tap "Voltar". |

---

## 11. CarrinhoScreen

| Campo | Descrição |
|-------|-----------|
| **Objetivo** | Revisar itens, aplicar cupom e prosseguir para checkout. |
| **Entrada** | RestauranteScreen (CTA flutuante) / ProdutoDetalheScreen (após adicionar) / DetalhePedidoScreen ("Repetir"). |
| **Saída** | CheckoutScreen / RestauranteScreen (voltar para adicionar mais). |
| **Dados necessários** | Itens no carrinho, subtotal, taxa, desconto, total. |
| **Estados** | `vazio`: "Carrinho vazio" + CTA explorar. `sucesso`: lista de itens + totais. `erro item indisponível`: alerta + item removido. `carregando`: "Atualizando carrinho...". `offline`: dados em cache. |
| **Ações** | Tap quantidade (+/-). Swipe para remover item. Digitar cupom. Tap aplicar cupom. Tap "Confirmar pedido — R$". Tap "Voltar". |

---

## 12. CheckoutScreen

| Campo | Descrição |
|-------|-----------|
| **Objetivo** | Informar endereço de entrega, escolher pagamento e revisar pedido. |
| **Entrada** | CarrinhoScreen ("Confirmar pedido"). |
| **Saída** | ConfirmacaoScreen (sucesso) / CarrinhoScreen (voltar). |
| **Dados necessários** | Endereços salvos, métodos de pagamento salvos, resumo itens, taxa, tempo estimado. |
| **Estados** | `carregando`: processando pagamento. `sucesso`: navega para confirmação. `erro pagamento`: "Pagamento não aprovado" + trocar método. `erro genérico`: "Ops, algo deu errado" + retry. `offline`: alerta explicativo. |
| **Ações** | 3 etapas: (1) Endereço → digitar campos / selecionar salvo. (2) Pagamento → selecionar método / adicionar cartão / digitar troco. (3) Revisão → ver resumo. Tap "Confirmar pedido". Tap "Voltar". |

---

## 13. ConfirmacaoScreen

| Campo | Descrição |
|-------|-----------|
| **Objetivo** | Confirmar que o pedido foi aceito e dar visibilidade do andamento. |
| **Entrada** | CheckoutScreen (pagamento aprovado). |
| **Saída** | RastreamentoScreen ("Acompanhar pedido") / HomeScreen ("Voltar ao início"). |
| **Dados necessários** | Número do pedido, tempo estimado. |
| **Estados** | `sucesso`: confirmação com dados. `carregando`: transição do checkout. `erro`: "Pedido enviado! Se não aparecer, veja em 'Em andamento'". |
| **Ações** | Tap "Acompanhar pedido". Tap "Voltar ao início". |

---

## 14. MapaScreen

| Campo | Descrição |
|-------|-----------|
| **Objetivo** | Visualizar em tempo real a localização do entregador e rota até o destino. |
| **Entrada** | RastreamentoScreen (quando pedido "saiu para entrega"). |
| **Saída** | RastreamentoScreen (voltar minimizado) / AvaliacaoScreen (entrega concluída + timeout). |
| **Dados necessários** | Localização do entregador (via socket/API), localização do usuário, rota. |
| **Estados** | `carregando`: mapa carregando + "Aguardando localização do entregador...". `sucesso`: entregador no mapa em tempo real. `erro localização`: "Localização desativada". `offline`: última posição conhecida. |
| **Ações** | Mapa interativo (zoom, pan). Tap "Centralizar". Tap "Voltar" (minimiza mapa no Rastreamento). |

---

## 15. RastreamentoScreen

| Campo | Descrição |
|-------|-----------|
| **Objetivo** | Acompanhar o status do pedido em tempo real com timeline e mapa. |
| **Entrada** | ConfirmacaoScreen ("Acompanhar pedido") / PedidosScreen (tap pedido em andamento). |
| **Saída** | HomeScreen (entregue) / AvaliacaoScreen (pós-entrega) / MapaScreen (expande mapa). |
| **Dados necessários** | Status atual do pedido, timestamps, localização do entregador (se aplicável). |
| **Estados** | `carregando`: timeline esqueleto. `sucesso`: timeline + mapa + tempo restante. `erro`: "Não foi possível atualizar o status" + pull-to-refresh. `entregue`: timeline completa + modal avaliação. `atrasado`: "Trânsito comum na região". |
| **Ações** | Tap expandir mapa (quando saiu). Pull-to-refresh. Tap "Avaliar" (pós-entrega). Tap "Voltar". |

---

## 16. PedidosScreen

| Campo | Descrição |
|-------|-----------|
| **Objetivo** | Visualizar pedidos em andamento e histórico completo. |
| **Entrada** | Tab "Pedidos" / Notification push (tap). |
| **Saída** | DetalhePedidoScreen / RastreamentoScreen / AvaliacaoScreen / CarrinhoScreen ("Repetir"). |
| **Dados necessários** | Lista de pedidos ativos + históricos. |
| **Estados** | `vazio em andamento`: "Nenhum pedido em andamento" + CTA explorar. `vazio histórico`: "Nada ainda" + CTA. `sucesso`: lista de pedidos. `carregando`: skeletons. `erro`: "Não foi possível carregar" + retry. |
| **Ações** | Tap tab "Em andamento". Tap tab "Histórico". Tap pedido → detalhe. Tap "Acompanhar" (se em andamento). Tap "Avaliar" (se entregue). Tap "Repetir" (se histórico). |

---

## 17. DetalhePedidoScreen

| Campo | Descrição |
|-------|-----------|
| **Objetivo** | Ver detalhes completos de um pedido específico. |
| **Entrada** | PedidosScreen (tap pedido) / Notificação push. |
| **Saída** | AvaliacaoScreen / CarrinhoScreen ("Repetir") / PedidosScreen (voltar). |
| **Dados necessários** | Dados completos do pedido (itens, valores, status, endereço, pagamento). |
| **Estados** | `carregando`: spinner. `sucesso`: seções completas. `erro`: mensagem + retry. |
| **Ações** | Tap "Avaliar". Tap "Repetir pedido". Scroll vertical. Tap "Voltar". |

---

## 18. PerfilScreen

| Campo | Descrição |
|-------|-----------|
| **Objetivo** | Gerenciar dados da conta e acessar configurações. |
| **Entrada** | Tab "Perfil" / HomeScreen (ícone perfil). |
| **Saída** | EnderecoScreen / FavoritosScreen / NotificacoesScreen / ConfiguracoesScreen / LoginScreen (logout). |
| **Dados necessários** | Dados do usuário (nome, email, foto), stats (pedidos, gastos, restaurantes). |
| **Estados** | `carregando`: skeleton. `sucesso`: dados + menu. `erro`: mensagem + retry. |
| **Ações** | Tap "Endereços". Tap "Favoritos". Tap "Notificações". Tap "Configurações". Tap "Ajuda". Tap "Sair". |

---

## 19. EnderecoScreen

| Campo | Descrição |
|-------|-----------|
| **Objetivo** | Gerenciar endereços de entrega salvos. |
| **Entrada** | PerfilScreen ("Endereços") / CheckoutScreen (novo endereço). |
| **Saída** | PerfilScreen (voltar) / CheckoutScreen (endereço selecionado). |
| **Dados necessários** | Lista de endereços salvos do usuário. |
| **Estados** | `vazio`: "Nenhum endereço salvo" + CTA. `sucesso`: lista de endereços. `carregando`: spinner. `erro`: mensagem + retry. |
| **Ações** | Tap endereço (selecionar como padrão). Tap "Adicionar endereço". Tap editar endereço. Swipe para deletar. Tap "Voltar". |

---

## 20. PagamentosScreen

| Campo | Descrição |
|-------|-----------|
| **Objetivo** | Gerenciar formas de pagamento salvas (cartões). |
| **Entrada** | PerfilScreen / CheckoutScreen ("Adicionar cartão"). |
| **Saída** | PerfilScreen / CheckoutScreen (cartão selecionado). |
| **Dados necessários** | Cartões salvos do usuário. |
| **Estados** | `vazio`: "Nenhum cartão salvo" + CTA. `sucesso`: lista de cartões. `carregando`: spinner. `erro`: mensagem + retry. |
| **Ações** | Tap cartão (selecionar). Tap "Adicionar cartão". Swipe para remover. Tap "Voltar". |

---

## 21. FavoritosScreen

| Campo | Descrição |
|-------|-----------|
| **Objetivo** | Visualizar e acessar restaurantes favoritados. |
| **Entrada** | PerfilScreen ("Favoritos") / Tab "Favoritos". |
| **Saída** | RestauranteScreen (tap restaurante) / PerfilScreen / HomeScreen. |
| **Dados necessários** | Lista de restaurantes favoritados. |
| **Estados** | `vazio`: "Nada por aqui ainda" + CTA. `sucesso`: grid de cards. `carregando`: shimmer. `erro`: mensagem + retry. |
| **Ações** | Tap restaurante card (vai para RestauranteScreen). Tap ♥ (desfavoritar). Scroll vertical. Tap "Voltar". |

---

## 22. NotificacoesScreen

| Campo | Descrição |
|-------|-----------|
| **Objetivo** | Visualizar histórico de notificações push e in-app. |
| **Entrada** | PerfilScreen ("Notificações") / Header HomeScreen (ícone sino). |
| **Saída** | PedidosScreen / DetalhePedidoScreen / HomeScreen. |
| **Dados necessários** | Lista de notificações do usuário. |
| **Estados** | `vazio`: "Nada de novo". `sucesso`: lista cronológica. `carregando`: skeletons. `erro`: mensagem + retry. |
| **Ações** | Tap notificação (deep link para tela relevante). Swipe para marcar como lida. Tap "Voltar". |

---

## 23. ConfiguracoesScreen

| Campo | Descrição |
|-------|-----------|
| **Objetivo** | Ajustar preferências do app, conta e visualizar versão. |
| **Entrada** | PerfilScreen ("Configurações"). |
| **Saída** | PerfilScreen (voltar) / LoginScreen (conta excluída). |
| **Dados necessários** | Preferências atuais, versão do app. |
| **Estados** | `sucesso`: lista de opções. `carregando`: spinner para ações destrutivas. |
| **Ações** | Toggle "Notificações push". Toggle "Notificações de promoções". Toggle "Localização em segundo plano". Toggle "Modo escuro". Tap "Alterar senha". Tap "Excluir conta" → confirmação. Tap "Voltar". |

---

## Resumo Quantitativo

| Métrica | Contagem |
|---------|----------|
| Total de telas | 23 |
| Telas com entrada única | 6 (Splash, Onboarding, ProdutoDetalhe, Checkout, Confirmacao, Mapa) |
| Telas com múltiplas entradas | 17 |
| Telas com empty state | 11 (Busca, Categorias, Carrinho, Pedidos, Endereço, Pagamentos, Favoritos, Notificações, Home, Restaurante, Perfil) |
| Telas com estado de erro | 20 |
| Telas com estado offline | 9 (Home, Carrinho, Checkout, Mapa, Rastreamento, Pedidos, Login, Cadastro, Busca) |
