#deploy.sh

# 0. 이미지 갱신
echo "새로운 이미지를 가져옵니다..."
sudo docker compose -p bluegreen-8081 -f /home/ubuntu/S12P11D201/BackendTest/docker-compose.bluegreen8081.yml pull
sudo docker compose -p bluegreen-8082 -f /home/ubuntu/S12P11D201/BackendTest/docker-compose.bluegreen8082.yml pull
#sudo docker compose -p bluegreen-django -f /home/ubuntu/S12P11D201/AITest/docker-compose.django.yml pull
#sudo docker compose -p bluegreen-react -f /home/ubuntu/S12P11D201/test/docker-compose.react.yml pull

# 1. 실행 중인 컨테이너 확인
EXIST_GITCHAN=$(sudo docker compose -p blue-8081 -f /home/ubuntu/S12P11D201/BackendTest/docker-compose.bluegreen8081.yml ps | grep Up)

# 8081(블루 환경) 또는 8082(그린 환경)가 실행 중인지 확인
if [ -z "$EXIST_GITCHAN" ]; then
        echo "8081(블루) 환경이 실행되지 않음. 8081 환경 실행..."
        sudo docker compose -p bluegreen-8081 -f /home/ubuntu/S12P11D201/BackendTest/docker-compose.bluegreen8081.yml up -d --force-recreate
        BEFORE_COLOR="8082"
        AFTER_COLOR="8081"
        BEFORE_PORT=8082
        AFTER_PORT=8081
else
        echo "8082(그린) 환경이 실행되지 않음. 8082 환경 실행..."
        sudo docker compose -p bluegreen-8082 -f /home/ubuntu/S12P11D201/BackendTest/docker-compose.bluegreen8082.yml up -d --force-recreate
        BEFORE_COLOR="8081"
        AFTER_COLOR="8082"
        BEFORE_PORT=8081
        AFTER_PORT=8082
fi

# Django와 React도 실행
#echo "Django 및 React 서버 실행..."
#sudo docker compose -p bluegreen-django -f /home/ubuntu/S12P11D201/AITest/docker-compose.django.yml up -d --force-recreate
#sudo docker compose -p bluegreen-react -f /home/ubuntu/S12P11D201/test/docker-compose.react.yml up -d --force-recreate


echo "${AFTER_COLOR} 서버가 실행되었습니다 (포트: ${AFTER_PORT})"

# 2. 새 버전 서버 응답 확인
for cnt in `seq 1 10`;
do
    echo "서버 응답을 확인 중... (${cnt}/10)"
    UP=$(curl -s http://127.0.0.1:${AFTER_PORT}/api/health-check)
    if [ "${UP}" != "OK" ]; then
        sleep 10
        echo "peachpitch api health check"
        UP2=$(curl -s https://peachpitch.site/api/health-check)
        if [ "${UP2}" == "OK" ]; then
            break
        fi
        continue
    else
        break
    fi
done

# 10번 시도 후에도 응답이 없으면 실패
if [ $cnt -eq 10 ]; then
    echo "서버에 문제가 있습니다..."
    exit 1
fi

# 3. Nginx 설정 파일 수정 (포트 변경)
echo "Nginx 설정 파일 업데이트..."
sudo sed -i "s/${BEFORE_PORT}/${AFTER_PORT}/" /etc/nginx/conf.d/default.inc
sudo nginx -s reload
echo "배포 완료!"

# 4. 이전 환경(블루 서버) 중지
echo "${BEFORE_COLOR} 서버 중지 (포트: ${BEFORE_PORT})"
sudo docker compose -p bluegreen-${BEFORE_COLOR} -f /home/ubuntu/S12P11D201/BackendTest/docker-compose.bluegreen${BEFORE_COLOR}.yml down

# 5. 사용되지 않는 Docker 이미지 정리
echo "사용되지 않는 Docker 이미지 삭제 중..."
sudo docker image prune -f