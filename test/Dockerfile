# 빌드 스테이지
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV BUILD_PATH=/app/build
RUN npm run build

# 프로덕션 스테이지
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/build .

# Nginx 설정 파일 복사 (3000번 포트 설정)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
