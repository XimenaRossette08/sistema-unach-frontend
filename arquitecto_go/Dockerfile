FROM golang:1.26-alpine

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY main.go .

RUN go build -o arquitecto .

EXPOSE 8090

CMD ["./arquitecto"]
