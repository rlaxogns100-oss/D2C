# 🗄️ DB 마이그레이션 가이드

## 📋 개요

현재 프로젝트는 **LocalStorage**를 사용하여 데이터를 브라우저에 저장합니다.  
실제 서비스 런칭 시 **Database + Backend API**로 전환하기 위한 가이드입니다.

---

## 🗑️ LocalStorage 제거 방법

### 1단계: 파일 삭제

```bash
# LocalStorage 서비스 파일 삭제
rm storage.js
```

### 2단계: HTML 파일에서 script 태그 제거

다음 파일들에서 **이 줄을 삭제**하세요:

```html
<!-- ⚠️ LocalStorage Service (DB 연동 시 이 줄 삭제) -->
<script src="storage.js"></script>
```

**삭제할 파일 목록:**
- `06_Food_Details.html`
- `07_Cart.html`
- `08_My_Orders.html`
- `10_Add_Address.html`

### 3단계: API 서비스 파일 생성

`api-service.js` 파일을 만들어 백엔드 API 호출 로직 작성

```javascript
// api-service.js
const API_BASE_URL = 'https://your-api.com/api';

const API = {
  // 장바구니
  async getCart() {
    const res = await fetch(`${API_BASE_URL}/cart`);
    return res.json();
  },
  
  async addToCart(item) {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return res.json();
  },
  
  // 주문
  async getOrders() {
    const res = await fetch(`${API_BASE_URL}/orders`);
    return res.json();
  },
  
  async createOrder(order) {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    return res.json();
  },
  
  // 주소
  async getAddresses() {
    const res = await fetch(`${API_BASE_URL}/addresses`);
    return res.json();
  },
  
  async addAddress(address) {
    const res = await fetch(`${API_BASE_URL}/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(address)
    });
    return res.json();
  }
};
```

---

## 🔄 코드 변경 가이드

### 장바구니 (07_Cart.html)

#### ❌ Before (LocalStorage)
```javascript
const cartItems = CartStorage.getAll();
CartStorage.addItem(item);
CartStorage.removeItem(id);
```

#### ✅ After (Database)
```javascript
const cartItems = await API.getCart();
await API.addToCart(item);
await API.removeFromCart(id);
```

---

### 주문 (08_My_Orders.html)

#### ❌ Before (LocalStorage)
```javascript
const orders = OrderStorage.getAll();
OrderStorage.addOrder(order);
```

#### ✅ After (Database)
```javascript
const orders = await API.getOrders();
await API.createOrder(order);
```

---

### 주소 (10_Add_Address.html)

#### ❌ Before (LocalStorage)
```javascript
AddressStorage.addAddress(address);
const addresses = AddressStorage.getAll();
```

#### ✅ After (Database)
```javascript
await API.addAddress(address);
const addresses = await API.getAddresses();
```

---

## 🛠️ 백엔드 개발 가이드

### 필요한 API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| **장바구니** |
| GET | `/api/cart` | 장바구니 조회 |
| POST | `/api/cart` | 장바구니 추가 |
| PUT | `/api/cart/:id` | 수량 변경 |
| DELETE | `/api/cart/:id` | 장바구니 삭제 |
| DELETE | `/api/cart` | 장바구니 비우기 |
| **주문** |
| GET | `/api/orders` | 주문 내역 조회 |
| GET | `/api/orders/:id` | 특정 주문 조회 |
| POST | `/api/orders` | 주문 생성 |
| PUT | `/api/orders/:id` | 주문 상태 변경 |
| DELETE | `/api/orders/:id` | 주문 취소 |
| **주소** |
| GET | `/api/addresses` | 주소 목록 조회 |
| GET | `/api/addresses/:id` | 특정 주소 조회 |
| POST | `/api/addresses` | 주소 추가 |
| PUT | `/api/addresses/:id` | 주소 수정 |
| DELETE | `/api/addresses/:id` | 주소 삭제 |
| **인증** |
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/logout` | 로그아웃 |
| GET | `/api/auth/me` | 현재 사용자 정보 |

---

## 📊 데이터베이스 스키마

### Users 테이블
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products 테이블
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  restaurant VARCHAR(100),
  category VARCHAR(50),
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Cart 테이블
```sql
CREATE TABLE cart (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  size VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### Orders 테이블
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status ENUM('ongoing', 'completed', 'cancelled') DEFAULT 'ongoing',
  address_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (address_id) REFERENCES addresses(id)
);
```

### Order_Items 테이블
```sql
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  size VARCHAR(10),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### Addresses 테이블
```sql
CREATE TABLE addresses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  street VARCHAR(255) NOT NULL,
  apartment VARCHAR(50),
  postcode VARCHAR(10) NOT NULL,
  label ENUM('Home', 'Work', 'Other') DEFAULT 'Home',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🔧 백엔드 기술 스택 추천

### Node.js + Express
```bash
npm install express mysql2 bcrypt jsonwebtoken cors
```

### Python + Flask
```bash
pip install flask flask-sqlalchemy flask-jwt-extended bcrypt
```

### PHP + Laravel
```bash
composer create-project laravel/laravel backend
```

---

## 🚀 배포 가이드

### 프론트엔드 배포
- **Vercel** (추천): 무료, 자동 배포
- **Netlify**: 무료, 간편함
- **GitHub Pages**: 무료, 정적 사이트

### 백엔드 배포
- **Heroku**: 무료 티어 있음
- **Railway**: 무료 $5 크레딧
- **AWS EC2**: 프리 티어 1년
- **DigitalOcean**: $5/월

### 데이터베이스 배포
- **PlanetScale**: MySQL, 무료 티어
- **MongoDB Atlas**: NoSQL, 무료 티어
- **Supabase**: PostgreSQL, 무료 티어

---

## ✅ 마이그레이션 체크리스트

### 개발 단계
- [ ] 백엔드 API 서버 구축
- [ ] 데이터베이스 설계 및 생성
- [ ] API 엔드포인트 구현
- [ ] 인증 시스템 구현 (JWT)
- [ ] API 테스트 (Postman/Insomnia)

### 프론트엔드 변경
- [ ] `storage.js` 삭제
- [ ] `api-service.js` 생성
- [ ] HTML 파일에서 LocalStorage 코드 제거
- [ ] API 호출 코드로 변경
- [ ] 에러 처리 추가
- [ ] 로딩 상태 UI 추가

### 배포 및 테스트
- [ ] 백엔드 서버 배포
- [ ] 데이터베이스 배포
- [ ] 프론트엔드 배포
- [ ] 전체 기능 테스트
- [ ] 성능 최적화

---

## 📝 주의사항

### 보안
- ✅ 비밀번호는 반드시 **해시화** (bcrypt)
- ✅ JWT 토큰으로 인증 처리
- ✅ HTTPS 사용 필수
- ✅ SQL Injection 방어
- ✅ CORS 설정 올바르게

### 성능
- ✅ 데이터베이스 인덱스 설정
- ✅ API 응답 캐싱
- ✅ 이미지 최적화
- ✅ CDN 사용 고려

---

## 🆘 문제 해결

### CORS 에러
```javascript
// Backend (Express)
app.use(cors({
  origin: 'https://your-frontend.com',
  credentials: true
}));
```

### 인증 토큰 저장
```javascript
// LocalStorage 대신 HttpOnly Cookie 사용 (더 안전)
// 또는 JWT를 LocalStorage에 저장 (간편)
localStorage.setItem('token', jwtToken);
```

---

## 📚 참고 자료

- [Express.js 공식 문서](https://expressjs.com/)
- [JWT 인증 가이드](https://jwt.io/)
- [REST API 디자인 가이드](https://restfulapi.net/)
- [SQL vs NoSQL 선택 가이드](https://www.mongodb.com/nosql-explained/nosql-vs-sql)

---

**마지막 업데이트**: 2024년 12월 14일  
**작성자**: Cursor AI Assistant

