FROM python:3.12-slim

# Cache bust v2 — força rebuild no EasyPanel
RUN echo "build-v2-$(date +%s)" > /tmp/build_marker.txt

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

CMD ["sh", "-c", "echo '############# DEBUG START #############' && echo \"DATABASE_URL=[$DATABASE_URL]\" && echo \"BUILD_MARKER=$(cat /tmp/build_marker.txt)\" && echo \"WORKDIR=$(pwd)\" && echo \"ENV FILE EXISTS:\" && ls -la /app/.env 2>&1 || echo no_env_file && echo '############# DEBUG END #############' && sleep 5 && alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8080"]
