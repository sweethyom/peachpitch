# 목차

- [**Project Skill Stack Version**](#Project-Skill-Stack-Version)
- [**EC2 포트 번호**](#EC2-포트-번호)
- [**외부 API**](#외부-API)
- [**빌드 방법**](#빌드-방법)
  * [Backend_Springboot](#backend_springboot)
    + [1. 도커 파일](#1-도커-파일)
    + [2. Docker-compose 파일](#2-docker-compose-파일)
    + [3. application.properties](#3-applicationproperties)
  * [BackendAI_Django](#backendai_django)
    + [1. 도커 파일](#1-도커-파일-1)
    + [2. Docker-compose 파일](#2-docker-compose-파일-1)
    + [3. .env 파일](#3-env-파일)
    + [4. settings.py에 추가할 내용](#4-settingspy에-추가할-내용)
  * [Frontend_React](#frontend_react)
    + [1. 도커 파일](#1-도커-파일-2)
    + [2. Docker-compose 파일](#2-docker-compose-파일-2)
    + [3. .env 파일](#3-env-파일-1)
    + [4. nginx.conf 파일](#4-nginxconf-파일)
- [**AWS EC2 Ubuntu, Docker, Nginx Setting**](#AWS-EC2-Ubuntu,-Docker,-Nginx-Setting)
  * [AWS EC2 Ubuntu](#aws-ec2-ubuntu)
  * [Docker](#docker)
    + [기본 설정 컨테이너 세팅](#기본-설정-컨테이너-세팅)
    + [코드를 이미지로 만들어서 컨테이너 세팅](#코드를-이미지로-만들어서-컨테이너-세팅)
  * [Nginx 설정](#nginx-설정)
  * [deploy.sh](#deploysh)

  <br />
  <br />
  <br />

# **Project Skill Stack Version**

```
[Frontend]
React - 18.3.1
Vite - 6.0.5
Typescript - 5.6.2

[Backend(springboot)]
java - jdk17
Spring Boot - 3.4.1

[Backend(springboot)]
python - 3.9.13
Django - 4.2.19

[Database]
Redis - 5.2.1
mysql - 5.7

[Infra]
openvidu 2.31.0
ubuntu - 24.04
jenkins - 2.492.1
nginx - 1.27.4
kurento - 7.1.1
```
<br /><br />


# **EC2 포트 번호**

| Skill | Port |
| --- | --- |
| Jenkins | 8080 |
| Nginx | 80/443 |
| Mysql | 13306 |
| Redis | 6379 |
| Springboot | 8081(blue), 8082(green) |
| Django | 8083(blue), 8084(green) |
| React | 3000 |
| OpenVidu | 8442/8443 |
| Prometheus | 9090 |
| Grafana | 4000 |

<br /><br />

# **외부 API**

OpenVidu (v2)

OpenAI API

Kakao Login API (Oauth2)

KakaoPay API

Google API Text to Speech

Google Custom Search JSON API

<br /><br />

# **빌드 방법**

## Backend_Springboot

### 1. 도커 파일

```
FROM openjdk:17-jdk

# UTF-8 로케일 설정
ENV LANG=ko_KR.UTF-8
ENV LANGUAGE=ko_KR:ko
ENV LC_ALL=ko_KR.UTF-8

# Spring Boot 포트 설정 (필요 시 오버라이드 가능)
# ENV SERVER_PORT=8081

WORKDIR /app

# 애플리케이션 복사 및 실행 설정
COPY build/libs/*SNAPSHOT.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar", "--server.port=8081"]
```

Dockerfile8081

```
FROM openjdk:17-jdk

# UTF-8 로케일 설정
ENV LANG=ko_KR.UTF-8
ENV LANGUAGE=ko_KR:ko
ENV LC_ALL=ko_KR.UTF-8

# Spring Boot 포트 설정 (필요 시 오버라이드 가능)
# ENV SERVER_PORT=8082

WORKDIR /app

# 애플리케이션 복사 및 실행 설정
COPY build/libs/*SNAPSHOT.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar", "--server.port=8082"]
```

Dockerfile8082

<br />

### 2. Docker-compose 파일

```
version: '3.1'

services:
  springboot-app:
    image: [Dockerhub username]/[Dockerhub repo]:bluegreen8081
    container_name: bluegreen-8081
    build:
      context: .
      dockerfile: Dockerfile8081
    environment:
      - TZ=Asia/Seoul
      - LANG=ko_KR.UTF-8
      - LANGUAGE=ko_KR:ko
      - LC_ALL=ko_KR.UTF-8
      - SPRING_DATASOURCE_URL=jdbc:mysql://[AWS address]:13306/[DB]?useSSL=false&useUnicode=true&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul
      - SPRING_DATASOURCE_USERNAME=[mysql username]
      - SPRING_DATASOURCE_PASSWORD=[mysql password]
      - SPRING_JPA_HIBERNATE_DDL_AUTO=update
      - SERVER_PORT=8081
      - SPRING_REDIS_HOST=[AWS address]
      - SPRING_REDIS_PORT=6379
    networks:
      - peachpitch-network
    ports:
      - "8081:8081"

networks:
  peachpitch-network:
    external: true
```

docker-compose.bluegreen8081.yml

```
version: '3.1'

services:
  springboot-app:
    image: [Dockerhub username]/[Dockerhub repo]:bluegreen8082
    container_name: bluegreen-8082
    build:
      context: .
      dockerfile: Dockerfile8082
    environment:
      - TZ=Asia/Seoul
      - LANG=ko_KR.UTF-8
      - LANGUAGE=ko_KR:ko
      - LC_ALL=ko_KR.UTF-8
      - SPRING_DATASOURCE_URL=jdbc:mysql://[AWS address]:13306/[DB]?useSSL=false&useUnicode=true&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul
      - SPRING_DATASOURCE_USERNAME=[mysql username]
      - SPRING_DATASOURCE_PASSWORD=[mysql password]
      - SPRING_JPA_HIBERNATE_DDL_AUTO=update
      - SERVER_PORT=8081
      - SPRING_REDIS_HOST=[AWS address]
      - SPRING_REDIS_PORT=6379
    networks:
      - peachpitch-network
    ports:
      - "8082:8082"

networks:
  peachpitch-network:
    external: true
```

docker-compose.bluegreen8082.yml

<br />

### 3. application.properties

```
spring.application.name=Backend
server.port=8081

# MySQL
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://[AWS 주소]:13306/[DB]?useSSL=false&useUnicode=true&serverTimezone=Asia/Seoul&allowPublicKeyRetrieval=true
spring.datasource.username=[mysql username]
spring.datasource.password=[mysql password]

# hibernate ddl ??
spring.jpa.hibernate.ddl-auto=update
# spring.jpa.show-sql=true
# spring.jpa.properties.hibernate.format_sql=true
# logging.level.org.hibernate.SQL=DEBUG
# logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE

# based on second
#server.servlet.session.timeout=1800

# based on minute
server.servlet.session.timeout=90m

# JWT secret key ??
spring.jwt.secret=[jwt secret key]

# openvidu
OPENVIDU_URL=https://[등록해둔 도메인명]:8443
OPENVIDU_SECRET=[등록해둔 비밀번호]

# kakaopay
kakaopay.secretKey=[kakao pay secret key]
kakaopay.cid=TC0ONETIME

# redis
spring.data.redis.host=[AWS 주소]
spring.data.redis.port=6379

# kakao registration
spring.security.oauth2.client.registration.kakao.client-name=kakao
spring.security.oauth2.client.registration.kakao.client-id=[kakao client id]
spring.security.oauth2.client.registration.kakao.client-secret=[kakao client secret]
spring.security.oauth2.client.registration.kakao.redirect-uri=https://[도메인명]/login/oauth2/code/kakao
spring.security.oauth2.client.registration.kakao.authorization-grant-type=authorization_code
spring.security.oauth2.client.registration.kakao.scope=account_email
# kakao redirect-uri
spring.security.oauth2.client.registration.kakao.client-authentication-method=client_secret_post
spring.security.oauth2.client.provider.kakao.authorization-uri=https://kauth.kakao.com/oauth/authorize
spring.security.oauth2.client.provider.kakao.token-uri=https://kauth.kakao.com/oauth/token
spring.security.oauth2.client.provider.kakao.user-info-uri=https://kapi.kakao.com/v2/user/me
spring.security.oauth2.client.provider.kakao.user-name-attribute=id

# Swagger settings
springdoc.api-docs.enabled=true
springdoc.swagger-ui.enabled=true
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.swagger-ui.url=/v3/api-docs
springdoc.api-docs.path=/v3/api-docs
springdoc.packages-to-scan=com.ssafy.peachptich
springdoc.default-consumes-media-type=application/json
springdoc.default-produces-media-type=application/json
```

```
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.12.1-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists

```

혹시 에러가 날 경우, gradle/wrapper에 gradle-wrapper.properties 파일 추가

<br /><br />

## BackendAI_Django

### 1. 도커 파일

```
# syntax=docker/dockerfile:1
FROM python:3.11-slim

# Install system dependencies required for mysqlclient
RUN apt-get update && apt-get install -y \
    gcc \
    pkg-config \
    libmariadb-dev \
    make \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONUNBUFFERED=1
WORKDIR /app

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/

EXPOSE 8083

CMD ["python", "manage.py", "runserver", "0.0.0.0:8083"]
```

Dockerfile8083

```
# syntax=docker/dockerfile:1
FROM python:3.11-slim

# Install system dependencies required for mysqlclient
RUN apt-get update && apt-get install -y \
    gcc \
    pkg-config \
    libmariadb-dev \
    make \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONUNBUFFERED=1
WORKDIR /app

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/

EXPOSE 8084

CMD ["python", "manage.py", "runserver", "0.0.0.0:8084"]
```

Dockerfile 8084

<br />

### 2. Docker-compose 파일

```
version: '3.1'

services:
  django-app:
    image: [Dockerhub username]/[Dockerhub repo]:bluegreen8083
    container_name: bluegreen-8083
    build:
      context: .
      dockerfile: Dockerfile8083
    environment:
      - TZ=Asia/Seoul
      - LANG=ko_KR.UTF-8
      - LANGUAGE=ko_KR:ko
      - LC_ALL=ko_KR.UTF-8
      - DJANGO_DATASOURCE_URL=jdbc:mysql://[AWS address]:13306/peachpitch?useSSL=false&useUnicode=true&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul
      - DJANGO_DATASOURCE_USERNAME=[mysql username]
      - DJANGO_DATASOURCE_PASSWORD=[mysql password]
      - DJANGO_JPA_HIBERNATE_DDL-AUTO=update
      - DJANGO_PORT=8083
      - DJANGO_REDIS_HOST=[AWS address]
      - DJANGO_REDIS_PORT=6379
    networks:
      - peachpitch-network
    ports:
      - "8083:8083"

networks:
  peachpitch-network:
    external: true

```

docker-compose.bluegreen8083.yml

```
version: '3.1'

services:
  django-app:
    image: [Dockerhub username]/[Dockerhub repo]:bluegreen8084
    container_name: bluegreen-8084
    build:
      context: .
      dockerfile: Dockerfile8084
    environment:
      - TZ=Asia/Seoul
      - LANG=ko_KR.UTF-8
      - LANGUAGE=ko_KR:ko
      - LC_ALL=ko_KR.UTF-8
      - DJANGO_DATASOURCE_URL=jdbc:mysql://[AWS address]:13306/peachpitch?useSSL=false&useUnicode=true&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul
      - DJANGO_DATASOURCE_USERNAME=[mysql username]
      - DJANGO_DATASOURCE_PASSWORD=[mysql password]
      - DJANGO_JPA_HIBERNATE_DDL-AUTO=update
      - DJANGO_PORT=8084
      - DJANGO_REDIS_HOST=[AWS address]
      - DJANGO_REDIS_PORT=6379
    networks:
      - peachpitch-network
    ports:
      - "8084:8084"

networks:
  peachpitch-network:
    external: true

```

<br />

### 3. .env 파일

```
OPENAI_API_KEY=[OPENAI_API_KEY]
GOOGLE_API_KEY=[GOOGLE_API_KEY]
GOOGLE_CX=[GOOGLE_CX]
```

### 4. settings.py에 추가할 내용

```
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',   # MySQL 엔진 사용
        'NAME': '[데이터베이스 이름]',           # 데이터베이스 이름
        'USER': '[mysql 사용자 이름]',              # MySQL 사용자 이름
        'PASSWORD': '[mysql 비밀번호]',      # MySQL 비밀번호
        'HOST': '[aws 주소]',                    # 로컬에서 실행 중이므로 localhost
        'PORT': '13306',                         # MySQL 기본 포트 (3306)
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'"
        }
    }
}

# Redis 설정
REDIS_HOST = '[aws 주소]'
REDIS_PORT = 6379
REDIS_DB = 1  # 사용할 DB 번호

# Redis 연결 설정
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://[AWS 주소]:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}
```

```
ALLOWED_HOSTS = ['[도메인]', '127.0.0.1', 'localhost', '172.20.0.1']
```

<br /><br />

## Frontend_React

### 1. 도커 파일

```
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
```

Dockerfile

<br />

### 2. Docker-compose 파일

```
version: '3.8'

services:
  react-app:
    image: yuseon7129/peachpitch:frontend
    container_name: my-react
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    networks:
      - peachpitch-network

networks:
  peachpitch-network:
    external: true
```

docker-compose.yml

<br />

### 3. .env 파일

```
VITE_GOOGLE_TTS_API_KEY=[VITE_GOOGLE_TTS_API_KEY]
```

<br />

### 4. nginx.conf 파일

```
server {
    listen 3000;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # React 앱의 클라이언트 측 라우팅 지원
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 정적 파일 처리 최적화
    location /static/ {
        expires 1y;
        add_header Cache-Control "public";
        access_log off;
    }

    # 오류 페이지 설정
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

<br /><br />

# **EC2_Ubuntu, Docker, Nginx Setting**

```
/home/ubuntu/my-project
  ├── Backend/
  │   ├── Dockerfile8081
  │   ├── Dockerfile8082
  │   ├── docker-compose.bluegreen8081.yml  # (Blue 배포 환경)
  │   └── docker-compose.bluegreen8082.yml # (Green 배포 환경)
  ├── BackendAI/
  │   ├── Dockerfile8083
  │   ├── Dockerfile8084
  │   ├── docker-compose.bluegreen8083.yml  # (Blue 배포 환경)
  │   └── docker-compose.bluegreen8084.yml # (Green 배포 환경)
  ├── Frontend/
  │   ├── Dockerfile
  │   └── docker-compose.yml
  └── deploy.sh
```

```
/home/ubuntu/nginx_conf
  ├── defaultblue.conf
  ├── defaultgreen.conf
  └── default.conf
```

<br /><br />

## EC2_Ubuntu

```
ssh -i I12D201T.pem ubuntu@i12d201.p.ssafy.io
```

ssh 접속

(pem 키 보안 설정 바꾸기)

도메인은 **peachpitch.site** 입니다

letsencrypt로 인증서를 받습니다

```
sudo ufw status
sudo ufw allow [포트번호]
```

ufw 포트 설정

<br /><br />

## Docker

도커 설치

도커 네트워크 생성

### 기본 설정 컨테이너 세팅

```
sudo docker run -d --name my-nginx \
  --network [도커 네트워크] \
  -p 80:80 -p 443:443 \
  -v /home/ubuntu/nginx_conf/default.conf:/etc/nginx/conf.d/default.conf \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  -v /var/www/certbot:/var/www/certbot:ro \
  nginx
```

nginx

```
docker run -d -p 8080:8080 \
-v /home/ubuntu/jenkins-data:/var/jenkins_home \
--name jenkins jenkins/jenkins:lts
```

jenkins

```
docker run -d -p 13306:3306 \
  -e MYSQL_ROOT_PASSWORD='[mysql 비밀번호]' \
  -e LC_ALL=C.UTF-8 \
  --name='my-mysql' mysql
```

mysql

```
docker run -d --name redis-server \
--network [도커 네트워크] \
-p 16379:6379 redis
```

redis

https://docs.openvidu.io/en/stable/deployment/ce/on-premises/

```
sudo su
cd /opt
curl https://s3-eu-west-1.amazonaws.com/aws.openvidu.io/install_openvidu_latest.sh | bash
```

```
1. Go to openvidu folder:
$ cd openvidu

2. Configure DOMAIN_OR_PUBLIC_IP and OPENVIDU_SECRET in .env file:
$ nano .env

3. Start OpenVidu
$ ./openvidu start
```

openvidu

```
sudo docker run -d \
  --name grafana \
  --network=[도커 네트워크] \
  -p 4000:3000 \
  -e GF_SECURITY_ADMIN_USER=[username] \
  -e GF_SECURITY_ADMIN_PASSWORD=[password] \
  -v grafana-storage:/var/lib/grafana \
  grafana/grafana:latest
```

grafana

```
docker run -d -p 9090:9090 --name prometheus \
		--network=[도커 네트워크] \
    -v /home/ubuntu/nginx_conf/prometheus.yml:/etc/prometheus/prometheus.yml \
    prom/prometheus
```

prometheus

<br /><br />

### 코드를 이미지로 만들어서 컨테이너 세팅

도커 허브에 repository 등록

```
chmod +x ./Backend/gradlew
cd ./Backend
./gradlew clean build -x test
```

Backend(springboot) 빌드

```
cd ./Frontend
npm install --legacy-peer-deps
npm run build
```

Frontend(react) 빌드 및 실행

```
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
./venv/bin/python manage.py migrate
./venv/bin/python manage.py collectstatic --noinput
```

BackendAI(Django) 빌드

```
cd /home/ubuntu/my-project/Backend
docker build -f Dockerfile8081 -t [도커 username]/[도커 repo]:bluegreen8081 .
docker push [도커 username]/[도커 repo]:bluegreen8081

cd /home/ubuntu/my-project/Backend
docker build -f Dockerfile8082 -t [도커 username]/[도커 repo]:bluegreen8082 .
docker push [도커 username]/[도커 repo]:bluegreen8082

cd /home/ubuntu/my-project/BackendAI
docker build -f Dockerfile8083 -t [도커 username]/[도커 repo]:bluegreen8083 .
docker push [도커 username]/[도커 repo]:bluegreen8083

cd /home/ubuntu/my-project/BackendAI
docker build -f Dockerfile8084 -t [도커 username]/[도커 repo]:bluegreen8084 .
docker push [도커 username]/[도커 repo]:bluegreen8084

cd /home/ubuntu/my-project/Frontend
docker build -f Dockerfile -t [도커 username]/[도커 repo]:frontend .
docker push [도커 username]/[도커 repo]:frontend
```

도커 이미지 올리기

```
chmod +x deploy.sh
sudo sh deploy.sh
```

도커 이미지 받아서 실행

<br /><br />

## Nginx 설정

```
upstream blue_spring {
    server bluegreen-8081:8081; # Spring Boot blue
}

upstream blue_django {
    server bluegreen-8083:8083; # Django blue
}

server {
    server_name  peachpitch.site;

    location / {
        proxy_pass http://my-react:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        proxy_pass http://my-react:3000;
        proxy_cache_valid 200 60m;
        expires 1y;
        add_header Cache-Control "public";
    }

    # Spring Boot API
    location /api/ {
        proxy_pass http://blue_spring/api/;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # kakao login API
    location /login/oauth2/ {
        proxy_pass http://blue_spring/login/oauth2/;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django API
    location /ai/ {
        proxy_pass http://blue_django/ai/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }

    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/peachpitch.site/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/peachpitch.site/privkey.pem; # managed by Certbot
    #include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    #ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}

server {
    if ($host = peachpitch.site) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen       80;
    listen  [::]:80;
    server_name  peachpitch.site;
    return 404; # managed by Certbot

}
```

defaultblue.conf

```
upstream green_spring {
    server bluegreen-8082:8082; # Spring Boot green
}

upstream green_django {
    server bluegreen-8084:8084; # Django green
}

server {
    server_name  peachpitch.site;

    location / {
        proxy_pass http://my-react:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        proxy_pass http://my-react:3000;
        proxy_cache_valid 200 60m;
        expires 1y;
        add_header Cache-Control "public";
    }

    # Spring Boot API
    location /api/ {
        proxy_pass http://green_spring/api/;
        proxy_http_version 1.1;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # kakao login API
    location /login/oauth2/ {
        proxy_pass http://green_spring/login/oauth2/;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django API
    location /ai/ {
        proxy_pass http://green_django/ai/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }

    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/peachpitch.site/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/peachpitch.site/privkey.pem; # managed by Certbot
    #include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    #ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}

server {
    if ($host = peachpitch.site) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen       80;
    listen  [::]:80;
    server_name  peachpitch.site;
    return 404; # managed by Certbot

}
```

defaultgreen.conf

<br /><br />

## deploy.sh

```
#!/bin/bash

# 0. 이미지 갱신
echo "새로운 이미지를 가져옵니다..."
docker-compose -p bluegreen-8081 -f /home/ubuntu/my-project/Backend/docker-compose.bluegreen8081.yml pull
docker-compose -p bluegreen-8082 -f /home/ubuntu/my-project/Backend/docker-compose.bluegreen8082.yml pull
docker-compose -p bluegreen-8083 -f /home/ubuntu/my-project/BackendAI/docker-compose.bluegreen8083.yml pull
docker-compose -p bluegreen-8084 -f /home/ubuntu/my-project/BackendAI/docker-compose.bluegreen8084.yml pull
docker-compose -p my-react -f /home/ubuntu/my-project/Frontend/docker-compose.yml pull

# 실행 중인 컨테이너 확인 및 중복 제거
remove_existing_container() {
    local container_name=$1
    echo "기존 컨테이너 확인 중: $container_name"
    existing_container=$(docker ps -a --filter "name=$container_name" --format "{{.ID}}")
    if [ ! -z "$existing_container" ]; then
        echo "기존 컨테이너($container_name)가 존재합니다. 삭제 중..."
        docker stop $container_name >/dev/null 2>&1
        docker rm $container_name >/dev/null 2>&1
        echo "기존 컨테이너($container_name) 삭제 완료."
    fi
}

# Blue-Green 환경에 따라 컨테이너 이름 설정
BLUE_S_CONTAINER="bluegreen-8081"
GREEN_S_CONTAINER="bluegreen-8082"
BLUE_D_CONTAINER="bluegreen-8083"
GREEN_D_CONTAINER="bluegreen-8084"

# 1. Blue-Green 배포 환경 전환
EXIST_GITCHAN=$(docker-compose -p bluegreen-8081 -f /home/ubuntu/my-project/Backend/docker-compose.bluegreen8081.yml ps | grep Up)

if [ -z "$EXIST_GITCHAN" ]; then
    echo "8081(블루) 환경이 실행되지 않음. 8081 환경 실행..."
    remove_existing_container $BLUE_S_CONTAINER
    remove_existing_container $BLUE_D_CONTAINER
    docker-compose -p bluegreen-8081 -f /home/ubuntu/my-project/Backend/docker-compose.bluegreen8081.yml up -d --build
    docker-compose -p bluegreen-8083 -f /home/ubuntu/my-project/BackendAI/docker-compose.bluegreen8083.yml up -d --build
    BEFORE_S_COLOR="8082"
    AFTER_S_COLOR="8081"
    BEFORE_S_PORT=8082
    AFTER_S_PORT=8081
    BEFORE_D_COLOR="8084"
    AFTER_D_COLOR="8083"
    BEFORE_D_PORT=8084
    AFTER_D_PORT=8083
else
    echo "8082(그린) 환경이 실행되지 않음. 8082 환경 실행..."
    remove_existing_container $GREEN_S_CONTAINER
    remove_existing_container $GREEN_D_CONTAINER
    docker-compose -p bluegreen-8082 -f /home/ubuntu/my-project/Backend/docker-compose.bluegreen8082.yml up -d --build
    docker-compose -p bluegreen-8084 -f /home/ubuntu/my-project/BackendAI/docker-compose.bluegreen8084.yml up -d --build
    BEFORE_S_COLOR="8081"
    AFTER_S_COLOR="8082"
    BEFORE_S_PORT=8081
    AFTER_S_PORT=8082
    BEFORE_D_COLOR="8083"
    AFTER_D_COLOR="8084"
    BEFORE_D_PORT=8083
    AFTER_D_PORT=8084
fi

# React 서버 실행 (중복된 React 컨테이너 제거)
REACT_CONTAINER="my-react"
echo "React 서버 실행..."
remove_existing_container $REACT_CONTAINER
docker-compose -p my-react -f /home/ubuntu/my-project/Frontend/docker-compose.yml up -d --build

echo "${AFTER_S_COLOR} springboot 서버가 실행되었습니다 (포트: ${AFTER_S_PORT})"
echo "${AFTER_D_COLOR} django 서버가 실행되었습니다 (포트: ${AFTER_D_PORT})"

# 3. 새 버전 서버 응답 확인
SERVER_OK=false
for cnt in `seq 1 10`; do
    echo "서버 응답 확인 : (${cnt}/10)"
    UP_SPRING=$(curl -s http://127.0.0.1:${AFTER_S_PORT}/api/server-check)
    UP_DJANGO=$(curl -s http://127.0.0.1:${AFTER_D_PORT}/api/server-check)
    if [ "$UP_SPRING" = "OK" ] && [ "$UP_DJANGO" = "OK" ]; then
        SERVER_OK=true
        break
    fi
    sleep 10
done

if [ "$SERVER_OK" = true ]; then
    echo "${AFTER_S_COLOR} springboot server up(port:${AFTER_S_PORT})"
    echo "${AFTER_D_COLOR} django server up(port:${AFTER_D_PORT})"
    
    # 4. nginx 설정 변경후 무중단 reload
    cp ${NGINX_CONF_DIR}/default${AFTER_S_COLOR}.conf $NGINX_CONF_PATH
    docker exec my-nginx nginx -s reload

    # 새로운 컨테이너가 제대로 떴는지 확인
    EXIST_AFTER_S=$(docker-compose -p bluegreen-${AFTER_S_COLOR} -f /home/ubuntu/my-project/Backend/docker-compose.bluegreen${AFTER_S_COLOR}.yml ps | grep Up)
    EXIST_AFTER_D=$(docker-compose -p bluegreen-${AFTER_D_COLOR} -f /home/ubuntu/my-project/BackendAI/docker-compose.bluegreen${AFTER_D_COLOR}.yml ps | grep Up)
    
    if [ -n "$EXIST_AFTER_S" ] && [ -n "$EXIST_AFTER_D" ]; then
        # 5. 이전 컨테이너 종료
        echo "${BEFORE_S_COLOR} springboot server down(port:${BEFORE_S_PORT})"
        echo "${BEFORE_D_COLOR} django server down(port:${BEFORE_D_PORT})"
        docker-compose -p bluegreen-${BEFORE_S_COLOR} -f /home/ubuntu/my-project/Backend/docker-compose.bluegreen${BEFORE_S_COLOR}.yml down
        docker-compose -p bluegreen-${BEFORE_D_COLOR} -f /home/ubuntu/my-project/BackendAI/docker-compose.bluegreen${BEFORE_D_COLOR}.yml down
        
        # 6. 사용되지 않는 이미지 삭제
        docker image prune -f
    else
        echo "새 컨테이너 실행 실패. 이전 상태로 롤백합니다."
        docker-compose -p bluegreen-${AFTER_S_COLOR} -f /home/ubuntu/my-project/Backend/docker-compose.bluegreen${AFTER_S_COLOR}.yml down
        docker-compose -p bluegreen-${AFTER_D_COLOR} -f /home/ubuntu/my-project/BackendAI/docker-compose.bluegreen${AFTER_D_COLOR}.yml down
    fi
else
    echo "서버에 문제가 있어요. 배포를 중단하고 이전 상태를 유지합니다."
    docker-compose -p bluegreen-${AFTER_S_COLOR} -f /home/ubuntu/my-project/Backend/docker-compose.bluegreen${AFTER_S_COLOR}.yml down
    docker-compose -p bluegreen-${AFTER_D_COLOR} -f /home/ubuntu/my-project/BackendAI/docker-compose.bluegreen${AFTER_D_COLOR}.yml down
fi

```