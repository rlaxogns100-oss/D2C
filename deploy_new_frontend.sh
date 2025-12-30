#!/bin/bash

# ============================================================================
# 🚀 새 프론트엔드 배포 스크립트
# ============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "=================================================="
echo "🚀 새 프론트엔드 배포 스크립트"
echo "=================================================="
echo ""

# 현재 디렉토리 확인
if [ ! -f "Caddyfile.new" ]; then
    echo -e "${RED}❌ 오류: Caddyfile.new 파일을 찾을 수 없습니다.${NC}"
    echo "D2C 프로젝트 루트 디렉토리에서 실행하세요."
    exit 1
fi

# 확인 프롬프트
echo -e "${YELLOW}⚠️  주의: 이 스크립트는 프론트엔드를 새 버전으로 교체합니다.${NC}"
echo ""
read -p "계속하시겠습니까? (y/N): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "배포가 취소되었습니다."
    exit 0
fi

echo ""
echo "1️⃣ 기존 Caddyfile 백업 중..."
BACKUP_NAME="/etc/caddy/Caddyfile.backup.$(date +%Y%m%d_%H%M%S)"
sudo cp /etc/caddy/Caddyfile "$BACKUP_NAME"
echo -e "${GREEN}   ✅ 백업 완료: $BACKUP_NAME${NC}"

echo ""
echo "2️⃣ 새 Caddyfile 문법 검사 중..."
if caddy validate --config Caddyfile.new > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ 문법 검사 통과${NC}"
else
    echo -e "${RED}   ❌ 문법 오류가 있습니다!${NC}"
    caddy validate --config Caddyfile.new
    exit 1
fi

echo ""
echo "3️⃣ 새 Caddyfile 적용 중..."
sudo cp Caddyfile.new /etc/caddy/Caddyfile
echo -e "${GREEN}   ✅ 복사 완료${NC}"

echo ""
echo "4️⃣ Caddy 재시작 중..."
sudo systemctl reload caddy
echo -e "${GREEN}   ✅ Caddy 재시작 완료${NC}"

echo ""
echo "5️⃣ 상태 확인 중..."
sleep 2

# 헬스 체크
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://pizzaschool.maejang.com)

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}   ✅ 사이트 응답 정상 (HTTP $HTTP_STATUS)${NC}"
else
    echo -e "${RED}   ❌ 사이트 응답 이상 (HTTP $HTTP_STATUS)${NC}"
    echo ""
    echo -e "${YELLOW}롤백하시겠습니까? (y/N): ${NC}"
    read -p "" rollback
    
    if [ "$rollback" = "y" ] || [ "$rollback" = "Y" ]; then
        sudo cp "$BACKUP_NAME" /etc/caddy/Caddyfile
        sudo systemctl reload caddy
        echo -e "${GREEN}✅ 롤백 완료${NC}"
    fi
    exit 1
fi

echo ""
echo "=================================================="
echo -e "${GREEN}✅ 배포 완료!${NC}"
echo "=================================================="
echo ""
echo "📌 확인 사항:"
echo "   - https://pizzaschool.maejang.com (고객용)"
echo "   - https://pizzaschool.maejang.com/admin/ (점주용)"
echo ""
echo "🔙 롤백 방법:"
echo "   ./rollback_frontend.sh"
echo "   또는"
echo "   sudo cp $BACKUP_NAME /etc/caddy/Caddyfile"
echo "   sudo systemctl reload caddy"
echo ""

# 로그 기록
echo "$(date): 새 프론트엔드 배포 완료" >> deploy_log.txt

