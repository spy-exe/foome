# Foome - Guia do Professor
## Roteiro de teste em celular

Este guia descreve como testar o estado atual do app por fluxo de usuario. Onde a spec previa uma funcionalidade que ainda nao aparece no codigo, o passo esta marcado como **Nao implementado** para facilitar a avaliacao.

## Preparacao

1. Acesse o repositorio: `https://github.com/spy-exe/Foome-Final`
2. Clone o projeto: `git clone https://github.com/spy-exe/Foome-Final.git`
3. Entre na pasta: `cd Foome-Final`
4. Instale dependencias: `npm install`
5. Inicie o Expo: `npx expo start`
6. Abra o app no celular com Expo Go escaneando o QR Code.

## Importante

- Teste em celular real. Camera, biometria, GPS e haptics dependem do dispositivo.
- Mantenha o celular na vertical, porque `app.json` define `orientation: portrait`.
- O app usa armazenamento local. Para repetir o primeiro acesso, limpe os dados do app no celular.
- Nao ha Tab Navigator no estado atual. A navegacao acontece por botoes dentro das telas.

## Fluxo 1: Primeiro acesso e autenticacao (5 min)

### 1.1 Entrada inicial

1. Abra o Foome.
2. Verifique se aparece a tela de login com marca Foome.
3. Confirme que nao ha onboarding de 3 telas. **Nao implementado**.
4. Toque em "Cadastre-se gratis".

### 1.2 Cadastro

5. Preencha nome, email e senha.
6. Toque no circulo de foto.
7. Permita acesso a camera.
8. Tire uma selfie.
9. No preview, toque em "Usar esta foto".
10. Toque em "Criar conta".
11. Resultado atual esperado: o app entra direto na Home.
12. Observacao de QA: a spec esperava retorno ao Login, mas o codigo autentica automaticamente.

### 1.3 Login posterior

13. Feche e abra o app novamente ou limpe/recrie a sessao conforme necessario.
14. Se existir usuario salvo, veja o card "Bem-vindo de volta".
15. Toque "Entrar com biometria" e autentique com digital/Face ID.
16. Alternativa: digite email e senha exatamente como cadastrados e toque "Entrar".
17. Verifique que email com caixa diferente pode falhar. Exemplo: cadastrar `Teste@email.com` e tentar `teste@email.com`.

## Fluxo 2: Fazer um pedido (7 min)

### 2.1 Explorar restaurantes

1. Na Home, veja header, busca, banner promocional, chips de categoria e lista de restaurantes.
2. Toque em "Burgers" ou outro chip.
3. Confirme que a lista filtra por categoria.
4. Toque no chip ativo novamente.
5. Digite "Pizza" na busca.
6. Confirme que a lista filtra e que o X limpa a busca.
7. Digite um termo inexistente e confira o empty state.

### 2.2 Cardapio

8. Toque em um restaurante.
9. Veja o header colorido com emoji, nome, avaliacao, tempo e entrega.
10. Deslize a lista de produtos.
11. Confirme que nao ha abas de subcategoria nem parallax de header. **Nao implementado**.

### 2.3 Adicionar itens

12. Toque no `+` de um produto.
13. Veja o Stepper mudar para quantidade 1.
14. Toque `+` novamente e depois `-`.
15. Adicione dois produtos diferentes.
16. Verifique o CTA flutuante "Ver carrinho" com quantidade e valor total.
17. Toque no card do produto e confirme que nao abre bottom sheet de detalhes. **Nao implementado**.

### 2.4 Carrinho

18. Toque em "Ver carrinho".
19. Revise itens, subtotal, entrega e total.
20. Deslize um item para a esquerda e toque "Remover".
21. Digite `FOOME10` no cupom e toque "Aplicar".
22. Confirme o desconto de 10%.
23. Escolha um endereco: Casa, Trabalho ou Faculdade.
24. Escolha pagamento: PIX, Credito ou Debito.

### 2.5 Checkout

25. Toque "Confirmar pedido".
26. Veja o overlay de biometria.
27. Autentique no sensor do celular.
28. Resultado esperado: toast "Pedido confirmado!", carrinho limpo e navegacao para Pedidos.
29. Teste negativo: repita o pedido e cancele a biometria para validar alerta de falha.

## Fluxo 3: Acompanhar pedido e avaliar (3 min)

1. Apos confirmar um pedido, abra `PedidosScreen`.
2. Veja o card com restaurante, itens, data, total e status "Confirmado".
3. Aguarde aproximadamente 10 segundos para "Em preparo".
4. Aguarde mais 10 segundos para "A caminho".
5. Aguarde mais 10 segundos para "Entregue".
6. Quando chegar em "Entregue", aguarde o modal de avaliacao.
7. Toque em "Enviar avaliacao" sem selecionar estrelas.
8. Confirme o alerta pedindo nota.
9. Selecione de 1 a 5 estrelas.
10. Escreva um comentario opcional.
11. Toque "Enviar avaliacao".
12. Resultado esperado: alerta "Obrigado!".
13. Toque no card do pedido e confirme que nao abre tela de detalhes/timeline. **Nao implementado**.

## Fluxo 4: Mapa (2 min)

1. Na Home, toque no botao de mapa ou no link "Ver no mapa".
2. Permita ou negue localizacao quando solicitado.
3. Verifique que o mapa abre em Vassouras/RJ.
4. Se permitir localizacao, confira se o ponto do usuario aparece.
5. Observacao de QA: o mapa nao centraliza automaticamente na posicao real.
6. Toque em um marker.
7. Verifique o bottom sheet com emoji, nome, categoria, avaliacao, tempo e entrega.
8. Toque fora do sheet no mapa.
9. Toque em outro marker e depois em "Ver cardapio".
10. Resultado esperado: navega para `RestauranteScreen`.
11. Procure filtros de categoria e botao de centralizar localizacao. **Nao implementado**.

## Fluxo 5: Perfil e configuracoes (2 min)

1. Na Home, toque no avatar no canto superior direito.
2. Resultado atual esperado: tela simples com "Perfil" e "Em breve...".
3. Procure foto, nome e email do usuario. **Nao implementado**.
4. Procure toggle de Dark Mode. **Nao implementado na UI**.
5. Procure "Alterar senha". **Nao implementado**.
6. Procure "Sair da conta". **Nao implementado**.
7. Observacao de QA: existe `ThemeProvider`, mas as telas usam cores estaticas e nao ha controle visual de tema.

## Fluxo 6: Features especiais (2 min)

### 6.1 Favoritos

1. Faca pelo menos um pedido.
2. Volte para Home.
3. Veja se aparece a secao "Favoritos seus".
4. Confirme cards com emoji, nome, preco e contagem de vezes pedidas.

### 6.2 Repetir ultimo pedido

5. Ainda na Home, procure o FAB laranja com icone de repeat no canto inferior direito.
6. Toque no FAB.
7. Resultado esperado: app popula o carrinho com itens do ultimo pedido e abre `CarrinhoScreen`.
8. Confirme subtotal, entrega e total antes de finalizar novamente.

### 6.3 Recursos prometidos mas ausentes

9. Onboarding inicial. **Nao implementado**.
10. Bottom sheet de detalhes do produto. **Nao implementado**.
11. Timeline detalhada do pedido. **Nao implementado**.
12. Perfil completo. **Nao implementado**.
13. Dark mode por toggle. **Nao implementado na UI**.

## Checklist de avaliacao

| Criterio | Peso | Nota |
|---|---:|---:|
| Fluxo de cadastro funciona | 10% | /10 |
| Fluxo de login por senha e biometria | 10% | /10 |
| Navegacao entre telas existentes | 10% | /10 |
| Adicionar/remover itens do carrinho | 10% | /10 |
| Confirmar pedido com biometria | 10% | /10 |
| Acompanhamento de pedido por status | 10% | /10 |
| Mapa com markers e bottom sheet | 10% | /10 |
| Cupom de desconto `FOOME10` | 5% | /5 |
| Avaliacao pos-entrega | 5% | /5 |
| Perfil e configuracoes | 5% | /5 |
| Onboarding/splash/primeira experiencia | 5% | /5 |
| Features especiais: favoritos e repetir pedido | 5% | /5 |
| Qualidade visual, feedback e acessibilidade | 5% | /5 |
| **TOTAL** | **100%** | **/100** |

## Observacoes para o professor

- Se uma tela ficar em branco ao abrir o carrinho direto, registre como bug de estado invalido.
- Se a biometria falhar, anote se o app mostra o motivo ou apenas mensagem generica.
- Verifique o app em pelo menos um Android real, porque `app.json` declara permissoes Android especificas.
- Ao avaliar o roteiro de features, diferencie recurso funcionando, recurso parcial e recurso ainda placeholder.
- Para resetar pedidos, limpe dados do app no sistema operacional ou reinstale o app no Expo Go.
