/**
 * 🏪 서브도메인별 매장 설정
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

// 서브도메인별 설정 매핑
const SUBDOMAIN_CONFIG = {
  'pizzaschool': {
    OWNER_ID: 11,
    STORE_ID: 11,
    STORE_NAME: 'Pizza School',
    DESCRIPTION: '신선한 피자를 만나보세요'
  },
  '7room': {
    OWNER_ID: 2,  // rlaxogns90@snu.ac.kr 유저의 ID (DB 삽입 후 실제 ID로 변경 필요)
    STORE_ID: 2,  // 7room 매장의 ID (DB 삽입 후 실제 ID로 변경 필요)
    STORE_NAME: '세븐룸',
    DESCRIPTION: '맛있는 음식을 만나보세요'
  },
  // 기타 서브도메인 (localhost, 127.0.0.1 등) - 기본값으로 pizzaschool 사용
  'localhost': {
    OWNER_ID: 11,
    STORE_ID: 11,
    STORE_NAME: 'Pizza School (Dev)',
    DESCRIPTION: '개발 환경'
  },
  '127': {  // 127.0.0.1의 경우
    OWNER_ID: 11,
    STORE_ID: 11,
    STORE_NAME: 'Pizza School (Dev)',
    DESCRIPTION: '개발 환경'
  }
};

// 현재 서브도메인의 설정 가져오기 (없으면 pizzaschool 기본값)
const currentConfig = SUBDOMAIN_CONFIG[subdomain] || SUBDOMAIN_CONFIG['pizzaschool'];

// 전역 변수로 export (기존 코드에서 사용 가능하도록)
const OWNER_ID = currentConfig.OWNER_ID;
const STORE_ID = currentConfig.STORE_ID;
const STORE_NAME = currentConfig.STORE_NAME;
const STORE_DESCRIPTION = currentConfig.DESCRIPTION;

console.log('🏪 [Config] 현재 서브도메인:', subdomain);
console.log('🏪 [Config] OWNER_ID:', OWNER_ID);
console.log('🏪 [Config] STORE_ID:', STORE_ID);
console.log('🏪 [Config] STORE_NAME:', STORE_NAME);


