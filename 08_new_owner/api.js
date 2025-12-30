/**
 * ============================================================================
 * 📡 OWNER API SERVICE MODULE - 기존 백엔드와 100% 호환
 * ============================================================================
 * 
 * 기존 02_Owner 코드의 API 호출 방식을 그대로 사용합니다.
 * 
 * ============================================================================
 */

// ============================================================================
// 🔧 기본 설정
// ============================================================================

const hostname = window.location.hostname;
const subdomain = hostname.split('.')[0];

const baseUrl = window.location.protocol === 'file:' 
  ? 'https://pizzaschool.maejang.com'
  : '';

let OWNER_ID = null;
let STORE_ID = null;
let STORE_NAME = null;
let STORE_INFO = null;

// ============================================================================
// 🏪 매장 정보 로드
// ============================================================================

async function loadStoreConfig() {
  try {
    const targetSubdomain = (subdomain === 'localhost' || subdomain === '127') 
      ? 'pizzaschool' 
      : subdomain;
    
    console.log('🏪 [Owner API] 서브도메인 감지:', targetSubdomain);
    
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
    
    console.log('✅ [Owner API] 매장 정보 로드 완료');
    console.log('   - OWNER_ID:', OWNER_ID);
    console.log('   - STORE_ID:', STORE_ID);
    console.log('   - STORE_NAME:', STORE_NAME);
    
    return STORE_INFO;
    
  } catch (error) {
    console.error('❌ [Owner API] 매장 정보 로드 실패:', error);
    throw error;
  }
}

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

function checkAuthError(response) {
  if (response.status === 401 || response.status === 403) {
    console.warn('🔐 인증 만료 또는 권한 없음');
    AuthToken.remove();
    return true;
  }
  return false;
}

// ============================================================================
// 👤 인증 API
// ============================================================================

const AuthApi = {
  /**
   * 로그인 - /api/v1/auth/login
   */
  async login(email, password) {
    try {
      const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const authHeader = response.headers.get('Authorization');
        if (authHeader) {
          const token = authHeader.replace('Bearer ', '');
          AuthToken.set(token);
        }
        
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          message: errorData.message || '아이디 또는 비밀번호를 확인해주세요'
        };
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
      if (!token) return { success: false };
      
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
  
  logout() {
    AuthToken.remove();
    return { success: true };
  },
  
  isLoggedIn() {
    return AuthToken.exists();
  }
};

// ============================================================================
// 📦 주문 API (기존 04_Orders.html과 동일)
// ============================================================================

const OrderApi = {
  /**
   * 주문 목록 조회 - /api/v1/order/check
   */
  async getList() {
    const token = AuthToken.get();
    if (!token) return { success: false, data: [] };
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/order/check`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (checkAuthError(response)) {
        return { success: false, error: 'AUTH_ERROR', data: [] };
      }
      
      if (!response.ok) {
        throw new Error('주문 목록을 불러올 수 없습니다.');
      }
      
      const result = await response.json();
      return { success: true, data: result.data || [] };
    } catch (error) {
      return { success: false, data: [], message: error.message };
    }
  },
  
  /**
   * 주문 수락 - /api/v1/order/ok?orderId=
   */
  async accept(orderId) {
    const token = AuthToken.get();
    if (!token) return { success: false };
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/order/ok?orderId=${orderId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (checkAuthError(response)) return { success: false, error: 'AUTH_ERROR' };
      return { success: response.ok };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  
  /**
   * 주문 거절 - /api/v1/order/cancel?orderId=
   */
  async reject(orderId) {
    const token = AuthToken.get();
    if (!token) return { success: false };
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/order/cancel?orderId=${orderId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (checkAuthError(response)) return { success: false, error: 'AUTH_ERROR' };
      return { success: response.ok };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  
  /**
   * 조리 완료 - /api/v1/order/complete?orderId=
   */
  async complete(orderId) {
    const token = AuthToken.get();
    if (!token) return { success: false };
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/order/complete?orderId=${orderId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (checkAuthError(response)) return { success: false, error: 'AUTH_ERROR' };
      return { success: response.ok };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  
  /**
   * 배달 완료 - /api/v1/order/deliver?orderId=
   */
  async deliver(orderId) {
    const token = AuthToken.get();
    if (!token) return { success: false };
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/order/deliver?orderId=${orderId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (checkAuthError(response)) return { success: false, error: 'AUTH_ERROR' };
      return { success: response.ok };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

// ============================================================================
// 🍽️ 메뉴 API (기존 05_Foods.html, 08_Add_Foods.html과 동일)
// ============================================================================

const MenuApi = {
  /**
   * 메뉴 목록 조회 - /api/v1/menu/read?ownerId=
   */
  async getList() {
    await window.STORE_CONFIG_LOADED;
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/menu/read?ownerId=${OWNER_ID}`, {
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
      return { success: false, data: [], message: error.message };
    }
  },
  
  /**
   * 메뉴 추가 - /api/v1/menu/create
   */
  async create(menuData) {
    await window.STORE_CONFIG_LOADED;
    
    const token = AuthToken.get();
    if (!token) return { success: false };
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/menu/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...menuData,
          ownerId: OWNER_ID
        })
      });
      
      if (checkAuthError(response)) return { success: false, error: 'AUTH_ERROR' };
      
      const data = await response.json();
      return { success: response.ok && data.success, data: data.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  
  /**
   * 메뉴 수정 - /api/v1/menu/update
   */
  async update(menuData) {
    const token = AuthToken.get();
    if (!token) return { success: false };
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/menu/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(menuData)
      });
      
      if (checkAuthError(response)) return { success: false, error: 'AUTH_ERROR' };
      
      const data = await response.json();
      return { success: response.ok && data.success };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  
  /**
   * 메뉴 삭제 - /api/v1/menu/delete?menuId=
   */
  async delete(menuId) {
    const token = AuthToken.get();
    if (!token) return { success: false };
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/menu/delete?menuId=${menuId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (checkAuthError(response)) return { success: false, error: 'AUTH_ERROR' };
      return { success: response.ok };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

// ============================================================================
// 🏪 가게 설정 API
// ============================================================================

const StoreApi = {
  /**
   * 가게 정보 조회
   */
  async getInfo() {
    await window.STORE_CONFIG_LOADED;
    return { success: true, data: STORE_INFO };
  },
  
  /**
   * 가게 정보 수정 - /api/v1/store/update
   */
  async update(storeData) {
    await window.STORE_CONFIG_LOADED;
    
    const token = AuthToken.get();
    if (!token) return { success: false };
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/store/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...storeData,
          storeId: STORE_ID
        })
      });
      
      if (checkAuthError(response)) return { success: false, error: 'AUTH_ERROR' };
      
      const data = await response.json();
      return { success: response.ok && data.success };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

// ============================================================================
// 🎯 포인트/적립 관리 (LocalStorage)
// ============================================================================

const PointsApi = {
  getRewardRate() {
    return parseInt(localStorage.getItem('rewardRate') || '40');
  },
  
  setRewardRate(rate) {
    localStorage.setItem('rewardRate', rate.toString());
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
window.OrderApi = OrderApi;
window.MenuApi = MenuApi;
window.StoreApi = StoreApi;
window.PointsApi = PointsApi;
window.checkAuthError = checkAuthError;
