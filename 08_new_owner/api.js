/**
 * ============================================================================
 * 📡 OWNER API SERVICE MODULE - maejang.com/owner 전용
 * ============================================================================
 * 
 * 점주 로그인 후 해당 점주의 매장 정보를 로드합니다.
 * 경로: maejang.com/owner
 * 
 * ============================================================================
 */

// ============================================================================
// 🔧 기본 설정
// ============================================================================

const baseUrl = window.location.protocol === 'file:' 
  ? 'https://maejang.com'
  : '';

let OWNER_ID = null;
let STORE_ID = null;
let STORE_NAME = null;
let STORE_INFO = null;
let OWNER_USER = null;

// ============================================================================
// 🏪 매장 정보 로드 (로그인 후 호출)
// ============================================================================

async function loadStoreConfigByOwner() {
  const token = AuthToken.get();
  if (!token) {
    console.log('🔐 [Owner API] 로그인 필요');
    return null;
  }
  
  try {
    // 1. 내 정보 조회 (점주 확인)
    const meResponse = await fetch(`${baseUrl}/api/v1/auth/me`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!meResponse.ok) {
      throw new Error('사용자 정보를 가져올 수 없습니다.');
    }
    
    const meData = await meResponse.json();
    
    if (!meData.success || !meData.data) {
      throw new Error('사용자 정보가 없습니다.');
    }
    
    OWNER_USER = meData.data;
    console.log('👤 [Owner API] 사용자 정보:', OWNER_USER);
    
    // 점주 권한 확인
    if (OWNER_USER.role !== 'OWNER') {
      throw new Error('점주 계정이 아닙니다.');
    }
    
    // userId를 ownerId로 사용 (기존 API 구조)
    OWNER_ID = OWNER_USER.userId;
    
    // 2. 점주의 매장 정보 설정 (me 응답에 storeId, storeName 포함)
    if (OWNER_USER.storeId) {
      STORE_ID = OWNER_USER.storeId;
      STORE_NAME = OWNER_USER.storeName || '내 매장';
      
      // 매장 상세 정보 조회 (배달 권역 등 추가 정보 필요시)
      try {
        const storeResponse = await fetch(`${baseUrl}/api/v1/store/${STORE_ID}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (storeResponse.ok) {
          const storeData = await storeResponse.json();
          if (storeData.success && storeData.data) {
            STORE_INFO = storeData.data;
          }
        }
      } catch (e) {
        console.warn('매장 상세 정보 조회 실패:', e);
      }
    } else {
      // storeId가 없으면 이름은 기본값 사용
      STORE_NAME = OWNER_USER.name ? `${OWNER_USER.name}님의 매장` : '내 매장';
    }
    
    console.log('✅ [Owner API] 점주 매장 정보 로드 완료');
    console.log('   - OWNER_ID:', OWNER_ID);
    console.log('   - STORE_ID:', STORE_ID);
    console.log('   - STORE_NAME:', STORE_NAME);
    
    // 전역 변수 업데이트
    window.OWNER_ID = OWNER_ID;
    window.STORE_ID = STORE_ID;
    window.STORE_NAME = STORE_NAME;
    window.STORE_INFO = STORE_INFO;
    window.OWNER_USER = OWNER_USER;
    
    return { user: OWNER_USER, store: STORE_INFO };
    
  } catch (error) {
    console.error('❌ [Owner API] 점주 정보 로드 실패:', error);
    throw error;
  }
}

// 초기 로드는 하지 않음 (로그인 후 호출)
window.STORE_CONFIG_LOADED = Promise.resolve(null);

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
   * 메뉴 목록 조회 - /api/v1/menu/read?storeId=
   */
  async getList() {
    // window.STORE_ID 사용 (로그인 후 설정됨)
    const storeId = window.STORE_ID || STORE_ID;
    
    if (!storeId) {
      console.error('❌ STORE_ID가 설정되지 않았습니다. 로그인이 필요합니다.');
      return { success: false, data: [], message: 'STORE_ID가 없습니다.' };
    }
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/menu/read?storeId=${storeId}`, {
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
    const ownerId = window.OWNER_ID || OWNER_ID;
    if (!ownerId) return { success: false, message: 'OWNER_ID가 없습니다.' };
    
    const token = AuthToken.get();
    if (!token) return { success: false, message: '로그인이 필요합니다.' };
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/menu/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...menuData,
          ownerId: ownerId
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
   * 메뉴 수정 - PATCH /api/v1/menu/update/${menuId}
   */
  async update(menuData) {
    const token = AuthToken.get();
    if (!token) return { success: false, message: '로그인이 필요합니다.' };
    
    if (!menuData.menuId) return { success: false, message: 'menuId가 필요합니다.' };
    
    // URL에 menuId 포함, body에서는 제거
    const { menuId, ...bodyData } = menuData;
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/menu/update/${menuId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
      });
      
      if (checkAuthError(response)) return { success: false, error: 'AUTH_ERROR' };
      
      const data = await response.json();
      return { success: response.ok && data.success };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  
  /**
   * 메뉴 삭제 - DELETE /api/v1/menu/delete/${menuId}
   */
  async delete(menuId) {
    const token = AuthToken.get();
    if (!token) return { success: false };
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/menu/delete/${menuId}`, {
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
// 📷 이미지 업로드 API
// ============================================================================

const ImageApi = {
  /**
   * 이미지 업로드 - POST /api/v1/images/upload
   */
  async upload(file) {
    const token = AuthToken.get();
    if (!token) return { success: false, message: '로그인이 필요합니다.' };
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`${baseUrl}/api/v1/images/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('이미지 업로드 실패');
      }
      
      const data = await response.json();
      console.log('📷 이미지 업로드 성공:', data);
      
      // 응답에서 URL 추출 (data.data.imageUrl 또는 data.data.url 또는 data.data)
      let imageUrl = data.data?.imageUrl || data.data?.url || data.url;
      
      // data.data가 문자열인 경우 (직접 URL)
      if (!imageUrl && typeof data.data === 'string') {
        imageUrl = data.data;
      }
      
      return { success: true, url: imageUrl };
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
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
window.ImageApi = ImageApi;
window.StoreApi = StoreApi;
window.PointsApi = PointsApi;
window.loadStoreConfigByOwner = loadStoreConfigByOwner;
window.checkAuthError = checkAuthError;
