# CF Prático

O **CF Prático** é uma suíte completa de controle financeiro desenvolvida para **pequenas empresas, autônomos e microempreendedores** que precisam de uma ferramenta **rápida, intuitiva e que funcione mesmo sem internet**.

A proposta do CF Prático é simples: **dar ao usuário controle total dos seus dados**, com performance local, baixa complexidade e experiência consistente em **qualquer plataforma**.

> **Versão 1.0 concluída** — Disponível em Mobile, Web e Desktop.

---

## 🎯 Principais Diferenciais

- **Local-First / Offline-First:** todos os dados são armazenados localmente (SQLite no Mobile, IndexedDB no Web/Desktop).
- **Sem Mensalidade e Sem Dependência de Servidores:** seus dados são seus — nada é enviado para a nuvem.
- **Multi-Plataforma Real:** use no **celular**, no **computador** ou no **navegador** — sempre com a mesma experiência.
- **Foco em Velocidade:** carregamento instantâneo, listas virtualizadas e consultas otimizadas para milhares de transações.

---

## 📌 Demonstração

| Desktop | Mobile |
|-----|--------|
| ![Web Demo](./docs/web.gif) | ![Mobile Demo](./docs/android.gif) |


---

## 🧭 Estrutura da Suíte

| Plataforma | Status | Tecnologias | Armazenamento |
|-----------|--------|-------------|----------------|
| **Mobile (Android/iOS)** | ✅ Pronto (1.0) | React Native (Expo) | SQLite (Async / Local-first) |
| **Web** | ✅ Pronto (1.0) | React + Vite | Dexie (IndexedDB) |
| **Desktop (Windows, macOS, Linux)** | ✅ Pronto (1.0) | Electron + React | Dexie (IndexedDB) |

---

## 📊 Funcionalidades Principais

### 1. Dashboard Financeiro
- Saldo Atual e Saldo do Período
- Receitas vs Despesas (gráfico comparativo)
- Desempenho por Categoria
- Últimas Transações e Filtros Inteligentes

### 2. Movimentação (Extrato Completo)
- Agrupamento automático por dia
- Busca e filtros avançados
- Seleção e exclusão em massa
- Visualização detalhada de cada transação

### 3. Gerenciamento de Transações (CRUD Completo)
- Receitas, Despesas, Parcelamento e Condições
- Edição e exclusão com histórico imediato
- Categorias e Formas de Pagamento personalizáveis

### 4. Configurações e Personalização
- Nome da Empresa / Identidade
- Saldo Inicial customizável
- Categorias com ícones
- Formas de pagamento definidas pelo usuário

### 5. Relatórios e Exportação
- Exportação para PDF (resumo financeiro filtrado)
- Exportação para Excel (.xlsx)
- Backup completo dos dados para `.json`
- Restauração e reset para padrão de fábrica

---

## 🔒 Privacidade & Armazenamento

Todos os dados são tratados de forma **100% local**:

- Não depende de servidores externos
- Pode ser usado sem internet
- Backup e restauração ficam sob controle do usuário

---


## 🧑‍💻 Autor

Desenvolvido na **OnVale Contabilidade**  
por **João Santos**

**GitHub:** https://github.com/jopaul0  
**LinkedIn:** https://www.linkedin.com/in/joaosantos02/  
**Site da OnVale:** https://onvale.com.br  

---

## 📝 Licença

License: MIT + Commons Clause<br/>
Copyright (c) 2025 Onvale Contabilidade

---
