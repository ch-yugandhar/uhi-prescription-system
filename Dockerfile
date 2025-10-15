# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install backend dependencies
RUN cd backend && npm install

# Install frontend dependencies and build
RUN cd frontend && npm install && npm run build

# Copy all source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Install backend dependencies again to ensure consistency
RUN cd backend && npm install --production

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "backend/server.js"]