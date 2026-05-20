import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from jose import JWTError
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session, get_clinica_id, _bearer
from app.models.user import User, UserRole
from app.schemas.auth import UserOut
from app.services.auth_service import AuthError, decode_token, hash_password

router = APIRouter(prefix="/users", tags=["users"])


class UserCreateIn(BaseModel):
    nome: str
    email: EmailStr
    password: str
    role: Optional[str] = "SECRETARIA"
    especialidade: Optional[str] = None


class UserUpdateIn(BaseModel):
    nome: str
    role: str
    especialidade: Optional[str] = None


async def _get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> uuid.UUID:
    try:
        payload = decode_token(credentials.credentials)
        if payload.get("type") != "access":
            raise AuthError("Token inválido")
        return uuid.UUID(payload["sub"])
    except (JWTError, AuthError, ValueError, KeyError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def _get_or_404(user_id: uuid.UUID, clinica_id: uuid.UUID, db: AsyncSession) -> User:
    user = await db.scalar(
        select(User).where(User.id == user_id, User.clinica_id == clinica_id)
    )
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
    return user


@router.get("", response_model=list[UserOut])
async def list_users(
    db: AsyncSession = Depends(get_session),
    clinica_id: uuid.UUID = Depends(get_clinica_id),
):
    result = await db.scalars(
        select(User).where(User.clinica_id == clinica_id, User.is_active == True)  # noqa: E712
    )
    return result.all()


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(
    body: UserCreateIn,
    db: AsyncSession = Depends(get_session),
    clinica_id: uuid.UUID = Depends(get_clinica_id),
):
    existing = await db.scalar(select(User).where(User.email == body.email))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="E-mail já cadastrado")

    try:
        role = UserRole(body.role.upper())
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Role inválida"
        )

    user = User(
        clinica_id=clinica_id,
        name=body.nome,
        email=body.email,
        password_hash=hash_password(body.password),
        role=role,
        especialidade=body.especialidade,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.put("/{user_id}", response_model=UserOut)
async def update_user(
    user_id: uuid.UUID,
    body: UserUpdateIn,
    db: AsyncSession = Depends(get_session),
    clinica_id: uuid.UUID = Depends(get_clinica_id),
):
    user = await _get_or_404(user_id, clinica_id, db)

    try:
        role = UserRole(body.role.upper())
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Role inválida"
        )

    user.name = body.nome
    user.role = role
    user.especialidade = body.especialidade
    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_session),
    clinica_id: uuid.UUID = Depends(get_clinica_id),
    current_user_id: uuid.UUID = Depends(_get_current_user_id),
):
    if user_id == current_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível remover seu próprio usuário",
        )
    user = await _get_or_404(user_id, clinica_id, db)
    user.is_active = False
    await db.commit()
