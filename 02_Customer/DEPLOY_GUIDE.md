# 🚀 AWS EC2 배포 가이드

## 서버 정보
- **퍼블릭 IP**: 3.24.199.215
- **도메인**: ec2-3-24-199-215.ap-southeast-2.compute.amazonaws.com
- **리전**: ap-southeast-2 (시드니)
- **인스턴스 타입**: t3.micro

---

## 1️⃣ SSH 접속

터미널에서 실행:

```bash
# SSH 키 권한 설정 (처음 한 번만)
chmod 400 your-key.pem

# EC2 접속
ssh -i your-key.pem ubuntu@3.24.199.215
```

---

## 2️⃣ 서버 초기 설정 (처음 한 번만)

```bash
# 패키지 업데이트
sudo apt update && sudo apt upgrade -y

# Nginx 설치
sudo apt install nginx -y

# Nginx 시작 및 부팅 시 자동 실행
sudo systemctl start nginx
sudo systemctl enable nginx

# 방화벽 설정
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

## 3️⃣ 파일 업로드 (로컬 컴퓨터에서 실행)

```bash
# 프로젝트 폴더로 이동
cd /Users/rlaxogns100/Desktop/Projects/D2C_builder

# 전체 파일 업로드
scp -i your-key.pem -r * ubuntu@3.24.199.215:/tmp/d2c_builder/
```

---

## 4️⃣ 파일 배포 (EC2 서버에서 실행)

```bash
# 웹 루트 디렉토리로 파일 이동
sudo mkdir -p /var/www/d2c-platform
sudo cp -r /tmp/d2c_builder/* /var/www/d2c-platform/

# 권한 설정
sudo chown -R www-data:www-data /var/www/d2c-platform
sudo chmod -R 755 /var/www/d2c-platform
```

---

## 5️⃣ Nginx 설정

```bash
# 메인 도메인용 설정 파일 생성
sudo nano /etc/nginx/sites-available/d2c-main
```

아래 내용 입력:

```nginx
server {
    listen 80;
    listen [::]:80;
    
    server_name 3.24.199.215 ec2-3-24-199-215.ap-southeast-2.compute.amazonaws.com;
    
    root /var/www/d2c-platform;
    index landing.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # 정적 파일 캐싱
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

저장: `Ctrl + X` → `Y` → `Enter`

```bash
# 설정 활성화
sudo ln -s /etc/nginx/sites-available/d2c-main /etc/nginx/sites-enabled/

# 기본 설정 제거 (선택사항)
sudo rm /etc/nginx/sites-enabled/default

# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

---

## 6️⃣ 접속 테스트

브라우저에서 접속:

```
http://3.24.199.215
```

또는

```
http://ec2-3-24-199-215.ap-southeast-2.compute.amazonaws.com
```

---

## 🎯 빠른 배포 스크립트

한 번에 실행:

### 로컬에서 실행:
```bash
cd /Users/rlaxogns100/Desktop/Projects/D2C_builder
scp -i your-key.pem landing.html style.css ubuntu@3.24.199.215:/tmp/
scp -i your-key.pem -r assets ubuntu@3.24.199.215:/tmp/
```

### 서버에서 실행:
```bash
sudo cp /tmp/landing.html /var/www/html/index.html
sudo cp /tmp/style.css /var/www/html/
sudo cp -r /tmp/assets /var/www/html/
sudo systemctl restart nginx
```

---

## 🔧 문제 해결

### 1. 접속이 안 될 때
```bash
# Nginx 상태 확인
sudo systemctl status nginx

# 로그 확인
sudo tail -f /var/log/nginx/error.log
```

### 2. AWS 보안 그룹 확인
EC2 콘솔 → 보안 그룹 → 인바운드 규칙 확인:
- HTTP (80번 포트) 열려있는지 확인
- HTTPS (443번 포트) 추가 권장

### 3. 파일 권한 문제
```bash
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

---

## 📱 멀티 테넌트 구조 (다음 단계)

가게별 서브도메인 설정 예시:

```nginx
# burger-king.yourdomain.com
server {
    listen 80;
    server_name burger-king.yourdomain.com;
    root /var/www/stores/burger-king;
    index 01_Loading.html;
}

# mcdonalds.yourdomain.com
server {
    listen 80;
    server_name mcdonalds.yourdomain.com;
    root /var/www/stores/mcdonalds;
    index 01_Loading.html;
}
```

---

## ✅ 체크리스트

- [ ] SSH 접속 성공
- [ ] Nginx 설치 완료
- [ ] 파일 업로드 완료
- [ ] Nginx 설정 완료
- [ ] 브라우저 접속 테스트 성공
- [ ] 모바일 접속 테스트 성공

---

**배포 완료 후 접속 주소:**
- **임시 주소**: http://3.24.199.215
- **도메인 연결 후**: http://yourdomain.com
