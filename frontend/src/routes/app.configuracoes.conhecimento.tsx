import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";

export const Route = createFileRoute("/app/configuracoes/conhecimento")({
  head: () => ({ meta: [{ title: "Minha clínica — Clínica Simioni" }] }),
  component: Conhecimento,
});

type Settings = {
  name: string;
  cnpj: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  cep: string | null;
  horario_atendimento: string | null;
  especialidades: string | null;
  bot_info: string | null;
};

const empty: Settings = {
  name: "", cnpj: "", phone: "", email: "",
  address: "", city: "", state: "", cep: "",
  horario_atendimento: "", especialidades: "", bot_info: "",
};

function Conhecimento() {
  const [data, setData] = useState<Settings>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<Settings>("/clinica")
      .then((d) => setData({ ...empty, ...d }))
      .catch(() => toast.error("Erro ao carregar dados da clínica"))
      .finally(() => setLoading(false));
  }, []);

  const set = (field: keyof Settings) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setData((prev) => ({ ...prev, [field]: e.target.value }));

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.put<Settings>("/clinica", data);
      setData({ ...empty, ...updated });
      const raw = localStorage.getItem("auth_clinica");
      if (raw) {
        const c = JSON.parse(raw) as { id: string; name: string };
        c.name = updated.name;
        localStorage.setItem("auth_clinica", JSON.stringify(c));
        window.dispatchEvent(new Event("clinica-name-updated"));
      }
      toast.success("Configurações salvas com sucesso");
    } catch {
      toast.error("Erro ao salvar configurações da clínica");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Minha clínica</h1>
        <p className="text-sm text-muted-foreground">Informações da clínica usadas pelo bot e pela equipe.</p>
      </div>

      <form onSubmit={salvar} className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Identificação</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Nome da clínica</Label>
              <Input required value={data.name} onChange={set("name")} placeholder="Clínica Simioni" />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input value={data.cnpj ?? ""} onChange={set("cnpj")} placeholder="00.000.000/0000-00" />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={data.phone ?? ""} onChange={set("phone")} placeholder="(11) 99999-0000" />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={data.email ?? ""} onChange={set("email")} placeholder="contato@clinicasimioni.com.br" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Endereço</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input value={data.address ?? ""} onChange={set("address")} placeholder="Av. Brasil, 1000" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input value={data.city ?? ""} onChange={set("city")} placeholder="São Paulo" />
              </div>
              <div className="space-y-2">
                <Label>UF</Label>
                <Input value={data.state ?? ""} onChange={set("state")} placeholder="SP" maxLength={2} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>CEP</Label>
              <Input value={data.cep ?? ""} onChange={set("cep")} placeholder="00000-000" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Funcionamento e especialidades</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Horário de funcionamento</Label>
              <Input value={data.horario_atendimento ?? ""} onChange={set("horario_atendimento")} placeholder="Seg–Sex 08h–18h, Sáb 08h–12h" />
            </div>
            <div className="space-y-2">
              <Label>Especialidades</Label>
              <Textarea rows={4} value={data.especialidades ?? ""} onChange={set("especialidades")} placeholder="Neuropsicologia, Psicologia, Fonoaudiologia, Terapia Ocupacional..." />
            </div>
            <div className="space-y-2">
              <Label>Informações adicionais para o bot</Label>
              <Textarea rows={4} value={data.bot_info ?? ""} onChange={set("bot_info")} placeholder="Formas de pagamento, garantias, política de cancelamento..." />
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Salvar alterações
          </Button>
        </div>
      </form>
    </div>
  );
}
