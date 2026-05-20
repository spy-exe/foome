# Microcopy — Foome

> Inventário completo de todos os textos do aplicativo, organizado por tela.
> Tom: rápido, urbano, honesto, local.

---

## Onboarding (3 slides)

### Slide 1
| Elemento | Texto |
|----------|-------|
| Headline | O Sul Fluminense tem fome. |
| Subtítulo | Restaurantes que você conhece, entrega que você merece. |
| CTA | Começar |
| Skip (inferior) | Já conheço |

### Slide 2
| Elemento | Texto |
|----------|-------|
| Headline | Rápido de verdade. |
| Subtítulo | Peça em segundos. Acompanhe em tempo real. Menos espera, mais comida. |
| CTA | Continuar |
| Skip (inferior) | Já conheço |

### Slide 3
| Elemento | Texto |
|----------|-------|
| Headline | Do pedido até a sua mesa. |
| Subtítulo | Veja quando o restaurante aceitou, quando saiu pra entrega e quando chegou. Sem mistério. |
| CTA | Criar minha conta |
| Skip (inferior) | Já conheço |

### Erros (Onboarding)
| Situação | Mensagem |
|----------|----------|
| Falha ao carregar slides | Ops, não conseguimos carregar. Verifique sua conexão. |

---

## Login

| Elemento | Texto |
|----------|-------|
| Título | Bem-vindo de volta |
| Subtítulo | Faça login pra continuar pedindo. |
| Label email | Email |
| Placeholder email | seu@email.com |
| Label senha | Senha |
| Placeholder senha | Sua senha |
| CTA principal | Entrar |
| CTA (loading) | Entrando... |
| Link senha | Esqueci minha senha |
| Link cadastro | Ainda não tem conta? **Criar conta** |
| Botão biométrico | Entrar com digital |

### Erros (Login)
| Situação | Mensagem |
|----------|----------|
| Email não encontrado | Nenhuma conta com esse email. Que tal criar uma? |
| Senha incorreta | Senha errada. Tente de novo ou redefina sua senha. |
| Campo email vazio | Digite seu email. |
| Campo senha vazio | Digite sua senha. |
| Email inválido | Esse email não parece válido. |
| Sessão expirada | Sua sessão expirou. Faça login de novo. |
| Erro genérico no login | Ops, algo deu errado. Tente novamente. |

---

## Cadastro (3 etapas)

### Etapa 1 — Dados
| Elemento | Texto |
|----------|-------|
| Título da etapa | Criar sua conta |
| Subtítulo | Rápido. Só o básico pra começar. |
| Label nome | Nome completo |
| Placeholder nome | Seu nome |
| Label email | Email |
| Placeholder email | seu@email.com |
| Label senha | Senha |
| Placeholder senha | Mínimo 6 caracteres |
| CTA | Continuar |

### Erros (Etapa 1)
| Situação | Mensagem |
|----------|----------|
| Nome vazio | Digite seu nome. |
| Email vazio | Digite seu email. |
| Email inválido | Esse email não parece válido. |
| Email já cadastrado | Esse email já tem conta. Que tal fazer login? |
| Senha vazia | Crie uma senha. |
| Senha curta | Use pelo menos 6 caracteres. |
| Erro ao cadastrar | Ops, algo deu errado. Tente de novo. |

### Etapa 2 — Foto
| Elemento | Texto |
|----------|-------|
| Título da etapa | Uma foto pra chamar de sua |
| Instrução | Tire uma selfie ou escolha uma foto. Isso ajuda o entregador a te reconhecer. |
| Botão principal | Tirar foto |
| Botão alternativo | Escolher da galeria |
| Botão refazer | Refazer |
| CTA | Continuar |

### Erros (Etapa 2)
| Situação | Mensagem |
|----------|----------|
| Câmera sem permissão | Precisamos da câmera pra tirar sua foto. Vá em Configurações e permita. |
| Galeria sem permissão | Precisamos da galeria pra escolher uma foto. Vá em Configurações e permita. |
| Foto não carregou | Não conseguiu salvar a foto? Tente de novo ou pule essa etapa. |

### Etapa 3 — Confirmação
| Elemento | Texto |
|----------|-------|
| Título da etapa | Quase lá! |
| Subtítulo | Confira seus dados antes de começar. |
| Label nome | Nome |
| Label email | Email |
| CTA | Criar conta |
| CTA (loading) | Criando conta... |

### Erros (Etapa 3)
| Situação | Mensagem |
|----------|----------|
| Erro ao criar conta | Ops, não foi dessa vez. Verifique seus dados e tente de novo. |

---

## Recuperar Senha

| Elemento | Texto |
|----------|-------|
| Título | Esqueceu sua senha? |
| Subtítulo | Digite seu email que a gente te ajuda. |
| Label email | Email |
| Placeholder email | seu@email.com |
| CTA | Enviar link |
| Confirmação enviada | Email enviado! Siga as instruções pra redefinir sua senha. |

### Erros (Recuperar Senha)
| Situação | Mensagem |
|----------|----------|
| Email não encontrado | Esse email não está cadastrado. |
| Erro ao enviar | Ops, não conseguimos enviar o email. Tente de novo. |

---

## Home

| Elemento | Texto |
|----------|-------|
| Saudação — Manhã (5h-11h59) | Bom dia, {nome}! |
| Subtítulo — Manhã | Vassouras já acordou. Que tal um café? |
| Saudação — Tarde (12h-17h59) | Boa tarde, {nome}! |
| Subtítulo — Tarde | A fome bateu? A gente resolve. |
| Saudação — Noite (18h-23h59) | Boa noite, {nome}! |
| Subtítulo — Noite | Fome de noite é normal. A gente entrega. |
| Saudação — Madrugada (0h-4h59) | E aí, {nome}! |
| Subtítulo — Madrugada | A madrugada é longa. A gente fica com você. |
| Seção 1 | Ofertas relâmpago |
| Seção 2 | {Último restaurante} de novo? (baseado no histórico) |
| Seção 3 | Perto de você |
| Seção 4 | Novidades |
| Placeholder busca | Buscar restaurante ou prato... |
| Badge "Aberto" | Aberto agora |
| Badge "Fechado" | Fechado |
| Badge tempo | {N} min |
| Badge promoção | {N}% OFF |

### Empty States (Home)
| Situação | Ícone | Título | Subtítulo | CTA |
|----------|-------|--------|-----------|-----|
| Busca sem resultado | 🔍 | Nada por aqui | Nenhum restaurante ou prato encontrado. Tente outro nome. | — |
| Sem restaurantes perto | 📭 | Nenhum restaurante por perto | Sua região ainda não tem restaurantes no Foome. Quer sugerir um? | Sugerir restaurante |
| Histórico vazio | 🍽️ | Bora pedir? | Seu histórico está vazio. Quando fizer o primeiro pedido, aparece aqui. | Explorar restaurantes |

### Loading (Home)
| Elemento | Texto |
|----------|-------|
| Shimmer | — (esqueletos de cards) |
| Texto inicial | Carregando perto de você... |

### Erros (Home)
| Situação | Mensagem |
|----------|----------|
| Erro ao carregar | Ops, não conseguimos carregar os restaurantes. |
| Offline | Sem conexão — mostrando dados salvos. |

---

## Restaurante

| Elemento | Texto |
|----------|-------|
| Badge | Aberto agora / Fechado |
| Tempo de entrega | {N}–{N} min |
| Taxa de entrega | Grátis / R$ {N},{N} |
| Tabs cardápio | Destaques / Pratos / Bebidas / Sobremesas (padrão, flexível por restaurante) |
| CTA carrinho flutuante | Ver carrinho • {N} item(ns) — R$ {N},{N} |

### Estados (Restaurante)
| Situação | Texto |
|----------|-------|
| Restaurante fechado | Esse restaurante está fechado agora. Volta {horário}. |
| Cardápio vazio | Nenhum item disponível ainda. |
| Erro ao carregar cardápio | Não conseguimos carregar o cardápio. Puxe pra atualizar. |
| Restaurante sem taxa | Taxa de entrega: Grátis |

### Loading (Restaurante)
| Texto |
|-------|
| Carregando cardápio... |

---

## Produto Detalhe

| Elemento | Texto |
|----------|-------|
| Título seção tamanhos | Escolha o tamanho |
| Título seção adicionais | Adicionais |
| Placeholder observações | Alguma observação? Ex: sem cebola, bem passado... |
| CTA principal | Adicionar — R$ {N},{N} |
| CTA (loading) | Adicionando... |
| Quando item já no carrinho | Já no carrinho • {N}x |

### Erros (Produto Detalhe)
| Situação | Mensagem |
|----------|----------|
| Tamanho obrigatório não selecionado | Escolha um tamanho antes de adicionar. |
| Adicionar sem estoque | Esse item acabou :( |

---

## Carrinho

| Elemento | Texto |
|----------|-------|
| Título da tela | Seu carrinho |
| Label subtotal | Subtotal |
| Label desconto | Desconto |
| Label taxa entrega | Taxa de entrega |
| Label total | Total |
| Placeholder cupom | Cupom de desconto |
| Mensagem cupom válido | Cupom aplicado! |
| Mensagem cupom inválido | Cupom não encontrado ou expirado. |
| CTA checkout | Confirmar pedido — R$ {N},{N} |
| CTA checkout (loading) | Confirmando... |

### Estados (Carrinho)
| Situação | Ícone | Título | Subtítulo | CTA |
|----------|-------|--------|-----------|-----|
| Carrinho vazio | 🛒 | Carrinho vazio | Adicione itens de um restaurante pra começar. | Explorar restaurantes |
| Carrinho vindo de tela de repetir | — | Carrinho preenchido | Último pedido do {restaurante}. Confira antes de confirmar. | — |

### Erros (Carrinho)
| Situação | Mensagem |
|----------|----------|
| Item indisponível | "{Item}" não está mais disponível. Ele foi removido do carrinho. |
| Mínimo não atingido | Valor mínimo não atingido. Faltam R$ {N},{N}. |
| Restaurante fechou | O restaurante fechou enquanto você escolhia. Que peninha. |

### Loading (Carrinho)
| Texto |
|-------|
| Atualizando carrinho... |

---

## Checkout

| Elemento | Texto |
|----------|-------|
| Título tela | Finalizar pedido |
| Título etapa 1 | Endereço de entrega |
| Título etapa 2 | Pagamento |
| Título etapa 3 | Revisão |

### Endereço
| Elemento | Texto |
|----------|-------|
| Label rua | Rua |
| Placeholder rua | Nome da rua |
| Label número | Número |
| Placeholder número | Nº |
| Label bairro | Bairro |
| Placeholder bairro | Seu bairro |
| Label complemento | Complemento (opcional) |
| Placeholder complemento | Apto, bloco, ponto de referência... |
| Label CEP | CEP |
| Placeholder CEP | 00000-000 |
| Label observação | Observação pro entregador |
| Placeholder observação | Ex: tocar interfone, portão azul... |
| CTA salvar endereço | Salvar endereço |

### Pagamento
| Elemento | Texto |
|----------|-------|
| Label cartão crédito | Cartão de crédito |
| Label cartão débito | Cartão de débito |
| Label dinheiro | Dinheiro (troco) |
| Label PIX | PIX |
| Instrução PIX | Pague com PIX escaneando o QR Code. |
| CTA adicionar cartão | Adicionar cartão |
| Placeholder nome cartão | Nome no cartão |
| Placeholder número cartão | Número do cartão |
| Placeholder validade | Validade |
| Placeholder CVV | CVV |
| Placeholder troco | Troco pra quanto? |
| CTA salvar cartão | Salvar |

### Revisão
| Elemento | Texto |
|----------|-------|
| Seção resumo | Seu pedido |
| Tempo estimado | {N}–{N} min |
| Endereço de entrega | Entregar em: {endereço} |
| CTA principal | Confirmar pedido |
| CTA (loading) | Enviando pedido... |

### Erros (Checkout)
| Situação | Mensagem |
|----------|----------|
| Endereço incompleto | Preencha todos os campos do endereço. |
| Nenhum método de pagamento | Escolha como pagar. |
| Cartão inválido | Verifique os dados do cartão. |
| Pagamento recusado | Pagamento não aprovado. Que tal tentar outro método? |
| PIX não confirmado | Aguardando confirmação do PIX — não saia da tela. |
| Erro ao confirmar pedido | Ops, não conseguimos confirmar seu pedido. Tente de novo. |
| Offline | Sem conexão. Seu pedido não foi perdido — ele volta assim que você estiver online. |

---

## Confirmação

| Elemento | Texto |
|----------|-------|
| Título de sucesso | Pedido confirmado! |
| Subtítulo | Relaxa que a gente cuida do resto. |
| Label número do pedido | Pedido #{N} |
| Label tempo estimado | Entrega prevista em {N} min |
| CTA 1 | Acompanhar pedido |
| CTA 2 | Voltar ao início |

### Erros (Confirmação)
| Situação | Mensagem |
|----------|----------|
| Não chegou confirmação | Pedido enviado! Se não aparecer em instantes, veja em "Em andamento". |

---

## Mapa

| Elemento | Texto |
|----------|-------|
| Título | Acompanhe sua entrega |
| Aviso | Mantenha a localização ligada pra ver o entregador chegar. |
| CTA centralizar | Centralizar |

### Estados (Mapa)
| Situação | Mensagem |
|----------|----------|
| Localização desligada | Localização desativada. Ative nas configurações. |
| Permissão negada | Precisamos da sua localização pra mostrar o entregador. Vá em Configurações e permita. |
| Sem dados de localização | Aguardando localização do entregador... |

---

## Rastreamento

| Elemento | Texto |
|----------|-------|
| Título | Acompanhando pedido #{N} |

### Estados de Status
| Status | Título | Subtexto |
|--------|--------|----------|
| Restaurante confirmou | Pedido confirmado | O restaurante viu seu pedido e já vai preparar. |
| Em preparo | Preparando | A cozinha já está cuidando do seu pedido. |
| Saiu para entrega | Saiu pra entrega | {ou: Nome do entregador} pegou seu pedido e está a caminho. |
| Entregue | Entregue! | Bom apetite! |
| Aguardando confirmação | Aguardando confirmação | Um instante enquanto o restaurante confirma... |

| Elemento | Texto |
|----------|-------|
| Timestamp | às 14:32 |
| Tempo restante | Chega em {N} min |
| Nome placeholder entregador | Seu entregador |
| Aviso atraso | Trânsito comum na região. Pode atrasar alguns minutos. |

### Notificações Push (Rastreamento)
| Situação | Push |
|----------|------|
| Pedido confirmado | Seu pedido #{N} foi confirmado! O {restaurante} já vai preparar. |
| Em preparo | Seu pedido #{N} está sendo preparado. |
| Saiu para entrega | Seu pedido #{N} saiu pra entrega! 🚀 |
| Entregue | Seu pedido #{N} chegou! Bom apetite! |

---

## Pedidos

| Elemento | Texto |
|----------|-------|
| Tab ativa | Em andamento |
| Tab inativa | Histórico |

### Estados (Pedidos)
| Situação | Ícone | Título | Subtítulo | CTA |
|----------|-------|--------|-----------|-----|
| Nenhum em andamento | 📭 | Nenhum pedido em andamento | Quando você pedir, aparece aqui. | Explorar restaurantes |
| Histórico vazio | 🍽️ | Nada ainda | Seus pedidos anteriores aparecem aqui. | Fazer primeiro pedido |

### Ações por pedido
| Botão | Texto |
|-------|-------|
| Acompanhar | Acompanhar |
| Avaliar | Avaliar |
| Repetir | Repetir |
| Detalhes | Ver detalhes |

---

## Detalhe do Pedido

| Elemento | Texto |
|----------|-------|
| Título | Pedido #{N} |
| Seção restaurante | Restaurante |
| Seção itens | Itens |
| Seção endereço | Entregar em |
| Seção pagamento | Pagamento |
| Seção status | Status |
| Label total | Total |
| Label taxa | Taxa de entrega |
| Label desconto | Desconto |
| CTA 1 | Avaliar pedido |
| CTA 2 | Repetir pedido |

### Estados (Detalhe do Pedido)
| Situação | Texto |
|----------|-------|
| Pedido em andamento | (status atual do rastreamento) |
| Pedido entregue | Entregue em {data} |

---

## Avaliação

| Elemento | Texto |
|----------|-------|
| Título — 1 estrela | Poxa, o que deu errado? |
| Título — 2 estrelas | Podia ser melhor. |
| Título — 3 estrelas | Foi ok. |
| Título — 4 estrelas | Foi bom! |
| Título — 5 estrelas | Perfeito! |
| Label restaurante | Como foi o {restaurante}? |
| Placeholder comentário | Conta mais sobre sua experiência... |
| CTA | Enviar avaliação |
| CTA (loading) | Enviando... |
| Confirmação enviada | Avaliação enviada! Sua opinião ajuda todo mundo. |

### Erros (Avaliação)
| Situação | Mensagem |
|----------|----------|
| Erro ao enviar | Não conseguimos enviar sua avaliação. Tente de novo. |

---

## Perfil

| Elemento | Texto |
|----------|-------|
| Título | Sua conta |
| Seção 1 | Endereços |
| Seção 2 | Favoritos |
| Seção 3 | Notificações |
| Seção 4 | Configurações |
| Seção 5 | Ajuda |

### Stats do Perfil
| Stat | Formato |
|------|---------|
| Total de pedidos | {N} pedidos |
| Total gasto | R$ {N},{N} gastos |
| Restaurantes visitados | {N} restaurantes |

---

## Endereços

| Elemento | Texto |
|----------|-------|
| Título | Meus endereços |
| Badge | Padrão |
| CTA adicionar | Adicionar endereço |
| CTA salvar | Salvar |

### Modal Adicionar Endereço
| Elemento | Texto |
|----------|-------|
| Título modal | Novo endereço |
| Label | Rua |
| Placeholder | Nome da rua |
| Label | Número |
| Placeholder | Nº |
| Label | Bairro |
| Placeholder | Seu bairro |
| Label | Complemento (opcional) |
| Placeholder | Apto, bloco... |
| Label | CEP |
| Placeholder | 00000-000 |

### Estados (Endereços)
| Situação | Ícone | Título | Subtítulo | CTA |
|----------|-------|--------|-----------|-----|
| Sem endereços | 📍 | Nenhum endereço salvo | Adicione seu endereço pra começar a pedir. | Adicionar endereço |

---

## Pagamentos

| Elemento | Texto |
|----------|-------|
| Título | Formas de pagamento |
| CTA adicionar | Adicionar cartão |

### Estados (Pagamentos)
| Situação | Ícone | Título | Subtítulo | CTA |
|----------|-------|--------|-----------|-----|
| Nenhum cartão | 💳 | Nenhum cartão salvo | Adicione um cartão ou pague com PIX na hora. | Adicionar cartão |

---

## Favoritos

| Elemento | Texto |
|----------|-------|
| Título | Favoritos |

### Estados (Favoritos)
| Situação | Ícone | Título | Subtítulo | CTA |
|----------|-------|--------|-----------|-----|
| Sem favoritos | 💔 | Nada por aqui ainda | Você ainda não favoritou nenhum restaurante. Quando encontrar um lugar que ama, é só tocar no ♥. | Explorar restaurantes |

---

## Notificações

| Elemento | Texto |
|----------|-------|
| Título | Notificações |

### Estados (Notificações)
| Situação | Ícone | Título | Subtítulo | CTA |
|----------|-------|--------|-----------|-----|
| Sem notificações | 🔔 | Nada de novo | Toda novidade aparece aqui. Fica tranquilo, a gente avisa. | — |

### Push Notification Texts
| Tipo | Título | Corpo |
|------|--------|-------|
| Pedido confirmado | Pedido confirmado! | Seu pedido no {restaurante} foi confirmado. |
| Em preparo | Preparando | O {restaurante} já está preparando seu pedido. |
| Saiu para entrega | Saiu pra entrega | Seu pedido saiu pra entrega. Fica de olho! |
| Entregue | Chegou! | Seu pedido chegou. Bom apetite! |
| Promoção relâmpago | ⚡ Hoje tem | {restaurante} com {N}% OFF. Corre que é por tempo limitado! |

---

## Configurações

| Elemento | Texto |
|----------|-------|
| Título | Configurações |
| Toggle 1 | Notificações push |
| Toggle 2 | Notificações de promoções |
| Toggle 3 | Localização em segundo plano |
| Toggle 4 | Modo escuro |
| Link | Alterar senha |
| Link | Excluir conta |
| Label versão | Versão {N}.{N}.{N} |

### Confirmação Excluir Conta
| Situação | Texto |
|----------|-------|
| Alerta título | Excluir conta? |
| Alerta mensagem | Todos os seus dados serão apagados. Essa ação não pode ser desfeita. |
| CTA confirmar | Sim, excluir |
| CTA cancelar | Cancelar |

---

## Erros Globais

| Situação | Mensagem |
|----------|----------|
| Sem conexão com internet | Sem conexão. Verifique seu Wi-Fi ou dados móveis. |
| Erro ao carregar restaurantes | Não conseguimos carregar os restaurantes. Puxe pra atualizar. |
| Erro ao confirmar pedido | Ops, algo deu errado ao confirmar seu pedido. Tente de novo. |
| Sessão expirada | Sua sessão expirou. Faça login de novo. |
| Erro genérico | Ops, algo deu errado. |
| Retry | Tentar novamente |

### Modal de Erro com Retry
| Elemento | Texto |
|----------|-------|
| Título | Algo deu errado |
| Mensagem | Não foi possível completar essa ação. |
| CTA 1 | Tentar novamente |
| CTA 2 | Cancelar |

---

## Componentes Reutilizáveis

| Componente | Texto / Comportamento |
|------------|-----------------------|
| Badge "Novidade" | Novo |
| Badge "Promoção" | {N}% OFF |
| Badge "Fechado" | Fechado |
| Badge "Aberto" | Aberto agora |
| Toast pedido adicionado | Adicionado ao carrinho! |
| Toast erro breve | Ops, algo deu errado. |
| Pull-to-refresh padrão | Solte pra atualizar |
| Pull-to-refresh carregando | Atualizando... |
| Timer de promoção (relâmpago) | Termina em {N}min |
