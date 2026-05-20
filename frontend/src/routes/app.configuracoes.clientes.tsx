import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, Phone, Calendar, FileText, User, Loader2, Mail, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";

export const Route = createFileRoute("/app/configuracoes/clientes")({
  head: () => ({ meta: [{ title: "Pacientes — Clínica Simioni" }] }),
  component: Clientes,
});

type Paciente = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  data_nascimento: string | null;
  cpf: string | null;
  convenio: string | null;
  observacoes: string | null;
  ultimo_atendimento: string | null;
};

function Clientes() {
  const [list, setList] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busca, setBusca] = useState("");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Paciente | null>(null);
  const [perfil, setPerfil] = useState<Paciente | null>(null);

  useEffect(() => {
    api.get<Paciente[]>("/pacientes")
      .then(setList)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = list.filter((c) =>
    [c.nome, c.telefone, c.cpf, c.email, c.convenio]
      .some((v) => v?.toLowerCase().includes(busca.toLowerCase()))
  );

  const salvar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = {
      nome: String(f.get("nome")),
      telefone: String(f.get("telefone") || "") || null,
      email: String(f.get("email") || "") || null,
      data_nascimento: String(f.get("data_nascimento") || "") || null,
      cpf: String(f.get("cpf") || "") || null,
      convenio: String(f.get("convenio") || "") || null,
      ultimo_atendimento: String(f.get("ultimo_atendimento") || "") || null,
      observacoes: String(f.get("observacoes") || "") || null,
    };
    setSaving(true);
    try {
      if (edit) {
        const updated = await api.put<Paciente>(`/pacientes/${edit.id}`, body);
        setList((arr) => arr.map((c) => (c.id === edit.id ? updated : c)));
      } else {
        const created = await api.post<Paciente>("/pacientes", body);
        setList((arr) => [...arr, created]);
      }
      setOpen(false);
      setEdit(null);
    } catch { /* ignora */ } finally {
      setSaving(false);
    }
  };

  const deletar = async (id: string) => {
    await api.delete(`/pacientes/${id}`).catch(() => {});
    setList((arr) => arr.filter((c) => c.id !== id));
  };

  const abrirNovo = () => { setEdit(null); setOpen(true); };
  const abrirEdit = (c: Paciente) => { setEdit(c); setOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Pacientes</h1>
          <p className="text-sm text-muted-foreground">Cadastro de pacientes da clínica.</p>
        </div>
        <Button onClick={abrirNovo}><Plus className="mr-1 h-4 w-4" /> Novo paciente</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, CPF, convênio..." className="pl-9" />
      </div>

      <div className="rounded-xl border bg-card">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Convênio</TableHead>
                <TableHead>Último atendimento</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    Nenhum paciente cadastrado.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <button type="button" onClick={() => setPerfil(c)} className="group text-left">
                      <p className="cursor-pointer font-medium text-primary underline-offset-2 group-hover:underline">{c.nome}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{c.email ?? "—"}</p>
                    </button>
                  </TableCell>
                  <TableCell>{c.telefone ?? "—"}</TableCell>
                  <TableCell>{c.cpf ?? "—"}</TableCell>
                  <TableCell>{c.convenio ?? "—"}</TableCell>
                  <TableCell>{c.ultimo_atendimento ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => abrirEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deletar(c.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Dialog: Criar / Editar */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit ? "Editar paciente" : "Novo paciente"}</DialogTitle></DialogHeader>
          <form onSubmit={salvar} className="space-y-3">
            <div className="space-y-2"><Label>Nome completo</Label><Input name="nome" required defaultValue={edit?.nome} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Telefone</Label><Input name="telefone" placeholder="(11) 99999-0000" defaultValue={edit?.telefone ?? ""} /></div>
              <div className="space-y-2"><Label>CPF</Label><Input name="cpf" placeholder="000.000.000-00" defaultValue={edit?.cpf ?? ""} /></div>
            </div>
            <div className="space-y-2"><Label>E-mail</Label><Input name="email" type="email" placeholder="paciente@email.com" defaultValue={edit?.email ?? ""} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Data de nascimento</Label><Input name="data_nascimento" type="date" defaultValue={edit?.data_nascimento ?? ""} /></div>
              <div className="space-y-2"><Label>Convênio</Label><Input name="convenio" placeholder="Unimed, Amil..." defaultValue={edit?.convenio ?? ""} /></div>
            </div>
            <div className="space-y-2"><Label>Último atendimento</Label><Input name="ultimo_atendimento" type="date" defaultValue={edit?.ultimo_atendimento ?? ""} /></div>
            <div className="space-y-2"><Label>Observações</Label><Textarea name="observacoes" placeholder="Informações adicionais sobre o paciente..." defaultValue={edit?.observacoes ?? ""} /></div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Perfil */}
      <Dialog open={!!perfil} onOpenChange={(v) => { if (!v) setPerfil(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              Perfil do paciente
            </DialogTitle>
          </DialogHeader>
          {perfil && (
            <div className="space-y-4">
              <p className="text-lg font-semibold">{perfil.nome}</p>
              <Separator />
              <div className="grid gap-3">
                {[
                  { Icon: Phone, label: "Telefone", value: perfil.telefone },
                  { Icon: Mail, label: "E-mail", value: perfil.email },
                  { Icon: Hash, label: "CPF", value: perfil.cpf },
                  { Icon: Calendar, label: "Data de nascimento", value: perfil.data_nascimento },
                  { Icon: FileText, label: "Convênio", value: perfil.convenio },
                  { Icon: Calendar, label: "Último atendimento", value: perfil.ultimo_atendimento },
                  { Icon: FileText, label: "Observações", value: perfil.observacoes },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 rounded-lg bg-muted/50 px-3 py-2.5">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium">{value ?? "—"}</p>
                    </div>
                  </div>
                ))}
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setPerfil(null)}>Fechar</Button>
                <Button onClick={() => { abrirEdit(perfil); setPerfil(null); }}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Editar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
