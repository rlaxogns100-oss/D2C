# 📦 LocalStorage 사용 가이드

## ⚠️ 중요: DB 연동 시 삭제 방법

### 🗑️ 1단계: 파일 삭제
```bash
rm storage.js
```

### 🗑️ 2단계: HTML에서 script 태그 제거

**다음 4개 파일에서 이 줄을 삭제하세요:**
```html
<!-- ⚠️ LocalStorage Service (DB 연동 시 이 줄 삭제) -->
<script src="storage.js"></script>
```

**삭제할 파일 목록:**
1. `06_Food_Details.html` (8번 줄)
2. `07_Cart.html` (8번 줄)
3. `08_My_Orders.html` (8번 줄)
4. `09_Address.html` (9번 줄)
5. `10_Add_Address.html` (8번 줄)

### 🗑️ 3단계: 코드에서 표시 찾기

각 HTML 파일의 JavaScript 코드에서 다음 표시를 찾으세요:

```javascript
// ⚠️ DB: await fetch('/api/cart')
```

이런 주석이 있는 곳이 **DB로 교체해야 할 부분**입니다!

---

## 📝 LocalStorage 사용 위치

### 1. 장바구니 (`07_Cart.html`)
```javascript
// 현재 코드
const cartItems = CartStorage.getAll();

// DB 연동 후
const cartItems = await fetch('/api/cart').then(r => r.json());
```

**함수 목록:**
- `loadCartItems()` - 장바구니 로드
- `increaseCartQuantity()` - 수량 증가
- `decreaseCartQuantity()` - 수량 감소
- `removeCartItem()` - 아이템 삭제
- `placeOrder()` - 주문하기

---

### 2. 음식 상세 (`06_Food_Details.html`)
```javascript
// 현재 코드
CartStorage.addItem(cartItem);

// DB 연동 후
await fetch('/api/cart', {
  method: 'POST',
  body: JSON.stringify(cartItem)
});
```

**함수 목록:**
- `addToCart()` - 장바구니에 추가

---

### 3. 주문 내역 (`08_My_Orders.html`)
```javascript
// 현재 코드
const orders = OrderStorage.getAll();

// DB 연동 후
const orders = await fetch('/api/orders').then(r => r.json());
```

**함수 목록:**
- `loadOrders()` - 주문 내역 로드
- `cancelOrder()` - 주문 취소

---

### 4. 주소 목록 (`09_Address.html`)
```javascript
// 현재 코드
const addresses = AddressStorage.getAll();

// DB 연동 후
const addresses = await fetch('/api/addresses').then(r => r.json());
```

**함수 목록:**
- `loadAddresses()` - 주소 목록 로드
- `deleteAddress()` - 주소 삭제

---

### 5. 주소 추가 (`10_Add_Address.html`)
```javascript
// 현재 코드
AddressStorage.addAddress(address);

// DB 연동 후
await fetch('/api/addresses', {
  method: 'POST',
  body: JSON.stringify(address)
});
```

**함수 목록:**
- `validateAddress()` - 주소 저장

---

## 🔍 검색으로 찾기

### VS Code에서 검색 (Ctrl/Cmd + Shift + F)

**검색어 1**: `⚠️ DB:`  
→ DB로 교체할 부분 모두 찾기

**검색어 2**: `CartStorage`  
→ 장바구니 관련 코드 모두 찾기

**검색어 3**: `OrderStorage`  
→ 주문 관련 코드 모두 찾기

**검색어 4**: `AddressStorage`  
→ 주소 관련 코드 모두 찾기

---

## 📊 현재 LocalStorage 구조

### 저장된 데이터 확인 (브라우저 개발자 도구)

```javascript
// 콘솔에서 실행
CartStorage.getAll()      // 장바구니 확인
OrderStorage.getAll()     // 주문 확인
AddressStorage.getAll()   // 주소 확인

// 전체 데이터 확인
StorageManager.debug()

// 모든 데이터 삭제
StorageManager.clearAll()
```

### LocalStorage Keys
- `dfood_cart` - 장바구니 데이터
- `dfood_orders` - 주문 내역
- `dfood_addresses` - 주소 목록
- `dfood_user` - 사용자 정보 (미사용)

---

## 🎯 빠른 삭제 가이드

### 옵션 1: 검색 & 삭제 (5분)
1. VS Code에서 `storage.js` 검색
2. 관련된 모든 줄 삭제
3. `storage.js` 파일 삭제

### 옵션 2: 파일 직접 수정 (10분)
1. `storage.js` 삭제
2. 위 5개 HTML 파일 열기
3. `<script src="storage.js"></script>` 줄 삭제
4. `⚠️ DB:` 주석 있는 코드 API 호출로 변경

---

## 💡 팁

### LocalStorage → DB 전환 시 장점
- ✅ 여러 기기에서 동기화
- ✅ 데이터 안전하게 보관
- ✅ 서버에서 데이터 관리 가능
- ✅ 여러 사용자 데이터 관리

### 주의사항
- ⚠️ 코드 수정 전 백업 필수
- ⚠️ API 서버 먼저 구축 후 전환
- ⚠️ 한 번에 하나씩 전환 (장바구니 → 주문 → 주소)
- ⚠️ 테스트 철저히!

---

## 📞 추가 도움

더 자세한 DB 연동 가이드는 `DB_MIGRATION_GUIDE.md` 참고하세요!

---

**작성일**: 2024년 12월 14일

