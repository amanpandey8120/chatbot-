FROM python:3.10-slim AS backend

WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# --- Build full application with Nginx ---
FROM nginx:alpine

# Copy frontend code
COPY . /usr/share/nginx/html

# Remove default config & copy our custom reverse proxy config
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy backend from previous stage
COPY --from=backend /app /backend

# Install python for backend
RUN apk add --no-cache python3 py3-pip
RUN pip3 install --no-cache-dir -r /backend/requirements.txt

# Expose single port
EXPOSE 80

# Start backend + nginx
CMD \
uvicorn backend.app:app --host 0.0.0.0 --port 8000 & \
nginx -g "daemon off;"
