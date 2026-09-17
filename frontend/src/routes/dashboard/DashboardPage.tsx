import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useDashboard } from "../../hooks/use-dashboard";
import type { HealthStatus } from "../../lib/types";

const healthLabel: Record<HealthStatus, string> = {
  saudavel: "Saudável",
  atencao: "Atenção",
  critico: "Crítico",
};

const healthColor: Record<HealthStatus, string> = {
  saudavel: "#10b981",
  atencao: "#f59e0b",
  critico: "#ef4444",
};

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="py-5">
        <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { data: stats, isLoading } = useDashboard();

  if (isLoading || !stats) {
    return <p className="text-sm text-muted-foreground">Carregando...</p>;
  }

  const faseData = stats.clientes_por_fase.map((c) => ({ fase: c.fase, total: c.total }));
  const saudeData = stats.clientes_por_saude.map((c) => ({
    name: healthLabel[c.health_status],
    value: c.total,
    color: healthColor[c.health_status],
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Clientes ativos" value={stats.total_clientes} />
        <StatCard label="Em risco" value={stats.clientes_em_risco} />
        <StatCard label="Oportunidades ativas" value={stats.oportunidades_ativas} />
        <StatCard label="GPs com clientes" value={stats.clientes_por_gp.length} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Clientes por fase</CardTitle>
          </CardHeader>
          <CardContent>
            {faseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={faseData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="fase" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">Sem dados ainda.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clientes por saúde</CardTitle>
          </CardHeader>
          <CardContent>
            {saudeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={saudeData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                    {saudeData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">Sem dados ainda.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Últimas evoluções</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.ultimas_evolucoes.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {stats.ultimas_evolucoes.map((e) => (
                  <li key={e.id} className="text-sm">
                    <Link to={`/clientes/${e.cliente_id}`} className="font-medium hover:underline">
                      {e.cliente_nome}
                    </Link>
                    {" — "}
                    {e.titulo}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {e.data_referencia}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma evolução registrada ainda.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cases em destaque</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.cases_destaque.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {stats.cases_destaque.map((e) => (
                  <li key={e.id} className="text-sm">
                    <Link
                      to={`/clientes/${e.cliente_id}/case`}
                      className="font-medium hover:underline"
                    >
                      {e.cliente_nome}
                    </Link>
                    {" — "}
                    {e.titulo} <Badge tone="success">positivo</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum case com resultado positivo registrado ainda.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
