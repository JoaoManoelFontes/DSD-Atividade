Monólito, Monólito Modular e

Microsservicos
Sistema de Pedidos de Lanchonete

1. Contexto e Objetivo
Neste trabalho, vocêsirão implementar o mesmo sistema em tres arquiteturas distintas:
Monolito, Monolito Modular e Microsservicos. O domínio de negócio e idêntico nas três
versões, mudando apenas onde estão as fronteiras e como as partes se comunicam. Isso
é intencional: sentir o peso arquitetural sem poder culpar a complexidade do negócio.
2. Dominio do Sistema
Quatro capacidades obrigatórias devem ser implementadas:
Pedidos: Criar, listar e cancelar pedidos.
Cardapio: CRUD de itens, preco e disponibilidade.
Pagamento: Processar pagamento (mock) e consultar status.
Notificacao: Notificar a cozinha quando o pedido for pago.
Regra de negócio crítica: Um pedido só vai para a cozinha após confirmação de
pagamento. Essa regra forçara comunicação entre domínios, o principal ponto de dor
de cada arquitetura.
3. Versão 1 — Monólito
O que fazer:
• Tudo em uma única aplicação, um único deploy e um único banco de dados.
• Módulos podem existir como pastas, mas sem fronteiras rígidas, deixem o
acoplamento acontecer naturalmente.
• Comunicação entre capacidades via chamadas diretas (funções/métodos).
Checklist:
[ ] Única aplicação rodando em uma porta.
[ ] Banco único com todas as tabelas.
[ ] Fluxo completo funcional: criar pedido → pagar → notificar cozinha.
[ ] Endpoint de health check (GET /health).
[ ] Experimento obrigatório: Simular lentidão no módulo de pagamento (sleep 5s) e
observar o que acontece com os outros endpoints.
[ ] Documentar: o que precisaria mudar se o módulo de cardápio precisasse escalar
10x mais que o resto?
4. Versão 2 — Monólito Modular
O que fazer:
• Mesma aplicação única, mas com fronteiras explicitas entre módulos.

• Cada módulo expõe uma interface publica, sem acesso direto a
repositorios/tabelas alheias.
• Módulos se comunicam apenas pela interface, nunca por acoplamento interno.
• Banco pode ser único, mas com schemas separados por módulo.
Checklist:
[ ] Cada módulo tem sua própria camada de interface (ex: PagamentoService,
PedidoService).
[ ] Nenhum módulo acessa a tabela/repositório de outro diretamente.
[ ] Schemas separados no banco (pedidos.*, pagamento.*, cardapio.*).
[ ] Comunicação entre módulos via interfaces tipadas (sem acoplamento por
ORM/entidade alheia).
[ ] Experimento obrigatório: Trocar a implementação interna do módulo de
pagamento sem alterar nenhum outro módulo. Documentar o esforço.
[ ] Documentar: quais módulos poderiam virar serviços independentes amanhã? O
que falta para isso?
5. Versao 3 — Microsserviços
O que fazer:
• Cada capacidade e um processo independente, com banco proprio.
• Comunicação via HTTP/REST ou mensageria. A notificação de cozinha deve usar
fila (Kafka ou RabbitMQ).
• Deploy independente com Docker Compose (um container por serviço).
• Sem banco compartilhado, se precisar de dado de outro serviço, chama a API ou
réplica.
Checklist:
[ ] 4 serviços rodando em portas distintas, cada um com seu banco/schema isolado.
[ ] Docker Compose orquestrando tudo.
[ ] Fluxo pedido → pagamento via chamada HTTP sincrona.
[ ] Notificacao de cozinha via fila assíncrona.
[ ] Cada serviço tem health check proprio.
[ ] Experimento obrigatório: Derrubar o serviço de notificação e fazer um pedido. O
sistema se comporta bem? O pagamento falha junto?
[ ] Pelo menos uma estratégia de resiliencia implementada: retry, circuit breaker ou
timeout explícito.
[ ] Documentar: como faria rollback apenas do serviço de pagamento sem afetar os
outros?
6. Experimentos Comparativos
Execute os experimentos abaixo nas 3 versões e registre os resultados para comparação:
1. Adicionar campo observação em um pedido: Quantos arquivos/serviços você
precisou tocar? Quanto tempo levou?
2. Simular falha no pagamento: O sistema degrada parcialmente ou trava por
completo?
3. Rodar 50 requisições simultâneas no endpoint de pedidos: Latencia, erros,
comportamento observado.
4. Logar todas as etapas de um pedido específico: Quão fácil foi rastrear o fluxo
completo?

7. Entregáveis
1. Código das 3 versões em repositório com estrutura clara.
2. README por versão com instruções de como rodar.
3. Relatório comparativo respondendo: Qual foi mais facil de implementar? Qual foi
mais fácil de modificar? Onde o debug foi mais doloroso e por quê? Em qual cenário
real você escolheria cada uma?
8. Stack Sugerida
Qualquer linguagem, o importante é não misturar stacks entre versões para que a
comparação seja justa.