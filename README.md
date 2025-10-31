# CF Prático

**Esse projeto está em fase de desenvolvimento.**

O CF Prático é uma suíte de controle financeiro ágil, multiplataforma e focada no local-first, desenhada para pequenas empresas e usuários autônomos que precisam de uma ferramenta rápida, confiável e que funcione offline.

## Status do Projeto (Roadmap)

Este projeto está sendo construído em etapas, com o objetivo de cobrir todas as plataformas principais:

### [🚧] Etapa 1: Protótipo Web

- Status: Concluído
- Objetivo: Validar o fluxo de usuário, layout e os principais conceitos da interface em um protótipo web de alta fidelidade.

### [⬜] Etapa 2: Aplicativo Mobile

- Status: Em Desenvolvimento
- Objetivo: Construir o aplicativo móvel nativo (iOS/Android) com funcionalidade completa offline-first, usando Expo e um banco de dados SQLite local.

### [⬜] Etapa 3: Aplicativo Web

- Status: Planejado
- Objetivo: Desenvolver a versão web completa, com sincronização de dados em nuvem (permitindo que os dados do app mobile sejam acessados no navegador).

### [⬜] Etapa 4: Aplicativo Desktop

- Status: Planejado
- Objetivo: Empacotar a aplicação web (provavelmente usando Electron ou Tauri) para criar uma experiência de desktop instalável para Windows, macOS e Linux.

---

## Funcionalidades Principais (Ecossistema)

A suíte CF Prático é desenhada para ter um conjunto de funcionalidades coeso em todas as plataformas:

- Dashboard de Resumo: Uma visão geral da saúde financeira com Saldo Atual total, Receitas, Despesas e Saldo do Período, com gráficos de Receita x Despesa e detalhamento por categoria.

- Extrato Detalhado (Movimentação): Um extrato completo de transações com performance otimizada e filtros avançados.

- Gerenciamento de Transações (CRUD): Um fluxo completo para Adicionar, Visualizar, Editar e Excluir transações, com suporte a parcelamento.

- Gerenciamento em Massa: Capacidade de selecionar e excluir múltiplas transações de uma vez.

- Configurações Avançadas: Definição de Saldo Inicial e Nome da Empresa; CRUD completo para Categorias personalizadas (com ícones); CRUD completo para Formas de Pagamento personalizadas.

- Relatórios e Exportação: Exportação de relatórios visuais para PDF; Exportação de dados brutos para Excel (.xlsx).

- Backup e Restauração: Funcionalidade de exportar o banco de dados local inteiro para um arquivo .json e restaurá-lo, garantindo a segurança dos dados do usuário.

---

## Autor

Desenvolvido na [OnVale Contabilidade](onvale.com.br) Por João Santos.

GitHub: [jopaul0](github.com/jopaul0)  
LinkedIn: [João Santos](linkedin.com/in/joaosantos02)