import { create } from "zustand";
import type { AgentEvent } from "@/lib/types";
import { subscribeToAgentEvents } from "@/lib/graphql-client";
import { toast } from "sonner";
import { useProjectsStore } from "./projects-store";

interface AgentEventsState {
  events: AgentEvent[];
  unsubscribe: (() => void) | null;
  addEvent: (event: AgentEvent) => void;
  clearEvents: () => void;
  setUnsubscribe: (fn: (() => void) | null) => void;
}

export const useAgentEventsStore = create<AgentEventsState>((set) => ({
  events: [],
  unsubscribe: null,
  addEvent: (event) => set((state) => ({ events: [event, ...state.events] })),
  clearEvents: () => set({ events: [] }),
  setUnsubscribe: (fn) => set({ unsubscribe: fn }),
}));

const MOCKED_USER_ID = "e524efd7-8bee-4eaa-8e91-06c3d7592af3";

export function initAgentEventsSubscription() {
  if (typeof window === "undefined") return () => {};

  const currentUnsubscribe = useAgentEventsStore.getState().unsubscribe;
  if (currentUnsubscribe) {
    currentUnsubscribe();
  }

  const unsubscribe = subscribeToAgentEvents(MOCKED_USER_ID, (event) => {
    useAgentEventsStore.getState().addEvent(event);
    
    // Update project scope content in real-time when a subscription event arrives
    const projects = useProjectsStore.getState().projects;
    if (projects.length > 0) {
      // Assuming the event refers to the most recently created project
      // In a real scenario, the event would include the projectId
      const latestProject = projects[0];
      useProjectsStore.getState().updateProjectScope(latestProject.id, event.contentMd);
    }

    toast("Novo evento do agente", {
      description: event.contentMd.slice(0, 100) + (event.contentMd.length > 100 ? "..." : ""),
    });
  });

  useAgentEventsStore.getState().setUnsubscribe(unsubscribe);
  return unsubscribe;
}
