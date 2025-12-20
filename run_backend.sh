#!/bin/bash

# ==============================================================================
# 🚀 백엔드 실행 스크립트 (Caddy 환경용)
# 사용법: ./run_backend.sh
# ==============================================================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== 1. 환경변수 확인 ===${NC}"

# .env 파일 확인
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env 파일이 없습니다!${NC}"
    echo -e "${RED}   .env.example 파일을 복사하여 .env 파일을 만들고 실제 값을 입력하세요.${NC}"
    echo ""
    echo "   cp .env.example .env"
    echo "   nano .env"
    echo ""
    exit 1
fi

echo "✅ .env 파일 확인됨"
echo "   (환경변수는 Spring Boot가 자동으로 .env 파일에서 로드합니다)"

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
