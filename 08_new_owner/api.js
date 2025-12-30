/**
 * ============================================================================
 * 📡 OWNER API SERVICE MODULE - 점주용 API 연동
 * ============================================================================
 */

// ============================================================================
// 🔧 기본 설정
// ============================================================================

const ApiConfig = {
  hostname: window.location.hostname,
  subdomain: window.location.hostname.split('.')[0],
  
  get baseUrl() {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    if (protocol === 'file:' || hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'https://pizzaschool.maejang.com';
    }
    return '';
  },
  
  storeInfo: null,
  ownerId: null,
  storeId: null,
  storeName: null
};

// ============================================================================
// 🔐 인증 토큰 관리
// ============================================================================

const AuthToken = {
  KEY: 'ownerAccessToken',
  
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

// ============================================================================
// 📡 API 호출 기본 함수
// ============================================================================

async function apiCall(endpoint, options = {}) {
  const url = `${ApiConfig.baseUrl}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (AuthToken.exists()) {
    headers['Authorization'] = `Bearer ${AuthToken.get()}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });
    
    if (response.status === 401 || response.status === 403) {
      console.warn('🔐 인증 만료');
      AuthToken.remove();
      return {
        success: false,
        error: 'AUTH_ERROR',
        message: '로그인이 필요합니다.',
        status: response.status
      };
    }
    
    const data = await response.json();
    
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
      message: error.message || '네트워크 오류',
      status: 0
    };
  }
}

async function apiGet(endpoint) {
  return apiCall(endpoint, { method: 'GET' });
}

async function apiPost(endpoint, body) {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

async function apiPut(endpoint, body) {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
}

async function apiDelete(endpoint) {
  return apiCall(endpoint, { method: 'DELETE' });
}

// ============================================================================
// 🏪 매장 정보 로드
// ============================================================================

async function loadStoreConfig() {
  try {
    const targetSubdomain = (ApiConfig.subdomain === 'localhost' || ApiConfig.subdomain === '127') 
      ? 'pizzaschool' 
      : ApiConfig.subdomain;
    
    console.log('🏪 [Owner API] 서브도메인:', targetSubdomain);
    
    const result = await apiGet(`/api/v1/store/by-subdomain?subdomain=${targetSubdomain}`);
    
    if (!result.success || !result.data) {
      throw new Error('매장을 찾을 수 없습니다.');
    }
    
    ApiConfig.storeInfo = result.data;
    ApiConfig.ownerId = result.data.ownerId;
    ApiConfig.storeId = result.data.storeId;
    ApiConfig.storeName = result.data.storeName;
    
    console.log('✅ [Owner API] 매장 정보 로드 완료');
    console.log('   - STORE_ID:', ApiConfig.storeId);
    console.log('   - STORE_NAME:', ApiConfig.storeName);
    
    return ApiConfig.storeInfo;
    
  } catch (error) {
    console.error('❌ [Owner API] 매장 정보 로드 실패:', error);
    throw error;
  }
}

window.STORE_CONFIG_LOADED = null;

// ============================================================================
// 👤 점주 인증 API
// ============================================================================

const OwnerAuthApi = {
  async login(email, password) {
    const result = await apiPost('/api/v1/user/login', { email, password });
    
    if (result.success && result.data?.token) {
      AuthToken.set(result.data.token);
    }
    
    return result;
  },
  
  logout() {
    AuthToken.remove();
    localStorage.removeItem('owner');
    return { success: true };
  },
  
  async getProfile() {
    return apiGet('/api/v1/user/me');
  },
  
  isLoggedIn() {
    return AuthToken.exists();
  }
};

// ============================================================================
// 🍽️ 메뉴 관리 API
// ============================================================================

const OwnerMenuApi = {
  async getList() {
    await window.STORE_CONFIG_LOADED;
    return apiGet(`/api/v1/menu/list?ownerId=${ApiConfig.ownerId}`);
  },
  
  async getDetail(menuId) {
    return apiGet(`/api/v1/menu/${menuId}`);
  },
  
  async create(menuData) {
    return apiPost('/api/v1/menu/create', menuData);
  },
  
  async update(menuId, menuData) {
    return apiPut(`/api/v1/menu/${menuId}`, menuData);
  },
  
  async delete(menuId) {
    return apiDelete(`/api/v1/menu/${menuId}`);
  },
  
  async toggleAvailability(menuId, isAvailable) {
    return apiPut(`/api/v1/menu/${menuId}/availability`, { isAvailable });
  }
};

// ============================================================================
// 📦 주문 관리 API
// ============================================================================

const OwnerOrderApi = {
  async getList(status = null) {
    await window.STORE_CONFIG_LOADED;
    let endpoint = `/api/v1/order/store/${ApiConfig.storeId}`;
    if (status) {
      endpoint += `?status=${status}`;
    }
    return apiGet(endpoint);
  },
  
  async getDetail(orderId) {
    return apiGet(`/api/v1/order/${orderId}`);
  },
  
  async updateStatus(orderId, status) {
    return apiPut(`/api/v1/order/${orderId}/status`, { status });
  },
  
  async accept(orderId) {
    return this.updateStatus(orderId, 'CONFIRMED');
  },
  
  async startCooking(orderId) {
    return this.updateStatus(orderId, 'PREPARING');
  },
  
  async startDelivery(orderId) {
    return this.updateStatus(orderId, 'DELIVERING');
  },
  
  async complete(orderId) {
    return this.updateStatus(orderId, 'COMPLETED');
  },
  
  async cancel(orderId, reason) {
    return apiPost(`/api/v1/order/${orderId}/cancel`, { reason });
  }
};

// ============================================================================
// 🏪 매장 정보 관리 API
// ============================================================================

const OwnerStoreApi = {
  async getInfo() {
    await window.STORE_CONFIG_LOADED;
    return apiGet(`/api/v1/store/${ApiConfig.storeId}`);
  },
  
  async update(storeData) {
    await window.STORE_CONFIG_LOADED;
    return apiPut(`/api/v1/store/${ApiConfig.storeId}`, storeData);
  },
  
  async updateBusinessHours(hours) {
    await window.STORE_CONFIG_LOADED;
    return apiPut(`/api/v1/store/${ApiConfig.storeId}/hours`, hours);
  },
  
  async toggleOpen(isOpen) {
    await window.STORE_CONFIG_LOADED;
    return apiPut(`/api/v1/store/${ApiConfig.storeId}/status`, { isOpen });
  }
};

// ============================================================================
// 🎯 설정 관리 (LocalStorage)
// ============================================================================

const OwnerSettings = {
  KEYS: {
    REWARD_RATE: 'rewardRate',
    CATEGORIES: 'menuCategories'
  },
  
  getRewardRate() {
    return parseInt(localStorage.getItem(this.KEYS.REWARD_RATE) || '40');
  },
  
  setRewardRate(rate) {
    localStorage.setItem(this.KEYS.REWARD_RATE, rate.toString());
    // 고객 페이지와 동기화
    if (window.opener && typeof window.opener.updateRewardRate === 'function') {
      window.opener.updateRewardRate(rate);
    }
  },
  
  getCategories() {
    const saved = localStorage.getItem(this.KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : ['전체', '메인', '사이드', '음료', '디저트'];
  },
  
  setCategories(categories) {
    localStorage.setItem(this.KEYS.CATEGORIES, JSON.stringify(categories));
  }
};

// ============================================================================
// 🚀 초기화
// ============================================================================

async function initOwnerApi() {
  console.log('🚀 [Owner API] 초기화 시작...');
  
  try {
    window.STORE_CONFIG_LOADED = loadStoreConfig();
    await window.STORE_CONFIG_LOADED;
    console.log('✅ [Owner API] 초기화 완료');
    return true;
  } catch (error) {
    console.error('❌ [Owner API] 초기화 실패:', error);
    return false;
  }
}

// ============================================================================
// 전역 내보내기
// ============================================================================

window.ApiConfig = ApiConfig;
window.AuthToken = AuthToken;
window.OwnerAuthApi = OwnerAuthApi;
window.OwnerMenuApi = OwnerMenuApi;
window.OwnerOrderApi = OwnerOrderApi;
window.OwnerStoreApi = OwnerStoreApi;
window.OwnerSettings = OwnerSettings;
window.initOwnerApi = initOwnerApi;

