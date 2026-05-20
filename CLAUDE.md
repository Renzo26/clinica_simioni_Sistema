# Clínica Simioni — Sistema de Gestão

Sistema de gestão clínica com atendimento via WhatsApp.
Adaptado do Mecaflow Workshop Hub para o domínio de saúde multidisciplinar.

---

## Contexto do negócio

Clínica Simioni — fundada em 1983, Santo André - SP.
Especialidades: Neuropsicologia, Psicologia, Fonoaudiologia, Psicopedagogia, Dermatologia, Endocrinologia.
Contato: (11) 4994-2599 | clinicasimionisc@terra.com.br

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Python 3.12 + FastAPI + SQLAlchemy 2 async + Alembic + Pydantic v2 |
| Frontend | React 19 + TanStack Router + TanStack Start + Tailwind CSS + shadcn/ui |
| Banco | Supabase (PostgreSQL) — Session Pooler IPv4, porta 5432 |
| Cache | Redis |
| WhatsApp | WAHA (self-hosted no EasyPanel) |
| Auth | JWT HS256 + bcrypt (pins obrigatórios: bcrypt==3.2.2 + passlib==1.7.4) |
| IA | Claude API (Anthropic) |
| Deploy | Docker Compose + EasyPanel |

---

## Estrutura de pastas

```
clinica_simioni_Sistema/
├── backend/                    ← API Python/FastAPI
│   ├── main.py
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env                    ← NÃO commitar (gitignore)
│   ├── alembic/
│   │   └── versions/
│   │       └── 0001_initial_clinica_simioni.py
│   └── app/
│       ├── api/
│       │   ├── auth.py
│       │   ├── pacientes.py
│       │   ├── consultas.py
│       │   ├── etiquetas.py
│       │   ├── clinica_users.py
│       │   ├── conversations.py
│       │   ├── webhooks.py
│       │   ├── sse.py
│       │   └── assistant.py
│       ├── core/
│       │   ├── config.py
│       │   ├── database.py
│       │   └── redis.py
│       ├── models/
│       │   ├── clinica.py
│       │   ├── user.py         ← roles: ADMIN, SECRETARIA, PROFISSIONAL
│       │   ├── paciente.py
│       │   ├── consulta.py
│       │   ├── etiqueta.py
│       │   ├── conversation.py
│       │   ├── message.py
│       │   └── label.py
│       ├── schemas/
│       └── services/
└── frontend/                   ← React (adaptado do Mecaflow)
```

---

## Mudanças em relação ao Mecaflow (oficina → clínica)

| Mecaflow | Clínica Simioni |
|----------|----------------|
| Workshop | Clinica |
| Client | Paciente |
| Appointment | Consulta |
| WorkshopLabel | Etiqueta |
| ADMIN / AGENT | ADMIN / SECRETARIA / PROFISSIONAL |
| veiculo, placa | convenio, cpf, data_nascimento |
| servico_realizado | observacoes |
| workshop_id no JWT | clinica_id no JWT |
| /clients | /pacientes |
| /appointments | /consultas |
| /labels | /etiquetas |
| /users | /users (mesma rota) |

---

## Banco de dados (Supabase)

- **Projeto:** hpvnornuvuglhdqppzed
- **Host Session Pooler:** aws-1-us-east-1.pooler.supabase.com
- **Porta:** 5432
- **User:** postgres.hpvnornuvuglhdqppzed
- **Método de conexão obrigatório:** Session Pooler (IPv4)

---

## Como rodar localmente

### Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
# configurar .env (ver .env.example)
alembic upgrade head
uvicorn main:app --reload --port 8000
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

---

## Rotas da API (prefixo `/api`)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /auth/register | Cria clínica + admin |
| POST | /auth/login | Login |
| POST | /auth/refresh | Renova token |
| GET | /auth/me | Dados do usuário |
| GET/POST | /pacientes | Lista/cria pacientes |
| PUT/DELETE | /pacientes/{id} | Atualiza/remove paciente |
| GET/POST | /consultas | Lista/cria consultas (?data=YYYY-MM-DD) |
| PUT/DELETE | /consultas/{id} | Atualiza/remove consulta |
| GET/POST | /etiquetas | Lista/cria etiquetas |
| PUT/DELETE | /etiquetas/{id} | Atualiza/remove etiqueta |
| GET/POST | /users | Lista/cria usuários |
| PUT/DELETE | /users/{id} | Atualiza/remove usuário |
| GET | /conversations | Conversas WhatsApp |
| POST | /webhooks/waha | Webhook do WAHA |
| GET | /sse/events | Server-Sent Events |
| POST | /assistant/chat | Chat com Claude IA |

---

## Armadilhas conhecidas

- `bcrypt==3.2.2` + `passlib==1.7.4` são **pins obrigatórios** (bcrypt 4.x quebra o passlib)
- Session Pooler (porta 5432) obrigatório para IPv4 — nunca usar Direct Connection
- Datas no JS: nunca usar `toISOString()` (quebra UTC-3), usar data local manualmente
- `CORS_ORIGINS` sem trailing slash
- JWT carrega `clinica_id` (não `workshop_id`)

---

## Repositório

- https://github.com/Renzo26/clinica_simioni_Sistema
- Branch: main
