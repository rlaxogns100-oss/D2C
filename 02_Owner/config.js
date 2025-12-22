/**
 * 🏪 서브도메인별 매장 설정 (관리자용)
 * 
 * 고객용 config.js와 동일한 로직입니다.
 */

// 서브도메인 감지
const hostname = window.location.hostname;
const subdomain = hostname.split('.')[0];

// baseUrl 처리 (로컬 파일 테스트용)
const baseUrl = window.location.protocol === 'file:' 
  ? 'https://pizzaschool.maejang.com'
  : '';

// 전역 변수
let OWNER_ID = null;
let STORE_ID = null;
let STORE_NAME = null;
let STORE_INFO = null;

// 매장 정보 로드 함수
async function loadStoreConfig() {
  try {
    // localhost는 pizzaschool로 기본 처리
    const targetSubdomain = (subdomain === 'localhost' || subdomain === '127') 
      ? 'pizzaschool' 
      : subdomain;
    
    console.log('🏪 [Admin Config] 서브도메인 감지:', targetSubdomain);
    
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
    
    console.log('✅ [Admin Config] 매장 정보 로드 완료');
    console.log('   - OWNER_ID:', OWNER_ID);
    console.log('   - STORE_ID:', STORE_ID);
    console.log('   - STORE_NAME:', STORE_NAME);
    
    return STORE_INFO;
    
  } catch (error) {
    console.error('❌ [Admin Config] 매장 정보 로드 실패:', error);
    
    // 점주 페이지에서는 다른 메시지 표시
    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; text-align: center; background: #f8f9fa;">
        <div style="max-width: 400px;">
          <div style="font-size: 64px; margin-bottom: 24px;">🏪</div>
          <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 12px; color: #1a1d26;">매장을 찾을 수 없습니다</h1>
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
            매장 정보가 설정되지 않았습니다.<br>
            관리자에게 문의하세요.
          </p>
          <a href="/" style="display: inline-block; padding: 12px 24px; background: #FF6B35; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            돌아가기 →
          </a>
        </div>
      </div>
    `;
    
    throw error;
  }
}

// 페이지 로드 시 자동 실행
window.STORE_CONFIG_LOADED = loadStoreConfig();

