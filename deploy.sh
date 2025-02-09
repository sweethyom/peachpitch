#!/bin/bash

# 0. 이미지 갱신
echo "새로운 이미지를 가져옵니다..."
docker-compose -p bluegreen-8081 -f /home/ubuntu/S12P11D201/BackendTest/docker-compose.bluegreen8081.yml pull
docker-compose -p bluegreen-8082 -f /home/ubuntu/S12P11D201/BackendTest/docker-compose.bluegreen8082.yml pull
docker-compose -p bluegreen-8083 -f /home/ubuntu/S12P11D201/AITest/docker-compose.bluegreen8083.yml pull
docker-compose -p bluegreen-8084 -f /home/ubuntu/S12P11D201/AITest/docker-compose.bluegreen8084.yml pull
docker-compose -p my-react -f /home/ubuntu/S12P11D201/test/docker-compose.yml pull

# 1. 실행 중인 컨테이너 확인 및 중복 제거
function remove_existing_container() {
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

# Blue-Green 배포 환경 전환
EXIST_GITCHAN=$(docker-compose -p bluegreen-8081 -f /home/ubuntu/S12P11D201/BackendTest/docker-compose.bluegreen8081.yml ps | grep Up)

if [ -z "$EXIST_GITCHAN" ]; then
    echo "8081(블루) 환경이 실행되지 않음. 8081 환경 실행..."
    remove_existing_container $BLUE_S_CONTAINER
    remove_existing_container $BLUE_D_CONTAINER
    docker-compose -p bluegreen-8081 -f /home/ubuntu/S12P11D201/BackendTest/docker-compose.bluegreen8081.yml up -d --build
    docker-compose -p bluegreen-8083 -f /home/ubuntu/S12P11D201/AITest/docker-compose.bluegreen8083.yml up -d --build
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
    docker-compose -p bluegreen-8082 -f /home/ubuntu/S12P11D201/BackendTest/docker-compose.bluegreen8082.yml up -d --build
    docker-compose -p bluegreen-8084 -f /home/ubuntu/S12P11D201/AITest/docker-compose.bluegreen8084.yml up -d --build
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
docker-compose -p my-react -f /home/ubuntu/S12P11D201/test/docker-compose.yml up -d --force-recreate --remove-orphans

echo "${AFTER_S_COLOR} springboot 서버가 실행되었습니다 (포트: ${AFTER_S_PORT})"
echo "${AFTER_D_COLOR} django 서버가 실행되었습니다 (포트: ${AFTER_D_PORT})"

# 2. 새 버전 서버 응답 확인
# for cnt in `seq 1 10`;
# do
#     echo "서버 응답을 확인 중... (${cnt}/10)"
#     UP=$(curl -s http://127.0.0.1:${AFTER_PORT}/api/health-check)
#     if [ "${UP}" != "OK" ]; then
#         sleep 10
#         echo "peachpitch api health check"
#         UP2=$(curl -s https://peachpitch.site/api/health-check)
#         if [ "${UP2}" == "OK" ]; then
#             break
#         fi
#         continue
#     else
#         break
#     fi
# done

# # 10번 시도 후에도 응답이 없으면 실패 처리
# if [ $cnt -eq 10 ]; then
#     echo "서버에 문제가 있습니다..."
#     exit 1
# fi

# 3. Nginx 설정 파일 수정 (포트 변경)
echo "Nginx 설정 파일 업데이트..."
# sudo sed -i "s/${BEFORE_PORT}/${AFTER_PORT}/" /etc/nginx/conf.d/default.conf
# sudo nginx -s reload
# echo "배포 완료!"

# Nginx 설정 파일 경로
# NGINX_CONF_PATH="/home/ubuntu/nginx_conf/default.conf"
NGINX_CONF_DIR="/home/ubuntu/nginx_conf"
NGINX_CONF_PATH="${NGINX_CONF_DIR}/default.conf"

if [ "$AFTER_S_COLOR" == "8081" ]; then
    echo "Blue 환경으로 Nginx 설정 파일 교체..."
    cp ${NGINX_CONF_DIR}/defaultblue.conf $NGINX_CONF_PATH
else
    echo "Green 환경으로 Nginx 설정 파일 교체..."
    cp ${NGINX_CONF_DIR}/defaultgreen.conf $NGINX_CONF_PATH
fi

# 기존 포트를 새로운 포트로 교체
#sudo sed -i "s/server 172.20.0.1:${BEFORE_S_PORT};/server 172.20.0.1:${AFTER_S_PORT};/" $NGINX_CONF_PATH

# Nginx 컨테이너에 업데이트된 설정 파일 복사
docker cp $NGINX_CONF_PATH my-nginx:/etc/nginx/conf.d/default.conf
docker restart my-nginx

# 4. 이전 환경(블루 서버) 중지 및 정리 (중복 방지)
echo "${BEFORE_S_COLOR} springboot 서버 중지 (포트: ${BEFORE_S_PORT})"
echo "${BEFORE_D_COLOR} django 서버 중지 (포트: ${BEFORE_D_PORT})"
docker-compose -p bluegreen-${BEFORE_S_COLOR} -f /home/ubuntu/S12P11D201/BackendTest/docker-compose.bluegreen${BEFORE_S_COLOR}.yml down
docker-compose -p bluegreen-${BEFORE_D_COLOR} -f /home/ubuntu/S12P11D201/AITest/docker-compose.bluegreen${BEFORE_D_COLOR}.yml down

# 5. 사용되지 않는 Docker 이미지 정리
echo "사용되지 않는 Docker 이미지 삭제 중..."
docker image prune -f

