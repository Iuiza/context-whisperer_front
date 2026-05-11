import { Link, useRouterState } from "@tanstack/react-router";
import { Plus, FolderKanban, Library, Sparkles } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { useProjectsStore } from "@/stores/projects-store";

export function AppSidebar() {
  const projects = useProjectsStore((s) => s.projects);
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-3 border-b border-sidebar-border px-3 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-sidebar-foreground">
              Context Whisperer
            </span>
            <span className="text-[11px] text-muted-foreground">
              Orquestrador de agentes
            </span>
          </div>
        </Link>
        <Button
          asChild
          size="sm"
          className="w-full gap-2 group-data-[collapsible=icon]:hidden"
        >
          <Link to="/">
            <Plus className="h-4 w-4" />
            Novo projeto
          </Link>
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Histórico</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map((p) => {
                const active = pathname.startsWith(`/projects/${p.id}`);
                return (
                  <SidebarMenuItem key={p.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={p.name}
                      className="h-auto items-start py-2"
                    >
                      <Link
                        to="/projects/$id"
                        params={{ id: p.id }}
                      >
                        <FolderKanban className="mt-0.5 h-4 w-4 shrink-0" />
                        <div className="flex min-w-0 flex-1 flex-col gap-1 group-data-[collapsible=icon]:hidden">
                          <span className="truncate text-sm font-medium">
                            {p.name}
                          </span>
                          <StatusBadge status={p.status} className="w-fit text-[10px]" />
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Conhecimento</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/templates"}
                  tooltip="Templates & Constraints"
                >
                  <Link to="/templates">
                    <Library className="h-4 w-4" />
                    <span>Templates & Constraints</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
