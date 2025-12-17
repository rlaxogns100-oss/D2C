#!/bin/bash

# ==============================================================================
# 🚀 백엔드 실행 스크립트 (Caddy 환경용)
# 사용법: ./run_backend.sh
# ==============================================================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== 백엔드 실행 준비 ===${NC}"

# 1. Java 확인
if ! command -v java &> /dev/null; then
    echo -e "${GREEN}Java 17 설치 중...${NC}"
    sudo apt update
    sudo apt install -y openjdk-17-jdk
fi

# 2. 백엔드 빌드
echo -e "${GREEN}백엔드 빌드 중...${NC}"
cd 05_Backend
chmod +x gradlew
./gradlew clean build -x test
cd ..

# 3. 백엔드 실행 (백그라운드)
JAR_PATH=$(find $(pwd)/05_Backend/build/libs -name "*-SNAPSHOT.jar" | head -n 1)

if [ -z "$JAR_PATH" ]; then
    echo "❌ 빌드된 JAR 파일을 찾을 수 없습니다."
    exit 1
fi

echo -e "${GREEN}기존 프로세스 정리 중...${NC}"
pkill -f "maejang" || true

echo -e "${GREEN}백엔드 서버 시작 (nohup)...${NC}"
nohup java -jar $JAR_PATH > backend.log 2>&1 &

echo -e "${BLUE}=== 실행 완료! ===${NC}"
echo -e "로그 확인: tail -f backend.log"

