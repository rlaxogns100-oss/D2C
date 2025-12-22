-- ============================================
-- 멀티 서브도메인 지원을 위한 DB 스키마 변경
-- ============================================
-- 실행 방법:
-- mysql -h [RDS주소] -u admin -p
-- USE maejang-db;
-- source db_migration_subdomain.sql;
-- ============================================

-- 1. stores 테이블에 subdomain 컬럼 추가
ALTER TABLE stores 
ADD COLUMN subdomain VARCHAR(50) UNIQUE COMMENT '서브도메인 (예: pizzaschool)';

-- 2. 기존 pizzaschool 매장에 subdomain 설정
UPDATE stores 
SET subdomain = 'pizzaschool' 
WHERE user_id = 11;

-- 3. 인덱스 생성 (성능 최적화)
CREATE INDEX idx_stores_subdomain ON stores(subdomain);

-- 4. 확인
SELECT 
    store_id,
    user_id,
    store_name,
    subdomain,
    is_open
FROM stores;

-- 완료!
SELECT '✅ 스키마 변경 완료!' AS result;

