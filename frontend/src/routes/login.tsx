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

// Tokens locais do design da tela de login
const BG = "hsl(185 65% 10%)";        // verde principal
const CARD = "hsl(185 65% 7%)";       // verde do card (mais escuro)
const CREAM = "hsl(43 33% 91%)";      // texto cream
const GOLD = "hsl(40 60% 55%)";       // dourado de destaque

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
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{ background: BG, color: CREAM }}
    >
      {/* Logo no canto superior esquerdo */}
      <div className="absolute left-8 top-8 lg:left-12 lg:top-10">
        <div className="rounded-2xl bg-white p-4 shadow-xl">
          <img src="/logo.png" alt="Clínica Simioni" className="h-20 w-auto lg:h-24" />
        </div>
      </div>

      {/* Conteúdo principal — grid 2 colunas em desktop */}
      <div className="flex min-h-screen flex-col items-start justify-center gap-12 px-8 py-32 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:px-12 lg:py-24">
        {/* Coluna esquerda — título */}
        <div className="w-full max-w-2xl">
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight lg:text-7xl">
            Cuidando de
            <br />
            pacientes com
            <br />
            <em className="italic">tecnologia</em>
            <br />
            e dedicação
            <br />
            desde <span style={{ color: GOLD }}>1983.</span>
          </h1>
          <div className="mt-8 flex items-center gap-4">
            <div className="h-px w-12" style={{ background: GOLD }} />
            <span className="text-xs font-medium uppercase tracking-[0.25em]" style={{ color: CREAM, opacity: 0.7 }}>
              Neuropsicologia e saúde multidisciplinar
            </span>
          </div>
        </div>

        {/* Coluna direita — formulário */}
        <div
          className="w-full max-w-md rounded-3xl border p-8 shadow-2xl lg:p-10"
          style={{
            background: CARD,
            borderColor: "rgba(255,255,255,0.06)",
          }}
        >
          <h2 className="font-display text-2xl font-bold" style={{ color: CREAM }}>
            Bem-vindo de volta
          </h2>
          <p className="mt-1 text-sm" style={{ color: CREAM, opacity: 0.6 }}>
            Acesse o portal da Clínica Simioni.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-medium uppercase tracking-[0.18em]"
                style={{ color: CREAM, opacity: 0.7 }}
              >
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="voce@clinicasimioni.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-white/10 bg-white/5 text-cream placeholder:text-white/30 focus-visible:border-white/30 focus-visible:ring-0"
                style={{ color: CREAM }}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="senha"
                  className="text-xs font-medium uppercase tracking-[0.18em]"
                  style={{ color: CREAM, opacity: 0.7 }}
                >
                  Senha
                </Label>
                <button
                  type="button"
                  className="text-xs transition-opacity hover:opacity-80"
                  style={{ color: GOLD }}
                >
                  Esqueceu?
                </button>
              </div>
              <Input
                id="senha"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border-white/10 bg-white/5 placeholder:text-white/30 focus-visible:border-white/30 focus-visible:ring-0"
                style={{ color: CREAM }}
              />
            </div>

            {error && (
              <p className="rounded-md bg-destructive/15 px-3 py-2 text-sm text-destructive">{error}</p>
            )}

            <Button
              type="submit"
              className="h-12 w-full font-semibold transition-opacity hover:opacity-90"
              disabled={loading}
              style={{ background: GOLD, color: "hsl(185 65% 8%)" }}
            >
              {loading ? "Entrando..." : "Entrar no Sistema"}
            </Button>
          </form>

          <div className="mt-6 border-t pt-6" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-center text-sm" style={{ color: CREAM, opacity: 0.6 }}>
              Primeira vez por aqui?{" "}
              <Link to="/cadastro" className="font-semibold hover:underline" style={{ color: GOLD }}>
                Cadastrar clínica
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div
        className="absolute bottom-6 left-6 flex flex-wrap items-center gap-6 text-[10px] font-medium uppercase tracking-[0.25em] lg:left-10 lg:bottom-8"
        style={{ color: CREAM, opacity: 0.4 }}
      >
        <span>Clínica Simioni © {new Date().getFullYear()}</span>
        <span>Sistema Proprietário</span>
      </div>
    </div>
  );
}
