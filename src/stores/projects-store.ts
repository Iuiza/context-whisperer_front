import { create } from "zustand";
import { mockProjects, newProjectScopeMd } from "@/lib/mock-data";
import type { Artifact, ArtifactType, Project, ProjectStatus, ScopeStatus } from "@/lib/types";

interface CreateProjectInput {
  name: string;
  prompt: string;
  selectedArtifacts: ArtifactType[];
  id?: string;
}

interface ProjectsState {
  projects: Project[];
  createProject: (input: CreateProjectInput) => Project;
  getProject: (id: string) => Project | undefined;
  setScopeStatus: (id: string, status: ScopeStatus, feedback?: string) => void;
  setProjectStatus: (id: string, status: ProjectStatus) => void;
  advanceSimulation: (id: string) => void;
}

const SAMPLE_DRAFT_REQ = `# Requisitos\n\n## RF\n- RF01 ...\n- RF02 ...\n\n## RNF\n- RNF01 ...\n`;
const SAMPLE_DRAFT_ARCH = `# Arquitetura\n\n## Camadas\n- Apresentação\n- Aplicação\n- Domínio\n- Infra\n`;
const SAMPLE_DRAFT_UML = "# UML\n\n```mermaid\nclassDiagram\n  class Entidade\n```\n";
const SAMPLE_DRAFT_USER_STORIES = "# User Stories\n\n- Como usuário, quero...\n";
const SAMPLE_DRAFT_DOMAIN = "# Modelo de domínio\n\n- Entidade\n- Valor\n";
const SAMPLE_DRAFT_API = "# API Spec\n\n## GET /health\n";

const draftFor = (type: ArtifactType) =>
  type === "REQUIREMENTS"
    ? SAMPLE_DRAFT_REQ
    : type === "ARCHITECTURE_DOC"
      ? SAMPLE_DRAFT_ARCH
      : type === "UML_DIAGRAM"
        ? SAMPLE_DRAFT_UML
        : type === "USER_STORIES"
          ? SAMPLE_DRAFT_USER_STORIES
          : type === "DOMAIN_MODEL"
            ? SAMPLE_DRAFT_DOMAIN
            : SAMPLE_DRAFT_API;

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: mockProjects,
  createProject: ({ id: providedId, name, prompt, selectedArtifacts }) => {
    const id = providedId ?? `proj-${Date.now()}`;
    const project: Project = {
      id,
      name,
      prompt,
      status: "AWAITING_SCOPE",
      selectedArtifacts,
      scope: { status: "PENDING", contentMd: newProjectScopeMd(prompt) },
      artifacts: [],
      evaluations: [],
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ projects: [project, ...s.projects] }));
    return project;
  },
  getProject: (id) => get().projects.find((p) => p.id === id),
  setScopeStatus: (id, status, feedback) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id !== id
          ? p
          : {
              ...p,
              scope: { ...p.scope, status, feedback },
              status:
                status === "APPROVED" ? "GENERATING" : status === "REJECTED" ? "FAILED" : p.status,
              artifacts:
                status === "APPROVED" && p.artifacts.length === 0
                  ? p.selectedArtifacts.map<Artifact>((t) => ({
                      type: t,
                      status: "IDLE",
                      iterationCount: 0,
                      content: "",
                    }))
                  : p.artifacts,
            },
      ),
    })),
  setProjectStatus: (id, status) =>
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, status } : p)),
    })),
  advanceSimulation: (id) =>
    set((s) => ({
      projects: s.projects.map((p) => {
        if (p.id !== id) return p;
        const next = p.artifacts.map((a) => ({ ...a }));
        const idleIdx = next.findIndex((a) => a.status === "IDLE");
        const runningIdx = next.findIndex((a) => a.status === "RUNNING");
        if (runningIdx >= 0) {
          next[runningIdx] = {
            ...next[runningIdx],
            status: "APPROVED",
            iterationCount: next[runningIdx].iterationCount + 1,
            content: draftFor(next[runningIdx].type),
          };
        } else if (idleIdx >= 0) {
          next[idleIdx] = {
            ...next[idleIdx],
            status: "RUNNING",
            iterationCount: next[idleIdx].iterationCount + 1,
          };
        }
        const allDone = next.every((a) => a.status === "APPROVED");
        return {
          ...p,
          artifacts: next,
          status: allDone ? "COMPLETED" : "GENERATING",
        };
      }),
    })),
}));
