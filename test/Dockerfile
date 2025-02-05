# 빌드 스테이지
FROM node:18-alpine AS builder
WORKDIR /app
RUN mkdir -p /app/build
COPY package*.json ./
RUN npm ci
COPY . .
ENV BUILD_PATH=/app/build
RUN npm run build

# 프로덕션 스테이지
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
