# Sistema de Pedidos - Monolito

Esta pasta contem a versao **monolito** da atividade de Sistemas Distribuidos.

Nesta versao, tudo roda em uma unica aplicacao Node.js com Fastify, em uma unica porta HTTP, usando um unico banco PostgreSQL. As capacidades de cardapio, pedidos, pagamentos e notificacoes estao organizadas em pastas, mas se comunicam por chamadas diretas de services, sem filas e sem servicos separados.

## Como Rodar

Entre na pasta do monolito:

```bash
cd monolito
```

Instale as dependencias:

```bash
npm install
```

Suba o PostgreSQL unico desta versao:

```bash
docker compose up -d
```

O compose expoe este PostgreSQL em `localhost:5434` para evitar conflito com outro banco local na porta `5432`.

Crie o arquivo `.env` a partir do exemplo, se quiser alterar alguma configuracao:

```bash
cp .env.example .env
```

Inicie a aplicacao:

```bash
npm run dev
```

Por padrao, a API roda em:

```txt
http://localhost:3000
```

## Health Check

```bash
curl http://localhost:3000/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "architecture": "monolito"
}
```

## Fluxo Completo

### 1. Criar item do cardapio

```bash
curl -X POST http://localhost:3000/menu-items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "X-Burguer",
    "description": "Pao, carne, queijo e salada",
    "price": 15.5,
    "available": true
  }'
```

### 2. Listar cardapio

```bash
curl http://localhost:3000/menu-items
```

### 3. Criar pedido

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "menuItemId": 1,
        "quantity": 2
      }
    ],
    "observation": "Sem cebola"
  }'
```

O pedido nasce com status `CREATED`.

### 4. Processar pagamento

```bash
curl -X POST http://localhost:3000/payments \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1
  }'
```

O pagamento e mockado, demora 5 segundos, cria um pagamento `APPROVED`, muda o pedido para `PAID`, chama diretamente `notificationsService.notifyKitchen(order)` e entao muda o pedido para `SENT_TO_KITCHEN`.

### 5. Consultar pedido

```bash
curl http://localhost:3000/orders/1
```

### 6. Consultar notificacoes

```bash
curl http://localhost:3000/notifications
```

## Outros Endpoints

Cardapio:

```txt
POST   /menu-items
GET    /menu-items
GET    /menu-items/:id
PUT    /menu-items/:id
DELETE /menu-items/:id
```

Pedidos:

```txt
POST /orders
GET  /orders
GET  /orders/:id
POST /orders/:id/cancel
```

Pagamentos:

```txt
POST /payments
GET  /payments/:id
GET  /payments/order/:orderId
```

Notificacoes:

```txt
GET /notifications
GET /notifications/:id
```

## Experimento Obrigatorio da Lentidao

O endpoint `POST /payments` possui um `sleep` de 5 segundos para simular lentidao no pagamento.

O que observar:

- O pagamento demora para responder.
- Como tudo esta no mesmo deploy, a lentidao fica dentro da mesma aplicacao.
- Como o sleep foi implementado de forma assincrona no Node.js, outros endpoints podem continuar respondendo durante a espera.
- Mesmo assim, o gargalo pertence ao mesmo sistema, usa o mesmo processo de aplicacao e afeta a experiencia geral do monolito.
- Em um monolito, problemas em uma parte podem afetar a percepcao e a operacao da aplicacao inteira.

## O que precisaria mudar se o módulo de cardápio precisasse escalar 10x mais que o resto?

Em um monolito, nao e possivel escalar apenas o modulo de cardapio de forma independente. Seria necessario escalar a aplicacao inteira, mesmo que apenas o cardapio precisasse de mais CPU, memoria ou replicas.

Para escalar somente o cardapio, seria necessario separar essa parte em outro servico ou evoluir a solucao para uma arquitetura mais modular ou de microsservicos, com deploy e recursos independentes.

## Partes Mais Acopladas

A parte mais acoplada e o fluxo de pagamento:

```txt
paymentsService.processPayment
  -> ordersService.getOrderBasic
  -> ordersService.markAsPaid
  -> notificationsService.notifyKitchen
  -> ordersService.markAsSentToKitchen
```

Esse acoplamento e natural no monolito: o pagamento chama diretamente pedidos e notificacoes, sem HTTP interno, sem fila e sem contrato separado entre servicos.

## O que foi facil e dificil de modificar

Foi facil implementar o fluxo principal porque tudo esta na mesma aplicacao e no mesmo banco. O service de pagamento consegue chamar pedidos e notificacoes diretamente, e uma unica transacao pode envolver pagamento, atualizacao do pedido e notificacao.

A parte dificil aparece quando o sistema cresce: modificar ou escalar partes isoladas fica mais trabalhoso, porque os dominios compartilham deploy, banco e processo. Uma falha, lentidao ou mudanca em pagamento pode afetar a experiencia geral da aplicacao.

## Banco de Dados

Esta versao usa apenas um PostgreSQL, sem schemas separados. As tabelas sao:

- `menu_items`
- `orders`
- `order_items`
- `payments`
- `notifications`

O arquivo [sql/init.sql](./sql/init.sql) cria todas as tabelas no mesmo banco.
