import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppShell } from "./components/layout/AppShell";
import { AuthProvider } from "./hooks/use-auth";
import { CaseViewPage } from "./routes/clientes/CaseViewPage";
import { ClienteDetailPage } from "./routes/clientes/ClienteDetailPage";
import { ClientesListPage } from "./routes/clientes/ClientesListPage";
import { ConfiguracoesPage } from "./routes/configuracoes/ConfiguracoesPage";
import { DashboardPage } from "./routes/dashboard/DashboardPage";
import { LoginPage } from "./routes/login/LoginPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/clientes/:id/case" element={<ProtectedRoute />}>
          <Route index element={<CaseViewPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/clientes" element={<ClientesListPage />} />
            <Route path="/clientes/:id" element={<ClienteDetailPage />} />
            <Route path="/configuracoes" element={<ConfiguracoesPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
