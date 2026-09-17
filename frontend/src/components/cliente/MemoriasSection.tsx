import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useMemorias } from "../../hooks/use-memorias";

export function MemoriasSection({ clienteId }: { clienteId: string }) {
  const { data: memorias, isLoading } = useMemorias(clienteId);

  if (isLoading || !memorias || memorias.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Memória — aprendizados promovidos</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3">
          {memorias.map((memoria) => (
            <li key={memoria.id} className="text-sm">
              <p className="font-medium">{memoria.titulo}</p>
              <p className="text-muted-foreground">{memoria.conteudo}</p>
              <p className="text-xs text-muted-foreground">
                Promovido por {memoria.criado_por} em{" "}
                {new Date(memoria.created_at).toLocaleDateString("pt-BR")}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
