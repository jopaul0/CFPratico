# CF Prático (Mobile)
Este é o repositório para o aplicativo móvel do CF Prático, um controlador financeiro ágil focado em pequenas empresas e usuários autônomos. Este projeto é a parte mobile de uma suíte que futuramente incluirá versões Web e Desktop.

O aplicativo é construído com React Native (Expo) e utiliza um banco de dados local-first (SQLite) para garantir funcionamento offline completo e performance.

## Funcionalidades Principais
O aplicativo está estruturado em três seções principais: Resumo, Movimentação e Configurações.

### 1. Dashboard (Resumo)
Tela principal com uma visão geral da saúde financeira, baseada em filtros de período:

* Saldo Atual: Exibe o saldo total da conta (Saldo Inicial + todas as transações).

* Resumo do Período: Cards de Receitas, Despesas e Saldo líquido dentro do período filtrado.

* Gráficos:

- Gráfico de barras de Receitas x Despesas ao longo do tempo.
- Gráficos de barras horizontais detalhando as Receitas e Despesas por categoria.

* Transações Recentes: Uma lista das últimas 5 transações realizadas dentro do filtro.

* Filtros: Permite filtrar o dashboard por Data, Tipo (Receita/Despesa) e Categoria.

### 2. Movimentação (Extrato)
Tela de extrato detalhado para análise e gerenciamento de todas as transações:

* Lista Otimizada: Usa SectionList para garantir alta performance e virtualização, mesmo com milhares de registros.

* Agrupamento por Dia: As transações são agrupadas por dia, exibindo o saldo acumulado ao final de cada dia.

* Filtros Avançados: Permite filtrar por Data, Tipo, Condição (À Vista/Parcelado), Categoria e Forma de Pagamento.

* Busca Rápida: Barra de busca que filtra transações pela descrição, categoria ou forma de pagamento.

* Gerenciamento em Massa: Permite selecionar múltiplas transações (com "long-press") para exclusão em lote.

### 3. Gerenciamento de Transações
O aplicativo possui um CRUD (Criar, Ler, Atualizar, Deletar) completo para transações:

* Adicionar: Formulário para adicionar novas Receitas ou Despesas, com campos para valor, data, categoria, forma de pagamento, condição (à vista) e parcelamento.

* Editar/Visualizar: Tela de detalhe que permite visualizar todos os dados de uma transação e entrar em "modo de edição" para corrigir informações.

* Excluir: Ações de exclusão disponíveis na tela de detalhes e na exclusão em massa.

### 4. Configurações e Dados
Área dedicada à personalização e gerenciamento dos dados do app:

* Configurações Gerais: Permite ao usuário definir o Saldo Inicial da conta e o Nome da Empresa (usado em relatórios).

* Gerenciar Categorias: CRUD completo para o usuário criar, editar ou excluir suas próprias categorias de transação, incluindo a seleção de ícones.

* Gerenciar Formas de Pagamento: CRUD completo para o usuário definir suas formas de pagamento (ex: NuBank, Banco do Brasil, Carteira).

* Relatórios:

- Exportação de relatórios (baseados nos filtros do Dashboard) para PDF.
- Exportação de dados brutos (baseados nos filtros do Dashboard) para Excel (.xlsx).

* Backup e Restauração:

- Exportar Dados: Gera um arquivo .json completo com todos os dados do usuário (transações, categorias, etc.).
- Importar Dados: Limpa o banco de dados atual e restaura os dados a partir de um arquivo de backup .json.
- Resetar App: Limpa completamente o banco de dados e o restaura aos valores padrão de fábrica.

## Otimizações de Performance
Para garantir que o aplicativo seja rápido e estável, duas otimizações principais foram implementadas:

* Recarregamento Inteligente de Dados: O aplicativo usa um RefreshContext global para "sinalizar" quando os dados precisam ser recarregados (ex: após adicionar/excluir uma transação). Isso evita o recarregamento desnecessário do banco de dados inteiro toda vez que o usuário troca de aba, prevenindo crashes e lentidão.

* Listas Virtualizadas: A tela de Movimentação (StatementScreen) usa SectionList para renderizar apenas os itens visíveis na tela, permitindo que o app lide com dezenas de milhares de transações sem travar.

## Tecnologias Utilizadas

* Framework: React Native (com Expo)

* Linguagem: TypeScript

* Banco de Dados: Expo SQLite (Async API)

* Estilização: NativeWind (TailwindCSS para React Native)

* Navegação: React Navigation (Drawer e Native Stack)

* Ícones: Lucide React Native

* Exportação: Expo Print, Expo Sharing, expo-file-system, xlsx

## Como Executar
Este projeto utiliza a "Development Build" do Expo.

Instalar dependências:

```bash
npm install
```

Pré-buildar os arquivos nativos (se for a primeira vez):

```bash
npx expo prebuild

```

Executar o aplicativo (Android):

```bash
npx expo run:android
```

Executar o aplicativo (iOS):

```bash
npx expo run:ios
```
## Estrutura do Projeto

```bash
src/
├── assets/         # Imagens e logos (icon.png, onvale.png, etc.)
├── components/     # Componentes reutilizáveis (Botões, Inputs, Gráficos)
│   └── charts/     # Componentes de Gráficos (CategoryChart, TimeChart)
├── contexts/       # Contextos globais (RefreshContext)
├── hooks/          # Hooks customizados com a lógica de negócio (useDashboardData, etc.)
├── navigation/     # Stacks de navegação (AppNavigator, DashboardStack, etc.)
├── screens/        # Telas principais (DashboardScreen, StatementScreen, SettingsScreen)
├── services/       # Lógica de banco de dados e Backup/Restore
│   ├── database/
│   │   └── crud/   # Funções SQL (fetch, add, update, delete)
│   └── dataSync.ts # Lógica de Importar/Exportar JSON
├── types/          # Definições de tipos (TypeScript)
└── utils/          # Funções utilitárias (Formatação de data, valor, etc.)

```