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
        className="flex items-center justify-center px-6 py-12 text-white"
        style={{
          background: "hsl(185 65% 10%)",
        }}
      >
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-bold text-white">Bem-vindo de volta</h1>
          <p className="mt-1 text-sm text-white/70">Entre para acessar o sistema da clínica.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="voce@clinicasimioni.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="senha" className="text-white">Senha</Label>
              </div>
              <Input
                id="senha"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-white/70">
            Primeira vez?{" "}
            <Link to="/cadastro" className="text-white underline-offset-4 hover:underline">
              Cadastrar clínica
            </Link>
          </p>
        </div>
      </div>

      <div
        className="hidden bg-white lg:flex lg:flex-col lg:justify-center lg:gap-10 lg:p-16"
        style={{ color: "hsl(185 65% 15%)" }}
      >
        <img src="/LogoSemescritaV2.png" alt="Clínica Simioni" className="w-full max-w-full self-center" />
        <div className="w-full">
          <h2 className="font-display text-4xl font-bold leading-tight" style={{ color: "hsl(185 65% 15%)" }}>
            Cuidando de pacientes com tecnologia e dedicação desde 1983.
          </h2>
          <p className="mt-4 text-base" style={{ color: "hsl(185 65% 25%)" }}>
            Conversas, agenda, pacientes e equipe em um só lugar.
          </p>
        </div>
        <p className="text-xs" style={{ color: "hsl(185 65% 35%)" }}>© Clínica Simioni</p>
      </div>
    </div>
  );
}
