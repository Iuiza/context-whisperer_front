import type {
  ArtifactType,
  Constraint,
  Project,
  Template,
} from "./types";

const ALL_ARTIFACTS: ArtifactType[] = [
  "REQUIREMENTS",
  "ARCHITECTURE",
  "UML",
  "AGENTS_MD",
];

const SAMPLE_REQUIREMENTS_MD = `# Requisitos

## RF — Funcionais
- **RF01** Cadastro de pedidos com endereço e itens.
- **RF02** Acompanhamento em tempo real do entregador.
- **RF03** Pagamento por cartão e PIX.

## RNF — Não Funcionais
- **RNF01** Latência < 300ms p95.
- **RNF02** PostgreSQL com migrações versionadas.
- **RNF03** Observabilidade via OpenTelemetry.
`;

const SAMPLE_ARCH_MD = `# Arquitetura

Camadas:
1. **Apresentação** — Next.js + React Server Components.
2. **Aplicação** — Casos de uso isolados.
3. **Domínio** — Entidades e regras de negócio puras.
4. **Infra** — PostgreSQL, fila, gateway de pagamento.
`;

const SAMPLE_UML_MD = `# Diagramas UML

\`\`\`mermaid
classDiagram
  class Pedido {
    +id: UUID
    +itens: Item[]
    +total(): Money
  }
  class Cliente {
    +id: UUID
    +nome: string
  }
  Cliente "1" --> "*" Pedido
\`\`\`
`;

const SAMPLE_AGENTS_MD = `# agents.md

- **OrderAgent**: orquestra pedidos, escuta eventos do gateway.
- **DeliveryAgent**: associa entregadores e calcula ETA.
`;

const SCOPE_MD = `## In-Scope
- Cadastro de pedidos
- Acompanhamento em tempo real
- Pagamento PIX e cartão

## Out-of-Scope
- Programa de fidelidade
- Suporte a múltiplos idiomas
- Dashboard analítico avançado

## Premissas
- Operação inicial em uma única cidade.
- Integração com um único PSP.
`;

export const mockProjects: Project[] = [
  {
    id: "proj-1",
    name: "Delivery local",
    prompt:
      "Quero um app de delivery para restaurantes do meu bairro com pagamento PIX e acompanhamento ao vivo.",
    status: "COMPLETED",
    selectedArtifacts: ALL_ARTIFACTS,
    scope: { status: "APPROVED", contentMd: SCOPE_MD },
    artifacts: [
      { type: "REQUIREMENTS", status: "APPROVED", iterationCount: 2, content: SAMPLE_REQUIREMENTS_MD },
      { type: "ARCHITECTURE", status: "APPROVED", iterationCount: 1, content: SAMPLE_ARCH_MD },
      { type: "UML", status: "APPROVED", iterationCount: 3, content: SAMPLE_UML_MD },
      { type: "AGENTS_MD", status: "APPROVED", iterationCount: 1, content: SAMPLE_AGENTS_MD },
    ],
    evaluations: [
      {
        id: "ev-1",
        artifactType: "ARCHITECTURE",
        iteration: 1,
        constraintCategory: "ARQUITETURA_LIMPA",
        constraintRule: "Domínio não pode importar Infra",
        isApproved: false,
        causalFeedback:
          "A camada de Domínio referencia diretamente o repositório PostgreSQL. Inverta a dependência via interface.",
        judgePrompt: "[Judge prompt formatado com regra ARQUITETURA_LIMPA]...",
        rawJudgeResponse: '{"approved": false, "violations": ["import direto de infra"]}',
        globalStateSnapshot: { requirements: "APPROVED", arch: "REJECTED", uml: "PENDING" },
        evaluatedAt: "2026-05-10T14:32:00Z",
      },
      {
        id: "ev-2",
        artifactType: "ARCHITECTURE",
        iteration: 2,
        constraintCategory: "ARQUITETURA_LIMPA",
        constraintRule: "Domínio não pode importar Infra",
        isApproved: true,
        causalFeedback: "OK — dependência invertida via porta.",
        judgePrompt: "[Judge prompt formatado]...",
        rawJudgeResponse: '{"approved": true}',
        globalStateSnapshot: { requirements: "APPROVED", arch: "APPROVED", uml: "APPROVED" },
        evaluatedAt: "2026-05-10T14:40:00Z",
      },
    ],
    createdAt: "2026-05-10T14:00:00Z",
  },
  {
    id: "proj-2",
    name: "SaaS de agendamento",
    prompt:
      "SaaS para clínicas pequenas gerenciarem agenda de consultas com lembretes por WhatsApp.",
    status: "GENERATING",
    selectedArtifacts: ["REQUIREMENTS", "ARCHITECTURE", "UML"],
    scope: { status: "APPROVED", contentMd: SCOPE_MD },
    artifacts: [
      { type: "REQUIREMENTS", status: "APPROVED", iterationCount: 1, content: SAMPLE_REQUIREMENTS_MD },
      { type: "ARCHITECTURE", status: "RUNNING", iterationCount: 2, content: "" },
      { type: "UML", status: "IDLE", iterationCount: 0, content: "" },
    ],
    evaluations: [],
    createdAt: "2026-05-11T09:12:00Z",
  },
  {
    id: "proj-3",
    name: "Marketplace de cursos",
    prompt: "Marketplace onde instrutores publicam cursos em vídeo e recebem por venda.",
    status: "AWAITING_SCOPE",
    selectedArtifacts: ALL_ARTIFACTS,
    scope: { status: "PENDING", contentMd: SCOPE_MD },
    artifacts: [],
    evaluations: [],
    createdAt: "2026-05-11T18:30:00Z",
  },
];

export const mockTemplates: Template[] = [
  { id: "t1", name: "Requisitos padrão", targetDocument: "1_Requisitos.md", contentMd: "# Requisitos\n## RF\n## RNF" },
  { id: "t2", name: "Arquitetura limpa", targetDocument: "2_Arquitetura.md", contentMd: "# Arquitetura\n## Camadas" },
  { id: "t3", name: "UML Mermaid", targetDocument: "3_UML.md", contentMd: "# UML\n```mermaid\n```" },
  { id: "t4", name: "agents.md base", targetDocument: "agents.md", contentMd: "# agents.md" },
];

export const mockConstraints: Constraint[] = [
  {
    id: "c1",
    category: "SINTAXE_MERMAID",
    ruleDescription: "Diagramas devem ser Mermaid válidos",
    ruleContent: "Validar que blocos ```mermaid renderizam sem erro.",
    isActive: true,
  },
  {
    id: "c2",
    category: "ARQUITETURA_LIMPA",
    ruleDescription: "Domínio não importa Infra",
    ruleContent: "A camada de Domínio não pode referenciar pacotes de infraestrutura.",
    isActive: true,
  },
  {
    id: "c3",
    category: "REQUISITOS",
    ruleDescription: "Cada RF deve ter ID único",
    ruleContent: "RF01, RF02... obrigatórios e únicos.",
    isActive: true,
  },
  {
    id: "c4",
    category: "ESCOPO",
    ruleDescription: "Out-of-scope explícito",
    ruleContent: "Toda proposta deve listar pelo menos 3 itens fora do escopo.",
    isActive: false,
  },
];

export function newProjectScopeMd(prompt: string) {
  return `## In-Scope
- Funcionalidades essenciais derivadas de: _"${prompt.slice(0, 80)}${prompt.length > 80 ? "…" : ""}"_
- Cadastro de usuários e autenticação básica
- Persistência relacional dos dados centrais

## Out-of-Scope
- Integrações externas avançadas
- Internacionalização
- Personalização visual avançada

## Premissas
- Equipe pequena, primeira versão em 6 semanas.
- Stack já definida: PostgreSQL + framework web moderno.
`;
}
