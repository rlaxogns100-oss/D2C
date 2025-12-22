/**
 * 🏪 서브도메인별 매장 설정 (동적 로딩)
 * 
 * 각 서브도메인마다 다른 OWNER_ID와 STORE_ID를 자동으로 매핑합니다.
 * 기존 코드는 수정하지 않고, 이 파일만 import하면 자동으로 적용됩니다.
 */

// 서브도메인 감지
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

// 매장 정보 로드 함수
async function loadStoreConfig() {
  try {
    // localhost는 pizzaschool로 기본 처리
    const targetSubdomain = (subdomain === 'localhost' || subdomain === '127') 
      ? 'pizzaschool' 
      : subdomain;
    
    console.log('🏪 [Config] 서브도메인 감지:', targetSubdomain);
    
    const response = await fetch(`${baseUrl}/api/v1/store/by-subdomain?subdomain=${targetSubdomain}`);
    
    if (!response.ok) {
      throw new Error('매장을 찾을 수 없습니다.');
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('매장 정보가 없습니다.');
    }
    
    STORE_INFO = result.data;
    OWNER_ID = STORE_INFO.userId;
    STORE_ID = STORE_INFO.storeId;
    STORE_NAME = STORE_INFO.storeName;
    
    console.log('✅ [Config] 매장 정보 로드 완료');
    console.log('   - OWNER_ID:', OWNER_ID);
    console.log('   - STORE_ID:', STORE_ID);
    console.log('   - STORE_NAME:', STORE_NAME);
    
    return STORE_INFO;
    
  } catch (error) {
    console.error('❌ [Config] 매장 정보 로드 실패:', error);
    
    // 매장이 없거나 승인되지 않은 경우 에러 페이지 표시
    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; text-align: center; background: #f8f9fa;">
        <div style="max-width: 400px;">
          <div style="font-size: 64px; margin-bottom: 24px;">🏪</div>
          <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 12px; color: #1a1d26;">매장을 찾을 수 없습니다</h1>
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
            이 도메인에 연결된 매장이 없거나<br>
            아직 설정되지 않았습니다.
          </p>
          <a href="https://maejang.com" style="display: inline-block; padding: 12px 24px; background: #FF6B35; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            메인 페이지로 돌아가기 →
          </a>
        </div>
      </div>
    `;
    
    throw error;
  }
}

// 페이지 로드 시 자동 실행 (Promise를 전역 변수에 저장)
window.STORE_CONFIG_LOADED = loadStoreConfig();

