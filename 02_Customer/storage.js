/* ============================================================================
   📦 LOCALSTORAGE SERVICE (임시 저장소)
   ============================================================================
   
   ⚠️ 주의: 이 파일은 LocalStorage를 사용한 임시 데이터 저장 방식입니다.
   
   🗑️ DB 연동 시 삭제 방법:
   1. 이 파일(storage.js) 전체 삭제
   2. HTML 파일에서 <script src="storage.js"></script> 제거
   3. API 서비스 파일로 교체 (예: api-service.js)
   
   🔄 DB 연동 시 교체 예시:
   
   [현재: LocalStorage]
   CartStorage.addItem(item);
   
   [DB 연동 후]
   await fetch('/api/cart', {
     method: 'POST',
     body: JSON.stringify(item)
   });
   
   ============================================================================ */

// ============================================================================
// 🛒 장바구니 관리 (CartStorage)
// ============================================================================

const CartStorage = {
  // 장바구니 KEY
  CART_KEY: 'dfood_cart',
  
  /**
   * 장바구니 전체 가져오기
   * @returns {Array} 장바구니 아이템 배열
   */
  getAll: function() {
    const cart = localStorage.getItem(this.CART_KEY);
    return cart ? JSON.parse(cart) : [];
  },
  
  /**
   * 장바구니에 상품 추가
   * @param {Object} item - 추가할 상품 정보
   * @param {string} item.id - 상품 ID
   * @param {string} item.name - 상품명
   * @param {number} item.price - 가격
   * @param {number} item.quantity - 수량
   * @param {string} item.size - 사이즈
   */
  addItem: function(item) {
    const cart = this.getAll();
    
    // 같은 상품이 있는지 확인 (ID + 사이즈 동일)
    const existingIndex = cart.findIndex(
      i => i.id === item.id && i.size === item.size
    );
    
    if (existingIndex > -1) {
      // 기존 상품 수량 증가
      cart[existingIndex].quantity += item.quantity;
    } else {
      // 새 상품 추가
      cart.push({
        ...item,
        addedAt: new Date().toISOString()
      });
    }
    
    this.save(cart);
    return cart;
  },
  
  /**
   * 장바구니 상품 수량 변경
   * @param {string} id - 상품 ID
   * @param {number} quantity - 새 수량
   */
  updateQuantity: function(id, quantity) {
    const cart = this.getAll();
    const item = cart.find(i => i.id === id);
    
    if (item) {
      item.quantity = quantity;
      this.save(cart);
    }
    return cart;
  },
  
  /**
   * 장바구니에서 상품 삭제
   * @param {string} id - 삭제할 상품 ID
   */
  removeItem: function(id) {
    let cart = this.getAll();
    cart = cart.filter(item => item.id !== id);
    this.save(cart);
    return cart;
  },
  
  /**
   * 장바구니 비우기
   */
  clear: function() {
    localStorage.removeItem(this.CART_KEY);
  },
  
  /**
   * 장바구니 저장 (내부 함수)
   */
  save: function(cart) {
    localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
  },
  
  /**
   * 장바구니 총 금액 계산
   */
  getTotal: function() {
    const cart = this.getAll();
    return cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  },
  
  /**
   * 장바구니 총 아이템 수
   */
  getCount: function() {
    const cart = this.getAll();
    return cart.reduce((count, item) => count + item.quantity, 0);
  }
};

// ============================================================================
// 📦 주문 내역 관리 (OrderStorage)
// ============================================================================

const OrderStorage = {
  // 주문 KEY
  ORDER_KEY: 'dfood_orders',
  
  /**
   * 모든 주문 가져오기
   * @returns {Array} 주문 배열
   */
  getAll: function() {
    const orders = localStorage.getItem(this.ORDER_KEY);
    return orders ? JSON.parse(orders) : [];
  },
  
  /**
   * 새 주문 추가
   * @param {Object} order - 주문 정보
   */
  addOrder: function(order) {
    const orders = this.getAll();
    const newOrder = {
      id: 'ORD' + Date.now(),
      ...order,
      status: 'ongoing',
      createdAt: new Date().toISOString()
    };
    orders.unshift(newOrder); // 최신 주문이 위로
    this.save(orders);
    return newOrder;
  },
  
  /**
   * 진행중인 주문만 가져오기
   */
  getOngoing: function() {
    return this.getAll().filter(order => order.status === 'ongoing');
  },
  
  /**
   * 완료된 주문만 가져오기
   */
  getHistory: function() {
    return this.getAll().filter(order => order.status === 'completed');
  },
  
  /**
   * 주문 상태 변경
   * @param {string} orderId - 주문 ID
   * @param {string} status - 새 상태 ('ongoing', 'completed', 'cancelled')
   */
  updateStatus: function(orderId, status) {
    const orders = this.getAll();
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      this.save(orders);
    }
    return orders;
  },
  
  /**
   * 주문 취소
   */
  cancelOrder: function(orderId) {
    return this.updateStatus(orderId, 'cancelled');
  },
  
  /**
   * 주문 저장 (내부 함수)
   */
  save: function(orders) {
    localStorage.setItem(this.ORDER_KEY, JSON.stringify(orders));
  }
};

// ============================================================================
// 📍 주소 관리 (AddressStorage)
// ============================================================================

const AddressStorage = {
  // 주소 KEY
  ADDRESS_KEY: 'dfood_addresses',
  
  /**
   * 모든 주소 가져오기
   */
  getAll: function() {
    const addresses = localStorage.getItem(this.ADDRESS_KEY);
    return addresses ? JSON.parse(addresses) : [];
  },
  
  /**
   * 주소 추가
   * @param {Object} address - 주소 정보
   */
  addAddress: function(address) {
    const addresses = this.getAll();
    const newAddress = {
      id: 'ADDR' + Date.now(),
      ...address,
      createdAt: new Date().toISOString()
    };
    addresses.push(newAddress);
    this.save(addresses);
    return newAddress;
  },
  
  /**
   * 주소 수정
   */
  updateAddress: function(id, updatedData) {
    const addresses = this.getAll();
    const index = addresses.findIndex(a => a.id === id);
    
    if (index > -1) {
      addresses[index] = {
        ...addresses[index],
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      this.save(addresses);
    }
    return addresses;
  },
  
  /**
   * 주소 삭제
   */
  removeAddress: function(id) {
    let addresses = this.getAll();
    addresses = addresses.filter(a => a.id !== id);
    this.save(addresses);
    return addresses;
  },
  
  /**
   * 기본 주소 설정
   */
  setDefault: function(id) {
    const addresses = this.getAll();
    
    // 모든 주소의 isDefault를 false로
    addresses.forEach(a => a.isDefault = false);
    
    // 선택한 주소만 true로
    const address = addresses.find(a => a.id === id);
    if (address) {
      address.isDefault = true;
      this.save(addresses);
    }
    return addresses;
  },
  
  /**
   * 기본 주소 가져오기
   */
  getDefault: function() {
    const addresses = this.getAll();
    return addresses.find(a => a.isDefault) || addresses[0];
  },
  
  /**
   * 주소 저장 (내부 함수)
   */
  save: function(addresses) {
    localStorage.setItem(this.ADDRESS_KEY, JSON.stringify(addresses));
  }
};

// ============================================================================
// 👤 사용자 정보 관리 (UserStorage)
// ============================================================================

const UserStorage = {
  USER_KEY: 'dfood_user',
  
  /**
   * 사용자 정보 저장 (로그인)
   */
  setUser: function(userData) {
    const user = {
      ...userData,
      loginAt: new Date().toISOString()
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },
  
  /**
   * 사용자 정보 가져오기
   */
  getUser: function() {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  
  /**
   * 로그인 여부 확인
   */
  isLoggedIn: function() {
    return this.getUser() !== null;
  },
  
  /**
   * 로그아웃
   */
  logout: function() {
    localStorage.removeItem(this.USER_KEY);
  }
};

// ============================================================================
// 🧹 전체 데이터 초기화 (개발/테스트용)
// ============================================================================

const StorageManager = {
  /**
   * 모든 앱 데이터 삭제
   */
  clearAll: function() {
    CartStorage.clear();
    localStorage.removeItem(OrderStorage.ORDER_KEY);
    localStorage.removeItem(AddressStorage.ADDRESS_KEY);
    localStorage.removeItem(UserStorage.USER_KEY);
    console.log('✅ 모든 데이터가 삭제되었습니다');
  },
  
  /**
   * 데이터 확인 (디버깅용)
   */
  debug: function() {
    console.log('🛒 장바구니:', CartStorage.getAll());
    console.log('📦 주문:', OrderStorage.getAll());
    console.log('📍 주소:', AddressStorage.getAll());
    console.log('👤 사용자:', UserStorage.getUser());
  }
};

/* ============================================================================
   ✅ 사용 완료! 
   
   💡 사용 예시:
   
   // 장바구니에 추가
   CartStorage.addItem({
     id: '1',
     name: 'Burger',
     price: 32,
     quantity: 2,
     size: '14"'
   });
   
   // 주문 생성
   OrderStorage.addOrder({
     items: CartStorage.getAll(),
     total: CartStorage.getTotal(),
     address: AddressStorage.getDefault()
   });
   
   // 주소 추가
   AddressStorage.addAddress({
     street: 'Hasan Nagar',
     postcode: '12345',
     label: 'Home'
   });
   
   ============================================================================ */

