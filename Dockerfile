# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copy module files first for caching
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -o /server ./cmd/api/main.go

# Runtime stage
FROM alpine:3.19

RUN apk --no-cache add ca-certificates

WORKDIR /app

COPY --from=builder /server .

# Railway sets PORT env var
EXPOSE ${PORT}

CMD ["./server"]
