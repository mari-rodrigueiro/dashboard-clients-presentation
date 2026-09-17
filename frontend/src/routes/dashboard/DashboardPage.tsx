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

// Aproximações hex das cores da paleta (index.css) — Recharts precisa de valores literais.
const healthColor: Record<HealthStatus, string> = {
  saudavel: "#4a8a72",
  atencao: "#ab7a2a",
  critico: "#b8495a",
};
const PRIMARY_HEX = "#16234a";

function StatPill({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-baseline gap-2 rounded-full bg-white/60 px-4 py-2">
      <span className="text-xl font-semibold text-primary">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
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
      <div>
        <h1 className="text-2xl font-semibold">Panorama</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Você acompanha <strong className="text-foreground">{stats.total_clientes}</strong>{" "}
          {stats.total_clientes === 1 ? "cliente ativo" : "clientes ativos"}
          {stats.clientes_em_risco > 0 ? (
            <>
              {", "}
              <strong className="text-danger">{stats.clientes_em_risco}</strong>{" "}
              {stats.clientes_em_risco === 1 ? "deles em risco" : "deles em risco"}
            </>
          ) : (
            ", nenhum em risco no momento"
          )}
          {stats.oportunidades_ativas > 0 && (
            <>
              {" e "}
              <strong className="text-foreground">{stats.oportunidades_ativas}</strong>{" "}
              {stats.oportunidades_ativas === 1
                ? "oportunidade ativa em aberto"
                : "oportunidades ativas em aberto"}
            </>
          )}
          .
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <StatPill label="clientes ativos" value={stats.total_clientes} />
        <StatPill label="em risco" value={stats.clientes_em_risco} />
        <StatPill label="oportunidades ativas" value={stats.oportunidades_ativas} />
        <StatPill label="GPs com carteira" value={stats.clientes_por_gp.length} />
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
                  <Bar dataKey="total" fill={PRIMARY_HEX} radius={[4, 4, 0, 0]} />
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
