import { Sparkles } from "lucide-react";

import { useMemorias } from "../../hooks/use-memorias";
import { Badge } from "../ui/badge";
import { CardContent, CardHeader, CardTitle } from "../ui/card";

export function MemoriasSection({ clienteId }: { clienteId: string }) {
  const { data: memorias, isLoading } = useMemorias(clienteId);

  if (isLoading || !memorias || memorias.length === 0) {
    return null;
  }

  return (
    <div className="glass-ai rounded-xl">
      <CardHeader className="flex flex-row items-center gap-2">
        <Sparkles className="h-4 w-4 text-ai" />
        <CardTitle className="text-ai">Memória — aprendizados promovidos</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3">
          {memorias.map((memoria) => (
            <li key={memoria.id} className="text-sm">
              <div className="flex items-center gap-2">
                <p className="font-medium">{memoria.titulo}</p>
                <Badge tone="ai">{memoria.tipo}</Badge>
              </div>
              <p className="text-muted-foreground">{memoria.conteudo}</p>
              <p className="text-xs text-muted-foreground">
                Promovido por {memoria.criado_por} em{" "}
                {new Date(memoria.created_at).toLocaleDateString("pt-BR")}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </div>
  );
}
