# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# copy dependency file first to leverage cache
COPY requirements.txt .

RUN apt-get update && apt-get install -y build-essential gcc libpq-dev \
 && pip install --no-cache-dir -r requirements.txt \
 && apt-get remove -y build-essential gcc libpq-dev \
 && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

COPY . .

ENV PYTHONUNBUFFERED=1

EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
