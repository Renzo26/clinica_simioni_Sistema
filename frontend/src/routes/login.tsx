import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { setAuth, isAuthenticated } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — Clínica Simioni" }] }),
  beforeLoad: () => {
    if (isAuthenticated()) throw redirect({ to: "/app" });
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.post<{
        access_token: string;
        refresh_token: string;
        user: { id: string; name: string; email: string; role: string; clinica_id: string };
        clinica: { id: string; name: string };
      }>("/auth/login", { email, password });
      setAuth(data);
      navigate({ to: "/app" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div
        className="hidden text-sidebar-foreground lg:flex lg:flex-col lg:justify-center lg:gap-10 lg:p-16"
        style={{
          background:
            "linear-gradient(170deg, hsl(43 33% 91%) 0%, hsl(43 33% 85%) 30%, hsl(185 65% 12%) 65%, hsl(185 65% 8%) 100%)",
        }}
      >
        <img src="/LogoSemescrita.png" alt="Clínica Simioni" className="w-full max-w-full self-center" />
        <div className="w-full">
          <h2 className="font-display text-4xl font-bold leading-tight drop-shadow-sm">
            Cuidando de pacientes com tecnologia e dedicação desde 1983.
          </h2>
          <p className="mt-4 text-base text-sidebar-foreground/70">
            Conversas, agenda, pacientes e equipe em um só lugar.
          </p>
        </div>
        <p className="text-xs text-sidebar-foreground/40">© Clínica Simioni</p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-bold">Bem-vindo de volta</h1>
          <p className="mt-1 text-sm text-muted-foreground">Entre para acessar o sistema da clínica.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="voce@clinicasimioni.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="senha">Senha</Label>
              </div>
              <Input
                id="senha"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Primeira vez?{" "}
            <Link to="/cadastro" className="text-primary hover:underline">
              Cadastrar clínica
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
