#!/bin/bash

# ==============================================================================
# 🚀 백엔드 실행 스크립트 (서버 전용)
# 주의: 빌드는 로컬에서! 이 스크립트는 JAR 실행만 담당합니다.
# 
# [로컬에서 실행]
# cd 05_Backend && ./gradlew clean build -x test
# scp build/libs/maejang-0.0.1-SNAPSHOT.jar ubuntu@서버IP:~/maejang-0.0.1-SNAPSHOT.jar
# 
# [서버에서 실행]
# cd ~/D2C && ./run_backend.sh
# ==============================================================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== 1. 환경변수 확인 ===${NC}"

# .env 파일 확인
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env 파일이 없습니다!${NC}"
    echo -e "${RED}   env.template 파일을 복사하여 .env 파일을 만들고 실제 값을 입력하세요.${NC}"
    echo ""
    echo "   cp env.template .env"
    echo "   nano .env"
    echo ""
    exit 1
fi

echo "✅ .env 파일 확인됨"

echo -e "${BLUE}=== 2. Java 확인 ===${NC}"
if ! command -v java &> /dev/null; then
    echo -e "${GREEN}Java 17 설치 중...${NC}"
    sudo apt update
    sudo apt install -y openjdk-17-jdk
fi

echo -e "${BLUE}=== 3. JAR 파일 확인 ===${NC}"

# JAR 파일 위치 (홈 디렉토리)
JAR_PATH="$HOME/maejang-0.0.1-SNAPSHOT.jar"

if [ ! -f "$JAR_PATH" ]; then
    echo -e "${RED}❌ JAR 파일을 찾을 수 없습니다: $JAR_PATH${NC}"
    echo -e "${RED}   로컬에서 빌드하고 scp로 전송해주세요:${NC}"
    echo ""
    echo "   cd 05_Backend && ./gradlew clean build -x test"
    echo "   scp build/libs/maejang-0.0.1-SNAPSHOT.jar ubuntu@서버IP:~/maejang-0.0.1-SNAPSHOT.jar"
    echo ""
    exit 1
fi

echo "✅ JAR 파일 확인: $JAR_PATH"

echo -e "${BLUE}=== 4. 기존 프로세스 종료 ===${NC}"
pkill -f "maejang" || true
sleep 2

echo -e "${BLUE}=== 5. 백엔드 서버 시작 ===${NC}"
nohup java -jar $JAR_PATH > $HOME/app.log 2>&1 &

echo ""
echo -e "${GREEN}✅ 백엔드 서버가 백그라운드에서 시작되었습니다!${NC}"
echo ""
echo -e "📋 로그 확인: tail -f ~/app.log"
echo -e "🔍 프로세스 확인: ps aux | grep maejang"
echo -e "🛑 서버 종료: pkill -f maejang"
echo ""
