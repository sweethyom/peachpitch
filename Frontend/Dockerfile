# 빌드 스테이지
FROM node:18-alpine AS builder
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
# RUN npm ci
RUN npm install --legacy-peer-deps

# 소스 코드 복사
COPY . .

# Vite를 사용한 프로덕션 빌드 (dist 폴더 생성)
RUN npm run build

# 프로덕션 스테이지
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Vite 빌드 결과(dist 폴더) 복사
COPY --from=builder /app/dist .

# Nginx 설정 파일 복사 (필요한 경우)
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
