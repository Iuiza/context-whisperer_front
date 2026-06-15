import type { Metadata } from "next";
import "../styles.css";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Context Whisperer",
  description: "Orquestrador de agentes para gerar documentação técnica de MVPs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
