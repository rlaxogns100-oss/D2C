#!/bin/bash

# ==============================================================================
# 🚀 백엔드 실행 스크립트 (Caddy 환경용)
# 사용법: ./run_backend.sh
# ==============================================================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== 1. 환경변수 설정 ===${NC}"

# [DATABASE]
# ⚠️ 서버에서 실행 시 실제 값으로 채워주세요
export DB_PASSWORD='YOUR_DB_PASSWORD'
export DB_PORT=3306
export DB_USERNAME='admin'
export DB_URL='maejang-db.cbsoemmw41zf.ap-southeast-2.rds.amazonaws.com'
# ⚠️ 주의: DB 이름 확인 필요 (기본값: maejang)
export DB_NAME='maejang-db' 

# [AWS]
# ⚠️ 서버에서 실행 시 실제 값으로 채워주세요
export AWS_ACCESS_KEY='YOUR_AWS_ACCESS_KEY'
export AWS_SECRET_KEY='YOUR_AWS_SECRET_KEY'
export AWS_REGION='ap-southeast-2'
# ⚠️ 주의: S3 버킷 이름 확인 필요
export AWS_S3_BUCKET='maejang-bucket'

echo "환경변수가 로드되었습니다."

echo -e "${BLUE}=== 2. Java 확인 ===${NC}"
if ! command -v java &> /dev/null; then
    echo -e "${GREEN}Java 17 설치 중...${NC}"
    sudo apt update
    sudo apt install -y openjdk-17-jdk
fi

echo -e "${BLUE}=== 3. 백엔드 빌드 ===${NC}"
cd 05_Backend
chmod +x gradlew
./gradlew clean build -x test
BUILD_RESULT=$?
cd ..

if [ $BUILD_RESULT -ne 0 ]; then
    echo -e "${RED}❌ 빌드 실패! 로그를 확인해주세요.${NC}"
    exit 1
fi

echo -e "${BLUE}=== 4. 기존 프로세스 종료 ===${NC}"
pkill -f "maejang" || true
sleep 2

echo -e "${BLUE}=== 5. 백엔드 서버 시작 ===${NC}"
# 최신 JAR 파일 찾기
JAR_PATH=$(find $(pwd)/05_Backend/build/libs -name "*-SNAPSHOT.jar" | head -n 1)

if [ -z "$JAR_PATH" ]; then
    echo -e "${RED}❌ 빌드된 JAR 파일을 찾을 수 없습니다.${NC}"
    exit 1
fi

echo "JAR 파일: $JAR_PATH"
nohup java -jar $JAR_PATH > backend.log 2>&1 &

echo -e "${GREEN}✅ 백엔드 서버가 백그라운드에서 시작되었습니다.${NC}"
echo -e "로그 확인: tail -f backend.log"
