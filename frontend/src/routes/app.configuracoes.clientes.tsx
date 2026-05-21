import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Plus, Pencil, Trash2, Search, Phone, Calendar, FileText,
  User, Loader2, Mail, Hash, ClipboardList, ChevronRight, Clock, Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

type Atendimento = {
  id: string;
  paciente_id: string;
  data: string;
  hora: string | null;
  tipo: string;
  profissional: string | null;
  observacoes: string | null;
  created_at: string;
};

const TIPOS_ATENDIMENTO = ["Consulta", "Retorno", "Avaliação", "Sessão", "Exame", "Outro"];

function formatDate(d: string | null) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function Clientes() {
  const [list, setList] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busca, setBusca] = useState("");

  // Modais
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Paciente | null>(null);
  const [perfil, setPerfil] = useState<Paciente | null>(null);

  // Atendimentos
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [loadingAtend, setLoadingAtend] = useState(false);
  const [novoAtend, setNovoAtend] = useState(false);
  const [savingAtend, setSavingAtend] = useState(false);
  const [tipoAtend, setTipoAtend] = useState("Consulta");

  useEffect(() => {
    api.get<Paciente[]>("/pacientes")
      .then(setList)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const abrirPerfil = async (p: Paciente) => {
    setPerfil(p);
    setAtendimentos([]);
    setNovoAtend(false);
    setLoadingAtend(true);
    try {
      const data = await api.get<Atendimento[]>(`/pacientes/${p.id}/atendimentos`);
      setAtendimentos(data);
    } catch { /* ignora */ } finally {
      setLoadingAtend(false);
    }
  };

  const filtered = list.filter((c) =>
    [c.nome, c.telefone, c.cpf, c.email, c.convenio]
      .some((v) => v?.toLowerCase().includes(busca.toLowerCase()))
  );

  const salvarPaciente = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = {
      nome: String(f.get("nome")),
      telefone: String(f.get("telefone") || "") || null,
      email: String(f.get("email") || "") || null,
      data_nascimento: String(f.get("data_nascimento") || "") || null,
      cpf: String(f.get("cpf") || "") || null,
      convenio: String(f.get("convenio") || "") || null,
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

  const lancarAtendimento = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!perfil) return;
    const f = new FormData(e.currentTarget);
    const body = {
      data: String(f.get("data")),
      hora: String(f.get("hora") || "") || null,
      tipo: tipoAtend,
      profissional: String(f.get("profissional") || "") || null,
      observacoes: String(f.get("observacoes") || "") || null,
    };
    setSavingAtend(true);
    try {
      const criado = await api.post<Atendimento>(`/pacientes/${perfil.id}/atendimentos`, body);
      setAtendimentos((prev) => [criado, ...prev]);
      // Atualiza ultimo_atendimento na lista
      setList((arr) =>
        arr.map((p) =>
          p.id === perfil.id
            ? { ...p, ultimo_atendimento: body.data }
            : p
        )
      );
      setPerfil((p) => p ? { ...p, ultimo_atendimento: body.data } : p);
      setNovoAtend(false);
    } catch { /* ignora */ } finally {
      setSavingAtend(false);
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
          <p className="text-sm text-muted-foreground">
            Cadastro de pacientes da clínica.{" "}
            <span className="text-foreground/70">
              Clique no nome para ver o perfil e o histórico de atendimentos.
            </span>
          </p>
        </div>
        <Button onClick={abrirNovo}><Plus className="mr-1 h-4 w-4" /> Novo paciente</Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, CPF, convênio..." className="pl-9" />
        </div>
        <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-muted-foreground">
          <Lightbulb className="h-3.5 w-3.5 text-primary" />
          <span>Clique no nome do paciente para abrir o perfil e lançar atendimentos.</span>
        </div>
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
                    <button type="button" onClick={() => abrirPerfil(c)} className="group text-left">
                      <p className="inline-flex items-center gap-1 cursor-pointer font-medium text-primary underline-offset-2 group-hover:underline">
                        {c.nome}
                        <ChevronRight className="h-3.5 w-3.5 opacity-40 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                      </p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{c.email ?? "—"}</p>
                    </button>
                  </TableCell>
                  <TableCell>{c.telefone ?? "—"}</TableCell>
                  <TableCell>{c.cpf ?? "—"}</TableCell>
                  <TableCell>{c.convenio ?? "—"}</TableCell>
                  <TableCell>{formatDate(c.ultimo_atendimento)}</TableCell>
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

      {/* Dialog: Criar / Editar paciente */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit ? "Editar paciente" : "Novo paciente"}</DialogTitle></DialogHeader>
          <form onSubmit={salvarPaciente} className="space-y-3">
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
            <div className="space-y-2"><Label>Observações</Label><Textarea name="observacoes" placeholder="Informações adicionais sobre o paciente..." defaultValue={edit?.observacoes ?? ""} /></div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Perfil + Atendimentos */}
      <Dialog open={!!perfil} onOpenChange={(v) => { if (!v) { setPerfil(null); setNovoAtend(false); } }}>
        <DialogContent className="max-w-lg">
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

              {/* Dados do paciente */}
              <div className="grid gap-2">
                {[
                  { Icon: Phone, label: "Telefone", value: perfil.telefone },
                  { Icon: Mail, label: "E-mail", value: perfil.email },
                  { Icon: Hash, label: "CPF", value: perfil.cpf },
                  { Icon: Calendar, label: "Data de nascimento", value: formatDate(perfil.data_nascimento) },
                  { Icon: FileText, label: "Convênio", value: perfil.convenio },
                  { Icon: FileText, label: "Observações", value: perfil.observacoes },
                ].map(({ Icon, label, value }) => value ? (
                  <div key={label} className="flex items-start gap-3 rounded-lg bg-muted/50 px-3 py-2">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium">{value}</p>
                    </div>
                  </div>
                ) : null)}
              </div>

              <Separator />

              {/* Histórico de atendimentos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">Atendimentos</span>
                    {atendimentos.length > 0 && (
                      <Badge variant="secondary" className="text-xs">{atendimentos.length}</Badge>
                    )}
                  </div>
                  {!novoAtend && (
                    <Button size="sm" variant="outline" onClick={() => { setNovoAtend(true); setTipoAtend("Consulta"); }}>
                      <Plus className="mr-1 h-3.5 w-3.5" /> Lançar atendimento
                    </Button>
                  )}
                </div>

                {/* Form: novo atendimento */}
                {novoAtend && (
                  <form onSubmit={lancarAtendimento} className="rounded-lg border bg-muted/30 p-3 space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Novo atendimento</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Data</Label>
                        <Input name="data" type="date" required defaultValue={new Date().toISOString().split("T")[0]} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Hora</Label>
                        <Input name="hora" type="time" placeholder="HH:MM" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Tipo</Label>
                        <Select value={tipoAtend} onValueChange={setTipoAtend}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {TIPOS_ATENDIMENTO.map((t) => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Profissional</Label>
                        <Input name="profissional" placeholder="Nome do profissional" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Observações</Label>
                      <Textarea name="observacoes" placeholder="Notas do atendimento..." className="min-h-[60px]" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setNovoAtend(false)}>Cancelar</Button>
                      <Button type="submit" size="sm" disabled={savingAtend}>
                        {savingAtend ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Salvar"}
                      </Button>
                    </div>
                  </form>
                )}

                {/* Lista de atendimentos */}
                {loadingAtend ? (
                  <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
                ) : atendimentos.length === 0 && !novoAtend ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">Nenhum atendimento registrado.</p>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {atendimentos.map((a) => (
                      <div key={a.id} className="flex items-start gap-3 rounded-lg border bg-card px-3 py-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                          <ChevronRight className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">{a.tipo}</Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />{formatDate(a.data)}
                              {a.hora && <><Clock className="h-3 w-3 ml-1" />{a.hora}</>}
                            </span>
                          </div>
                          {a.profissional && (
                            <p className="text-xs text-muted-foreground mt-0.5">{a.profissional}</p>
                          )}
                          {a.observacoes && (
                            <p className="text-sm mt-1 line-clamp-2">{a.observacoes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setPerfil(null)}>Fechar</Button>
                <Button onClick={() => { abrirEdit(perfil); setPerfil(null); }}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Editar dados
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
