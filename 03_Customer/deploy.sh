#!/bin/bash

# D2C Builder - 랜딩 페이지 배포 스크립트
# AWS EC2: 3.24.199.215

echo "🚀 D2C Builder 랜딩 페이지 배포 시작..."
echo ""

# 설정
SERVER_IP="3.24.199.215"
SERVER_USER="ubuntu"
SSH_KEY="$1"  # 첫 번째 인자로 SSH 키 경로 받기

# SSH 키 확인
if [ -z "$SSH_KEY" ]; then
    echo "❌ SSH 키 파일 경로를 입력해주세요"
    echo ""
    echo "사용법: ./deploy.sh /path/to/your-key.pem"
    echo ""
    exit 1
fi

if [ ! -f "$SSH_KEY" ]; then
    echo "❌ SSH 키 파일을 찾을 수 없습니다: $SSH_KEY"
    exit 1
fi

echo "✅ SSH 키 확인: $SSH_KEY"
echo ""

# 1단계: 임시 디렉토리 생성
echo "📁 1/5: 임시 디렉토리 생성..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "mkdir -p /tmp/d2c_landing"

if [ $? -ne 0 ]; then
    echo "❌ SSH 접속 실패. 키 파일과 서버 상태를 확인해주세요."
    exit 1
fi

echo "✅ 완료"
echo ""

# 2단계: 파일 업로드
echo "📤 2/5: 랜딩 페이지 파일 업로드..."
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no \
    landing.html \
    style.css \
    $SERVER_USER@$SERVER_IP:/tmp/d2c_landing/

echo "✅ 완료"
echo ""

# 3단계: assets 폴더 업로드
echo "📤 3/5: assets 폴더 업로드..."
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -r \
    assets \
    $SERVER_USER@$SERVER_IP:/tmp/d2c_landing/

echo "✅ 완료"
echo ""

# 4단계: Nginx 설치 및 설정
echo "⚙️  4/5: 웹 서버 설정..."
ssh -i "$SSH_KEY" $SERVER_USER@$SERVER_IP << 'ENDSSH'
    # Nginx 설치 확인
    if ! command -v nginx &> /dev/null; then
        echo "Nginx 설치 중..."
        sudo apt update
        sudo apt install -y nginx
        sudo systemctl enable nginx
    fi
    
    # 웹 루트로 파일 복사
    sudo mkdir -p /var/www/html
    sudo cp /tmp/d2c_landing/landing.html /var/www/html/index.html
    sudo cp /tmp/d2c_landing/style.css /var/www/html/
    sudo cp -r /tmp/d2c_landing/assets /var/www/html/ 2>/dev/null || true
    
    # 권한 설정
    sudo chown -R www-data:www-data /var/www/html
    sudo chmod -R 755 /var/www/html
    
    # Nginx 재시작
    sudo systemctl restart nginx
    
    echo "웹 서버 설정 완료"
ENDSSH

echo "✅ 완료"
echo ""

# 5단계: 임시 파일 삭제
echo "🧹 5/5: 임시 파일 정리..."
ssh -i "$SSH_KEY" $SERVER_USER@$SERVER_IP "rm -rf /tmp/d2c_landing"

echo "✅ 완료"
echo ""

# 완료 메시지
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 배포 완료!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 접속 주소:"
echo "   http://$SERVER_IP"
echo ""
echo "🌐 또는:"
echo "   http://ec2-3-24-199-215.ap-southeast-2.compute.amazonaws.com"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
