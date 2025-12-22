-- ========================================
-- 🏪 7room.maejang.com 매장 설정 SQL
-- ========================================
-- 
-- 이 스크립트는 기존 pizzaschool 매장을 건드리지 않고
-- 새로운 7room 매장을 추가합니다.
--
-- 실행 방법:
-- 1. MySQL에 접속: mysql -u [username] -p [database_name]
-- 2. 이 파일 실행: source setup_7room_store.sql;
-- 
-- ⚠️ 주의사항:
-- - rlaxogns90@snu.ac.kr 유저가 이미 존재한다고 가정합니다
-- - 해당 유저의 ID를 확인 후 아래 @owner_user_id 값을 수정하세요
-- - 실제 운영 환경에서는 비밀번호를 반드시 변경하세요
-- ========================================

-- 1️⃣ 기존 rlaxogns90@snu.ac.kr 유저 확인
-- 만약 유저가 없다면 새로 생성합니다
SET @existing_user_id = (SELECT user_id FROM users WHERE email = 'rlaxogns90@snu.ac.kr' LIMIT 1);

-- 유저가 없으면 새로 생성 (OWNER 권한)
INSERT INTO users (email, password, name, phone, role, created_at)
SELECT 
    'rlaxogns90@snu.ac.kr',
    '$2a$10$YourHashedPasswordHere',  -- ⚠️ 실제 bcrypt 해시 비밀번호로 변경 필요
    '세븐룸 관리자',
    '010-0000-0000',
    'OWNER',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'rlaxogns90@snu.ac.kr'
);

-- 유저 ID 가져오기
SET @owner_user_id = (SELECT user_id FROM users WHERE email = 'rlaxogns90@snu.ac.kr' LIMIT 1);

SELECT CONCAT('✅ 사용자 ID: ', @owner_user_id) AS '확인';

-- 2️⃣ 세븐룸 매장 생성
INSERT INTO stores (
    user_id,
    store_name,
    address,
    description,
    picture,
    open_time,
    close_time,
    is_open,
    latitude,
    longitude,
    delivery_radius
) VALUES (
    @owner_user_id,
    '세븐룸',
    '서울시 강남구 테헤란로 123',  -- ⚠️ 실제 주소로 변경
    '맛있는 음식을 제공하는 세븐룸입니다',
    NULL,  -- 매장 이미지 URL (나중에 추가 가능)
    '10:00:00',
    '22:00:00',
    TRUE,
    37.5012743,  -- ⚠️ 실제 위도로 변경
    127.0396597, -- ⚠️ 실제 경도로 변경
    5.0  -- 배달 반경 5km
);

-- 생성된 매장 ID 확인
SET @store_id = LAST_INSERT_ID();
SELECT CONCAT('✅ 매장 ID: ', @store_id) AS '확인';

-- 3️⃣ 샘플 메뉴 추가 (선택사항)
-- 실제 메뉴는 관리자 페이지에서 추가하는 것을 권장합니다

INSERT INTO menus (user_id, menu_name, price, description, category, picture, is_available, created_at)
VALUES 
    (@owner_user_id, '치킨버거', 8500, '바삭한 치킨 패티가 들어간 버거', '버거', NULL, TRUE, NOW()),
    (@owner_user_id, '불고기버거', 9000, '한국식 불고기가 들어간 버거', '버거', NULL, TRUE, NOW()),
    (@owner_user_id, '감자튀김', 3000, '바삭한 감자튀김', '사이드', NULL, TRUE, NOW()),
    (@owner_user_id, '콜라', 2000, '시원한 콜라', '음료', NULL, TRUE, NOW());

SELECT CONCAT('✅ 샘플 메뉴 ', COUNT(*), '개 추가됨') AS '확인' 
FROM menus 
WHERE user_id = @owner_user_id;

-- 4️⃣ 최종 확인
SELECT '========================================' AS '';
SELECT '✅ 7room 매장 설정 완료!' AS '결과';
SELECT '========================================' AS '';
SELECT CONCAT('👤 사용자 ID: ', @owner_user_id) AS '정보';
SELECT CONCAT('🏪 매장 ID: ', @store_id) AS '정보';
SELECT '========================================' AS '';
SELECT '📝 다음 단계:' AS '';
SELECT '1. config.js에서 OWNER_ID와 STORE_ID를 위 값으로 업데이트' AS '할일';
SELECT '2. Caddy 재시작: sudo systemctl reload caddy' AS '할일';
SELECT '3. 7room.maejang.com 접속 테스트' AS '할일';
SELECT '========================================' AS '';

-- 5️⃣ config.js 업데이트를 위한 정보 출력
SELECT 
    CONCAT(
        '\n🔧 config.js 업데이트 정보:\n',
        '  ''7room'': {\n',
        '    OWNER_ID: ', @owner_user_id, ',\n',
        '    STORE_ID: ', @store_id, ',\n',
        '    STORE_NAME: ''세븐룸'',\n',
        '    DESCRIPTION: ''맛있는 음식을 만나보세요''\n',
        '  }\n'
    ) AS 'config.js_설정값';


