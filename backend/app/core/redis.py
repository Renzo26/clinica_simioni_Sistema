from redis.asyncio import Redis
from app.core.config import get_settings

_redis: Redis | None = None


async def get_redis() -> Redis | None:
    global _redis
    settings = get_settings()
    if not settings.redis_url:
        return None
    if _redis is None:
        try:
            _redis = Redis.from_url(settings.redis_url, decode_responses=True)
            await _redis.ping()
        except Exception:
            _redis = None
    return _redis
