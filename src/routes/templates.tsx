import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockConstraints, mockTemplates } from "@/lib/mock-data";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [{ title: "Templates & Constraints — Context Whisperer" }],
  }),
  component: TemplatesPage,
});

function TemplatesPage() {
  const [constraints, setConstraints] = useState(mockConstraints);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Templates & Constraints</h1>
          <p className="text-sm text-muted-foreground">
            Repositório do RAG determinístico (RF05 / RNF04).
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Biblioteca</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="constraints">Constraints</TabsTrigger>
              </TabsList>
              <Button size="sm" variant="outline" className="gap-2" disabled>
                <Plus className="h-4 w-4" /> Novo
              </Button>
            </div>

            <TabsContent value="templates" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Documento alvo</TableHead>
                    <TableHead>Preview</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTemplates.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {t.targetDocument}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {t.contentMd.split("\n")[0]}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="constraints" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Regra</TableHead>
                    <TableHead>Detalhe</TableHead>
                    <TableHead className="text-right">Ativa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {constraints.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {c.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {c.ruleDescription}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.ruleContent}
                      </TableCell>
                      <TableCell className="text-right">
                        <Switch
                          checked={c.isActive}
                          onCheckedChange={(v) =>
                            setConstraints((prev) =>
                              prev.map((x) =>
                                x.id === c.id ? { ...x, isActive: v } : x,
                              ),
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
