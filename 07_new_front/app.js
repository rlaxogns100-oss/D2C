/**
 * ============================================================================
 * MAEJANG D2C - NEW FRONTEND APP
 * Single Page Application with Real API Integration
 * ============================================================================
 */

// ========================================
// STATE MANAGEMENT
// ========================================
const AppState = {
  currentPage: 'page-splash',
  previousPage: null,
  isLoggedIn: false,
  user: null,
  cart: [],
  cartCount: 0,
  sliderIndex: 0,
  
  // 결제 관련
  orderTotal: 0,
  orderSubtotal: 0,
  pointsUsed: 0,
  finalPayment: 0,
  selectedAddressId: null,
  
  // 토스페이먼츠
  tossWidgets: null,
  
  // 카카오맵
  kakaoMap: null,
  storeMarker: null,
  customerMarker: null,
  
  // 매장 정보
  storeInfo: null
};

// ========================================
// MOCK DATA (API 실패 시 폴백용)
// ========================================
const MockData = {
  menus: [
    { id: 1, name: '크림 파스타', desc: '부드러운 크림 소스와 쫄깃한 면발', price: 12900, category: 'main', emoji: '🍝' },
    { id: 2, name: '매콤 불닭 볶음면', desc: '불타는 매운맛의 볶음면', price: 8900, category: 'main', emoji: '🍜' },
    { id: 3, name: '돈까스 정식', desc: '바삭한 돈까스와 특제 소스', price: 11900, category: 'main', emoji: '🥘' },
    { id: 4, name: '해물 짬뽕', desc: '얼큰한 국물과 신선한 해산물', price: 9900, category: 'main', emoji: '🍲' },
    { id: 5, name: '치즈 감자튀김', desc: '바삭한 감자에 치즈 듬뿍', price: 5900, category: 'side', emoji: '🍟' },
    { id: 6, name: '치킨 너겟', desc: '골든 브라운 치킨 너겟 6조각', price: 4900, category: 'side', emoji: '🍗' },
    { id: 7, name: '콜라', desc: '시원한 코카콜라 500ml', price: 2000, category: 'drink', emoji: '🥤' },
    { id: 8, name: '사이다', desc: '청량한 사이다 500ml', price: 2000, category: 'drink', emoji: '🧃' },
    { id: 9, name: '아메리카노', desc: '진한 에스프레소 아메리카노', price: 3500, category: 'drink', emoji: '☕' },
    { id: 10, name: '초코 케이크', desc: '진한 초콜릿 케이크 한 조각', price: 6500, category: 'dessert', emoji: '🍰' },
    { id: 11, name: '아이스크림', desc: '바닐라 아이스크림 2스쿱', price: 4500, category: 'dessert', emoji: '🍨' },
    { id: 12, name: '티라미수', desc: '클래식 이탈리안 티라미수', price: 7500, category: 'dessert', emoji: '🍮' }
  ],
  
  addresses: [],
  orders: { ongoing: [], completed: [] }
};

// 실제 메뉴 데이터 (API에서 로드)
let RealMenuData = null;

// ========================================
// NAVIGATION
// ========================================
function navigateTo(pageId) {
  // Hide splash if visible
  const splash = document.getElementById('page-splash');
  if (splash && splash.classList.contains('active')) {
    splash.classList.remove('active');
  }
  
  // Store previous page
  AppState.previousPage = AppState.currentPage;
  
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // Show target page
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
    AppState.currentPage = pageId;
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Initialize page-specific content
    initPageContent(pageId);
  }
}

function navigateFromHeader(pageId) {
  // Update header nav active state
  document.querySelectorAll('.header-nav .nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.page === pageId) {
      link.classList.add('active');
    }
  });
  
  navigateTo(pageId);
}

function navigateFromTab(pageId) {
  // Update tab active state
  document.querySelectorAll('.mobile-tabbar .tab-item').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.page === pageId) {
      tab.classList.add('active');
    }
  });
  
  navigateTo(pageId);
}

function goBack() {
  if (AppState.previousPage) {
    navigateTo(AppState.previousPage);
  } else {
    navigateTo('page-home');
  }
}

// ========================================
// PAGE INITIALIZATION
// ========================================
function initPageContent(pageId) {
  switch (pageId) {
    case 'page-delivery':
      renderMenuGrid();
      break;
    case 'page-cart':
      renderCartItems();
      break;
    case 'page-orders':
      renderOrders();
      break;
    case 'page-addresses':
      renderAddresses();
      break;
    case 'page-add-address':
      initAddressPage();
      break;
    case 'page-payment':
      initPaymentPage();
      break;
    case 'page-profile':
      updateProfilePage();
      break;
  }
}

// ========================================
// MENU GRID (API 연동)
// ========================================
async function renderMenuGrid(category = 'all') {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;
  
  // 로딩 표시
  grid.innerHTML = '<div class="loading-spinner">메뉴를 불러오는 중...</div>';
  
  // 적립률 가져오기
  const rewardRate = PointsApi?.getRewardRate() || 40;
  
  // 적립률 표시 업데이트
  const rewardRateDisplay = document.getElementById('reward-rate-display');
  if (rewardRateDisplay) {
    rewardRateDisplay.textContent = `${rewardRate}%`;
  }
  
  // 메뉴 데이터 가져오기
  let menus = [];
  
  try {
    if (!RealMenuData && window.MenuApi) {
      const result = await MenuApi.getList();
      if (result.success && result.data) {
        RealMenuData = result.data.map(menu => ({
          id: menu.menuId,
          name: menu.menuName,
          desc: menu.description || '',
          price: menu.price,
          category: menu.category?.toLowerCase() || 'main',
          emoji: getMenuEmoji(menu.category),
          picture: menu.picture
        }));
      }
    }
    
    menus = RealMenuData || MockData.menus;
  } catch (error) {
    console.error('메뉴 로드 실패, Mock 데이터 사용:', error);
    menus = MockData.menus;
  }
  
  // 카테고리 필터링
  if (category !== 'all') {
    menus = menus.filter(m => m.category === category);
  }
  
  if (menus.length === 0) {
    grid.innerHTML = '<p class="empty-message">메뉴가 없습니다.</p>';
    return;
  }
  
  grid.innerHTML = menus.map(menu => {
    const rewardAmount = Math.floor(menu.price * rewardRate / 100);
    const imageContent = menu.picture 
      ? `<img src="${menu.picture}" alt="${menu.name}" class="menu-card-img">`
      : `<span class="menu-card-emoji">${menu.emoji}</span>`;
    
    return `
      <div class="menu-card" onclick="openMenuDetail(${menu.id})">
        <div class="menu-card-image">${imageContent}</div>
        <div class="menu-card-content">
          <h4 class="menu-card-name">${menu.name}</h4>
          <p class="menu-card-desc">${menu.desc}</p>
          <div class="menu-card-footer">
            <div class="price-reward">
              <span class="menu-card-price">${menu.price.toLocaleString()}원</span>
              <span class="menu-card-reward">${rewardAmount.toLocaleString()}P 적립!</span>
            </div>
            <button class="add-btn" onclick="quickAddToCart(${menu.id}, event)">+</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  // 메뉴 개수 업데이트
  const countEl = document.querySelector('.section-header .count');
  if (countEl) {
    countEl.textContent = `(${menus.length})`;
  }
}

function getMenuEmoji(category) {
  const emojiMap = {
    'main': '🍽️',
    'side': '🍟',
    'drink': '🥤',
    'dessert': '🍰',
    'pizza': '🍕',
    'chicken': '🍗',
    'pasta': '🍝'
  };
  return emojiMap[category?.toLowerCase()] || '🍽️';
}

// ========================================
// CATEGORY TABS
// ========================================
function setupCategoryTabs() {
  const tabs = document.querySelectorAll('.category-tabs .tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderMenuGrid(tab.dataset.category);
    });
  });
}

// ========================================
// MENU DETAIL
// ========================================
function openMenuDetail(menuId) {
  const menus = RealMenuData || MockData.menus;
  const menu = menus.find(m => m.id === menuId);
  if (!menu) return;
  
  const rewardRate = PointsApi?.getRewardRate() || 40;
  
  const detailPage = document.getElementById('page-menu-detail');
  if (detailPage) {
    const heroPlaceholder = detailPage.querySelector('.hero-img-placeholder');
    if (heroPlaceholder) {
      if (menu.picture) {
        heroPlaceholder.innerHTML = `<img src="${menu.picture}" alt="${menu.name}" style="width:100%;height:100%;object-fit:cover;">`;
      } else {
        heroPlaceholder.textContent = menu.emoji;
      }
    }
    
    const menuName = detailPage.querySelector('.menu-name');
    if (menuName) menuName.textContent = menu.name;
    
    const menuDesc = detailPage.querySelector('.menu-description');
    if (menuDesc) menuDesc.textContent = menu.desc || '정성스럽게 준비한 특별한 메뉴입니다.';
    
    const priceValue = detailPage.querySelector('.price-value');
    if (priceValue) priceValue.textContent = `${menu.price.toLocaleString()}원`;
    
    const rewardAmount = Math.floor(menu.price * rewardRate / 100);
    const detailReward = document.getElementById('detail-reward');
    if (detailReward) detailReward.textContent = `${rewardAmount.toLocaleString()}P 적립!`;
    
    detailPage.dataset.menuId = menuId;
    detailPage.dataset.basePrice = menu.price;
    
    const qtyValue = detailPage.querySelector('.qty-value');
    if (qtyValue) qtyValue.textContent = '1';
  }
  
  navigateTo('page-menu-detail');
}

function quickAddToCart(menuId, event) {
  event.stopPropagation();
  
  const menus = RealMenuData || MockData.menus;
  const menu = menus.find(m => m.id === menuId);
  if (!menu) return;
  
  // CartApi 사용
  if (window.CartApi) {
    CartApi.addItem({
      menuId: menu.id,
      menuName: menu.name,
      price: menu.price,
      totalPrice: menu.price,
      quantity: 1,
      option: '기본',
      picture: menu.picture || null,
      emoji: menu.emoji,
      ownerId: window.OWNER_ID
    });
  }
  
  showToast(`${menu.name}이(가) 장바구니에 담겼습니다.`);
  updateCartBadge();
}

function addToCartAndNavigate() {
  const detailPage = document.getElementById('page-menu-detail');
  const menuId = parseInt(detailPage?.dataset.menuId);
  const menus = RealMenuData || MockData.menus;
  const menu = menus.find(m => m.id === menuId);
  
  if (!menu) {
    showToast('메뉴 정보를 찾을 수 없습니다.');
    return;
  }
  
  const quantity = parseInt(detailPage.querySelector('.qty-value')?.textContent || 1);
  const selectedOption = detailPage.querySelector('.option-btn.active')?.textContent || '기본';
  
  // 옵션 가격 계산
  let additionalPrice = 0;
  if (selectedOption.includes('+')) {
    const priceMatch = selectedOption.match(/\+(\d+,?\d*)/);
    if (priceMatch) {
      additionalPrice = parseInt(priceMatch[1].replace(',', ''));
    }
  }
  
  const itemPrice = menu.price + additionalPrice;
  
  if (window.CartApi) {
    CartApi.addItem({
      menuId: menu.id,
      menuName: menu.name,
      price: itemPrice,
      totalPrice: itemPrice * quantity,
      quantity: quantity,
      option: selectedOption.split('(')[0].trim(),
      picture: menu.picture || null,
      emoji: menu.emoji,
      ownerId: window.OWNER_ID
    });
  }
  
  showToast('장바구니에 담겼습니다.');
  updateCartBadge();
  setTimeout(() => navigateTo('page-cart'), 500);
}

// ========================================
// CART (API 연동)
// ========================================
function renderCartItems() {
  const container = document.getElementById('cart-items');
  if (!container) return;
  
  const cartItems = CartApi?.getAll() || [];
  
  if (cartItems.length === 0) {
    container.innerHTML = '<p class="empty-message">장바구니가 비어있습니다.</p>';
    updateOrderSummary(0);
    return;
  }
  
  container.innerHTML = cartItems.map(item => {
    const imageContent = item.picture 
      ? `<img src="${item.picture}" alt="${item.menuName}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`
      : (item.emoji || '🍽️');
    
    return `
      <div class="cart-item" data-id="${item.id}">
        <button class="cart-item-remove" onclick="removeCartItem(${item.id})">×</button>
        <div class="cart-item-image">${imageContent}</div>
        <div class="cart-item-info">
          <h4 class="cart-item-name">${item.menuName}</h4>
          <p class="cart-item-option">${item.option || '기본'}</p>
          <div class="cart-item-footer">
            <span class="cart-item-price">${item.totalPrice.toLocaleString()}원</span>
            <div class="cart-counter">
              <button class="cart-counter-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">−</button>
              <span class="cart-counter-value">${item.quantity}</span>
              <button class="cart-counter-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  updateOrderSummary();
  loadAddressForCart();
}

function updateCartQuantity(itemId, newQuantity) {
  if (newQuantity < 1) return;
  
  if (window.CartApi) {
    CartApi.updateQuantity(itemId, newQuantity);
  }
  
  renderCartItems();
  updateCartBadge();
}

function removeCartItem(itemId) {
  if (confirm('이 상품을 장바구니에서 삭제하시겠습니까?')) {
    if (window.CartApi) {
      CartApi.removeItem(itemId);
    }
    renderCartItems();
    updateCartBadge();
  }
}

function updateOrderSummary() {
  const cartItems = CartApi?.getAll() || [];
  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const delivery = subtotal > 0 ? 2500 : 0;
  const total = subtotal + delivery;
  
  const rewardRate = PointsApi?.getRewardRate() || 40;
  const rewardAmount = Math.floor(subtotal * rewardRate / 100);
  
  const subtotalEl = document.getElementById('cart-subtotal');
  if (subtotalEl) subtotalEl.textContent = `${subtotal.toLocaleString()}원`;
  
  const rewardEl = document.getElementById('cart-reward');
  if (rewardEl) rewardEl.textContent = `${rewardAmount.toLocaleString()}P (${rewardRate}%)`;
  
  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = `${total.toLocaleString()}원`;
  
  const checkoutBtn = document.querySelector('.checkout-section .btn');
  if (checkoutBtn) {
    checkoutBtn.textContent = `${total.toLocaleString()}원 결제하기`;
  }
  
  AppState.orderTotal = total;
  AppState.orderSubtotal = subtotal;
}

async function loadAddressForCart() {
  if (!AuthApi?.isLoggedIn()) {
    const addressLabel = document.querySelector('.address-label');
    const addressText = document.querySelector('.address-text');
    if (addressLabel) addressLabel.textContent = '';
    if (addressText) addressText.textContent = '로그인 후 주소를 선택해주세요';
    return;
  }
  
  try {
    const result = await AddressApi.getList();
    if (result.success && result.data && result.data.length > 0) {
      const addresses = result.data;
      MockData.addresses = addresses;
      
      // 기본 주소 또는 첫 번째 주소 선택
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      AppState.selectedAddressId = defaultAddr.addressId;
      
      const addressLabel = document.querySelector('.address-label');
      const addressText = document.querySelector('.address-text');
      if (addressLabel) addressLabel.textContent = defaultAddr.name || '배달';
      if (addressText) addressText.textContent = defaultAddr.address || '';
    }
  } catch (error) {
    console.error('주소 로드 실패:', error);
  }
}

function updateCartBadge() {
  const count = CartApi?.getCount() || 0;
  AppState.cartCount = count;
  
  document.querySelectorAll('.cart-badge, .tab-badge, .cart-tab-badge').forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
}

// ========================================
// ORDERS (API 연동)
// ========================================
async function renderOrders() {
  setupOrderTabs();
  await renderOngoingOrders();
}

async function renderOngoingOrders() {
  const container = document.getElementById('ongoing-orders');
  if (!container) return;
  
  container.innerHTML = '<div class="loading-spinner">주문 내역을 불러오는 중...</div>';
  
  try {
    if (AuthApi?.isLoggedIn()) {
      const result = await OrderApi.getList();
      if (result.success && result.data) {
        const orders = result.data;
        
        if (orders.length === 0) {
          container.innerHTML = '<p class="empty-message">주문 내역이 없습니다.</p>';
          return;
        }
        
        container.innerHTML = orders.map(order => `
          <div class="order-card">
            <div class="order-header">
              <div>
                <p class="order-id">주문번호: ${order.orderId}</p>
                <p class="order-date">${formatDate(order.createdAt)}</p>
              </div>
              <span class="order-status status-${order.orderStatus?.toLowerCase()}">${getStatusText(order.orderStatus)}</span>
            </div>
            <p class="order-items-preview">${order.items?.map(i => i.menuName).join(', ') || '주문 상품'}</p>
            <p class="order-total">${order.totalPrice?.toLocaleString() || 0}원</p>
          </div>
        `).join('');
        
        return;
      }
    }
  } catch (error) {
    console.error('주문 내역 로드 실패:', error);
  }
  
  container.innerHTML = '<p class="empty-message">로그인 후 주문 내역을 확인하세요.</p>';
}

function renderCompletedOrders() {
  const container = document.getElementById('completed-orders');
  if (!container) return;
  container.innerHTML = '<p class="empty-message">완료된 주문이 없습니다.</p>';
}

function getStatusText(status) {
  const statusMap = {
    'PENDING': '주문 접수',
    'CONFIRMED': '주문 확인',
    'PREPARING': '조리 중',
    'DELIVERING': '배달 중',
    'COMPLETED': '배달 완료',
    'CANCELLED': '취소됨'
  };
  return statusMap[status] || status || '처리 중';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
}

function setupOrderTabs() {
  const tabs = document.querySelectorAll('.order-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const ongoingList = document.getElementById('ongoing-orders');
      const completedList = document.getElementById('completed-orders');
      
      if (tab.dataset.tab === 'ongoing') {
        ongoingList?.classList.remove('hidden');
        completedList?.classList.add('hidden');
      } else {
        ongoingList?.classList.add('hidden');
        completedList?.classList.remove('hidden');
        renderCompletedOrders();
      }
    });
  });
}

// ========================================
// ADDRESSES (API 연동)
// ========================================
async function renderAddresses() {
  const container = document.getElementById('address-list');
  if (!container) return;
  
  container.innerHTML = '<div class="loading-spinner">주소를 불러오는 중...</div>';
  
  try {
    if (AuthApi?.isLoggedIn()) {
      const result = await AddressApi.getList();
      if (result.success && result.data) {
        const addresses = result.data;
        MockData.addresses = addresses;
        
        if (addresses.length === 0) {
          container.innerHTML = '<p class="empty-message">등록된 주소가 없습니다.</p>';
          return;
        }
        
        container.innerHTML = addresses.map(addr => `
          <div class="address-card ${addr.isDefault ? 'default' : ''}" data-id="${addr.addressId}">
            <div class="address-card-header">
              <div class="address-card-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span class="address-card-name">${addr.name || '배달 주소'}</span>
                ${addr.isDefault ? '<span class="default-badge">기본</span>' : ''}
              </div>
              <div class="address-card-actions">
                <button class="address-action-btn delete" onclick="deleteAddress(${addr.addressId})">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>
            <p class="address-card-text">${addr.address || ''}</p>
          </div>
        `).join('');
        
        return;
      }
    }
  } catch (error) {
    console.error('주소 로드 실패:', error);
  }
  
  container.innerHTML = '<p class="empty-message">로그인 후 주소를 관리하세요.</p>';
}

async function deleteAddress(addressId) {
  if (!confirm('이 주소를 삭제하시겠습니까?')) return;
  
  try {
    const result = await AddressApi.delete(addressId);
    if (result.success) {
      showToast('주소가 삭제되었습니다.');
      renderAddresses();
    } else {
      showToast(result.message || '주소 삭제에 실패했습니다.');
    }
  } catch (error) {
    showToast('주소 삭제 중 오류가 발생했습니다.');
  }
}

// ========================================
// ADD ADDRESS (카카오맵 연동)
// ========================================
function initAddressPage() {
  // 로그인 체크
  if (!AuthApi?.isLoggedIn()) {
    showToast('로그인이 필요합니다.');
    navigateTo('page-login');
    return;
  }
  
  // 카카오맵 초기화
  initKakaoMap();
  
  // 라벨 버튼 설정
  setupAddressLabels();
}

function initKakaoMap() {
  const mapContainer = document.getElementById('kakao-map');
  if (!mapContainer || !window.kakao?.maps) {
    console.warn('카카오맵 SDK가 로드되지 않았습니다.');
    return;
  }
  
  // 가게 위치 (기본값 또는 API에서 가져온 값)
  const storeLocation = {
    lat: AppState.storeInfo?.latitude || 37.5012743,
    lng: AppState.storeInfo?.longitude || 127.0396597
  };
  
  const mapOption = {
    center: new kakao.maps.LatLng(storeLocation.lat, storeLocation.lng),
    level: 4
  };
  
  AppState.kakaoMap = new kakao.maps.Map(mapContainer, mapOption);
  
  // 가게 마커 추가
  AppState.storeMarker = new kakao.maps.Marker({
    position: new kakao.maps.LatLng(storeLocation.lat, storeLocation.lng),
    map: AppState.kakaoMap
  });
  
  const storeInfoWindow = new kakao.maps.InfoWindow({
    content: '<div style="padding:5px;font-size:12px;color:#FF6B35;font-weight:600;">🏪 가게 위치</div>'
  });
  storeInfoWindow.open(AppState.kakaoMap, AppState.storeMarker);
}

function openAddressSearch() {
  new daum.Postcode({
    oncomplete: function(data) {
      const roadAddr = data.roadAddress;
      const zonecode = data.zonecode;
      
      document.getElementById('street-address').value = roadAddr;
      document.getElementById('address-postcode').value = zonecode;
      
      // 주소 미리보기
      const preview = document.getElementById('address-preview');
      const previewText = document.getElementById('address-preview-text');
      if (preview && previewText) {
        preview.style.display = 'flex';
        previewText.textContent = roadAddr;
      }
      
      // 좌표 변환
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.addressSearch(roadAddr, function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
          const lat = result[0].y;
          const lng = result[0].x;
          
          document.getElementById('address-lat').value = lat;
          document.getElementById('address-lng').value = lng;
          
          // 지도에 마커 추가
          const coords = new kakao.maps.LatLng(lat, lng);
          
          if (AppState.customerMarker) {
            AppState.customerMarker.setMap(null);
          }
          
          AppState.customerMarker = new kakao.maps.Marker({
            position: coords,
            map: AppState.kakaoMap
          });
          
          const customerInfoWindow = new kakao.maps.InfoWindow({
            content: '<div style="padding:5px;font-size:12px;color:#4A90E2;font-weight:600;">📍 배달 주소</div>'
          });
          customerInfoWindow.open(AppState.kakaoMap, AppState.customerMarker);
          
          // 두 마커가 보이도록 지도 범위 조정
          const bounds = new kakao.maps.LatLngBounds();
          const storeLocation = {
            lat: AppState.storeInfo?.latitude || 37.5012743,
            lng: AppState.storeInfo?.longitude || 127.0396597
          };
          bounds.extend(new kakao.maps.LatLng(storeLocation.lat, storeLocation.lng));
          bounds.extend(coords);
          AppState.kakaoMap.setBounds(bounds);
          
          // 배달 가능 여부 체크
          checkDeliveryAvailability(parseFloat(lat), parseFloat(lng));
        }
      });
    }
  }).open();
}

async function checkDeliveryAvailability(lat, lng) {
  const resultEl = document.getElementById('delivery-check-result');
  if (!resultEl) return;
  
  try {
    if (window.StoreApi) {
      const result = await StoreApi.checkDelivery(lat, lng);
      
      resultEl.style.display = 'flex';
      
      if (result.isAvailable) {
        resultEl.className = 'delivery-check-result available';
        resultEl.innerHTML = `
          <span class="icon">✅</span>
          <span class="text">배달 가능 지역입니다 (${result.distance}km)</span>
        `;
      } else {
        resultEl.className = 'delivery-check-result unavailable';
        resultEl.innerHTML = `
          <span class="icon">⚠️</span>
          <span class="text">배달 권역 밖입니다 (${result.distance}km / 최대 ${result.maxRadius}km)</span>
        `;
      }
    }
  } catch (error) {
    console.error('배달 가능 여부 확인 실패:', error);
  }
}

function setupAddressLabels() {
  const labelBtns = document.querySelectorAll('#address-labels .label-btn');
  const customInput = document.getElementById('custom-label');
  
  labelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      labelBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      if (btn.dataset.label === '기타') {
        customInput.style.display = 'block';
        customInput.required = true;
      } else {
        customInput.style.display = 'none';
        customInput.required = false;
      }
    });
  });
}

async function submitAddress(event) {
  event.preventDefault();
  
  const street = document.getElementById('street-address').value.trim();
  const detail = document.getElementById('detail-address').value.trim();
  const lat = document.getElementById('address-lat').value;
  const lng = document.getElementById('address-lng').value;
  
  if (!lat || !lng) {
    showToast('주소 검색 버튼을 클릭하여 주소를 선택해주세요.');
    return;
  }
  
  // 선택된 라벨
  const activeLabel = document.querySelector('#address-labels .label-btn.active');
  let label = activeLabel?.dataset.label || '배달';
  
  if (label === '기타') {
    label = document.getElementById('custom-label').value.trim() || '기타';
  }
  
  const addressData = {
    name: label,
    address: detail ? `${street}, ${detail}` : street,
    latitude: parseFloat(lat),
    longitude: parseFloat(lng)
  };
  
  try {
    const result = await AddressApi.create(addressData);
    
    if (result.success) {
      showToast('주소가 저장되었습니다!');
      navigateTo('page-addresses');
    } else if (result.error === 'AUTH_ERROR') {
      showToast('로그인이 필요합니다.');
      navigateTo('page-login');
    } else {
      showToast(result.message || '주소 저장에 실패했습니다.');
    }
  } catch (error) {
    console.error('주소 저장 실패:', error);
    showToast('주소 저장 중 오류가 발생했습니다.');
  }
}

// ========================================
// PAYMENT (토스페이먼츠 연동)
// ========================================
async function initPaymentPage() {
  // 로그인 체크
  if (!AuthApi?.isLoggedIn()) {
    showToast('로그인이 필요합니다.');
    navigateTo('page-login');
    return;
  }
  
  // 장바구니 확인
  const cartItems = CartApi?.getAll() || [];
  if (cartItems.length === 0) {
    showToast('장바구니가 비어있습니다.');
    navigateTo('page-delivery');
    return;
  }
  
  // 금액 계산
  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const delivery = 2500;
  const total = subtotal + delivery;
  
  AppState.orderTotal = total;
  AppState.orderSubtotal = subtotal;
  AppState.finalPayment = total;
  
  // 금액 표시 업데이트
  const paymentTotal = document.getElementById('payment-total');
  if (paymentTotal) paymentTotal.textContent = `${total.toLocaleString()}원`;
  
  const originalAmount = document.getElementById('original-amount');
  if (originalAmount) originalAmount.textContent = `${total.toLocaleString()}원`;
  
  const finalAmount = document.getElementById('final-amount');
  if (finalAmount) finalAmount.textContent = `${total.toLocaleString()}원`;
  
  // 포인트 표시
  const availablePoints = PointsApi?.getAvailablePoints() || 0;
  const availableEl = document.getElementById('available-points');
  if (availableEl) availableEl.textContent = `${availablePoints.toLocaleString()}P`;
  
  // 포인트 input 최대값 설정
  const pointInput = document.getElementById('point-amount');
  if (pointInput) pointInput.max = availablePoints;
  
  // 토스페이먼츠 위젯 초기화
  initTossPayments(total);
}

async function initTossPayments(amount) {
  const widgetContainer = document.getElementById('payment-method-widget');
  
  try {
    // 토스페이먼츠 테스트 키 (실제 배포 시 실제 키로 변경)
    const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
    const customerKey = 'CUSTOMER_' + Date.now();
    
    if (typeof TossPayments === 'undefined') {
      widgetContainer.innerHTML = '<p style="text-align:center;color:#888;">결제 위젯을 로드할 수 없습니다.</p>';
      return;
    }
    
    const tossPayments = TossPayments(clientKey);
    const widgets = tossPayments.widgets({ customerKey });
    
    await widgets.setAmount({
      currency: "KRW",
      value: amount
    });
    
    await widgets.renderPaymentMethods({
      selector: "#payment-method-widget",
      variantKey: "DEFAULT"
    });
    
    await widgets.renderAgreement({
      selector: "#agreement-widget",
      variantKey: "AGREEMENT"
    });
    
    AppState.tossWidgets = widgets;
    
  } catch (error) {
    console.error('토스페이먼츠 초기화 실패:', error);
    widgetContainer.innerHTML = `
      <p style="text-align:center;color:#888;">
        결제 위젯 초기화 실패<br>
        <small>(${error.message})</small>
      </p>
    `;
  }
}

function togglePointUsage() {
  const checkbox = document.getElementById('use-points');
  const details = document.getElementById('point-details');
  
  if (checkbox && details) {
    if (checkbox.checked) {
      details.style.display = 'block';
      updatePointUsage();
    } else {
      details.style.display = 'none';
      resetPointUsage();
    }
  }
}

function updatePointUsage() {
  const pointInput = document.getElementById('point-amount');
  const availablePoints = PointsApi?.getAvailablePoints() || 0;
  const orderTotal = AppState.orderTotal || 0;
  const minPayment = 5000;
  
  let pointsToUse = parseInt(pointInput?.value || 0);
  
  // 최대 사용 가능 포인트 (최소 결제금액 보장)
  const maxUsable = Math.min(availablePoints, orderTotal - minPayment);
  if (pointsToUse > maxUsable) {
    pointsToUse = Math.max(0, maxUsable);
    if (pointInput) pointInput.value = pointsToUse;
  }
  if (pointsToUse < 0) pointsToUse = 0;
  
  const finalAmount = orderTotal - pointsToUse;
  
  // 표시 업데이트
  const originalAmountEl = document.getElementById('original-amount');
  const pointDiscountEl = document.getElementById('point-discount');
  const finalAmountEl = document.getElementById('final-amount');
  const paymentTotalEl = document.getElementById('payment-total');
  
  if (originalAmountEl) originalAmountEl.textContent = `${orderTotal.toLocaleString()}원`;
  if (pointDiscountEl) pointDiscountEl.textContent = `-${pointsToUse.toLocaleString()}P`;
  if (finalAmountEl) finalAmountEl.textContent = `${finalAmount.toLocaleString()}원`;
  if (paymentTotalEl) paymentTotalEl.textContent = `${finalAmount.toLocaleString()}원`;
  
  AppState.pointsUsed = pointsToUse;
  AppState.finalPayment = finalAmount;
  
  // 토스위젯 금액 업데이트
  if (AppState.tossWidgets && finalAmount > 0) {
    AppState.tossWidgets.setAmount({
      currency: "KRW",
      value: finalAmount
    });
  }
}

function useAllPoints() {
  const availablePoints = PointsApi?.getAvailablePoints() || 0;
  const orderTotal = AppState.orderTotal || 0;
  const minPayment = 5000;
  
  const maxUsable = Math.min(availablePoints, orderTotal - minPayment);
  
  const pointInput = document.getElementById('point-amount');
  if (pointInput) {
    pointInput.value = Math.max(0, maxUsable);
    updatePointUsage();
  }
}

function resetPointUsage() {
  const pointInput = document.getElementById('point-amount');
  if (pointInput) pointInput.value = 0;
  
  const orderTotal = AppState.orderTotal || 0;
  const paymentTotalEl = document.getElementById('payment-total');
  if (paymentTotalEl) paymentTotalEl.textContent = `${orderTotal.toLocaleString()}원`;
  
  AppState.pointsUsed = 0;
  AppState.finalPayment = orderTotal;
}

async function submitPayment() {
  const cartItems = CartApi?.getAll() || [];
  
  if (cartItems.length === 0) {
    showToast('장바구니가 비어있습니다.');
    return;
  }
  
  if (!AppState.selectedAddressId) {
    showToast('배달 주소를 선택해주세요.');
    navigateTo('page-addresses');
    return;
  }
  
  const submitBtn = document.getElementById('payment-submit-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = '결제 처리 중...';
  }
  
  try {
    // 1. 주문 생성
    const orderData = {
      addressId: AppState.selectedAddressId,
      request: '',
      items: cartItems.map(item => ({
        menuId: item.menuId,
        option: item.option || null,
        count: item.quantity
      }))
    };
    
    console.log('📦 주문 생성:', orderData);
    
    // 주문 생성 API 호출
    const orderResult = await OrderApi.create(orderData);
    
    if (!orderResult.success) {
      throw new Error(orderResult.message || '주문 생성에 실패했습니다.');
    }
    
    const orderId = orderResult.data?.orderId;
    console.log('✅ 주문 생성 완료:', orderId);
    
    // 2. 토스페이먼츠 결제 요청
    if (AppState.tossWidgets && AppState.finalPayment > 0) {
      await AppState.tossWidgets.requestPayment({
        orderId: PaymentUtils.generateOrderId(),
        orderName: `매장직결 주문 (${cartItems.length}개)`,
        successUrl: window.location.origin + '/07_new_front/payment_success.html?orderId=' + orderId,
        failUrl: window.location.origin + '/07_new_front/payment_fail.html',
        customerEmail: AppState.user?.email || 'customer@example.com',
        customerName: AppState.user?.name || '고객'
      });
    } else {
      // 포인트로 전액 결제한 경우
      handlePaymentSuccess(orderId);
    }
    
  } catch (error) {
    console.error('결제 실패:', error);
    showToast('결제 처리 중 오류가 발생했습니다: ' + error.message);
    
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = '결제하기';
    }
  }
}

function handlePaymentSuccess(orderId) {
  // 포인트 차감
  if (AppState.pointsUsed > 0) {
    const currentPoints = PointsApi?.getAvailablePoints() || 0;
    PointsApi?.setPoints(currentPoints - AppState.pointsUsed);
  }
  
  // 적립금 지급
  const rewardRate = PointsApi?.getRewardRate() || 40;
  const earnedPoints = Math.floor(AppState.orderSubtotal * rewardRate / 100);
  const currentPoints = PointsApi?.getAvailablePoints() || 0;
  PointsApi?.setPoints(currentPoints + earnedPoints);
  
  // 장바구니 비우기
  CartApi?.clear();
  updateCartBadge();
  
  showToast(`주문이 완료되었습니다! ${earnedPoints.toLocaleString()}P 적립`);
  
  setTimeout(() => navigateTo('page-orders'), 1500);
}

function copyBankAccount() {
  const account = document.getElementById('bank-account')?.textContent || '';
  navigator.clipboard.writeText(account).then(() => {
    showToast('계좌번호가 복사되었습니다.');
  }).catch(() => {
    showToast('복사에 실패했습니다.');
  });
}

// ========================================
// PROFILE PAGE
// ========================================
function updateProfilePage() {
  const nameEl = document.querySelector('.profile-name');
  const emailEl = document.querySelector('.profile-email');
  const loginMenuItem = document.querySelector('.profile-menu-item:last-child span');
  
  if (AuthApi?.isLoggedIn() && AppState.user) {
    if (nameEl) nameEl.textContent = AppState.user.name || '회원';
    if (emailEl) emailEl.textContent = AppState.user.email || '';
    if (loginMenuItem) loginMenuItem.textContent = '로그아웃';
  } else {
    if (nameEl) nameEl.textContent = '게스트';
    if (emailEl) emailEl.textContent = '로그인이 필요합니다';
    if (loginMenuItem) loginMenuItem.textContent = '로그인';
  }
}

// ========================================
// AUTH FORMS (API 연동)
// ========================================
function setupAuthForms() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '로그인 중...';
      }
      
      try {
        const result = await AuthApi.login(email, password);
        
        if (result.success) {
          AppState.isLoggedIn = true;
          AppState.user = result.data?.user || { email };
          localStorage.setItem('user', JSON.stringify(AppState.user));
          
          showToast('로그인 되었습니다.');
          setTimeout(() => navigateTo('page-home'), 500);
        } else {
          showToast(result.message || '로그인에 실패했습니다.');
        }
      } catch (error) {
        showToast('로그인 중 오류가 발생했습니다.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = '로그인';
        }
      }
    });
  }
  
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const passwordConfirm = document.getElementById('signup-password-confirm').value;
      
      if (password !== passwordConfirm) {
        showToast('비밀번호가 일치하지 않습니다.');
        return;
      }
      
      if (password.length < 6) {
        showToast('비밀번호는 6자 이상이어야 합니다.');
        return;
      }
      
      const submitBtn = signupForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '가입 중...';
      }
      
      try {
        const result = await AuthApi.signup({ name, email, password });
        
        if (result.success) {
          showToast('회원가입이 완료되었습니다.');
          setTimeout(() => navigateTo('page-login'), 500);
        } else {
          showToast(result.message || '회원가입에 실패했습니다.');
        }
      } catch (error) {
        showToast('회원가입 중 오류가 발생했습니다.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = '회원가입';
        }
      }
    });
  }
}

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
}

// ========================================
// HERO SLIDER
// ========================================
const sliderSlides = [
  { bg: 'linear-gradient(135deg, #8B1538 0%, #C41E3A 100%)', emoji: '🍗', subtitle: 'SPECIAL MENU', title: '신선한 재료로<br>만든 특별한 맛', desc: '매장직결만의 레시피로 정성껏 준비했습니다' },
  { bg: 'linear-gradient(135deg, #2C3E50 0%, #3498DB 100%)', emoji: '🍜', subtitle: 'BEST SELLER', title: '매콤하고 얼큰한<br>면 요리의 정석', desc: '불맛 가득한 볶음면과 짬뽕' },
  { bg: 'linear-gradient(135deg, #1E5631 0%, #2ECC71 100%)', emoji: '🥗', subtitle: 'HEALTHY', title: '건강하게 먹는<br>신선한 샐러드', desc: '매일 아침 준비하는 신선한 채소' }
];

function updateSlider() {
  const slider = document.querySelector('.hero-slider');
  if (!slider) return;
  
  const slide = slider.querySelector('.hero-slide');
  if (slide) {
    const currentData = sliderSlides[AppState.sliderIndex];
    slide.style.background = currentData.bg;
    const emoji = slide.querySelector('.hero-food-emoji');
    if (emoji) emoji.textContent = currentData.emoji;
    const subtitle = slide.querySelector('.hero-subtitle');
    if (subtitle) subtitle.textContent = currentData.subtitle;
    const title = slide.querySelector('.hero-title');
    if (title) title.innerHTML = currentData.title;
    const desc = slide.querySelector('.hero-desc');
    if (desc) desc.textContent = currentData.desc;
  }
  
  const dots = slider.querySelectorAll('.dot');
  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === AppState.sliderIndex);
  });
}

function nextSlide() {
  AppState.sliderIndex = (AppState.sliderIndex + 1) % sliderSlides.length;
  updateSlider();
}

function prevSlide() {
  AppState.sliderIndex = (AppState.sliderIndex - 1 + sliderSlides.length) % sliderSlides.length;
  updateSlider();
}

function setupSlider() {
  setInterval(nextSlide, 5000);
  
  const dots = document.querySelectorAll('.slider-dots .dot');
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      AppState.sliderIndex = idx;
      updateSlider();
    });
  });
}

// ========================================
// QUANTITY CONTROLS
// ========================================
function setupQuantityControls() {
  const minusBtn = document.querySelector('.qty-btn.minus');
  const plusBtn = document.querySelector('.qty-btn.plus');
  const qtyValue = document.querySelector('.qty-value');
  const priceValue = document.querySelector('.price-value');
  const detailReward = document.getElementById('detail-reward');
  
  if (!minusBtn || !plusBtn) return;
  
  const rewardRate = PointsApi?.getRewardRate() || 40;
  
  function updatePriceAndReward() {
    const detailPage = document.getElementById('page-menu-detail');
    const basePrice = parseInt(detailPage?.dataset.basePrice || 8900);
    const quantity = parseInt(qtyValue?.textContent || 1);
    const totalPrice = basePrice * quantity;
    const rewardAmount = Math.floor(totalPrice * rewardRate / 100);
    
    if (priceValue) priceValue.textContent = `${totalPrice.toLocaleString()}원`;
    if (detailReward) detailReward.textContent = `${rewardAmount.toLocaleString()}P 적립!`;
  }
  
  minusBtn.addEventListener('click', () => {
    let quantity = parseInt(qtyValue.textContent || 1);
    if (quantity > 1) {
      quantity--;
      qtyValue.textContent = quantity;
      updatePriceAndReward();
    }
  });
  
  plusBtn.addEventListener('click', () => {
    let quantity = parseInt(qtyValue.textContent || 1);
    quantity++;
    qtyValue.textContent = quantity;
    updatePriceAndReward();
  });
}

// ========================================
// OPTION BUTTONS
// ========================================
function setupOptionButtons() {
  const optionBtns = document.querySelectorAll('.option-btn');
  optionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      optionBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// ========================================
// TOAST NOTIFICATION
// ========================================
function showToast(message, duration = 2500) {
  const existingToast = document.querySelector('.toast');
  if (existingToast) existingToast.remove();
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 9999;
    animation: toastIn 0.3s ease;
    max-width: 80%;
    text-align: center;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Toast animation styles
const toastStyles = document.createElement('style');
toastStyles.textContent = `
  @keyframes toastIn {
    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  @keyframes toastOut {
    from { opacity: 1; transform: translateX(-50%) translateY(0); }
    to { opacity: 0; transform: translateX(-50%) translateY(20px); }
  }
`;
document.head.appendChild(toastStyles);

// ========================================
// SPLASH SCREEN & INITIALIZATION
// ========================================
async function initSplash() {
  try {
    // API 초기화 (매장 정보 로드 대기)
    if (window.STORE_CONFIG_LOADED) {
      await window.STORE_CONFIG_LOADED;
      
      // 매장 정보 저장
      if (window.STORE_INFO) {
        AppState.storeInfo = window.STORE_INFO;
        
        // 매장명 업데이트
        const storeTitle = document.querySelector('.store-title');
        if (storeTitle && window.STORE_NAME) {
          storeTitle.textContent = window.STORE_NAME;
        }
      }
    }
    
    // 로그인 상태 복원
    const savedUser = localStorage.getItem('user');
    if (savedUser && AuthToken?.exists()) {
      AppState.user = JSON.parse(savedUser);
      AppState.isLoggedIn = true;
    }
    
    // 장바구니 카운트 업데이트
    updateCartBadge();
    
  } catch (error) {
    console.error('초기화 실패:', error);
  }
  
  // 스플래시 숨기기
  setTimeout(() => {
    const splash = document.getElementById('page-splash');
    if (splash) {
      splash.style.opacity = '0';
      splash.style.transition = 'opacity 0.5s ease';
      
      setTimeout(() => {
        splash.classList.remove('active');
        splash.style.display = 'none';
        navigateTo('page-home');
      }, 500);
    }
  }, 2000);
}

// ========================================
// MAIN INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  // 스플래시 & API 초기화
  initSplash();
  
  // 이벤트 리스너 설정
  setupCategoryTabs();
  setupSlider();
  setupQuantityControls();
  setupOptionButtons();
  setupAuthForms();
});

// ========================================
// GLOBAL EXPORTS
// ========================================
window.navigateTo = navigateTo;
window.navigateFromHeader = navigateFromHeader;
window.navigateFromTab = navigateFromTab;
window.goBack = goBack;
window.openMenuDetail = openMenuDetail;
window.quickAddToCart = quickAddToCart;
window.addToCartAndNavigate = addToCartAndNavigate;
window.updateCartQuantity = updateCartQuantity;
window.removeCartItem = removeCartItem;
window.deleteAddress = deleteAddress;
window.submitAddress = submitAddress;
window.openAddressSearch = openAddressSearch;
window.submitPayment = submitPayment;
window.copyBankAccount = copyBankAccount;
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.togglePassword = togglePassword;
window.togglePointUsage = togglePointUsage;
window.updatePointUsage = updatePointUsage;
window.useAllPoints = useAllPoints;
window.handlePaymentSuccess = handlePaymentSuccess;
