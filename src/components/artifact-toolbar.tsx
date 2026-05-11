import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ARTIFACT_META, type ArtifactType } from "@/lib/types";

const ORDER: ArtifactType[] = ["REQUIREMENTS", "ARCHITECTURE", "UML", "AGENTS_MD"];

export function ArtifactToolbar({
  value,
  onChange,
  disabled,
}: {
  value: ArtifactType[];
  onChange: (next: ArtifactType[]) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Artefatos a produzir
        </label>
        <span className="text-xs text-muted-foreground">
          {value.length} selecionado{value.length === 1 ? "" : "s"}
        </span>
      </div>
      <TooltipProvider delayDuration={200}>
        <ToggleGroup
          type="multiple"
          value={value}
          onValueChange={(v) => {
            if (v.length === 0) return;
            onChange(v as ArtifactType[]);
          }}
          disabled={disabled}
          className="flex flex-wrap justify-start gap-2"
        >
          {ORDER.map((type) => {
            const meta = ARTIFACT_META[type];
            return (
              <Tooltip key={type}>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value={type}
                    aria-label={meta.label}
                    className="h-auto gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm data-[state=on]:border-primary data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
                  >
                    <span aria-hidden>{meta.icon}</span>
                    <span className="font-medium">{meta.label}</span>
                    <span className="hidden text-xs text-muted-foreground sm:inline">
                      {meta.file}
                    </span>
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>{meta.description}</TooltipContent>
              </Tooltip>
            );
          })}
        </ToggleGroup>
      </TooltipProvider>
    </div>
  );
}
