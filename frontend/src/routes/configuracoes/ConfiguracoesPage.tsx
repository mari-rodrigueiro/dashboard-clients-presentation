import { type FormEvent, useState } from "react";

import { PageIntro } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../hooks/use-auth";
import { ApiError } from "../../lib/api-client";

export function ConfiguracoesPage() {
  const { usuario, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "A nova senha e a confirmação não coincidem." });
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      setMessage({ type: "success", text: "Senha alterada com sucesso." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const text =
        err instanceof ApiError && err.status === 403
          ? "Senha atual incorreta."
          : "Não foi possível alterar a senha.";
      setMessage({ type: "error", text });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <PageIntro eyebrow="Conta" title="Configurações" />
      <Card>
        <CardHeader>
          <CardTitle>Conta</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <p className="text-sm text-muted-foreground">Logado como {usuario?.email}</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="current-password">Senha atual</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            {message && (
              <p
                className={
                  message.type === "success" ? "text-sm text-success" : "text-sm text-destructive"
                }
              >
                {message.text}
              </p>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Alterar senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
