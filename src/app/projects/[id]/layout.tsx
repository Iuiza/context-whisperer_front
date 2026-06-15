"use client";

import Link from "next/link";
import { notFound, useParams, usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { useProjectsStore } from "@/stores/projects-store";
import { ARTIFACT_META } from "@/lib/types";

const STEPS = [
  { to: "scope", label: "Escopo (HITL)" },
  { to: "orchestration", label: "Orquestração" },
  { to: "evaluation", label: "Juiz" },
  { to: "artifacts", label: "Artefatos" },
] as const;

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ id: string }>();
  const project = useProjectsStore((s) => s.getProject(params.id));
  const pathname = usePathname();

  if (!project) notFound();

  return (
    <div className="flex flex-col">
      <div className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="-ml-2 h-7 gap-1 text-xs text-muted-foreground"
              >
                <Link href="/">
                  <ChevronLeft className="h-3 w-3" /> Novo projeto
                </Link>
              </Button>
              <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
              <p className="line-clamp-2 max-w-2xl text-sm text-muted-foreground">
                {project.prompt}
              </p>
            </div>
            <StatusBadge status={project.status} />
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.selectedArtifacts.map((t) => (
              <Badge key={t} variant="secondary" className="gap-1 text-[11px]">
                <span>{ARTIFACT_META[t].icon}</span>
                {ARTIFACT_META[t].label}
              </Badge>
            ))}
          </div>

          <nav className="mt-5 flex gap-1 border-b border-border">
            {STEPS.map((s) => {
              const href = `/projects/${project.id}/${s.to}`;
              const active = pathname.endsWith(`/${s.to}`);
              return (
                <Link
                  key={s.to}
                  href={href}
                  className={
                    "border-b-2 px-3 py-2 text-sm transition-colors " +
                    (active
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground")
                  }
                >
                  {s.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 py-6">{children}</div>
    </div>
  );
}
