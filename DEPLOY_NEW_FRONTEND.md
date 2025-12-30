# 🚀 새 프론트엔드 배포 가이드

## ⚠️ 주의사항

이 가이드는 기존 프론트엔드(03_Customer, 02_Owner)를 새 프론트엔드(07_new_front, 08_new_owner)로 교체하는 방법을 설명합니다.

**리스크 심사 중이라면 신중하게 진행하세요!**

---

## 📦 준비물

1. 서버 SSH 접속 권한
2. sudo 권한
3. 5-10분의 시간

---

## 🔄 배포 단계

### 1단계: 서버 접속
```bash
ssh ubuntu@maejang.com
```

### 2단계: 프로젝트 최신화
```bash
cd /home/ubuntu/D2C
git pull origin main
```

### 3단계: 기존 설정 백업 (⚠️ 필수!)
```bash
# Caddyfile 백업
sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.backup.$(date +%Y%m%d_%H%M%S)

# 현재 시간 기록
echo "배포 시작: $(date)" >> /home/ubuntu/D2C/deploy_log.txt
```

### 4단계: 새 Caddyfile 적용
```bash
# 새 설정 복사
sudo cp /home/ubuntu/D2C/Caddyfile.new /etc/caddy/Caddyfile

# 문법 검사
caddy validate --config /etc/caddy/Caddyfile

# 문제 없으면 적용
sudo systemctl reload caddy
```

### 5단계: 테스트
```bash
# 고객 페이지 확인
curl -I https://pizzaschool.maejang.com

# 점주 페이지 확인
curl -I https://pizzaschool.maejang.com/admin/

# API 확인
curl https://pizzaschool.maejang.com/api/v1/store/by-subdomain?subdomain=pizzaschool
```

### 6단계: 브라우저에서 확인
1. https://pizzaschool.maejang.com 접속
2. 로그인 테스트
3. 메뉴 표시 확인
4. 장바구니 추가 테스트
5. 주소 검색 테스트 (카카오맵)
6. 결제 페이지 테스트

---

## 🔙 롤백 방법 (문제 발생 시)

### 즉시 롤백 (30초 이내)
```bash
# 가장 최근 백업으로 복구
sudo cp /etc/caddy/Caddyfile.backup.* /etc/caddy/Caddyfile
sudo systemctl reload caddy

# 또는 기존 설정 직접 복원
sudo cp /home/ubuntu/D2C/Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

### 롤백 확인
```bash
# Caddy 상태 확인
sudo systemctl status caddy

# 접속 테스트
curl -I https://pizzaschool.maejang.com
```

---

## 📋 체크리스트

### 배포 전 확인
- [ ] 백엔드 서버 정상 동작 중
- [ ] git pull 완료
- [ ] Caddyfile 백업 완료

### 배포 후 확인
- [ ] 메인 페이지 로딩 확인
- [ ] 로그인 기능 정상
- [ ] 메뉴 목록 API 정상
- [ ] 장바구니 기능 정상
- [ ] 주소 검색 (카카오맵) 정상
- [ ] 결제 페이지 진입 정상
- [ ] 점주 페이지 접속 정상

### 고위험 기능 테스트
- [ ] 🔴 결제: 토스페이먼츠 위젯 로딩
- [ ] 🔴 주소: 카카오 주소 검색 팝업
- [ ] 🔴 주문: 주문 생성 API 호출

---

## 🆘 긴급 연락처

문제 발생 시 즉시 롤백 후 개발자에게 연락

---

## 📝 변경 이력

| 날짜 | 내용 | 담당자 |
|------|------|--------|
| 2024-12-30 | 새 프론트엔드 배포 가이드 작성 | - |

---

## 🔍 기술 세부사항

### 변경된 파일 경로
- 기존 고객: `/home/ubuntu/D2C/03_Customer/`
- 새 고객: `/home/ubuntu/D2C/07_new_front/`
- 기존 점주: `/home/ubuntu/D2C/02_Owner/`
- 새 점주: `/home/ubuntu/D2C/08_new_owner/`

### SPA 라우팅
- 기존: `try_files {path} /01_Loading.html`
- 새로: `try_files {path} /index.html`

### API 연동
- 모든 API 호출이 `api.js` 모듈로 중앙화됨
- 토큰 관리, 에러 처리 일관성 확보
- 서브도메인 기반 매장 정보 자동 로드

### 외부 SDK
- 카카오맵 API: 주소 검색용
- 토스페이먼츠 SDK v2: 결제용

