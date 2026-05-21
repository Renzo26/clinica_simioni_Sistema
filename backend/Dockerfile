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

CMD ["sh", "-c", "echo 'XXXXX DEBUG MODE v3 XXXXX' && echo '--- ENV VARS ---' && env | grep -E 'DATABASE|REDIS|JWT|WAHA|ANTHROPIC|APP_|CORS' && echo '--- .env FILE ---' && (ls -la /app/.env 2>&1 && cat /app/.env 2>&1) || echo 'no .env file' && echo '--- KEEP ALIVE ---' && sleep 3600"]
