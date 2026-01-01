# 🧭 페이지 네비게이션 가이드

## 📱 전체 페이지 플로우

```
01_Loading (3초 자동)
    ↓
02_Login 
    ├→ 03_Sign_Up (회원가입)
    │    ↓
    └→ 04_Home (로그인)
         ├→ 05_Home_Menu (메뉴 버튼)
         │    ├→ 07_Cart (장바구니)
         │    ├→ 08_My_Orders (주문내역)
         │    └→ 09_Address (주소관리)
         │         └→ 10_Add_Address (주소추가)
         │
         ├→ 06_Food_Details (음식 클릭)
         │    └→ 07_Cart (ADD TO CART)
         │
         └→ 07_Cart (+ 버튼)
              └→ 08_My_Orders (PLACE ORDER)
```

---

## 🔗 페이지별 연결 상세

### 01_Loading.html
- **자동 이동**: 3초 후 → `02_Login.html`

### 02_Login.html
- **LOG IN 버튼** → `04_Home.html`
- **SIGN UP 링크** → `03_Sign_Up.html`
- **소셜 로그인** → (기능 없음, 디자인만)

### 03_Sign_Up.html
- **뒤로가기 버튼** → 이전 페이지 (history.back)
- **SIGN IN 버튼** → `04_Home.html`

### 04_Home.html
- **메뉴 버튼 (⋮)** → `05_Home_Menu.html`
- **음식 카드 클릭** → `06_Food_Details.html`
- **+ 버튼** → `07_Cart.html`

### 05_Home_Menu.html
- **메뉴 버튼 (∨)** → `04_Home.html` (메뉴 닫기)
- **장바구니** → `07_Cart.html`
- **주문 내역** → `08_My_Orders.html`
- **주소 관리** → `09_Address.html`
- **결제 수단 관리** → (준비중 알림)
- **음식 카드 클릭** → `06_Food_Details.html`
- **+ 버튼** → `07_Cart.html`

### 06_Food_Details.html
- **뒤로가기 버튼** → 이전 페이지 (history.back)
- **하트 버튼** → (즐겨찾기 토글, 기능 없음)
- **ADD TO CART 버튼** → `07_Cart.html`

### 07_Cart.html
- **뒤로가기 버튼** → 이전 페이지 (history.back)
- **DONE** → `04_Home.html`
- **EDIT (주소)** → `09_Address.html`
- **× 버튼** → (삭제 기능, 아직 미구현)
- **수량 조절 (±)** → (기능 아직 미구현)
- **PLACE ORDER 버튼** → `08_My_Orders.html` (주문 완료 알림)

### 08_My_Orders.html
- **뒤로가기 버튼** → 이전 페이지 (history.back)
- **메뉴 버튼 (⋮)** → `04_Home.html`
- **Track Order 버튼** → (기능 아직 미구현)
- **Cancel 버튼** → (기능 아직 미구현)
- **Ongoing/History 탭** → (기능 아직 미구현)

### 09_Address.html
- **뒤로가기 버튼** → 이전 페이지 (history.back)
- **Edit (연필) 버튼** → `10_Add_Address.html`
- **Delete (휴지통) 버튼** → 삭제 확인 알림
- **ADD NEW ADDRESS 버튼** → `10_Add_Address.html`

### 10_Add_Address.html
- **뒤로가기 버튼** → 이전 페이지 (history.back)
- **SAVE LOCATION 버튼** → `09_Address.html` (저장 완료 알림)
- **Home/Work/Other 버튼** → (선택 기능, 아직 미구현)

---

## 🎯 주요 사용 패턴

### 신규 사용자 플로우
```
01_Loading → 02_Login → 03_Sign_Up → 04_Home
```

### 기존 사용자 플로우
```
01_Loading → 02_Login → 04_Home
```

### 주문 플로우
```
04_Home → 06_Food_Details → 07_Cart → 08_My_Orders
```

### 주소 관리 플로우
```
04_Home → 05_Home_Menu → 09_Address → 10_Add_Address
```

---

## ⚠️ 주의사항

### 구현된 기능
- ✅ 모든 페이지 간 링크 연결
- ✅ 뒤로가기 버튼 (history.back)
- ✅ 기본 알림 메시지

### 미구현 기능 (JavaScript 필요)
- ❌ 실제 로그인/회원가입 처리
- ❌ 장바구니 수량 조절
- ❌ 장바구니 아이템 삭제
- ❌ 탭 전환 (Ongoing/History)
- ❌ 주문 추적
- ❌ 주문 취소
- ❌ 드롭다운 토글 애니메이션
- ❌ 사이즈 선택
- ❌ 즐겨찾기 토글
- ❌ 데이터 저장 (LocalStorage/DB)

---

## 🚀 테스트 방법

1. `01_Loading.html` 파일을 브라우저로 열기
2. 자동으로 로그인 페이지로 이동 (3초 대기)
3. 각 버튼과 링크를 클릭하여 페이지 전환 확인
4. 브라우저 뒤로가기 버튼도 테스트

---

## 📝 다음 단계

### Phase 2: JavaScript 인터랙션 추가
1. 드롭다운 메뉴 토글
2. 탭 전환 기능
3. 수량 증감 버튼
4. 장바구니 아이템 추가/삭제
5. 폼 유효성 검사

### Phase 3: 데이터 관리
1. LocalStorage로 장바구니 저장
2. LocalStorage로 주문 내역 저장
3. LocalStorage로 주소 저장

### Phase 4: 백엔드 연동
1. 회원가입/로그인 API
2. 상품 목록 API
3. 주문 생성 API
4. 주소 관리 API

---

**마지막 업데이트**: 2024년 12월 14일  
**페이지 수**: 11개  
**연결 수**: 30+ 개

