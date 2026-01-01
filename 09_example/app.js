/**
 * 09_example - LocalStorage 기반 예시 앱
 * 서버 없이 로컬 저장소만 사용하여 메뉴 등록, 장바구니, 주문 기능을 제공합니다.
 */

// ========================================
// LocalStorage 키
// ========================================
const STORAGE_KEYS = {
  MENUS: 'example_menus',
  CART: 'example_cart',
  ORDERS: 'example_orders'
};

// ========================================
// 데이터 관리 함수
// ========================================

// 메뉴 관련
function getMenus() {
  const data = localStorage.getItem(STORAGE_KEYS.MENUS);
  return data ? JSON.parse(data) : [];
}

function saveMenus(menus) {
  localStorage.setItem(STORAGE_KEYS.MENUS, JSON.stringify(menus));
}

function addMenu(menu) {
  const menus = getMenus();
  menu.id = Date.now().toString();
  menu.createdAt = new Date().toISOString();
  menus.push(menu);
  saveMenus(menus);
  return menu;
}

function updateMenu(id, updates) {
  const menus = getMenus();
  const index = menus.findIndex(m => m.id === id);
  if (index !== -1) {
    menus[index] = { ...menus[index], ...updates };
    saveMenus(menus);
    return menus[index];
  }
  return null;
}

function deleteMenu(id) {
  const menus = getMenus();
  const filtered = menus.filter(m => m.id !== id);
  saveMenus(filtered);
}

// 장바구니 관련
function getCart() {
  const data = localStorage.getItem(STORAGE_KEYS.CART);
  return data ? JSON.parse(data) : [];
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
}

function addToCart(menuId, quantity = 1) {
  const cart = getCart();
  const menus = getMenus();
  const menu = menus.find(m => m.id === menuId);
  
  if (!menu) return;
  
  const existingIndex = cart.findIndex(item => item.menuId === menuId);
  
  if (existingIndex !== -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      menuId,
      name: menu.name,
      price: menu.price,
      emoji: menu.emoji || '🍽️',
      quantity
    });
  }
  
  saveCart(cart);
  updateCartBadge();
}

function updateCartQuantity(menuId, quantity) {
  const cart = getCart();
  const index = cart.findIndex(item => item.menuId === menuId);
  
  if (index !== -1) {
    if (quantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = quantity;
    }
    saveCart(cart);
    updateCartBadge();
  }
}

function clearCart() {
  localStorage.removeItem(STORAGE_KEYS.CART);
  updateCartBadge();
}

// 주문 관련
function getOrders() {
  const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
  return data ? JSON.parse(data) : [];
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

function createOrder(orderData) {
  const orders = getOrders();
  const order = {
    id: 'ORD-' + Date.now().toString().slice(-6),
    ...orderData,
    status: 'new',
    createdAt: new Date().toISOString()
  };
  orders.unshift(order);
  saveOrders(orders);
  return order;
}

function updateOrderStatus(orderId, status) {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    orders[index].status = status;
    saveOrders(orders);
    return orders[index];
  }
  return null;
}

// ========================================
// 네비게이션
// ========================================
function navigateTo(pageId) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.remove('active'));
  
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
  }
  
  // 페이지별 로딩 로직
  if (pageId === 'page-cart') {
    renderCart();
  } else if (pageId === 'page-orders') {
    renderOrders();
  } else if (pageId === 'page-menus') {
    renderOwnerMenus();
  } else if (pageId === 'page-dashboard') {
    renderOrders();
    updateStats();
  } else if (pageId === 'page-add-menu') {
    resetMenuForm();
  }
  
  // 탭바 active 상태 업데이트
  const tabItems = document.querySelectorAll('.tab-item');
  tabItems.forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.page === pageId) {
      tab.classList.add('active');
    }
  });
  
  // 스크롤 맨 위로
  window.scrollTo(0, 0);
}

function navigateFromTab(pageId) {
  navigateTo(pageId);
}

// ========================================
// 고객 페이지 렌더링
// ========================================

// 메뉴 목록 렌더링
function renderMenus(category = 'all') {
  const menuGrid = document.getElementById('menu-grid');
  const menuCount = document.getElementById('menu-count');
  if (!menuGrid) return;
  
  const menus = getMenus();
  const filtered = category === 'all' 
    ? menus 
    : menus.filter(m => m.category === category);
  
  if (menuCount) {
    menuCount.textContent = `(${filtered.length})`;
  }
  
  if (filtered.length === 0) {
    menuGrid.innerHTML = `
      <div class="empty-message">
        <p>📋</p>
        <p>등록된 메뉴가 없습니다</p>
        <a href="owner.html" class="link-btn">점주 페이지에서 메뉴 등록하기</a>
      </div>
    `;
    return;
  }
  
  menuGrid.innerHTML = filtered.map(menu => `
    <div class="menu-card" onclick="showMenuDetail('${menu.id}')">
      <div class="menu-image">
        <span class="menu-emoji">${menu.emoji || '🍽️'}</span>
      </div>
      <div class="menu-info">
        <h4>${menu.name}</h4>
        <p class="menu-description">${menu.description || ''}</p>
        <div class="menu-price">${formatPrice(menu.price)}원</div>
      </div>
      <button class="add-btn" onclick="event.stopPropagation(); addToCart('${menu.id}')">+</button>
    </div>
  `).join('');
  
  // 카테고리 탭 업데이트
  updateCategoryTabs();
}

function updateCategoryTabs() {
  const tabsContainer = document.getElementById('category-tabs');
  if (!tabsContainer) return;
  
  const menus = getMenus();
  const categories = new Set(['all']);
  menus.forEach(m => m.category && categories.add(m.category));
  
  const categoryLabels = {
    'all': '전체',
    'main': '메인',
    'side': '사이드',
    'drink': '음료',
    'dessert': '디저트'
  };
  
  tabsContainer.innerHTML = Array.from(categories).map(cat => `
    <button class="tab ${cat === 'all' ? 'active' : ''}" data-category="${cat}" onclick="filterMenus('${cat}')">${categoryLabels[cat] || cat}</button>
  `).join('');
}

function filterMenus(category) {
  const tabs = document.querySelectorAll('#category-tabs .tab');
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.category === category);
  });
  renderMenus(category);
}

// 메뉴 상세 표시
function showMenuDetail(menuId) {
  const menus = getMenus();
  const menu = menus.find(m => m.id === menuId);
  if (!menu) return;
  
  const detailContent = document.getElementById('detail-content');
  detailContent.innerHTML = `
    <div class="detail-image">
      <span class="detail-emoji">${menu.emoji || '🍽️'}</span>
    </div>
    <div class="detail-info">
      <h2>${menu.name}</h2>
      <p class="detail-description">${menu.description || '맛있는 메뉴입니다!'}</p>
      <div class="detail-price">${formatPrice(menu.price)}원</div>
      
      <div class="quantity-selector">
        <button class="qty-btn" onclick="updateDetailQuantity(-1)">−</button>
        <span id="detail-qty">1</span>
        <button class="qty-btn" onclick="updateDetailQuantity(1)">+</button>
      </div>
      
      <button class="btn btn-primary btn-full btn-lg" onclick="addToCartFromDetail('${menu.id}')">
        장바구니 담기
      </button>
    </div>
  `;
  
  navigateTo('page-detail');
}

let detailQty = 1;
function updateDetailQuantity(delta) {
  detailQty = Math.max(1, detailQty + delta);
  document.getElementById('detail-qty').textContent = detailQty;
}

function addToCartFromDetail(menuId) {
  addToCart(menuId, detailQty);
  detailQty = 1;
  showToast('장바구니에 담았습니다!');
  navigateTo('page-home');
}

// 장바구니 렌더링
function renderCart() {
  const cartItems = document.getElementById('cart-items');
  const cart = getCart();
  
  if (!cartItems) return;
  
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-message">
        <p>🛒</p>
        <p>장바구니가 비어있습니다</p>
        <button class="btn btn-primary" onclick="navigateTo('page-home')">메뉴 보러 가기</button>
      </div>
    `;
    updateCartSummary(0);
    return;
  }
  
  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-image">
        <span class="item-emoji">${item.emoji}</span>
      </div>
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p class="item-price">${formatPrice(item.price)}원</p>
      </div>
      <div class="cart-item-quantity">
        <button class="qty-btn small" onclick="updateCartQuantity('${item.menuId}', ${item.quantity - 1})">−</button>
        <span>${item.quantity}</span>
        <button class="qty-btn small" onclick="updateCartQuantity('${item.menuId}', ${item.quantity + 1})">+</button>
      </div>
    </div>
  `).join('');
  
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  updateCartSummary(subtotal);
}

function updateCartSummary(subtotal) {
  const cartSubtotal = document.getElementById('cart-subtotal');
  const cartReward = document.getElementById('cart-reward');
  const cartTotal = document.getElementById('cart-total');
  
  const deliveryFee = 2500;
  const reward = Math.floor(subtotal * 0.4);
  const total = subtotal + deliveryFee;
  
  if (cartSubtotal) cartSubtotal.textContent = formatPrice(subtotal) + '원';
  if (cartReward) cartReward.textContent = formatPrice(reward) + 'P';
  if (cartTotal) cartTotal.textContent = formatPrice(total) + '원';
}

function updateCartBadge() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const badge = document.getElementById('cart-badge');
  const tabBadge = document.getElementById('tab-cart-badge');
  
  if (badge) {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
  }
  if (tabBadge) {
    tabBadge.textContent = totalItems;
    tabBadge.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

// 주문하기
function placeOrder() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast('장바구니가 비어있습니다');
    return;
  }
  
  const address = document.getElementById('delivery-address')?.value || '';
  const request = document.getElementById('order-request')?.value || '';
  
  if (!address.trim()) {
    showToast('배달 주소를 입력해주세요');
    return;
  }
  
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 2500;
  const total = subtotal + deliveryFee;
  
  const order = createOrder({
    items: cart,
    address,
    request,
    subtotal,
    deliveryFee,
    total
  });
  
  clearCart();
  
  // 주문 완료 페이지 표시
  const orderInfo = document.getElementById('order-info');
  if (orderInfo) {
    orderInfo.innerHTML = `
      <div class="info-row">
        <span>주문번호</span>
        <strong>${order.id}</strong>
      </div>
      <div class="info-row">
        <span>결제금액</span>
        <strong>${formatPrice(order.total)}원</strong>
      </div>
      <div class="info-row">
        <span>배달주소</span>
        <span>${order.address}</span>
      </div>
    `;
  }
  
  navigateTo('page-complete');
}

// ========================================
// 점주 페이지 렌더링
// ========================================

// 점주용 메뉴 목록
function renderOwnerMenus() {
  const menuGrid = document.getElementById('owner-menu-grid');
  if (!menuGrid) return;
  
  const menus = getMenus();
  
  if (menus.length === 0) {
    menuGrid.innerHTML = `
      <div class="empty-message full-width">
        <p>📋</p>
        <p>등록된 메뉴가 없습니다</p>
        <button class="btn btn-primary" onclick="navigateTo('page-add-menu')">첫 메뉴 추가하기</button>
      </div>
    `;
    return;
  }
  
  menuGrid.innerHTML = menus.map(menu => `
    <div class="menu-card owner-card">
      <div class="menu-image">
        <span class="menu-emoji">${menu.emoji || '🍽️'}</span>
      </div>
      <div class="menu-info">
        <h4>${menu.name}</h4>
        <div class="menu-price">${formatPrice(menu.price)}원</div>
      </div>
      <div class="menu-actions">
        <button class="action-btn edit" onclick="editMenu('${menu.id}')">✏️</button>
        <button class="action-btn delete" onclick="confirmDeleteMenu('${menu.id}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

// 메뉴 폼 리셋
function resetMenuForm() {
  document.getElementById('menu-form-title').textContent = '메뉴 추가';
  document.getElementById('menu-id').value = '';
  document.getElementById('menu-name').value = '';
  document.getElementById('menu-price').value = '';
  document.getElementById('menu-category').value = 'main';
  document.getElementById('menu-description').value = '';
  document.getElementById('menu-emoji').value = '🍽️';
  
  // 이모지 버튼 초기화
  const emojiButtons = document.querySelectorAll('.emoji-btn');
  emojiButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.emoji === '🍽️');
  });
}

// 메뉴 수정
function editMenu(menuId) {
  const menus = getMenus();
  const menu = menus.find(m => m.id === menuId);
  if (!menu) return;
  
  document.getElementById('menu-form-title').textContent = '메뉴 수정';
  document.getElementById('menu-id').value = menu.id;
  document.getElementById('menu-name').value = menu.name;
  document.getElementById('menu-price').value = menu.price;
  document.getElementById('menu-category').value = menu.category || 'main';
  document.getElementById('menu-description').value = menu.description || '';
  document.getElementById('menu-emoji').value = menu.emoji || '🍽️';
  
  // 이모지 버튼 업데이트
  const emojiButtons = document.querySelectorAll('.emoji-btn');
  emojiButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.emoji === (menu.emoji || '🍽️'));
  });
  
  navigateTo('page-add-menu');
}

// 메뉴 저장
function saveMenu(event) {
  event.preventDefault();
  
  const id = document.getElementById('menu-id').value;
  const menuData = {
    name: document.getElementById('menu-name').value,
    price: parseInt(document.getElementById('menu-price').value),
    category: document.getElementById('menu-category').value,
    description: document.getElementById('menu-description').value,
    emoji: document.getElementById('menu-emoji').value
  };
  
  if (id) {
    updateMenu(id, menuData);
    showToast('메뉴가 수정되었습니다');
  } else {
    addMenu(menuData);
    showToast('메뉴가 추가되었습니다');
  }
  
  navigateTo('page-menus');
}

// 메뉴 삭제 확인
function confirmDeleteMenu(menuId) {
  if (confirm('정말 이 메뉴를 삭제하시겠습니까?')) {
    deleteMenu(menuId);
    showToast('메뉴가 삭제되었습니다');
    renderOwnerMenus();
  }
}

// 주문 목록 렌더링
let currentOrderTab = 'new';

function switchOrderTab(tab) {
  currentOrderTab = tab;
  const tabs = document.querySelectorAll('.order-tab');
  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  renderOrders();
}

function renderOrders() {
  const ordersList = document.getElementById('orders-list');
  const recentOrders = document.getElementById('recent-orders');
  const orders = getOrders();
  
  const newOrders = orders.filter(o => o.status === 'new');
  const doneOrders = orders.filter(o => o.status === 'done');
  
  // 카운트 업데이트
  const countNew = document.getElementById('count-new');
  const countDone = document.getElementById('count-done');
  if (countNew) countNew.textContent = newOrders.length;
  if (countDone) countDone.textContent = doneOrders.length;
  
  // 주문 배지 업데이트
  updateOrderBadge();
  
  // 대시보드 최근 주문
  if (recentOrders) {
    if (orders.length === 0) {
      recentOrders.innerHTML = `
        <div class="empty-message">
          <p>📋</p>
          <p>새 주문이 없습니다</p>
        </div>
      `;
    } else {
      const recent = orders.slice(0, 3);
      recentOrders.innerHTML = recent.map(order => renderOrderCard(order)).join('');
    }
  }
  
  // 주문 관리 페이지
  if (ordersList) {
    const filtered = currentOrderTab === 'new' ? newOrders : doneOrders;
    
    if (filtered.length === 0) {
      ordersList.innerHTML = `
        <div class="empty-message">
          <p>📋</p>
          <p>${currentOrderTab === 'new' ? '새 주문이 없습니다' : '완료된 주문이 없습니다'}</p>
        </div>
      `;
    } else {
      ordersList.innerHTML = filtered.map(order => renderOrderCard(order)).join('');
    }
  }
}

function renderOrderCard(order) {
  const itemSummary = order.items.map(i => `${i.name} x${i.quantity}`).join(', ');
  const time = new Date(order.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  
  return `
    <div class="order-card ${order.status}">
      <div class="order-header">
        <span class="order-id">${order.id}</span>
        <span class="order-time">${time}</span>
      </div>
      <div class="order-items">${itemSummary}</div>
      <div class="order-address">📍 ${order.address}</div>
      ${order.request ? `<div class="order-request">📝 ${order.request}</div>` : ''}
      <div class="order-footer">
        <span class="order-total">${formatPrice(order.total)}원</span>
        ${order.status === 'new' 
          ? `<button class="btn btn-primary btn-sm" onclick="completeOrder('${order.id}')">완료</button>`
          : `<span class="status-badge done">완료됨</span>`
        }
      </div>
    </div>
  `;
}

function completeOrder(orderId) {
  updateOrderStatus(orderId, 'done');
  showToast('주문이 완료 처리되었습니다');
  renderOrders();
  updateStats();
}

function updateOrderBadge() {
  const orders = getOrders();
  const newCount = orders.filter(o => o.status === 'new').length;
  
  const badge = document.getElementById('order-badge');
  if (badge) {
    badge.textContent = newCount;
    badge.style.display = newCount > 0 ? 'flex' : 'none';
  }
}

// 통계 업데이트
function updateStats() {
  const orders = getOrders();
  const today = new Date().toDateString();
  
  const todayOrders = orders.filter(o => 
    new Date(o.createdAt).toDateString() === today
  );
  
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  
  const statOrders = document.getElementById('stat-orders');
  const statRevenue = document.getElementById('stat-revenue');
  
  if (statOrders) statOrders.textContent = todayOrders.length;
  if (statRevenue) statRevenue.textContent = formatPrice(todayRevenue) + '원';
}

// 데이터 초기화
function clearAllData() {
  if (confirm('모든 데이터(메뉴, 장바구니, 주문)를 초기화하시겠습니까?')) {
    localStorage.removeItem(STORAGE_KEYS.MENUS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    
    showToast('모든 데이터가 초기화되었습니다');
    
    renderOwnerMenus();
    renderOrders();
    updateStats();
    updateCartBadge();
    updateOrderBadge();
  }
}

// ========================================
// 유틸리티
// ========================================

function formatPrice(price) {
  return price.toLocaleString('ko-KR');
}

function showToast(message) {
  // 기존 토스트 제거
  const existingToast = document.querySelector('.toast');
  if (existingToast) existingToast.remove();
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

