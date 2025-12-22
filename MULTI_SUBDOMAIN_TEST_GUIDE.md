# 🚀 멀티 서브도메인 시스템 - 테스트 가이드

## ✅ 완료된 작업

### 1. 백엔드 (Spring Boot)
- [x] Store 엔티티에 `subdomain` 필드 추가
- [x] StoreRepository에 서브도메인 조회/중복확인 메서드 추가
- [x] StoreService에 서브도메인 관련 비즈니스 로직 추가
- [x] StoreController에 3개 API 추가:
  - `GET /api/v1/store/by-subdomain?subdomain=xxx`
  - `GET /api/v1/store/check-subdomain?subdomain=xxx`
  - (기존 APIs 유지)

### 2. 프론트엔드 (JavaScript)
- [x] `03_Customer/config.js` 생성 (동적 매장 정보 로딩)
- [x] `02_Owner/config.js` 생성
- [x] 주요 HTML 파일들에 config.js 로딩 대기 로직 추가:
  - 04_Home.html
  - 07_Cart.html
  - 10_Add_Address.html

### 3. 관리자 페이지 (00_Admin)
- [x] `00_Admin/style.css` (관리자 전용 스타일)
- [x] `00_Admin/index.html` (대시보드)
- [x] `00_Admin/01_Store_Match.html` (매장 매칭 페이지) ⭐

### 4. 인프라 설정
- [x] Caddyfile을 와일드카드(`*.maejang.com`)로 변경
- [x] DB 마이그레이션 SQL 생성

---

## 📝 당신이 해야 할 작업

### Step 1: 데이터베이스 마이그레이션 (5분)

```bash
# MySQL 접속
mysql -h maejang-db.cbsoemmw41zfap-southeast-2.rds.amazonaws.com -u admin -p

# 데이터베이스 선택
USE `maejang-db`;

# 마이그레이션 실행
source /home/ubuntu/D2C/db_migration_subdomain.sql;

# 확인
SELECT store_id, user_id, store_name, subdomain, is_open FROM stores;
```

**예상 결과:**
```
+-----------+---------+------------+-------------+---------+
| store_id  | user_id | store_name | subdomain   | is_open |
+-----------+---------+------------+-------------+---------+
|        11 |      11 | Pizza School| pizzaschool|    1    |
+-----------+---------+------------+-------------+---------+
```

---

### Step 2: 백엔드 재배포 (10분)

```bash
# 서버 SSH 접속
ssh ubuntu@3.24.199.215

# 코드 업데이트
cd ~/D2C
git pull

# 빌드
cd 05_Backend
./gradlew clean build -x test

# 기존 프로세스 종료
ps aux | grep java | grep maejang
kill -9 [PID]

# 새 프로세스 시작
nohup java -jar build/libs/maejang-0.0.1-SNAPSHOT.jar > ~/app.log 2>&1 &

# 로그 확인 (정상 시작 확인)
tail -50 ~/app.log | grep "Started"
```

**예상 출력:**
```
Started MaejangApplication in 8.123 seconds
```

---

### Step 3: Caddy 재시작 (2분)

```bash
# 여전히 서버에서
cd ~/D2C

# Caddyfile 복사
sudo cp Caddyfile /etc/caddy/Caddyfile

# 설정 검증
sudo caddy validate --config /etc/caddy/Caddyfile

# Caddy 재시작
sudo systemctl reload caddy

# 상태 확인
sudo systemctl status caddy
```

**예상 출력:**
```
● caddy.service - Caddy
   Active: active (running)
```

---

## 🧪 테스트 시나리오

### 테스트 1: 기존 pizzaschool 작동 확인

**목적:** 기존 시스템이 정상 작동하는지 확인

1. **브라우저에서 접속**
   ```
   https://pizzaschool.maejang.com
   ```

2. **개발자 도구 콘솔 확인 (F12)**
   ```
   예상 로그:
   🏪 [Config] 서브도메인 감지: pizzaschool
   ✅ [Config] 매장 정보 로드 완료
      - OWNER_ID: 11
      - STORE_ID: 11
      - STORE_NAME: Pizza School
   [Customer Home] Page loaded, fetching menus...
   ```

3. **메뉴 목록 표시 확인**
   - 기존 메뉴들이 정상 표시되어야 함

4. **점주 페이지 접속**
   ```
   https://pizzaschool.maejang.com/owner/
   ```
   - 로그인 → 주문 관리 페이지 정상 작동

**✅ 성공 기준:** 모든 기능이 이전과 동일하게 작동

---

### 테스트 2: 새 서브도메인 에러 페이지 확인

**목적:** 등록되지 않은 서브도메인 접속 시 에러 페이지 표시

1. **존재하지 않는 서브도메인 접속**
   ```
   https://nonexistent.maejang.com
   ```

2. **예상 화면**
   ```
   🏪
   매장을 찾을 수 없습니다
   
   이 도메인에 연결된 매장이 없거나
   아직 설정되지 않았습니다.
   
   [메인 페이지로 돌아가기] 버튼
   ```

3. **개발자 도구 콘솔**
   ```
   🏪 [Config] 서브도메인 감지: nonexistent
   ❌ [Config] 매장 정보 로드 실패: Error: 매장을 찾을 수 없습니다.
   ```

**✅ 성공 기준:** 에러 페이지가 표시됨 (500 에러가 아님)

---

### 테스트 3: 관리자 페이지에서 새 매장 생성

**목적:** 00_Admin에서 새 매장을 생성하고 접속 확인

#### 3-1. 관리자 페이지 접속

```
https://pizzaschool.maejang.com/admin/
```

**주의:** DNS 와일드카드 때문에 어떤 서브도메인으로든 /admin 접속 가능
- `https://abc.maejang.com/admin/` ✅
- `https://xyz.maejang.com/admin/` ✅

#### 3-2. 매장 매칭 페이지로 이동

```
01_Store_Match.html 클릭
```

**예상 화면:**
- "매장 없는 OWNER 목록" 섹션에 user_id가 나열됨
- "전체 매장 목록" 섹션에 기존 pizzaschool 표시

#### 3-3. 새 매장 생성

1. **"매장 생성하기" 버튼 클릭**
   - 예: user_id=15인 점주 선택

2. **모달에서 정보 입력**
   ```
   매장명: 치킨킹
   서브도메인: chickenking  [중복확인 버튼 클릭]
   주소: 서울시 강남구 테헤란로 123
   설명: 맛있는 치킨 전문점
   ```

3. **중복 확인 결과**
   ```
   ✓ 사용 가능한 도메인입니다!  (초록색)
   ```

4. **"생성" 버튼 클릭**

5. **성공 알림**
   ```
   ✅ 매장이 생성되었습니다!
   
   매장 주소: https://chickenking.maejang.com
   ```

#### 3-4. 새 매장 접속 확인

```
https://chickenking.maejang.com
```

**예상 화면:**
- 로딩 후 메뉴 페이지 표시 (메뉴는 아직 없음)
- 개발자 도구 콘솔:
  ```
  🏪 [Config] 서브도메인 감지: chickenking
  ✅ [Config] 매장 정보 로드 완료
     - OWNER_ID: 15
     - STORE_ID: [생성된 ID]
     - STORE_NAME: 치킨킹
  ```

#### 3-5. 점주 로그인 후 메뉴 등록

```
https://chickenking.maejang.com/owner/
```

1. user_id=15 계정으로 로그인
2. 메뉴 추가 페이지에서 메뉴 등록
3. 다시 `https://chickenking.maejang.com` 접속
4. 등록한 메뉴 표시 확인

**✅ 성공 기준:** 
- 새 서브도메인 정상 작동
- 각 매장이 독립적으로 운영됨
- pizzaschool과 chickenking이 서로 다른 메뉴 표시

---

## 🐛 문제 해결

### 문제 1: "매장을 찾을 수 없습니다" 페이지가 계속 뜸

**원인:** DB 마이그레이션이 안 됨

**해결:**
```bash
mysql -h [RDS주소] -u admin -p
USE `maejang-db`;
SHOW COLUMNS FROM stores LIKE 'subdomain';
```

**subdomain 컬럼이 없으면:**
```sql
source /home/ubuntu/D2C/db_migration_subdomain.sql;
```

---

### 문제 2: 백엔드 API 에러 (404, 500)

**원인:** 백엔드가 재시작 안 됨

**해결:**
```bash
ssh ubuntu@3.24.199.215
tail -100 ~/app.log | grep -i error
```

**백엔드 재시작:**
```bash
cd ~/D2C/05_Backend
./gradlew clean build -x test
pkill -f maejang
nohup java -jar build/libs/maejang-0.0.1-SNAPSHOT.jar > ~/app.log 2>&1 &
```

---

### 문제 3: Caddy 에러

**원인:** Caddyfile 문법 오류

**확인:**
```bash
sudo caddy validate --config /etc/caddy/Caddyfile
```

**로그 확인:**
```bash
sudo journalctl -u caddy -n 50
```

---

## 📊 API 테스트 (cURL)

### 1. 서브도메인으로 매장 조회

```bash
curl "https://pizzaschool.maejang.com/api/v1/store/by-subdomain?subdomain=pizzaschool"
```

**예상 응답:**
```json
{
  "success": true,
  "data": {
    "storeId": 11,
    "userId": 11,
    "storeName": "Pizza School",
    "address": "...",
    "isOpen": true
  }
}
```

### 2. 서브도메인 중복 확인

```bash
curl "https://pizzaschool.maejang.com/api/v1/store/check-subdomain?subdomain=pizzaschool"
```

**예상 응답:**
```json
{
  "success": true,
  "data": false  // 이미 사용 중이므로 false
}
```

```bash
curl "https://pizzaschool.maejang.com/api/v1/store/check-subdomain?subdomain=newstore"
```

**예상 응답:**
```json
{
  "success": true,
  "data": true  // 사용 가능하므로 true
}
```

---

## ✅ 전체 체크리스트

### 인프라
- [ ] AWS Route53 와일드카드 DNS 설정 (`*.maejang.com → 3.24.199.215`)
- [ ] MySQL 스키마 변경 (subdomain 컬럼 추가)
- [ ] 백엔드 재배포
- [ ] Caddy 재시작

### 테스트
- [ ] pizzaschool.maejang.com 정상 작동
- [ ] 존재하지 않는 서브도메인 → 에러 페이지 표시
- [ ] 관리자 페이지 접속 가능
- [ ] 새 매장 생성 가능
- [ ] 생성한 매장 접속 가능
- [ ] 각 매장이 독립적으로 작동

---

## 🎉 완료 후 상태

**기존 매장:**
- pizzaschool.maejang.com (user_id=11) ✅

**새로 추가 가능:**
- chickenking.maejang.com (user_id=15)
- koreanbbq.maejang.com (user_id=22)
- ...무제한

**관리 방식:**
1. 점주가 회원가입 (기존 프로세스)
2. 당신이 `00_Admin` 접속
3. "매장 생성하기" 클릭
4. 서브도메인 입력
5. 생성! → 즉시 사용 가능

**소요 시간:** 매장당 2~3분

---

문제 발생 시 저에게 알려주세요! 🚀

