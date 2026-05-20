from dotenv import load_dotenv
load_dotenv()

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.api import auth, conversations, webhooks, sse, assistant
from app.api import pacientes, consultas, etiquetas, clinica_users, clinica_settings

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.core.redis import get_redis
    redis = await get_redis()
    app.state.redis = redis
    yield
    if redis:
        await redis.aclose()


app = FastAPI(
    title="Clínica Simioni API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"https?://.*\.easypanel\.host",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(webhooks.router, prefix="/api")
app.include_router(conversations.router, prefix="/api")
app.include_router(sse.router, prefix="/api")
app.include_router(pacientes.router, prefix="/api")
app.include_router(consultas.router, prefix="/api")
app.include_router(etiquetas.router, prefix="/api")
app.include_router(clinica_users.router, prefix="/api")
app.include_router(clinica_settings.router, prefix="/api")
app.include_router(assistant.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "Clínica Simioni API"}
