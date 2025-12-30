/**
 * MAEJANG D2C - OWNER DASHBOARD APP
 * Single Page Application for Store Management
 */

// ========================================
// STATE MANAGEMENT
// ========================================
const AppState = {
  currentPage: 'page-splash',
  previousPage: null,
  isLoggedIn: false,
  isShopOpen: false,
  currentOrderTab: 'new'
};

// ========================================
// MOCK DATA
// ========================================
const MockData = {
  menus: [
    { id: 1, name: '크림 파스타', price: 12900, category: 'main', emoji: '🍝', description: '부드러운 크림 소스와 쫄깃한 면발' },
    { id: 2, name: '매콤 불닭 볶음면', price: 8900, category: 'main', emoji: '🍜', description: '불타는 매운맛의 볶음면' },
    { id: 3, name: '돈까스 정식', price: 11900, category: 'main', emoji: '🥘', description: '바삭한 돈까스와 특제 소스' },
    { id: 4, name: '해물 짬뽕', price: 9900, category: 'main', emoji: '🍲', description: '얼큰한 국물과 신선한 해산물' },
    { id: 5, name: '치즈 감자튀김', price: 5900, category: 'side', emoji: '🍟', description: '바삭한 감자에 치즈 듬뿍' },
    { id: 6, name: '치킨 너겟', price: 4900, category: 'side', emoji: '🍗', description: '골든 브라운 치킨 너겟 6조각' },
    { id: 7, name: '콜라', price: 2000, category: 'drink', emoji: '🥤', description: '시원한 코카콜라 500ml' },
    { id: 8, name: '아메리카노', price: 3500, category: 'drink', emoji: '☕', description: '진한 에스프레소 아메리카노' }
  ],
  
  orders: {
    new: [
      { id: 1001, time: '2분 전', status: 'new', customer: '김철수', phone: '010-****-1234', total: 32700, request: '덜 맵게 해주세요', items: '매콤 불닭 볶음면 외 1개' },
      { id: 1002, time: '5분 전', status: 'new', customer: '이영희', phone: '010-****-5678', total: 15900, request: '', items: '크림 파스타' },
      { id: 1003, time: '8분 전', status: 'new', customer: '박민수', phone: '010-****-9012', total: 24800, request: '젓가락 추가 부탁드립니다', items: '돈까스 정식 외 2개' }
    ],
    cooking: [
      { id: 1000, time: '12분 전', status: 'cooking', customer: '정수진', phone: '010-****-3456', total: 19800, request: '', items: '해물 짬뽕 외 1개' }
    ],
    done: [
      { id: 999, time: '30분 전', status: 'delivered', customer: '최지훈', phone: '010-****-7890', total: 27300, items: '크림 파스타 외 2개' },
      { id: 998, time: '45분 전', status: 'delivered', customer: '강민지', phone: '010-****-2345', total: 12900, items: '크림 파스타' }
    ]
  },
  
  categories: ['전체', '메인', '사이드', '음료', '디저트'],
  
  promos: [
    { id: 1, emoji: '🎉', title: '첫 주문 3,000원 할인', desc: '신규 가입 고객님께 드리는 특별 혜택', badge: 'EVENT', color1: '#FF6B35', color2: '#F7931E' },
    { id: 2, emoji: '🍜', title: '신메뉴 출시', desc: '매콤 불닭 볶음면이 새롭게 출시되었습니다', badge: 'NEW', color1: '#6B5B95', color2: '#88B04B' },
    { id: 3, emoji: '⏰', title: '영업시간 안내', desc: '매일 오전 11시 ~ 밤 10시 운영', badge: 'INFO', color1: '#45B7D1', color2: '#96CEB4' }
  ]
};

// ========================================
// NAVIGATION
// ========================================
function navigateTo(pageId) {
  // Hide splash if visible
  const splash = document.getElementById('page-splash');
  if (splash && splash.classList.contains('active')) {
    splash.classList.remove('active');
  }
  
  AppState.previousPage = AppState.currentPage;
  
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
    AppState.currentPage = pageId;
    window.scrollTo(0, 0);
    initPageContent(pageId);
  }
}

function navigateFromHeader(pageId) {
  document.querySelectorAll('.header-nav .nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.page === pageId) {
      link.classList.add('active');
    }
  });
  navigateTo(pageId);
}

function navigateFromTab(pageId) {
  document.querySelectorAll('.mobile-tabbar .tab-item').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.page === pageId) {
      tab.classList.add('active');
    }
  });
  navigateTo(pageId);
}

// ========================================
// PAGE INITIALIZATION
// ========================================
function initPageContent(pageId) {
  switch (pageId) {
    case 'page-dashboard':
      renderRecentOrders();
      break;
    case 'page-orders':
      renderOrdersList();
      break;
    case 'page-menus':
      renderMenuGrid();
      break;
    case 'page-promo-edit':
      renderPromoList();
      break;
  }
}

// ========================================
// SHOP STATUS
// ========================================
function toggleShopStatus() {
  AppState.isShopOpen = !AppState.isShopOpen;
  
  const toggle = document.getElementById('statusToggle');
  const icon = document.getElementById('statusIcon');
  const text = document.getElementById('statusText');
  const headerStatus = document.getElementById('header-shop-status');
  
  if (AppState.isShopOpen) {
    toggle.textContent = '영업 종료';
    toggle.classList.remove('closed');
    toggle.classList.add('open');
    icon.textContent = '🟢';
    text.textContent = '현재 영업 중';
    
    if (headerStatus) {
      headerStatus.querySelector('.status-dot').classList.remove('closed');
      headerStatus.querySelector('.status-dot').classList.add('open');
      headerStatus.querySelector('.status-text').textContent = '영업 중';
    }
    
    showToast('영업을 시작했습니다!');
  } else {
    toggle.textContent = '영업 시작';
    toggle.classList.remove('open');
    toggle.classList.add('closed');
    icon.textContent = '🔴';
    text.textContent = '현재 영업 종료';
    
    if (headerStatus) {
      headerStatus.querySelector('.status-dot').classList.remove('open');
      headerStatus.querySelector('.status-dot').classList.add('closed');
      headerStatus.querySelector('.status-text').textContent = '영업 종료';
    }
    
    showToast('영업을 종료했습니다.');
  }
}

// ========================================
// ORDERS
// ========================================
function renderRecentOrders() {
  const container = document.getElementById('recent-orders-list');
  if (!container) return;
  
  const recentOrders = [...MockData.orders.new, ...MockData.orders.cooking].slice(0, 3);
  
  if (recentOrders.length === 0) {
    container.innerHTML = '<p class="empty-text">새 주문이 없습니다</p>';
    return;
  }
  
  container.innerHTML = recentOrders.map(order => createOrderCard(order, true)).join('');
}

function renderOrdersList() {
  const container = document.getElementById('orders-list');
  if (!container) return;
  
  let orders = [];
  switch (AppState.currentOrderTab) {
    case 'new':
      orders = MockData.orders.new;
      break;
    case 'cooking':
      orders = MockData.orders.cooking;
      break;
    case 'done':
      orders = MockData.orders.done;
      break;
  }
  
  // Update counts
  document.getElementById('count-new').textContent = MockData.orders.new.length;
  document.getElementById('count-cooking').textContent = MockData.orders.cooking.length;
  document.getElementById('count-done').textContent = MockData.orders.done.length;
  
  if (orders.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 24px; color: var(--text-muted);">
        <p style="font-size: 3rem; margin-bottom: 16px;">📋</p>
        <p>주문이 없습니다</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = orders.map(order => createOrderCard(order)).join('');
}

function createOrderCard(order, compact = false) {
  const statusText = getStatusText(order.status);
  const statusClass = getStatusClass(order.status);
  
  if (compact) {
    return `
      <div class="order-card" onclick="navigateTo('page-orders')">
        <div class="order-card-header">
          <div>
            <div class="order-id">#${order.id}</div>
            <div class="order-time">${order.time}</div>
          </div>
          <span class="order-status ${statusClass}">${statusText}</span>
        </div>
        <div class="order-total">${order.total.toLocaleString()}원</div>
      </div>
    `;
  }
  
  const showActions = order.status === 'new' || order.status === 'cooking';
  
  return `
    <div class="order-card">
      <div class="order-card-header">
        <div>
          <div class="order-id">#${order.id}</div>
          <div class="order-time">${order.time}</div>
        </div>
        <span class="order-status ${statusClass}">${statusText}</span>
      </div>
      
      <div class="order-customer">
        <div class="customer-row">
          <span class="customer-label">고객명</span>
          <span class="customer-value">${order.customer}</span>
        </div>
        <div class="customer-row">
          <span class="customer-label">연락처</span>
          <span class="customer-value">${order.phone}</span>
        </div>
      </div>
      
      <div class="order-total">${order.total.toLocaleString()}원</div>
      
      ${order.request ? `<div class="order-request"><strong>요청:</strong> ${order.request}</div>` : ''}
      
      ${showActions ? `
        <div class="order-actions">
          ${order.status === 'new' ? `
            <button class="btn btn-primary btn-sm" onclick="acceptOrder(${order.id})">✓ 수락</button>
            <button class="btn btn-outline btn-sm" onclick="rejectOrder(${order.id})">✗ 거절</button>
          ` : ''}
          ${order.status === 'cooking' ? `
            <button class="btn btn-primary btn-sm btn-full" onclick="completeOrder(${order.id})">🚚 조리 완료</button>
          ` : ''}
        </div>
      ` : ''}
    </div>
  `;
}

function getStatusText(status) {
  const map = {
    'new': '새 주문',
    'cooking': '조리 중',
    'delivering': '배달 중',
    'delivered': '배달 완료',
    'cancelled': '취소됨'
  };
  return map[status] || status;
}

function getStatusClass(status) {
  const map = {
    'new': 'status-new',
    'cooking': 'status-cooking',
    'delivering': 'status-delivering',
    'delivered': 'status-delivered',
    'cancelled': 'status-cancelled'
  };
  return map[status] || '';
}

function switchOrderTab(tab) {
  AppState.currentOrderTab = tab;
  
  document.querySelectorAll('.order-tab').forEach(t => {
    t.classList.remove('active');
    if (t.dataset.tab === tab) {
      t.classList.add('active');
    }
  });
  
  renderOrdersList();
}

function acceptOrder(orderId) {
  if (!confirm('주문을 수락하시겠습니까?')) return;
  
  const orderIndex = MockData.orders.new.findIndex(o => o.id === orderId);
  if (orderIndex > -1) {
    const order = MockData.orders.new.splice(orderIndex, 1)[0];
    order.status = 'cooking';
    order.time = '방금 전';
    MockData.orders.cooking.push(order);
  }
  
  showToast('주문을 수락했습니다!');
  renderOrdersList();
  updateOrderBadge();
}

function rejectOrder(orderId) {
  if (!confirm('주문을 거절하시겠습니까?\n이 작업은 취소할 수 없습니다.')) return;
  
  const orderIndex = MockData.orders.new.findIndex(o => o.id === orderId);
  if (orderIndex > -1) {
    MockData.orders.new.splice(orderIndex, 1);
  }
  
  showToast('주문을 거절했습니다.');
  renderOrdersList();
  updateOrderBadge();
}

function completeOrder(orderId) {
  if (!confirm('조리를 완료하고 배달을 시작하시겠습니까?')) return;
  
  const orderIndex = MockData.orders.cooking.findIndex(o => o.id === orderId);
  if (orderIndex > -1) {
    const order = MockData.orders.cooking.splice(orderIndex, 1)[0];
    order.status = 'delivered';
    order.time = '방금 전';
    MockData.orders.done.unshift(order);
  }
  
  showToast('조리가 완료되었습니다!');
  renderOrdersList();
}

function updateOrderBadge() {
  const count = MockData.orders.new.length;
  const badge = document.getElementById('mobile-order-badge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

// ========================================
// MENUS
// ========================================
function renderMenuGrid(category = 'all') {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;
  
  let menus = MockData.menus;
  if (category !== 'all') {
    menus = menus.filter(m => m.category === category);
  }
  
  grid.innerHTML = menus.map(menu => `
    <div class="menu-card">
      <button class="menu-more-btn" onclick="toggleMenuDropdown(${menu.id}, event)">•••</button>
      <div class="menu-card-image">${menu.emoji}</div>
      <div class="menu-card-content">
        <h4 class="menu-card-name">${menu.name}</h4>
        <div class="menu-card-price">${menu.price.toLocaleString()}원</div>
        <div class="menu-card-actions">
          <button class="btn btn-secondary btn-sm" onclick="editMenu(${menu.id})">수정</button>
          <button class="btn btn-outline btn-sm" onclick="deleteMenu(${menu.id})">삭제</button>
        </div>
      </div>
    </div>
  `).join('');
}

function setupMenuCategoryTabs() {
  const tabs = document.querySelectorAll('#menu-category-tabs .tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderMenuGrid(tab.dataset.category);
    });
  });
}

function editMenu(menuId) {
  // Store menu id for editing
  localStorage.setItem('editMenuId', menuId);
  navigateTo('page-add-menu');
  
  // Fill form with menu data
  const menu = MockData.menus.find(m => m.id === menuId);
  if (menu) {
    document.getElementById('menu-name').value = menu.name;
    document.getElementById('menu-price').value = menu.price;
    document.getElementById('menu-category').value = menu.category;
    document.getElementById('menu-description').value = menu.description || '';
    
    document.querySelector('#page-add-menu .page-header h1').textContent = '메뉴 수정';
  }
}

function deleteMenu(menuId) {
  if (!confirm('이 메뉴를 삭제하시겠습니까?\n삭제된 메뉴는 복구할 수 없습니다.')) return;
  
  const index = MockData.menus.findIndex(m => m.id === menuId);
  if (index > -1) {
    MockData.menus.splice(index, 1);
  }
  
  showToast('메뉴가 삭제되었습니다.');
  renderMenuGrid();
}

function toggleMenuDropdown(menuId, event) {
  event.stopPropagation();
  // Simple dropdown toggle logic could go here
}

// ========================================
// MENU FORM
// ========================================
function setupMenuForm() {
  const form = document.getElementById('menu-form');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('menu-name').value;
    const price = document.getElementById('menu-price').value;
    const category = document.getElementById('menu-category').value;
    const description = document.getElementById('menu-description').value;
    
    if (!name || !price || !category) {
      showToast('필수 항목을 입력해주세요.');
      return;
    }
    
    showToast('메뉴가 저장되었습니다!');
    navigateTo('page-menus');
  });
}

function resetMenuForm() {
  if (confirm('입력한 내용을 모두 초기화하시겠습니까?')) {
    document.getElementById('menu-form').reset();
    document.getElementById('options-list').innerHTML = '';
  }
}

function addMenuOption() {
  const list = document.getElementById('options-list');
  const id = Date.now();
  
  const item = document.createElement('div');
  item.className = 'option-item';
  item.id = `option-${id}`;
  item.innerHTML = `
    <input type="text" placeholder="예: 치즈 추가 +1000원">
    <button type="button" class="remove-btn" onclick="removeMenuOption(${id})">×</button>
  `;
  
  list.appendChild(item);
}

function removeMenuOption(id) {
  const item = document.getElementById(`option-${id}`);
  if (item) item.remove();
}

// Image upload handling
function setupImageUpload() {
  const fileInput = document.getElementById('menu-image-file');
  if (!fileInput) return;
  
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      showToast('파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const preview = document.getElementById('menu-image-preview');
      preview.querySelector('img').src = event.target.result;
      preview.classList.remove('hidden');
      document.querySelector('.upload-placeholder').classList.add('hidden');
    };
    reader.readAsDataURL(file);
  });
}

function removeMenuImage() {
  document.getElementById('menu-image-file').value = '';
  document.getElementById('menu-image-preview').classList.add('hidden');
  document.querySelector('.upload-placeholder').classList.remove('hidden');
}

// ========================================
// CATEGORY MODAL
// ========================================
function openCategoryModal() {
  document.getElementById('category-modal').classList.remove('hidden');
  renderCategoryList();
}

function closeCategoryModal() {
  document.getElementById('category-modal').classList.add('hidden');
}

function renderCategoryList() {
  const list = document.getElementById('category-list');
  if (!list) return;
  
  list.innerHTML = MockData.categories.map((cat, idx) => `
    <div class="category-item" data-idx="${idx}">
      <input type="text" value="${cat}" ${cat === '전체' ? 'disabled' : ''}>
      ${cat !== '전체' ? `
        <button class="save-btn" onclick="renameCategory(${idx})">저장</button>
        <button class="delete-btn" onclick="deleteCategory(${idx})">삭제</button>
      ` : ''}
    </div>
  `).join('');
}

function addCategory() {
  const input = document.getElementById('new-category-input');
  const name = input.value.trim();
  
  if (!name) {
    showToast('카테고리 이름을 입력하세요.');
    return;
  }
  
  if (MockData.categories.includes(name)) {
    showToast('이미 존재하는 카테고리입니다.');
    return;
  }
  
  MockData.categories.push(name);
  input.value = '';
  renderCategoryList();
  showToast('카테고리가 추가되었습니다.');
}

function renameCategory(idx) {
  const item = document.querySelector(`.category-item[data-idx="${idx}"]`);
  const newName = item.querySelector('input').value.trim();
  
  if (!newName) {
    showToast('카테고리 이름을 입력하세요.');
    return;
  }
  
  MockData.categories[idx] = newName;
  showToast('카테고리가 수정되었습니다.');
}

function deleteCategory(idx) {
  if (!confirm('이 카테고리를 삭제하시겠습니까?')) return;
  
  MockData.categories.splice(idx, 1);
  renderCategoryList();
  showToast('카테고리가 삭제되었습니다.');
}

// ========================================
// STORE EDIT
// ========================================
function updatePreview() {
  const storeName = document.getElementById('store-name')?.value || '';
  const storeTagline = document.getElementById('store-tagline')?.value || '';
  const heroTitle = document.getElementById('hero-title')?.value || '';
  const heroDesc = document.getElementById('hero-desc')?.value || '';
  const deliveryTime = document.getElementById('delivery-time')?.value || '';
  const deliveryFee = document.getElementById('delivery-fee')?.value || '';
  
  // Update preview elements
  const previewStoreName = document.getElementById('preview-store-name');
  const previewStoreTagline = document.getElementById('preview-store-tagline');
  const previewHeroTitle = document.getElementById('preview-hero-title');
  const previewHeroDesc = document.getElementById('preview-hero-desc');
  const previewDeliveryTime = document.getElementById('preview-delivery-time');
  const previewDeliveryFee = document.getElementById('preview-delivery-fee');
  
  if (previewStoreName) previewStoreName.textContent = storeName;
  if (previewStoreTagline) previewStoreTagline.textContent = storeTagline;
  if (previewHeroTitle) previewHeroTitle.innerHTML = heroTitle.replace(/\n/g, '<br>');
  if (previewHeroDesc) previewHeroDesc.textContent = heroDesc;
  if (previewDeliveryTime) previewDeliveryTime.textContent = deliveryTime;
  if (previewDeliveryFee) previewDeliveryFee.textContent = deliveryFee;
}

function selectHeroColor(btn, color1, color2) {
  document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  const previewHero = document.getElementById('preview-hero');
  if (previewHero) {
    previewHero.style.background = `linear-gradient(135deg, ${color1}, ${color2})`;
  }
}

function saveStoreInfo() {
  showToast('매장 정보가 저장되었습니다!');
}

// ========================================
// PROMO EDIT
// ========================================
function renderPromoList() {
  const list = document.getElementById('promo-list');
  if (!list) return;
  
  list.innerHTML = MockData.promos.map(promo => `
    <div class="promo-edit-card" data-id="${promo.id}">
      <div class="promo-preview" style="background: linear-gradient(135deg, ${promo.color1}, ${promo.color2});">
        <div class="promo-preview-emoji">${promo.emoji}</div>
        <span class="promo-badge" style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; font-size: 12px;">${promo.badge}</span>
      </div>
      <div class="promo-form">
        <div class="input-group">
          <label>뱃지</label>
          <input type="text" value="${promo.badge}" placeholder="EVENT, NEW, INFO 등">
        </div>
        <div class="input-group">
          <label>제목</label>
          <input type="text" value="${promo.title}">
        </div>
        <div class="input-group">
          <label>설명</label>
          <input type="text" value="${promo.desc}">
        </div>
        <button class="btn btn-danger btn-sm" onclick="deletePromo(${promo.id})">삭제</button>
      </div>
    </div>
  `).join('');
}

function addPromoCard() {
  const newPromo = {
    id: Date.now(),
    emoji: '🎁',
    title: '새 프로모션',
    desc: '프로모션 설명을 입력하세요',
    badge: 'NEW',
    color1: '#FF6B35',
    color2: '#F7931E'
  };
  
  MockData.promos.push(newPromo);
  renderPromoList();
  showToast('프로모션 카드가 추가되었습니다.');
}

function deletePromo(id) {
  if (!confirm('이 프로모션을 삭제하시겠습니까?')) return;
  
  const index = MockData.promos.findIndex(p => p.id === id);
  if (index > -1) {
    MockData.promos.splice(index, 1);
  }
  
  renderPromoList();
  showToast('프로모션이 삭제되었습니다.');
}

function savePromos() {
  showToast('프로모션이 저장되었습니다!');
}

// ========================================
// AUTH
// ========================================
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
}

function setupAuthForms() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('login-email')?.value;
      const password = document.getElementById('login-password')?.value;
      
      if (!email || !password) {
        showToast('이메일과 비밀번호를 입력해주세요.');
        return;
      }
      
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '로그인 중...';
      }
      
      try {
        // 1. 로그인 API 호출
        const loginResult = await AuthApi.login(email, password);
        
        if (!loginResult.success) {
          showToast(loginResult.message || '로그인에 실패했습니다.');
          return;
        }
        
        // 2. 점주 정보 및 매장 정보 로드
        const ownerInfo = await loadStoreConfigByOwner();
        
        if (!ownerInfo) {
          showToast('점주 정보를 불러올 수 없습니다.');
          AuthApi.logout();
          return;
        }
        
        if (ownerInfo.user?.role !== 'OWNER') {
          showToast('점주 계정이 아닙니다. 점주 계정으로 로그인해주세요.');
          AuthApi.logout();
          return;
        }
        
        // 3. 성공 - 대시보드로 이동
        AppState.isLoggedIn = true;
        showToast(`${ownerInfo.store?.storeName || '매장'} 관리자로 로그인되었습니다.`);
        
        // 매장명 업데이트
        updateStoreInfo();
        
        setTimeout(() => navigateTo('page-dashboard'), 500);
        
      } catch (error) {
        console.error('로그인 오류:', error);
        showToast(error.message || '로그인 중 오류가 발생했습니다.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = '로그인';
        }
      }
    });
  }
}

function updateStoreInfo() {
  // 매장명 표시 업데이트
  const storeNameEl = document.querySelector('.store-name');
  if (storeNameEl && window.STORE_NAME) {
    storeNameEl.textContent = window.STORE_NAME;
  }
  
  // 점주명 표시
  const ownerNameEl = document.querySelector('.owner-name');
  if (ownerNameEl && window.OWNER_USER) {
    ownerNameEl.textContent = window.OWNER_USER.name || window.OWNER_USER.email;
  }
}

function logout() {
  if (confirm('로그아웃 하시겠습니까?')) {
    AppState.isLoggedIn = false;
    AuthApi?.logout();
    showToast('로그아웃 되었습니다.');
    navigateTo('page-login');
  }
}

// ========================================
// REWARD RATE SETTINGS
// ========================================
function saveRewardRate() {
  const rate = parseInt(document.getElementById('reward-rate')?.value || 40);
  localStorage.setItem('rewardRate', rate);
  updateRewardPreview(rate);
  showToast(`적립 비율이 ${rate}%로 저장되었습니다.`);
}

function updateRewardPreview(rate) {
  const previewAmount = document.getElementById('reward-preview-amount');
  if (previewAmount) {
    const reward = Math.floor(10000 * rate / 100);
    previewAmount.textContent = `${reward.toLocaleString()}P 적립`;
  }
}

function loadRewardRate() {
  const rate = parseInt(localStorage.getItem('rewardRate') || '40');
  const input = document.getElementById('reward-rate');
  if (input) {
    input.value = rate;
    updateRewardPreview(rate);
  }
}

// ========================================
// TOAST
// ========================================
function showToast(message, duration = 2000) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  
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
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Toast animations
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
// SPLASH SCREEN
// ========================================
async function initSplash() {
  setTimeout(async () => {
    const splash = document.getElementById('page-splash');
    if (splash) {
      splash.style.opacity = '0';
      splash.style.transition = 'opacity 0.5s ease';
      
      setTimeout(async () => {
        splash.classList.remove('active');
        splash.style.display = 'none';
        
        // 로그인 상태 확인
        const token = AuthToken?.get();
        if (token) {
          try {
            // 기존 토큰으로 점주 정보 로드 시도
            const ownerInfo = await loadStoreConfigByOwner();
            if (ownerInfo && ownerInfo.user?.role === 'OWNER') {
              AppState.isLoggedIn = true;
              updateStoreInfo();
              navigateTo('page-dashboard');
              return;
            }
          } catch (e) {
            console.log('자동 로그인 실패, 로그인 페이지로 이동');
          }
        }
        
        // 로그인 페이지로 이동
        navigateTo('page-login');
      }, 500);
    }
  }, 1500);
}

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  initSplash();
  setupAuthForms();
  setupMenuForm();
  setupImageUpload();
  setupMenuCategoryTabs();
  updateOrderBadge();
  loadRewardRate();
});

// Make functions globally available
window.navigateTo = navigateTo;
window.navigateFromHeader = navigateFromHeader;
window.navigateFromTab = navigateFromTab;
window.toggleShopStatus = toggleShopStatus;
window.switchOrderTab = switchOrderTab;
window.acceptOrder = acceptOrder;
window.rejectOrder = rejectOrder;
window.completeOrder = completeOrder;
window.editMenu = editMenu;
window.deleteMenu = deleteMenu;
window.toggleMenuDropdown = toggleMenuDropdown;
window.resetMenuForm = resetMenuForm;
window.addMenuOption = addMenuOption;
window.removeMenuOption = removeMenuOption;
window.removeMenuImage = removeMenuImage;
window.openCategoryModal = openCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.addCategory = addCategory;
window.renameCategory = renameCategory;
window.deleteCategory = deleteCategory;
window.updatePreview = updatePreview;
window.selectHeroColor = selectHeroColor;
window.saveStoreInfo = saveStoreInfo;
window.addPromoCard = addPromoCard;
window.deletePromo = deletePromo;
window.savePromos = savePromos;
window.togglePassword = togglePassword;
window.logout = logout;
window.saveRewardRate = saveRewardRate;

