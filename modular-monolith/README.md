# Monolito Modular - Sistema de Pedidos de Lanchonete

Esta pasta implementa somente a versao Monolito Modular do trabalho. Ela roda como uma unica aplicacao Fastify em uma unica porta, com um unico PostgreSQL, mas separa o banco em schemas por modulo:

- `menu.*`
- `orders.*`
- `payments.*`
- `notifications.*`

## Como rodar

```bash
cd modular-monolith
cp .env.example .env
docker compose up --build
```

A aplicacao sobe em `http://localhost:3000`. O container executa a migracao inicial antes de iniciar o servidor.

Para desenvolvimento local:

```bash
cd modular-monolith
cp .env.example .env
npm install
npm run db:migrate
npm run dev
```

## Fluxo criar pedido -> pagar -> notificar cozinha

1. Criar um item de cardapio:

```bash
curl -X POST http://localhost:3000/menu-items \
  -H "Content-Type: application/json" \
  -d '{"name":"X-Salada","description":"Hamburguer com salada","price":18.5,"available":true}'
```

2. Criar um pedido usando o item criado:

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[{"menuItemId":1,"quantity":2}],"observation":"Sem cebola"}'
```

O pedido nasce com status `PENDING_PAYMENT` e total calculado pelo modulo `orders` usando a interface publica do modulo `menu`.

3. Processar o pagamento mockado:

```bash
curl -X POST http://localhost:3000/payments \
  -H "Content-Type: application/json" \
  -d '{"orderId":1}'
```

Se o pagamento for aprovado, o modulo `payments` chama `OrderService` para marcar o pedido como `PAID`, chama `NotificationService` para notificar a cozinha e depois chama `OrderService` novamente para mudar o pedido para `SENT_TO_KITCHEN`.

4. Conferir pedido e notificacao:

```bash
curl http://localhost:3000/orders/1
curl http://localhost:3000/notifications
```

Para simular pagamento rejeitado:

```bash
curl -X POST http://localhost:3000/payments \
  -H "Content-Type: application/json" \
  -d '{"orderId":1,"approved":false}'
```

## Endpoints

- `GET /health`
- `POST /menu-items`
- `GET /menu-items`
- `GET /menu-items/:id`
- `PUT /menu-items/:id`
- `DELETE /menu-items/:id`
- `POST /orders`
- `GET /orders`
- `GET /orders/:id`
- `POST /orders/:id/cancel`
- `POST /payments`
- `GET /payments/:id`
- `GET /payments/order/:orderId`
- `GET /notifications`
- `GET /notifications/:id`

## Separacao dos modulos

Cada modulo fica em `src/modules/<modulo>` e possui:

- `interfaces`: contrato publico usado por outros modulos.
- `repositories`: acesso ao schema/tabelas do proprio modulo.
- `services`: regras de negocio do modulo.
- `routes`: endpoints HTTP.
- `types`: tipos do dominio.

As interfaces publicas principais sao:

- `MenuService`
- `OrderService`
- `PaymentService`
- `NotificationService`

## Comunicacao entre modulos

Os modulos se comunicam apenas por interfaces tipadas. Exemplos:

- `orders` usa `MenuService` para buscar itens disponiveis e calcular o total.
- `payments` usa `OrderService` para consultar e atualizar status do pedido.
- `payments` usa `NotificationService` para notificar a cozinha.

Nenhum modulo importa repository, tabela ou entidade interna de outro modulo.

## Troca da implementacao de pagamento

A troca acontece em `src/shared/config/container.ts`, que centraliza a injecao das dependencias.

No `.env`, escolha:

```env
PAYMENT_IMPLEMENTATION=mock
```

ou:

```env
PAYMENT_IMPLEMENTATION=slow
SLOW_PAYMENT_DELAY_MS=2000
```

`mock` aprova o pagamento imediatamente. `slow` usa a mesma interface `PaymentService`, mas adiciona atraso artificial antes de processar. Nenhum modulo de `orders`, `menu` ou `notifications` precisa ser alterado para trocar a implementacao.

Esforco para trocar o modulo de pagamento: **baixo**. A mudanca fica concentrada no ponto central de configuracao/injecao.

## Modulos que poderiam virar servicos independentes

- `menu`: tem dados proprios e uma API clara de consulta de itens.
- `payments`: ja troca por interface e poderia virar um servico com provider real.
- `notifications`: tem baixo acoplamento e poderia consumir eventos.
- `orders`: poderia virar o orquestrador do fluxo de pedidos.

## O que faltaria para virar microsservicos

- Separar deploys e portas por servico.
- Dar um banco proprio para cada servico, sem banco compartilhado.
- Trocar chamadas internas por HTTP, mensageria ou eventos.
- Adicionar contratos de API entre servicos.
- Implementar timeout, retry e tratamento de indisponibilidade.
- Usar uma fila para notificacao da cozinha.
