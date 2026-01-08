/**
 * ============================================================================
 * 📡 API SERVICE MODULE - 기존 백엔드와 100% 호환
 * ============================================================================
 * 
 * 기존 03_Customer 코드의 API 호출 방식을 그대로 사용합니다.
 * 
 * ============================================================================
 */

// ============================================================================
// 🔧 기본 설정 (config.js 호환)
// ============================================================================

const hostname = window.location.hostname;
const subdomain = hostname.split('.')[0];

// baseUrl 처리 (로컬 파일 테스트용)
const baseUrl = window.location.protocol === 'file:' 
  ? 'https://pizzaschool.maejang.com'
  : '';

// 전역 변수 (다른 스크립트에서 사용)
let OWNER_ID = null;
let STORE_ID = null;
let STORE_NAME = null;
let STORE_INFO = null;

// ============================================================================
// 🏪 매장 정보 로드 (config.js와 동일)
// ============================================================================

async function loadStoreConfig() {
  try {
    // localhost는 pizzaschool로 기본 처리
    const targetSubdomain = (subdomain === 'localhost' || subdomain === '127') 
      ? 'pizzaschool' 
      : subdomain;
    
    console.log('🏪 [API] 서브도메인 감지:', targetSubdomain);
    
    const response = await fetch(`${baseUrl}/api/v1/store/by-subdomain?subdomain=${targetSubdomain}`);
    
    if (!response.ok) {
      throw new Error('매장을 찾을 수 없습니다.');
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('매장 정보가 없습니다.');
    }
    
    STORE_INFO = result.data;
    OWNER_ID = STORE_INFO.ownerId;
    STORE_ID = STORE_INFO.storeId;
    STORE_NAME = STORE_INFO.storeName;
    
    console.log('✅ [API] 매장 정보 로드 완료');
    console.log('   - OWNER_ID:', OWNER_ID);
    console.log('   - STORE_ID:', STORE_ID);
    console.log('   - STORE_NAME:', STORE_NAME);
    
    return STORE_INFO;
    
  } catch (error) {
    console.error('❌ [API] 매장 정보 로드 실패:', error);
    
    // 매장을 찾을 수 없거나 비활성화된 경우 메인 랜딩페이지로 리다이렉트
    if (window.location.hostname !== 'maejang.com' && window.location.hostname !== 'localhost') {
      console.log('🔄 [API] 매장을 찾을 수 없어 maejang.com으로 리다이렉트합니다.');
      window.location.href = 'https://maejang.com';
    }
    
    throw error;
  }
}

// 페이지 로드 시 자동 실행
window.STORE_CONFIG_LOADED = loadStoreConfig();

// ============================================================================
// 🔐 인증 토큰 관리
// ============================================================================

const AuthToken = {
  KEY: 'accessToken',
  
  get() {
    return localStorage.getItem(this.KEY);
  },
  
  set(token) {
    localStorage.setItem(this.KEY, token);
  },
  
  remove() {
    localStorage.removeItem(this.KEY);
  },
  
  exists() {
    return !!this.get();
  }
};

// 인증 에러 체크
// 주의: 토큰 자동 삭제하지 않음 (탭 전환 시 로그인 풀림 방지)
function checkAuthError(response) {
  if (response.status === 401 || response.status === 403) {
    console.warn('🔐 인증 만료 또는 권한 없음 (status:', response.status, ')');
    // 토큰 삭제는 명시적인 로그아웃에서만 수행
    // AuthToken.remove(); // 제거: 자동 삭제 비활성화
    return true;
  }
  return false;
}

// ============================================================================
// 👤 인증 API (기존 02_Login.html, 03_Sign_Up.html과 동일)
// ============================================================================

const AuthApi = {
  /**
   * 로그인 - /api/v1/auth/login (토큰은 헤더에서 추출)
   */
  async login(email, password) {
    try {
      const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        // 토큰은 응답 헤더에서 추출 (Bearer 제거)
        const authHeader = response.headers.get('Authorization');
        if (authHeader) {
          const token = authHeader.replace('Bearer ', '');
          AuthToken.set(token);
        }
        
        // 로그인 후 사용자 정보 조회
        const meResult = await this.getProfile();
        if (meResult.success) {
          return { 
            success: true, 
            data: { user: meResult.data } 
          };
        }
        
        return { success: true, data: { user: { email } } };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          message: errorData.message || '아이디 또는 비밀번호를 확인해주세요'
        };
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      return { success: false, message: error.message };
    }
  },
  
  /**
   * 회원가입 - /api/v1/users/sign_in
   */
  async signup(userData) {
    try {
      const response = await fetch(`${baseUrl}/api/v1/users/sign_in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          name: userData.name,
          role: 'CUSTOMER'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, message: errorData.message || '회원가입에 실패했습니다.' };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  
  /**
   * 내 정보 조회 - /api/v1/auth/me (POST)
   */
  async getProfile() {
    try {
      const token = AuthToken.get();
      if (!token) return { success: false, message: '로그인 필요' };
      
      const response = await fetch(`${baseUrl}/api/v1/auth/me`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data: data.data || data };
      }
      return { success: false };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  
  /**
   * 로그아웃
   */
  logout() {
    AuthToken.remove();
    localStorage.removeItem('user');
    return { success: true };
  },
  
  /**
   * 로그인 상태 확인
   */
  isLoggedIn() {
    return AuthToken.exists();
  }
};

// ============================================================================
// 🍽️ 메뉴 API (기존 04_Home.html과 동일)
// ============================================================================

const MenuApi = {
  /**
   * 메뉴 목록 조회 - /api/v1/menu/read?storeId=
   * 인증 불필요
   */
  async getList() {
    await window.STORE_CONFIG_LOADED;
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/menu/read?storeId=${STORE_ID}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('메뉴 목록을 가져올 수 없습니다.');
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        return { success: true, data: data.data };
      }
      return { success: false, data: [] };
    } catch (error) {
      console.error('메뉴 로드 오류:', error);
      return { success: false, data: [], message: error.message };
    }
  },
  
  /**
   * 메뉴 상세 조회
   */
  async getDetail(menuId) {
    try {
      const response = await fetch(`${baseUrl}/api/v1/menu/${menuId}`);
      if (response.ok) {
        const data = await response.json();
        return { success: true, data: data.data || data };
      }
      return { success: false };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

// ============================================================================
// 📦 주문 API (기존 07_Cart.html, 08_My_Orders.html과 동일)
// ============================================================================

const OrderApi = {
  /**
   * 주문 생성 - /api/v1/order/create
   */
  async create(orderData) {
    await window.STORE_CONFIG_LOADED;
    
    const token = AuthToken.get();
    if (!token) return { success: false, message: '로그인이 필요합니다.' };
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/order/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          storeId: STORE_ID,
          ...orderData
        })
      });
      
      if (checkAuthError(response)) {
        return { success: false, error: 'AUTH_ERROR', message: '로그인이 필요합니다.' };
      }
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message || '주문 생성에 실패했습니다.' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  
  /**
   * 주문 내역 조회 - /api/v1/order/history
   */
  async getList() {
    const token = AuthToken.get();
    if (!token) return { success: false, message: '로그인이 필요합니다.', data: [] };
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/order/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (checkAuthError(response)) {
        return { success: false, error: 'AUTH_ERROR', data: [] };
      }
      
      if (!response.ok) {
        throw new Error('주문 내역을 불러올 수 없습니다.');
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        return { success: true, data: data.data };
      }
      return { success: false, data: [] };
    } catch (error) {
      return { success: false, message: error.message, data: [] };
    }
  },
  
  /**
   * 주문 취소 - /api/v1/order/delete?orderId=
   */
  async cancel(orderId) {
    const token = AuthToken.get();
    if (!token) return { success: false, message: '로그인이 필요합니다.' };
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/order/delete?orderId=${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (checkAuthError(response)) {
        return { success: false, error: 'AUTH_ERROR' };
      }
      
      return { success: response.ok };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

// ============================================================================
// 📍 주소 API (기존 09_Address.html, 10_Add_Address.html과 동일)
// ============================================================================

const AddressApi = {
  /**
   * 주소 목록 조회 - /api/v1/address/read
   */
  async getList() {
    const token = AuthToken.get();
    if (!token) return { success: false, data: [] };
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/address/read`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (checkAuthError(response)) {
        return { success: false, error: 'AUTH_ERROR', data: [] };
      }
      
      if (!response.ok) {
        throw new Error('주소 목록을 불러올 수 없습니다.');
      }
      
      const data = await response.json();
      if (data.success && data.data) {
        return { success: true, data: data.data };
      }
      return { success: false, data: [] };
    } catch (error) {
      return { success: false, data: [], message: error.message };
    }
  },
  
  /**
   * 주소 추가 - /api/v1/address/create
   */
  async create(addressData) {
    const token = AuthToken.get();
    if (!token) return { success: false, error: 'AUTH_ERROR' };
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/address/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addressData)
      });
      
      if (checkAuthError(response)) {
        return { success: false, error: 'AUTH_ERROR' };
      }
      
      const data = await response.json();
      return { success: response.ok && data.success, data: data.data, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  
  /**
   * 주소 삭제 - /api/v1/address/delete/{addressId}
   */
  async delete(addressId) {
    const token = AuthToken.get();
    if (!token) return { success: false };
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/address/delete/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return { success: response.ok };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

// ============================================================================
// 🏪 가게 API
// ============================================================================

const StoreApi = {
  /**
   * 가게 정보 조회
   */
  async getInfo() {
    await window.STORE_CONFIG_LOADED;
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/store/${STORE_ID}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          return { success: true, data: data.data };
        }
      }
      return { success: false };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  
  /**
   * 배달 가능 여부 확인 (Haversine 공식)
   */
  async checkDelivery(lat, lng) {
    await window.STORE_CONFIG_LOADED;
    
    const storeResult = await this.getInfo();
    if (!storeResult.success) return { success: false, isAvailable: false };
    
    const store = storeResult.data;
    if (!store.latitude || !store.longitude || !store.deliveryRadius) {
      return { success: true, isAvailable: true };
    }
    
    // Haversine 공식으로 거리 계산
    const R = 6371;
    const dLat = (store.latitude - lat) * Math.PI / 180;
    const dLon = (store.longitude - lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat * Math.PI / 180) * Math.cos(store.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return {
      success: true,
      isAvailable: distance <= store.deliveryRadius,
      distance: distance.toFixed(2),
      maxRadius: store.deliveryRadius
    };
  }
};

// ============================================================================
// 🛒 장바구니 (LocalStorage 기반 - 기존과 동일)
// ============================================================================

const CartApi = {
  CART_KEY: 'cart',
  
  getAll() {
    return JSON.parse(localStorage.getItem(this.CART_KEY) || '[]');
  },
  
  addItem(item) {
    const cart = this.getAll();
    
    // 같은 상품+옵션이 있는지 확인
    const existingIndex = cart.findIndex(
      i => i.menuId === item.menuId && i.option === item.option
    );
    
    if (existingIndex > -1) {
      cart[existingIndex].quantity += item.quantity;
      cart[existingIndex].totalPrice = (cart[existingIndex].price + (cart[existingIndex].additionalPrice || 0)) * cart[existingIndex].quantity;
    } else {
      cart.push({
        ...item,
        addedAt: new Date().toISOString()
      });
    }
    
    this.save(cart);
    return cart;
  },
  
  updateQuantity(index, quantity) {
    const cart = this.getAll();
    if (cart[index]) {
      cart[index].quantity = Math.max(1, quantity);
      cart[index].totalPrice = (cart[index].price + (cart[index].additionalPrice || 0)) * cart[index].quantity;
      this.save(cart);
    }
    return cart;
  },
  
  removeItem(index) {
    const cart = this.getAll();
    cart.splice(index, 1);
    this.save(cart);
    return cart;
  },
  
  clear() {
    localStorage.removeItem(this.CART_KEY);
  },
  
  save(cart) {
    localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
  },
  
  getTotal() {
    return this.getAll().reduce((sum, item) => sum + item.totalPrice, 0);
  },
  
  getCount() {
    return this.getAll().reduce((count, item) => count + item.quantity, 0);
  }
};

// ============================================================================
// 🎯 포인트/적립 관리
// ============================================================================

const PointsApi = {
  getRewardRate() {
    return parseInt(localStorage.getItem('rewardRate') || '40');
  },
  
  calculateReward(amount) {
    const rate = this.getRewardRate();
    return Math.floor(amount * rate / 100);
  },
  
  getAvailablePoints() {
    return parseInt(localStorage.getItem('userPoints') || '0');
  },
  
  setPoints(points) {
    localStorage.setItem('userPoints', points.toString());
  }
};

// ============================================================================
// 💳 결제 유틸리티
// ============================================================================

const PaymentUtils = {
  generateOrderId() {
    return 'ORD' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
};

// ============================================================================
// 💳 빌링(카드 등록) API
// ============================================================================

const BillingApi = {
  /**
   * 등록된 카드 목록 조회
   */
  async getCards() {
    const token = AuthToken.get();
    if (!token) {
      return [];
    }
    
    const response = await fetch(`${baseUrl}/api/v1/billing/cards`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('카드 목록 조회 실패:', response.status);
      return [];
    }
    
    const result = await response.json();
    return result.data || [];
  },
  
  /**
   * 카드 삭제
   */
  async deleteCard(billingId) {
    const token = AuthToken.get();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }
    
    const response = await fetch(`${baseUrl}/api/v1/billing/cards/${billingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.message || '카드 삭제에 실패했습니다.');
    }
    
    return true;
  }
};

// ============================================================================
// 전역 내보내기
// ============================================================================

window.baseUrl = baseUrl;
window.OWNER_ID = OWNER_ID;
window.STORE_ID = STORE_ID;
window.STORE_NAME = STORE_NAME;
window.STORE_INFO = STORE_INFO;

window.AuthToken = AuthToken;
window.AuthApi = AuthApi;
window.MenuApi = MenuApi;
window.OrderApi = OrderApi;
window.AddressApi = AddressApi;
window.StoreApi = StoreApi;
window.CartApi = CartApi;
window.PointsApi = PointsApi;
window.PaymentUtils = PaymentUtils;
window.BillingApi = BillingApi;
window.checkAuthError = checkAuthError;
