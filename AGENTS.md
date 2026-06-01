# AGENTS.md

## Contexto do projeto

Este repositório implementa um trabalho de Sistemas Distribuídos comparando três estilos arquiteturais para o mesmo domínio de negócio: **Monólito**, **Monólito Modular** e **Microsserviços**.

O domínio é um **Sistema de Pedidos de Lanchonete** com as mesmas capacidades nas três versões:

* **Pedidos**: criar, listar e cancelar pedidos.
* **Cardápio**: CRUD de itens, preço e disponibilidade.
* **Pagamento**: processar pagamento mockado e consultar status.
* **Notificação**: notificar a cozinha quando o pedido for pago.

Regra crítica de negócio:

> Um pedido só pode ir para a cozinha depois da confirmação do pagamento.

Essa regra deve existir nas três versões, mudando apenas a forma de organização e comunicação entre as partes.

## Objetivo do agente

Atuar como um engenheiro de software ajudando a implementar, documentar e comparar as três arquiteturas, mantendo o escopo acadêmico simples, claro e executável.

O agente deve priorizar:

1. Código funcional e fácil de rodar.
2. Separação clara entre as três versões.
3. Comparação justa: mesma stack, mesmo domínio, mesmos fluxos principais.
4. Documentação objetiva para README e relatório comparativo.
5. Evitar complexidade desnecessária que não seja pedida pela atividade.

## Stack sugerida

Usar a mesma stack nas três versões para a comparação ser justa.

Sugestão principal:

* Backend: Node.js com Fastify.
* Banco: PostgreSQL.
* Mensageria: RabbitMQ para a versão de microsserviços.
* Orquestração: Docker Compose.
* Testes/experimentos: scripts simples com k6, autocannon, curl ou Thunder Client/Insomnia.

Não misturar stacks entre versões.

## Estrutura sugerida do repositório

```txt
.
├── agents.md
├── README.md
├── docs/
│   ├── relatorio-comparativo.md
│   ├── experimentos.md
│   └── arquitetura.md
├── monolith/
│   ├── README.md
│   ├── src/
│   └── docker-compose.yml
├── modular-monolith/
│   ├── README.md
│   ├── src/
│   └── docker-compose.yml
└── microservices/
    ├── README.md
    ├── docker-compose.yml
    ├── orders-service/
    ├── menu-service/
    ├── payments-service/
    └── notifications-service/
```

## Regras gerais de implementação

* Implementar primeiro o fluxo feliz completo: criar pedido → pagar → notificar cozinha.
* Manter nomes simples e consistentes: `orders`, `menu`, `payments`, `notifications`.
* Evitar features fora do escopo, como autenticação, painel administrativo, gateway complexo ou observabilidade avançada.
* Usar logs claros em cada etapa importante do fluxo.
* Criar `GET /health` em toda aplicação ou serviço.
* Sempre documentar comandos de execução no README da respectiva versão.

## Versão 1: Monólito

### Objetivo

Uma única aplicação, um único deploy e um único banco de dados.

### Diretrizes

* Todas as capacidades ficam dentro da mesma aplicação.
* Pode haver pastas por domínio, mas sem fronteiras rígidas.
* Comunicação entre capacidades pode ser feita por chamadas diretas de função, classe ou service.
* Um único banco contém todas as tabelas.

### Fluxos obrigatórios

* Criar pedido.
* Listar pedidos.
* Cancelar pedido.
* CRUD de itens do cardápio.
* Processar pagamento mockado.
* Consultar status do pagamento.
* Notificar cozinha após pagamento confirmado.
* `GET /health`.

### Experimento obrigatório

Simular lentidão no módulo de pagamento com `sleep` de 5 segundos e observar o impacto nos demais endpoints.

### Documentação obrigatória

Responder no README:

* O que aconteceria se o cardápio precisasse escalar 10x mais que o resto?
* Quais partes ficaram mais acopladas?
* O que foi fácil e difícil de modificar?

## Versão 2: Monólito Modular

### Objetivo

Uma única aplicação e um único deploy, mas com fronteiras explícitas entre os módulos.

### Diretrizes

* Cada módulo deve ter interface pública própria.
* Um módulo não pode acessar diretamente repositórios, tabelas ou entidades internas de outro módulo.
* Comunicação interna apenas por interfaces tipadas.
* Banco pode ser único, mas usar schemas separados por módulo.

Exemplo de schemas:

```txt
orders.*
menu.*
payments.*
notifications.*
```

### Interfaces esperadas

* `OrderService`
* `MenuService`
* `PaymentService`
* `NotificationService`

### Proibições

* `orders` acessar diretamente tabela ou repository de `payments`.
* `payments` importar entidade interna de `orders`.
* `notifications` consultar banco de `orders` diretamente.

### Experimento obrigatório

Trocar a implementação interna do módulo de pagamento sem alterar os outros módulos.

### Documentação obrigatória

Responder no README:

* Quais módulos poderiam virar serviços independentes amanhã?
* O que ainda faltaria para isso?
* O esforço de trocar o módulo de pagamento foi baixo, médio ou alto?

## Versão 3: Microsserviços

### Objetivo

Cada capacidade roda como processo independente, com banco próprio ou schema isolado e comunicação via rede.

### Serviços obrigatórios

* `orders-service`
* `menu-service`
* `payments-service`
* `notifications-service`

### Diretrizes

* Cada serviço roda em uma porta diferente.
* Cada serviço possui seu próprio banco ou schema isolado.
* Não compartilhar banco entre serviços.
* Se um serviço precisar de dados de outro, deve chamar API ou consumir evento.
* Usar Docker Compose para subir tudo.
* Notificação da cozinha deve ser assíncrona via RabbitMQ ou Kafka.

### Comunicação esperada

Fluxo principal:

```txt
client -> orders-service -> payments-service -> RabbitMQ -> notifications-service
```

Ou, em etapas:

1. Cliente cria pedido no `orders-service`.
2. Cliente ou `orders-service` solicita pagamento ao `payments-service`.
3. Pagamento é processado de forma mockada.
4. Após pagamento confirmado, uma mensagem é publicada na fila.
5. `notifications-service` consome a mensagem e notifica a cozinha.

### Resiliência mínima

Implementar pelo menos uma das estratégias abaixo:

* Timeout explícito em chamadas HTTP.
* Retry controlado.
* Circuit breaker simples.

Para manter o escopo simples, priorizar timeout explícito e retry pequeno.

### Experimento obrigatório

Derrubar o serviço de notificação e fazer um pedido.

Observar:

* O pagamento falha junto?
* A mensagem fica pendente na fila?
* O sistema degrada parcialmente?
* Como o erro aparece nos logs?

### Documentação obrigatória

Responder no README:

* Como fazer rollback apenas do serviço de pagamento?
* O que acontece se a notificação estiver fora do ar?
* Qual parte foi mais difícil de debugar?

## Experimentos comparativos obrigatórios

Executar nas três versões e registrar no relatório:

### 1. Adicionar campo `observation` em pedido

Registrar:

* Quantos arquivos foram alterados.
* Quantos módulos ou serviços foram afetados.
* Tempo aproximado.
* Onde a alteração foi mais simples.

### 2. Simular falha no pagamento

Registrar:

* O sistema inteiro trava ou só parte dele falha?
* O pedido fica em qual status?
* O erro é fácil de entender?

### 3. Rodar 50 requisições simultâneas no endpoint de pedidos

Registrar:

* Latência aproximada.
* Erros encontrados.
* Comportamento observado.
* Diferenças entre arquiteturas.

### 4. Logar todas as etapas de um pedido específico

Registrar:

* Quão fácil foi rastrear o fluxo completo.
* Se os logs ficaram em um lugar só ou espalhados.
* Se foi necessário correlacionar logs entre serviços.

## Estratégia recomendada de implementação

### Fase 1: Modelagem mínima do domínio

Criar entidades simples:

#### Order

* `id`
* `items`
* `status`
* `total`
* `observation`
* `createdAt`
* `updatedAt`

Status sugeridos:

* `CREATED`
* `PENDING_PAYMENT`
* `PAID`
* `SENT_TO_KITCHEN`
* `CANCELLED`

#### MenuItem

* `id`
* `name`
* `description`
* `price`
* `available`

#### Payment

* `id`
* `orderId`
* `amount`
* `status`
* `createdAt`
* `paidAt`

Status sugeridos:

* `PENDING`
* `APPROVED`
* `REJECTED`

#### KitchenNotification

* `id`
* `orderId`
* `status`
* `createdAt`

### Fase 2: Implementar o monólito

Começar pela versão mais simples para validar o domínio e o fluxo.

### Fase 3: Refatorar para monólito modular

Reaproveitar o aprendizado do monólito, mas reforçar fronteiras entre módulos.

### Fase 4: Implementar microsserviços

Só depois de entender bem o fluxo, separar em processos independentes.

## Uso recomendado do OpenSpec

Não usar o OpenSpec para planejar todo o trabalho de uma vez em um único plano gigante.

Usar OpenSpec para mudanças menores, rastreáveis e incrementais.

### Boa estratégia

Criar specs separadas por fatia de entrega:

1. `define-base-domain`
2. `implement-monolith-version`
3. `implement-modular-monolith-boundaries`
4. `implement-microservices-compose`
5. `add-kitchen-notification-queue`
6. `add-resilience-timeouts`
7. `add-comparative-experiments`
8. `write-readmes-and-report`

### Evitar

* Uma única spec chamada `implement-all-microservices-architecture` com tudo dentro.
* Specs muito grandes que misturam modelagem, banco, Docker, mensageria, testes e relatório.
* Planejamento excessivo antes de ter o fluxo principal funcionando.

### Quando usar OpenSpec

Usar quando a tarefa:

* Muda arquitetura.
* Define contratos entre módulos ou serviços.
* Altera endpoints públicos.
* Adiciona mensageria.
* Adiciona experimento comparativo.
* Exige documentação de decisão técnica.

### Quando não usar OpenSpec

Não precisa usar para:

* Ajuste simples de bug.
* Rename pequeno.
* Alteração cosmética de README.
* Pequenas correções de DTO.
* Logs simples.

## Convenções de endpoints

### Orders

```txt
POST /orders
GET /orders
GET /orders/:id
POST /orders/:id/cancel
```

### Menu

```txt
POST /menu-items
GET /menu-items
GET /menu-items/:id
PUT /menu-items/:id
DELETE /menu-items/:id
```

### Payments

```txt
POST /payments
GET /payments/:id
GET /payments/order/:orderId
```

### Notifications

```txt
GET /notifications
GET /notifications/:id
```

### Health check

```txt
GET /health
```

## Critérios de aceite gerais

Antes de considerar uma versão concluída, verificar:

* A aplicação sobe com comando documentado.
* O health check funciona.
* O fluxo criar pedido → pagar → notificar cozinha funciona.
* Os logs mostram as etapas principais.
* O README explica como rodar e testar.
* Os experimentos obrigatórios foram executados ou pelo menos preparados.

## Estilo de resposta do agente

Ao ajudar neste projeto, o agente deve:

* Sugerir passos pequenos e executáveis.
* Evitar soluções supercomplexas.
* Explicar trade-offs arquiteturais com foco acadêmico.
* Priorizar entrega funcional antes de abstrações.
* Sempre lembrar que o objetivo é comparar arquiteturas, não criar um sistema real de produção.

## Tarefas iniciais recomendadas para o Codex

1. Criar a estrutura de pastas do repositório.
2. Criar README raiz explicando o objetivo do trabalho.
3. Implementar primeiro o monólito com fluxo completo.
4. Criar seeds simples para cardápio.
5. Implementar experimento de lentidão no pagamento.
6. Refatorar para monólito modular.
7. Implementar microsserviços com Docker Compose.
8. Adicionar RabbitMQ para notificação.
9. Adicionar timeout ou retry.
10. Criar relatório comparativo.

## Prompt inicial sugerido para o Codex

```txt
Leia o AGENTS.md e implemente a primeira etapa do projeto: estrutura inicial do repositório para comparar Monólito, Monólito Modular e Microsserviços no domínio de Sistema de Pedidos de Lanchonete.

Crie apenas a estrutura base, READMEs iniciais e documentação mínima. Não implemente regras de negócio ainda.

Mantenha a mesma stack nas três versões e siga o escopo acadêmico do trabalho.
```

## Prompt sugerido para primeira implementação funcional

```txt
Leia o AGENTS.md e implemente a versão Monólito do Sistema de Pedidos de Lanchonete.

Requisitos:
- Uma única aplicação.
- Um único banco.
- Endpoints de pedidos, cardápio, pagamento e health check.
- Fluxo completo: criar pedido → pagar pedido → notificar cozinha.
- Pagamento mockado.
- Simulação opcional de lentidão no pagamento com sleep de 5 segundos.
- README com instruções de execução e teste.

Não implemente ainda monólito modular nem microsserviços.
```

## Prompt sugerido para OpenSpec

```txt
Leia o AGENTS.md e crie uma proposta OpenSpec pequena para a próxima mudança: implementar a versão Monólito do sistema.

A spec deve conter:
- Escopo da mudança.
- Requisitos funcionais.
- Endpoints envolvidos.
- Critérios de aceite.
- Fora de escopo.

Não planeje as três arquiteturas de uma vez.
```
