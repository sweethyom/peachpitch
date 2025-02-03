#deploy.sh

#0
# 이미지 갱신
sudo docker compose -p bluegreen-8081 -f ./docker-compose.bluegreen8081.yml pull
sudo docker compose -p bluegreen-8082 -f ./docker-compose.bluegreen8082.yml pull

#1
EXIST_GITCHAN=$(sudo docker compose -p blue-8081 -f docker-compose.bluegreen8081.yml ps | grep Up)

if [ -z "$EXIST_GITCHAN" ]; then
        echo "8081 컨테이너 실행"
        sudo docker compose -p bluegreen-8081 -f ./docker-compose.bluegreen8081.yml up -d --force-recreate
        BEFORE_COLOR="8082"
        AFTER_COLOR="8081"
        BEFORE_PORT=8082
        AFTER_PORT=8081
else
        echo "8082 컨테이너 실행"
        sudo docker compose -p bluegreen-8082 -f ./docker-compose.bluegreen8082.yml up -d --force-recreate
        BEFORE_COLOR="8081"
        AFTER_COLOR="8082"
        BEFORE_PORT=8081
        AFTER_PORT=8082
fi

echo "${AFTER_COLOR} server up(port:${AFTER_PORT})"


# 2
for cnt in `seq 1 10`;
do
    echo "서버 응답 확인하는중~(${cnt}/10)";
    UP=$(curl -s http://127.0.0.1:${AFTER_PORT}/api/health-check)
    if [ "${UP}" != "OK" ]; then
        sleep 10
        continue
    else
        break
    fi
done

if [ $cnt -eq 10 ]; then
    echo "서버에 문제가 있어요..."
    exit 1
fi

# 3
sudo sed -i "s/${BEFORE_PORT}/${AFTER_PORT}/" /etc/nginx/conf.d/service-url.inc
sudo nginx -s reload
echo "Deploy Completed!!"

# 4
echo "$BEFORE_COLOR server down(port:${BEFORE_PORT})"
sudo docker compose -p bluegreen-${BEFORE_COLOR} -f docker-compose.bluegreen${BEFORE_COLOR}.yml down

# 5
sudo docker image prune -f
