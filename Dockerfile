# ==========================================
# Stage 1: Build the Next.js frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Install dependencies needed for build
RUN apk add --no-cache libc6-compat

# Install dependencies first (caching)
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

# Copy remaining frontend files and build
COPY frontend/ ./frontend/
COPY prisma/ ./prisma/
RUN cd frontend && npx prisma generate --schema=../prisma/schema.prisma && BUILD_FOR_GO=true npm run build

# ==========================================
# Stage 2: Build the Go Backend
# ==========================================
FROM golang:1.25-alpine AS backend-builder
WORKDIR /app

ARG APP_VERSION="dev"

# Install C dependencies if CGO is needed (currently disabled)
RUN apk add --no-cache gcc musl-dev

# Copy Go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .
# Replace the empty frontend/out with the built static files
COPY --from=frontend-builder /app/frontend/out ./frontend/out

# Build the Go binary (CGO_ENABLED=0 for static binary)
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s -X 'github.com/fernandoamerico/dimy/version.Version=${APP_VERSION}'" -o dimy main.go

# ==========================================
# Stage 3: Final Production Image
# ==========================================
FROM alpine:latest
WORKDIR /app

# Install CA certificates and tzdata
RUN apk --no-cache add ca-certificates tzdata

# Copy the binary from the backend builder
COPY --from=backend-builder /app/dimy .

# Expose the standard port
EXPOSE 8080

# Run the binary
CMD ["./dimy"]
