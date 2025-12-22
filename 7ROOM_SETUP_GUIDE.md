# 🏪 7room.maejang.com 매장 추가 가이드

기존 pizzaschool.maejang.com을 건드리지 않고 새로운 매장을 추가하는 방법입니다.

---

## ✅ 완료된 작업

### 1. **프론트엔드 설정 파일 생성**
- `03_Customer/config.js` 생성
- 서브도메인을 자동으로 감지하여 매장 ID를 매핑
- 기존 코드 수정 없이 작동

### 2. **프론트엔드 파일 업데이트**
다음 파일들에 `config.js` import 추가:
- `03_Customer/04_Home.html`
- `03_Customer/07_Cart.html`
- `03_Customer/10_Add_Address.html`

### 3. **Caddyfile 업데이트**
- `7room.maejang.com` 블록 추가
- pizzaschool과 동일한 백엔드(8080 포트) 사용
- 로그는 `/var/log/caddy/7room.access.log`에 기록

### 4. **SQL 스크립트 생성**
- `setup_7room_store.sql` 생성
- rlaxogns90@snu.ac.kr 유저를 OWNER로 설정
- 새 매장 및 샘플 메뉴 추가

---

## 🚀 배포 단계

### 1️⃣ 데이터베이스 설정

```bash
# MySQL 접속
mysql -u [username] -p [database_name]

# SQL 스크립트 실행
source setup_7room_store.sql;
```

**출력 결과 확인:**
```
✅ 사용자 ID: [생성된 USER_ID]
✅ 매장 ID: [생성된 STORE_ID]
```

### 2️⃣ config.js 업데이트

SQL 스크립트 실행 후 출력된 ID 값으로 `03_Customer/config.js` 수정:

```javascript
'7room': {
  OWNER_ID: [실제_USER_ID],  // SQL 실행 결과에서 확인
  STORE_ID: [실제_STORE_ID],  // SQL 실행 결과에서 확인
  STORE_NAME: '세븐룸',
  DESCRIPTION: '맛있는 음식을 만나보세요'
}
```

### 3️⃣ 서버에 파일 업로드

```bash
# 로컬에서 서버로 파일 복사
scp 03_Customer/config.js ubuntu@[서버IP]:/home/ubuntu/D2C/03_Customer/
scp Caddyfile ubuntu@[서버IP]:/home/ubuntu/D2C/
```

### 4️⃣ Caddy 재시작

```bash
# 서버에 SSH 접속
ssh ubuntu@[서버IP]

# Caddyfile 복사 (백업 후)
sudo cp /home/ubuntu/D2C/Caddyfile /etc/caddy/Caddyfile

# Caddy 설정 검증
sudo caddy validate --config /etc/caddy/Caddyfile

# Caddy 재시작
sudo systemctl reload caddy

# 상태 확인
sudo systemctl status caddy
```

### 5️⃣ DNS 설정

도메인 관리 페이지에서 A 레코드 추가:
```
Type: A
Name: 7room
Value: [서버 IP 주소]
TTL: 3600
```

### 6️⃣ 테스트

1. **브라우저에서 접속**
   - https://7room.maejang.com

2. **개발자 도구 콘솔 확인**
   ```
   🏪 [Config] 현재 서브도메인: 7room
   🏪 [Config] OWNER_ID: [설정한 ID]
   🏪 [Config] STORE_ID: [설정한 ID]
   ```

3. **관리자 페이지 접속**
   - https://7room.maejang.com/admin
   - rlaxogns90@snu.ac.kr로 로그인
   - 메뉴 관리 확인

---

## 🔧 문제 해결

### 문제: 7room 접속 시 pizzaschool 데이터가 보임

**원인:** config.js가 제대로 로드되지 않음

**해결:**
```bash
# 브라우저 캐시 삭제 (Ctrl+Shift+R)
# 또는 개발자 도구에서 네트워크 탭 확인
```

### 문제: 404 Not Found

**원인:** Caddy가 재시작되지 않음

**해결:**
```bash
sudo systemctl restart caddy
sudo systemctl status caddy
```

### 문제: 메뉴가 안 보임

**원인:** OWNER_ID가 잘못 설정됨

**해결:**
```sql
-- MySQL에서 확인
SELECT user_id, email, role FROM users WHERE email = 'rlaxogns90@snu.ac.kr';
SELECT store_id, store_name, user_id FROM stores WHERE user_id = [확인한_ID];
SELECT menu_id, menu_name, user_id FROM menus WHERE user_id = [확인한_ID];
```

---

## 📝 추가 매장 등록 방법

3번째, 4번째 매장을 추가하려면:

1. **SQL 스크립트 복사**
   ```bash
   cp setup_7room_store.sql setup_newstore_store.sql
   ```

2. **이메일 및 매장명 수정**
   ```sql
   -- 유저 이메일 변경
   'newstore@example.com'
   
   -- 매장명 변경
   '새로운 매장'
   ```

3. **config.js에 추가**
   ```javascript
   'newstore': {
     OWNER_ID: [새_USER_ID],
     STORE_ID: [새_STORE_ID],
     STORE_NAME: '새로운 매장',
     DESCRIPTION: '설명'
   }
   ```

4. **Caddyfile에 블록 추가**
   ```
   newstore.maejang.com {
     # 7room 블록 복사
   }
   ```

---

## ⚠️ 주의사항

1. **기존 pizzaschool 매장은 절대 건드리지 않음**
   - OWNER_ID=11, STORE_ID=11은 그대로 유지

2. **비밀번호 보안**
   - SQL 스크립트의 비밀번호는 반드시 bcrypt 해시로 변경
   - 또는 회원가입 페이지에서 직접 가입

3. **백업**
   - 작업 전 데이터베이스 백업 필수
   ```bash
   mysqldump -u [username] -p [database] > backup_$(date +%Y%m%d).sql
   ```

---

## 📞 문제 발생 시

1. Caddy 로그 확인
   ```bash
   sudo journalctl -u caddy -f
   ```

2. 브라우저 개발자 도구 콘솔 확인

3. MySQL 데이터 확인
   ```sql
   SELECT * FROM users WHERE email = 'rlaxogns90@snu.ac.kr';
   SELECT * FROM stores WHERE user_id = [USER_ID];
   SELECT * FROM menus WHERE user_id = [USER_ID];
   ```

---

## ✨ 완료!

모든 설정이 완료되면:
- ✅ pizzaschool.maejang.com → 기존 매장 (OWNER_ID=11)
- ✅ 7room.maejang.com → 새 매장 (rlaxogns90@snu.ac.kr)
- ✅ 같은 백엔드, 같은 DB, 다른 데이터
- ✅ 서로 독립적으로 운영


