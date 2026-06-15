export type ArtifactType =
  | "API_SPEC"
  | "ARCHITECTURE_DOC"
  | "DOMAIN_MODEL"
  | "REQUIREMENTS"
  | "UML_DIAGRAM"
  | "USER_STORIES";

export const ARTIFACT_META: Record<
  ArtifactType,
  { label: string; file: string; icon: string; description: string }
> = {
  REQUIREMENTS: {
    label: "Requisitos",
    file: "1_Requisitos.md",
    icon: "📋",
    description: "RF e RNF estruturados a partir do escopo aprovado.",
  },
  USER_STORIES: {
    label: "User stories",
    file: "2_User_Stories.md",
    icon: "👤",
    description: "Histórias de usuário com critérios de aceite.",
  },
  DOMAIN_MODEL: {
    label: "Modelo de domínio",
    file: "3_Modelo_Dominio.md",
    icon: "🧠",
    description: "Entidades, agregados e relações centrais do domínio.",
  },
  ARCHITECTURE_DOC: {
    label: "Arquitetura",
    file: "4_Arquitetura.md",
    icon: "🏗️",
    description: "Documento arquitetural com camadas, decisões e trade-offs.",
  },
  UML_DIAGRAM: {
    label: "Diagramas UML",
    file: "5_UML.md",
    icon: "🧩",
    description: "Casos de uso, classes e fluxo em sintaxe Mermaid.",
  },
  API_SPEC: {
    label: "API Spec",
    file: "6_API_Spec.md",
    icon: "🔌",
    description: "Contrato de API com endpoints, payloads e respostas esperadas.",
  },
};

export type ProjectStatus = "AWAITING_SCOPE" | "GENERATING" | "COMPLETED" | "FAILED";

export type ScopeStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ArtifactStatus = "DRAFT" | "RUNNING" | "APPROVED" | "REJECTED" | "IDLE";

export interface Artifact {
  type: ArtifactType;
  status: ArtifactStatus;
  iterationCount: number;
  content: string;
}

export interface EvaluationLog {
  id: string;
  artifactType: ArtifactType;
  iteration: number;
  constraintCategory: string;
  constraintRule: string;
  isApproved: boolean;
  causalFeedback: string;
  judgePrompt: string;
  rawJudgeResponse: string;
  globalStateSnapshot: Record<string, string>;
  evaluatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  prompt: string;
  status: ProjectStatus;
  selectedArtifacts: ArtifactType[];
  scope: {
    status: ScopeStatus;
    contentMd: string;
    feedback?: string;
  };
  artifacts: Artifact[];
  evaluations: EvaluationLog[];
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  targetDocument: string;
  contentMd: string;
}

export interface Constraint {
  id: string;
  category: string;
  ruleDescription: string;
  ruleContent: string;
  isActive: boolean;
}
