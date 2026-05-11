# Protótipo de média fidelidade — Context Whisperer

Orquestrador de agentes para gerar documentação técnica de MVPs (requisitos, arquitetura, UML, agents.md) com validação humana e LLM-as-a-Judge. Stack: **TanStack Start + React + Tailwind + shadcn/ui** (já configurado no projeto).

Como é um protótipo de média fidelidade, todo o estado é **mockado em memória** (sem backend, sem chamadas a LLM) — o objetivo é demonstrar fluxo, telas e interações.

## Layout global

`src/routes/__root.tsx` ganha um shell com `SidebarProvider`:

```text
┌──────────────┬────────────────────────────────────┐
│  SIDEBAR     │  Header (breadcrumb + status)      │
│              ├────────────────────────────────────┤
│ + Novo proj. │                                    │
│              │                                    │
│ Histórico    │        <Outlet /> (tela ativa)     │
│ • Projeto A  │                                    │
│ • Projeto B  │                                    │
│ • Projeto C  │                                    │
└──────────────┴────────────────────────────────────┘
```

**Sidebar (`AppSidebar`)**
- Logo + nome "Context Whisperer"
- Botão primário **"+ Novo projeto"** → navega para `/`
- Lista de projetos do mock (título + status badge: *Aguardando escopo*, *Gerando*, *Concluído*, *Com falhas*)
- Item ativo destacado pela rota atual
- Colapsável (modo `icon`) com `SidebarTrigger` no header

## Rotas (file-based)

```text
src/routes/
  __root.tsx              shell + sidebar + QueryClientProvider
  index.tsx               /  → Novo projeto (prompt inicial)
  projects.$id.tsx        /projects/:id  → layout do projeto (tabs + Outlet)
  projects.$id.index.tsx  /projects/:id  → redireciona para a etapa atual
  projects.$id.scope.tsx       Etapa 1: Proposta de escopo (HITL)
  projects.$id.orchestration.tsx Etapa 2: Orquestração de agentes
  projects.$id.evaluation.tsx  Etapa 3: Juiz + feedback causal
  projects.$id.artifacts.tsx   Etapa 4: Artefatos finais (.md)
  templates.tsx           /templates  → biblioteca de Templates e Constraints (RAG)
```

## Telas

### 1. `/` — Novo Projeto
- Card central com:
  - **Campo "Nome do projeto"** (`Input`, obrigatório) — usado como título na sidebar
  - `Textarea` grande para o prompt em linguagem natural descrevendo o MVP (RF01)
  - **Barra de ferramentas "Artefatos a produzir"** logo abaixo do textarea:
    - Conjunto de toggles/chips (`ToggleGroup` multi-select com ícone + rótulo) para o usuário escolher quais artefatos o orquestrador deve gerar:
      - 📋 **Requisitos** (`1_Requisitos.md`)
      - 🏗️ **Arquitetura** (`2_Arquitetura.md`)
      - 🧩 **Diagramas UML** (`3_UML.md`)
      - ⚙️ **agents.md**
    - Todos vêm marcados por padrão; usuário pode desmarcar individualmente
    - Tooltip em cada item explicando o que aquele artefato contém
    - Validação: pelo menos 1 artefato deve estar selecionado
  - Sugestões/exemplos de prompt clicáveis ("App de delivery", "SaaS de agendamento"…)
  - Botão **"Gerar proposta de escopo"** (desabilitado se nome vazio, prompt vazio ou nenhum artefato selecionado) → cria projeto no mock guardando `name`, `prompt` e `selectedArtifacts`, e navega para `/projects/:id/scope`

A seleção de artefatos é propagada para todo o fluxo:
- Tela de orquestração mostra apenas os Drafters dos artefatos selecionados
- Tela de avaliação só audita os artefatos selecionados
- Tela de artefatos só lista o que foi escolhido

### 2. `/projects/:id/scope` — Proposta de Escopo (HITL, RF02 + RF03)
- Painel esquerdo: nome do projeto + prompt original + chips dos artefatos selecionados (somente leitura)
- Painel direito: proposta gerada (Markdown renderizado) com seções **In-Scope** e **Out-of-Scope**
- Barra de ações:
  - **Aprovar** (primário) → muda status e navega para `/orchestration`
  - **Solicitar ajustes** → abre `Textarea` de feedback e re-gera (mock)
  - **Rejeitar**
- Badge de status: `PENDING / APPROVED / REJECTED`

### 3. `/projects/:id/orchestration` — Orquestração (RF04 + RF05)
- Visualização do **grafo de fluxo** (cards conectados, baseado no `mermaid_fluxo`):
  - Coordenador → Drafters em paralelo (apenas os selecionados na criação) → Juiz → Decisão → Resolvedor / agents.md
- Cada nó-agente é um card com:
  - Ícone, nome, status (`idle` / `running` / `done` / `failed`) com cor semântica
  - Iteração atual (`iteration_count`)
  - Botão "Ver prompt injetado" (drawer mostrando template + constraints aplicados — RAG determinístico)
- Painel lateral direito: **State Graph** atual (JSON formatado do `global_state_snapshot`)
- Botão "Avançar simulação" para o usuário ver os estados mudarem (mock animado)

### 4. `/projects/:id/evaluation` — Juiz Restritivo (RF06 + RF07)
- Tabela de `EVALUATION_LOGS` (mock), filtrada pelos artefatos selecionados:
  - Colunas: Artefato | Iteração | Constraint avaliado | Aprovado? | Feedback causal
- Linha expansível mostra:
  - `judge_prompt` (collapsible)
  - `raw_judge_response` (JSON)
  - `global_state_snapshot` no momento da avaliação
- Filtros por artefato e por status (aprovado/reprovado)
- Banner no topo: "X de Y artefatos aprovados"

### 5. `/projects/:id/artifacts` — Artefatos (RF08 + RF09)
- Grid de cards, um por artefato selecionado:
  - Status badge, contagem de iterações
  - Ações: **Visualizar** (dialog com Markdown renderizado) / **Baixar .md** (mock)
- Botão "Exportar tudo (.zip)" (mock)

### 6. `/templates` — Biblioteca RAG (suporta RF05)
- Duas tabs:
  - **Templates**: tabela `name | target_document | preview`
  - **Constraints**: tabela `category | rule_description | ativo (Switch)`
- Botão "Novo template / nova constraint" abre dialog (mock)

## Mock de dados

`src/lib/mock-data.ts` exporta:
- `mockProjects: Project[]` (3 projetos em estados diferentes para a sidebar parecer viva)
- `mockTemplates`, `mockConstraints`, `mockEvaluationLogs`
- Helpers `getProject(id)`, `createProject({ name, prompt, selectedArtifacts })`, `updateProjectStatus(id, status)`

`Project` inclui `selectedArtifacts: ArtifactType[]` (`'REQUIREMENTS' | 'ARCHITECTURE' | 'UML' | 'AGENTS_MD'`).

Estado in-memory via **Zustand** (`src/stores/projects-store.ts`) para ações refletirem em todas as telas, incluindo a sidebar.

## Design system

Tema próprio em `src/styles.css` com tokens em `oklch`:
- Identidade "técnica/IA": fundo escuro grafite, accent ciano-elétrico, tipografia sem-serifa moderna (Geist/Inter via Google Fonts)
- Status colors semânticos: `--status-pending`, `--status-running`, `--status-approved`, `--status-rejected`
- Componentes shadcn já existentes: `sidebar`, `card`, `button`, `badge`, `tabs`, `dialog`, `drawer`, `table`, `textarea`, `input`, `toggle-group`, `tooltip`, `switch`, `collapsible`

Markdown renderizado com `react-markdown` + `remark-gfm` (instalar).

## Arquivos novos / modificados

**Novos**
- `src/components/app-sidebar.tsx`
- `src/components/artifact-toolbar.tsx` (toolbar de seleção de artefatos)
- `src/components/agent-flow-graph.tsx`
- `src/components/markdown-view.tsx`
- `src/components/status-badge.tsx`
- `src/lib/mock-data.ts`
- `src/lib/types.ts` (interfaces alinhadas ao DER + `ArtifactType`)
- `src/stores/projects-store.ts`
- 7 arquivos de rota acima

**Modificados**
- `src/routes/__root.tsx` — wrap com `SidebarProvider` + `AppSidebar` + header
- `src/routes/index.tsx` — substitui placeholder pela tela "Novo projeto" (nome + prompt + toolbar de artefatos)
- `src/styles.css` — tokens de tema e fontes

## Fora do escopo
- Sem backend / banco real / chamadas de LLM
- Sem autenticação
- "Avançar simulação" é manual — não há agentes rodando de verdade
