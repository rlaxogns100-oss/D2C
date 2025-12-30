#!/bin/bash

# ============================================================================
# 🔙 프론트엔드 롤백 스크립트
# ============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "=================================================="
echo "🔙 프론트엔드 롤백 스크립트"
echo "=================================================="
echo ""

# 백업 파일 목록 표시
echo "📁 사용 가능한 백업 파일:"
ls -la /etc/caddy/Caddyfile.backup.* 2>/dev/null || echo "   백업 파일 없음"
echo ""

echo "🔄 기본 Caddyfile로 롤백합니다..."
echo ""

# 확인 프롬프트
read -p "계속하시겠습니까? (y/N): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "롤백이 취소되었습니다."
    exit 0
fi

# 가장 최근 백업 찾기
LATEST_BACKUP=$(ls -t /etc/caddy/Caddyfile.backup.* 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo -e "${YELLOW}백업 파일이 없습니다. 기본 Caddyfile을 사용합니다.${NC}"
    
    if [ -f "Caddyfile" ]; then
        sudo cp Caddyfile /etc/caddy/Caddyfile
    else
        echo -e "${RED}❌ Caddyfile을 찾을 수 없습니다.${NC}"
        exit 1
    fi
else
    echo "📋 사용할 백업: $LATEST_BACKUP"
    sudo cp "$LATEST_BACKUP" /etc/caddy/Caddyfile
fi

echo ""
echo "🔄 Caddy 재시작 중..."
sudo systemctl reload caddy
echo -e "${GREEN}✅ Caddy 재시작 완료${NC}"

echo ""
echo "🔍 상태 확인 중..."
sleep 2

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://pizzaschool.maejang.com)

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ 사이트 응답 정상 (HTTP $HTTP_STATUS)${NC}"
else
    echo -e "${RED}⚠️ 사이트 응답: HTTP $HTTP_STATUS${NC}"
fi

echo ""
echo "=================================================="
echo -e "${GREEN}✅ 롤백 완료!${NC}"
echo "=================================================="
echo ""

# 로그 기록
echo "$(date): 프론트엔드 롤백 완료" >> deploy_log.txt

