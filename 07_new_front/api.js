/**
 * ============================================================================
 * 📡 API SERVICE MODULE - 중앙화된 API 연동
 * ============================================================================
 * 
 * 모든 API 호출을 일관성 있게 처리합니다.
 * - 인증 토큰 자동 첨부
 * - 에러 핸들링 통합
 * - 서브도메인 기반 매장 정보 자동 로드
 * 
 * ============================================================================
 */

// ============================================================================
// 🔧 기본 설정
// ============================================================================

const ApiConfig = {
  // 서브도메인 감지
  hostname: window.location.hostname,
  subdomain: window.location.hostname.split('.')[0],
  
  // baseUrl 처리 (로컬 파일 테스트 또는 localhost)
  get baseUrl() {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    // 파일 프로토콜이거나 localhost인 경우
    if (protocol === 'file:' || hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'https://pizzaschool.maejang.com';
    }
    
    // 실제 도메인에서는 같은 도메인 사용
    return '';
  },
  
  // 매장 정보 (동적 로드)
  storeInfo: null,
  ownerId: null,
  storeId: null,
  storeName: null
};

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
  },
  
  // JWT 페이로드 추출 (만료 체크용)
  getPayload() {
    const token = this.get();
    if (!token) return null;
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (e) {
      console.error('토큰 파싱 실패:', e);
      return null;
    }
  },
  
  // 토큰 만료 체크
  isExpired() {
    const payload = this.getPayload();
    if (!payload || !payload.exp) return true;
    
    // 만료 시간 - 현재 시간 (5분 여유)
    return (payload.exp * 1000) < (Date.now() + 5 * 60 * 1000);
  }
};

// ============================================================================
// 📡 API 호출 기본 함수
// ============================================================================

/**
 * API 호출 기본 함수
 * @param {string} endpoint - API 엔드포인트 (예: '/api/v1/menu/list')
 * @param {object} options - fetch 옵션
 * @returns {Promise<object>} API 응답
 */
async function apiCall(endpoint, options = {}) {
  const url = `${ApiConfig.baseUrl}${endpoint}`;
  
  // 기본 헤더 설정
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  // 인증 토큰 자동 첨부
  if (AuthToken.exists()) {
    headers['Authorization'] = `Bearer ${AuthToken.get()}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });
    
    // 인증 에러 처리
    if (response.status === 401 || response.status === 403) {
      console.warn('🔐 인증 만료 또는 권한 없음');
      AuthToken.remove();
      
      // 로그인 페이지로 리다이렉트 여부는 호출자가 결정
      return {
        success: false,
        error: 'AUTH_ERROR',
        message: '로그인이 필요합니다.',
        status: response.status
      };
    }
    
    // JSON 파싱
    const data = await response.json();
    
    // API 응답 형식 통일
    return {
      success: response.ok && data.success !== false,
      data: data.data || data,
      message: data.message || '',
      status: response.status
    };
    
  } catch (error) {
    console.error(`❌ API 호출 실패 [${endpoint}]:`, error);
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: error.message || '네트워크 오류가 발생했습니다.',
      status: 0
    };
  }
}

// GET 요청 헬퍼
async function apiGet(endpoint) {
  return apiCall(endpoint, { method: 'GET' });
}

// POST 요청 헬퍼
async function apiPost(endpoint, body) {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

// PUT 요청 헬퍼
async function apiPut(endpoint, body) {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
}

// DELETE 요청 헬퍼
async function apiDelete(endpoint) {
  return apiCall(endpoint, { method: 'DELETE' });
}

// ============================================================================
// 🏪 매장 정보 로드
// ============================================================================

/**
 * 서브도메인 기반 매장 정보 로드
 * 앱 초기화 시 반드시 호출 필요
 */
async function loadStoreConfig() {
  try {
    // localhost는 pizzaschool로 기본 처리
    const targetSubdomain = (ApiConfig.subdomain === 'localhost' || ApiConfig.subdomain === '127') 
      ? 'pizzaschool' 
      : ApiConfig.subdomain;
    
    console.log('🏪 [API] 서브도메인 감지:', targetSubdomain);
    
    const result = await apiGet(`/api/v1/store/by-subdomain?subdomain=${targetSubdomain}`);
    
    if (!result.success || !result.data) {
      throw new Error('매장을 찾을 수 없습니다.');
    }
    
    ApiConfig.storeInfo = result.data;
    ApiConfig.ownerId = result.data.ownerId;
    ApiConfig.storeId = result.data.storeId;
    ApiConfig.storeName = result.data.storeName;
    
    console.log('✅ [API] 매장 정보 로드 완료');
    console.log('   - OWNER_ID:', ApiConfig.ownerId);
    console.log('   - STORE_ID:', ApiConfig.storeId);
    console.log('   - STORE_NAME:', ApiConfig.storeName);
    
    return ApiConfig.storeInfo;
    
  } catch (error) {
    console.error('❌ [API] 매장 정보 로드 실패:', error);
    throw error;
  }
}

// 매장 정보 로드 Promise (다른 API 호출 전 대기용)
window.STORE_CONFIG_LOADED = null;

// ============================================================================
// 👤 인증 API
// ============================================================================

const AuthApi = {
  /**
   * 로그인
   */
  async login(email, password) {
    const result = await apiPost('/api/v1/user/login', { email, password });
    
    if (result.success && result.data?.token) {
      AuthToken.set(result.data.token);
    }
    
    return result;
  },
  
  /**
   * 회원가입
   */
  async signup(userData) {
    return apiPost('/api/v1/user/customer/signup', userData);
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
   * 내 정보 조회
   */
  async getProfile() {
    return apiGet('/api/v1/user/me');
  },
  
  /**
   * 로그인 상태 확인
   */
  isLoggedIn() {
    return AuthToken.exists() && !AuthToken.isExpired();
  }
};

// ============================================================================
// 🍽️ 메뉴 API
// ============================================================================

const MenuApi = {
  /**
   * 메뉴 목록 조회
   */
  async getList() {
    await window.STORE_CONFIG_LOADED;
    return apiGet(`/api/v1/menu/list?ownerId=${ApiConfig.ownerId}`);
  },
  
  /**
   * 메뉴 상세 조회
   */
  async getDetail(menuId) {
    return apiGet(`/api/v1/menu/${menuId}`);
  },
  
  /**
   * 카테고리별 메뉴 조회
   */
  async getByCategory(category) {
    await window.STORE_CONFIG_LOADED;
    return apiGet(`/api/v1/menu/list?ownerId=${ApiConfig.ownerId}&category=${category}`);
  }
};

// ============================================================================
// 🛒 장바구니 (LocalStorage 기반 - API 연동 준비)
// ============================================================================

const CartApi = {
  CART_KEY: 'maejang_cart',
  
  /**
   * 장바구니 조회
   */
  getAll() {
    const cart = localStorage.getItem(this.CART_KEY);
    return cart ? JSON.parse(cart) : [];
  },
  
  /**
   * 장바구니에 상품 추가
   */
  addItem(item) {
    const cart = this.getAll();
    
    // 같은 상품+옵션이 있는지 확인
    const existingIndex = cart.findIndex(
      i => i.menuId === item.menuId && i.option === item.option
    );
    
    if (existingIndex > -1) {
      cart[existingIndex].quantity += item.quantity;
      cart[existingIndex].totalPrice = cart[existingIndex].price * cart[existingIndex].quantity;
    } else {
      cart.push({
        ...item,
        id: Date.now(),
        addedAt: new Date().toISOString()
      });
    }
    
    this.save(cart);
    return cart;
  },
  
  /**
   * 수량 변경
   */
  updateQuantity(itemId, quantity) {
    const cart = this.getAll();
    const item = cart.find(i => i.id === itemId);
    
    if (item) {
      item.quantity = Math.max(1, quantity);
      item.totalPrice = item.price * item.quantity;
      this.save(cart);
    }
    
    return cart;
  },
  
  /**
   * 아이템 삭제
   */
  removeItem(itemId) {
    let cart = this.getAll();
    cart = cart.filter(item => item.id !== itemId);
    this.save(cart);
    return cart;
  },
  
  /**
   * 장바구니 비우기
   */
  clear() {
    localStorage.removeItem(this.CART_KEY);
  },
  
  /**
   * 저장
   */
  save(cart) {
    localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
  },
  
  /**
   * 총 금액
   */
  getTotal() {
    return this.getAll().reduce((sum, item) => sum + item.totalPrice, 0);
  },
  
  /**
   * 총 수량
   */
  getCount() {
    return this.getAll().reduce((count, item) => count + item.quantity, 0);
  }
};

// ============================================================================
// 📦 주문 API
// ============================================================================

const OrderApi = {
  /**
   * 주문 생성
   * ⚠️ 고위험: 결제와 연동됨
   */
  async create(orderData) {
    await window.STORE_CONFIG_LOADED;
    
    // storeId 자동 첨부
    const order = {
      storeId: ApiConfig.storeId,
      ...orderData
    };
    
    console.log('🛒 [OrderApi] 주문 생성:', order);
    
    return apiPost('/api/v1/order/create', order);
  },
  
  /**
   * 주문 목록 조회
   */
  async getList() {
    return apiGet('/api/v1/order/list');
  },
  
  /**
   * 주문 상세 조회
   */
  async getDetail(orderId) {
    return apiGet(`/api/v1/order/${orderId}`);
  },
  
  /**
   * 주문 취소
   */
  async cancel(orderId) {
    return apiPost(`/api/v1/order/${orderId}/cancel`);
  }
};

// ============================================================================
// 📍 주소 API
// ============================================================================

const AddressApi = {
  /**
   * 주소 목록 조회
   */
  async getList() {
    return apiGet('/api/v1/address/read');
  },
  
  /**
   * 주소 추가
   * ⚠️ 고위험: 배달 권역 체크 필요
   */
  async create(addressData) {
    console.log('📍 [AddressApi] 주소 추가:', addressData);
    return apiPost('/api/v1/address/create', addressData);
  },
  
  /**
   * 주소 수정
   */
  async update(addressId, addressData) {
    return apiPut(`/api/v1/address/${addressId}`, addressData);
  },
  
  /**
   * 주소 삭제
   */
  async delete(addressId) {
    return apiDelete(`/api/v1/address/${addressId}`);
  },
  
  /**
   * 기본 주소 설정
   */
  async setDefault(addressId) {
    return apiPost(`/api/v1/address/${addressId}/default`);
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
    return apiGet(`/api/v1/store/${ApiConfig.storeId}`);
  },
  
  /**
   * 배달 가능 여부 확인
   * @param {number} lat 위도
   * @param {number} lng 경도
   */
  async checkDelivery(lat, lng) {
    await window.STORE_CONFIG_LOADED;
    
    // 가게 정보에서 배달 반경 가져오기
    const storeResult = await this.getInfo();
    if (!storeResult.success) return { success: false, isAvailable: false };
    
    const store = storeResult.data;
    if (!store.latitude || !store.longitude || !store.deliveryRadius) {
      return { success: true, isAvailable: true }; // 제한 없음
    }
    
    // Haversine 공식으로 거리 계산
    const R = 6371; // 지구 반경 (km)
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
// 💳 결제 관련 유틸리티
// ============================================================================

const PaymentUtils = {
  /**
   * 랜덤 문자열 생성 (주문번호용)
   */
  generateOrderId() {
    return 'ORD' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  },
  
  /**
   * 결제 성공 URL
   */
  getSuccessUrl() {
    return window.location.origin + '/payment_success.html';
  },
  
  /**
   * 결제 실패 URL
   */
  getFailUrl() {
    return window.location.origin + '/payment_fail.html';
  }
};

// ============================================================================
// 🎯 포인트/적립 관리
// ============================================================================

const PointsApi = {
  /**
   * 적립률 조회 (점주 설정값)
   */
  getRewardRate() {
    return parseInt(localStorage.getItem('rewardRate') || '40');
  },
  
  /**
   * 적립금 계산
   */
  calculateReward(amount) {
    const rate = this.getRewardRate();
    return Math.floor(amount * rate / 100);
  },
  
  /**
   * 사용 가능 포인트 조회 (TODO: 실제 API 연동 필요)
   */
  getAvailablePoints() {
    return parseInt(localStorage.getItem('userPoints') || '0');
  },
  
  /**
   * 포인트 설정 (TODO: 실제 API 연동 필요)
   */
  setPoints(points) {
    localStorage.setItem('userPoints', points.toString());
  }
};

// ============================================================================
// 🚀 초기화
// ============================================================================

/**
 * API 모듈 초기화
 * 앱 시작 시 호출 필요
 */
async function initApi() {
  console.log('🚀 [API] 초기화 시작...');
  
  try {
    window.STORE_CONFIG_LOADED = loadStoreConfig();
    await window.STORE_CONFIG_LOADED;
    console.log('✅ [API] 초기화 완료');
    return true;
  } catch (error) {
    console.error('❌ [API] 초기화 실패:', error);
    return false;
  }
}

// ============================================================================
// 전역 내보내기
// ============================================================================

window.ApiConfig = ApiConfig;
window.AuthToken = AuthToken;
window.AuthApi = AuthApi;
window.MenuApi = MenuApi;
window.CartApi = CartApi;
window.OrderApi = OrderApi;
window.AddressApi = AddressApi;
window.StoreApi = StoreApi;
window.PaymentUtils = PaymentUtils;
window.PointsApi = PointsApi;
window.initApi = initApi;

