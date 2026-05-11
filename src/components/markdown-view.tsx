import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export function MarkdownView({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "prose prose-invert max-w-none text-sm leading-relaxed",
        "prose-headings:text-foreground prose-headings:font-semibold",
        "prose-p:text-foreground/90 prose-li:text-foreground/90",
        "prose-strong:text-foreground prose-code:text-primary",
        "prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
        "prose-pre:bg-muted prose-pre:border prose-pre:border-border",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
