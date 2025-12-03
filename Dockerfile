FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install frontend dependencies and build
WORKDIR /app/frontend
RUN npm ci
COPY frontend/ .
RUN npm run build

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci
COPY backend/ .

# Create combined server
RUN echo 'const express = require("express"); \
const path = require("path"); \
const app = express(); \
const port = process.env.PORT || 5000; \
\
app.use(express.json()); \
\
// Serve static files from frontend build \
app.use(express.static(path.join(__dirname, "../frontend/build"))); \
\
// Your backend API routes (example) \
app.get("/api/health", (req, res) => { \
    res.json({ status: "OK" }); \
}); \
\
// For React Router - all other requests go to React app \
app.get("*", (req, res) => { \
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html")); \
}); \
\
app.listen(port, () => { \
    console.log(`Server running on port ${port}`); \
});' > /app/backend/server.js

EXPOSE 5000

WORKDIR /app/backend
CMD ["node", "server.js"]
