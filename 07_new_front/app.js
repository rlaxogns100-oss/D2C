/**
 * MAEJANG D2C - NEW FRONTEND APP
 * Single Page Application with BHC-style Header Navigation
 */

// ========================================
// STATE MANAGEMENT
// ========================================
const AppState = {
  currentPage: 'page-splash',
  previousPage: null,
  isLoggedIn: false,
  cart: [],
  cartCount: 3, // Mock data
  sliderIndex: 0,
  userPoints: 15000, // Mock: 15,000P
  orderTotal: 29200,
  orderSubtotal: 26700,
  pointsUsed: 0,
  finalPayment: 29200
};

// ========================================
// MOCK DATA
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
  
  cartItems: [
    { id: 1, menuId: 2, name: '매콤 불닭 볶음면', option: '치즈 추가', price: 9900, quantity: 2, emoji: '🍜' },
    { id: 2, menuId: 1, name: '크림 파스타', option: '기본', price: 12900, quantity: 1, emoji: '🍝' }
  ],
  
  orders: {
    ongoing: [
      {
        id: 'ORD-2024001',
        date: '2024-01-15 14:30',
        status: 'delivering',
        statusText: '배달 중',
        trackingProgress: 75,
        items: '매콤 불닭 볶음면 외 1개',
        total: '32,700원'
      }
    ],
    completed: [
      {
        id: 'ORD-2024000',
        date: '2024-01-14 19:20',
        status: 'delivered',
        statusText: '배달 완료',
        items: '크림 파스타 외 2개',
        total: '27,300원'
      }
    ]
  },
  
  addresses: [
    { id: 1, label: '집', address: '경기도 용인시 수지구 현암로125번길 11', detail: '101동 1001호', isDefault: true },
    { id: 2, label: '회사', address: '서울시 강남구 테헤란로 123', detail: '10층', isDefault: false }
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
      updateOrderSummary();
      break;
    case 'page-orders':
      renderOrders();
      break;
    case 'page-addresses':
      renderAddresses();
      break;
    case 'page-payment':
      initPaymentPage();
      break;
  }
}

// ========================================
// MENU GRID
// ========================================
function renderMenuGrid(category = 'all') {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;
  
  // Get reward rate
  const rewardRate = parseInt(localStorage.getItem('rewardRate') || '40');
  
  // Update reward banner
  const rewardRateDisplay = document.getElementById('reward-rate-display');
  if (rewardRateDisplay) {
    rewardRateDisplay.textContent = `${rewardRate}%`;
  }
  
  let menus = MockData.menus;
  if (category !== 'all') {
    menus = menus.filter(m => m.category === category);
  }
  
  grid.innerHTML = menus.map(menu => {
    const rewardAmount = Math.floor(menu.price * rewardRate / 100);
    return `
      <div class="menu-card" onclick="openMenuDetail(${menu.id})">
        <div class="menu-card-image">${menu.emoji}</div>
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
  
  // Update count
  const countEl = document.querySelector('.section-header .count');
  if (countEl) {
    countEl.textContent = `(${menus.length})`;
  }
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
  const menu = MockData.menus.find(m => m.id === menuId);
  if (!menu) return;
  
  // Get reward rate
  const rewardRate = parseInt(localStorage.getItem('rewardRate') || '40');
  
  // Update detail page content
  const detailPage = document.getElementById('page-menu-detail');
  if (detailPage) {
    const heroPlaceholder = detailPage.querySelector('.hero-img-placeholder');
    if (heroPlaceholder) heroPlaceholder.textContent = menu.emoji;
    
    const menuName = detailPage.querySelector('.menu-name');
    if (menuName) menuName.textContent = menu.name;
    
    const menuDesc = detailPage.querySelector('.menu-description');
    if (menuDesc) menuDesc.textContent = menu.desc || '정성스럽게 준비한 특별한 메뉴입니다.';
    
    const priceValue = detailPage.querySelector('.price-value');
    if (priceValue) priceValue.textContent = `${menu.price.toLocaleString()}원`;
    
    // Calculate and show reward
    const rewardAmount = Math.floor(menu.price * rewardRate / 100);
    const detailReward = document.getElementById('detail-reward');
    if (detailReward) detailReward.textContent = `${rewardAmount.toLocaleString()}P 적립!`;
    
    // Store current menu info
    detailPage.dataset.menuId = menuId;
    detailPage.dataset.basePrice = menu.price;
    
    // Reset quantity
    const qtyValue = detailPage.querySelector('.qty-value');
    if (qtyValue) qtyValue.textContent = '1';
  }
  
  navigateTo('page-menu-detail');
}

function quickAddToCart(menuId, event) {
  event.stopPropagation();
  const menu = MockData.menus.find(m => m.id === menuId);
  if (menu) {
    showToast(`${menu.name}이(가) 장바구니에 담겼습니다.`);
    updateCartBadge(AppState.cartCount + 1);
  }
}

function addToCartAndNavigate() {
  showToast('장바구니에 담겼습니다.');
  updateCartBadge(AppState.cartCount + 1);
  setTimeout(() => navigateTo('page-cart'), 500);
}

// ========================================
// CART
// ========================================
function renderCartItems() {
  const container = document.getElementById('cart-items');
  if (!container) return;
  
  container.innerHTML = MockData.cartItems.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <button class="cart-item-remove" onclick="removeCartItem(${item.id})">×</button>
      <div class="cart-item-image">${item.emoji}</div>
      <div class="cart-item-info">
        <h4 class="cart-item-name">${item.name}</h4>
        <p class="cart-item-option">${item.option}</p>
        <div class="cart-item-footer">
          <span class="cart-item-price">${(item.price * item.quantity).toLocaleString()}원</span>
          <div class="cart-counter">
            <button class="cart-counter-btn" onclick="updateCartQuantity(${item.id}, -1)">−</button>
            <span class="cart-counter-value">${item.quantity}</span>
            <button class="cart-counter-btn" onclick="updateCartQuantity(${item.id}, 1)">+</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function updateCartQuantity(itemId, change) {
  const item = MockData.cartItems.find(i => i.id === itemId);
  if (item) {
    item.quantity = Math.max(1, item.quantity + change);
    renderCartItems();
    updateOrderSummary();
  }
}

function removeCartItem(itemId) {
  MockData.cartItems = MockData.cartItems.filter(i => i.id !== itemId);
  renderCartItems();
  updateOrderSummary();
  updateCartBadge(MockData.cartItems.reduce((sum, i) => sum + i.quantity, 0));
}

function updateOrderSummary() {
  const subtotal = MockData.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const delivery = 2500;
  const total = subtotal + delivery;
  
  // Get reward rate from localStorage (set by owner, default 40%)
  const rewardRate = parseInt(localStorage.getItem('rewardRate') || '40');
  const rewardAmount = Math.floor(subtotal * rewardRate / 100);
  
  // Update subtotal
  const subtotalEl = document.getElementById('cart-subtotal');
  if (subtotalEl) subtotalEl.textContent = `${subtotal.toLocaleString()}원`;
  
  // Update reward display
  const rewardEl = document.getElementById('cart-reward');
  if (rewardEl) rewardEl.textContent = `${rewardAmount.toLocaleString()}P (${rewardRate}%)`;
  
  // Update total
  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = `${total.toLocaleString()}원`;
  
  const checkoutBtn = document.querySelector('.checkout-section .btn');
  if (checkoutBtn) {
    checkoutBtn.textContent = `${total.toLocaleString()}원 결제하기`;
  }
  
  // Store for payment page
  AppState.orderTotal = total;
  AppState.orderSubtotal = subtotal;
}

function updateCartBadge(count) {
  AppState.cartCount = count;
  
  document.querySelectorAll('.cart-badge, .tab-badge, .cart-tab-badge').forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
}

// ========================================
// ORDERS
// ========================================
function renderOrders() {
  renderOngoingOrders();
  renderCompletedOrders();
  setupOrderTabs();
}

function renderOngoingOrders() {
  const container = document.getElementById('ongoing-orders');
  if (!container) return;
  
  if (MockData.orders.ongoing.length === 0) {
    container.innerHTML = '<p class="empty-message">진행 중인 주문이 없습니다.</p>';
    return;
  }
  
  container.innerHTML = MockData.orders.ongoing.map(order => `
    <div class="order-card">
      <div class="order-header">
        <div>
          <p class="order-id">${order.id}</p>
          <p class="order-date">${order.date}</p>
        </div>
        <span class="order-status status-${order.status}">${order.statusText}</span>
      </div>
      <div class="order-tracking">
        <div class="tracking-steps">
          <div class="tracking-line">
            <div class="tracking-progress" style="width: ${order.trackingProgress}%"></div>
          </div>
          <div class="tracking-step">
            <div class="step-dot completed"></div>
            <span class="step-label">주문확인</span>
          </div>
          <div class="tracking-step">
            <div class="step-dot ${order.trackingProgress >= 50 ? 'completed' : ''}"></div>
            <span class="step-label">조리중</span>
          </div>
          <div class="tracking-step">
            <div class="step-dot ${order.trackingProgress >= 75 ? 'active' : ''}"></div>
            <span class="step-label ${order.trackingProgress >= 75 ? 'active' : ''}">배달중</span>
          </div>
          <div class="tracking-step">
            <div class="step-dot ${order.trackingProgress >= 100 ? 'completed' : ''}"></div>
            <span class="step-label">완료</span>
          </div>
        </div>
      </div>
      <p class="order-items-preview">${order.items}</p>
      <p class="order-total">${order.total}</p>
    </div>
  `).join('');
}

function renderCompletedOrders() {
  const container = document.getElementById('completed-orders');
  if (!container) return;
  
  if (MockData.orders.completed.length === 0) {
    container.innerHTML = '<p class="empty-message">지난 주문이 없습니다.</p>';
    return;
  }
  
  container.innerHTML = MockData.orders.completed.map(order => `
    <div class="order-card">
      <div class="order-header">
        <div>
          <p class="order-id">${order.id}</p>
          <p class="order-date">${order.date}</p>
        </div>
        <span class="order-status status-${order.status}">${order.statusText}</span>
      </div>
      <p class="order-items-preview">${order.items}</p>
      <p class="order-total">${order.total}</p>
    </div>
  `).join('');
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
        ongoingList.classList.remove('hidden');
        completedList.classList.add('hidden');
      } else {
        ongoingList.classList.add('hidden');
        completedList.classList.remove('hidden');
      }
    });
  });
}

// ========================================
// ADDRESSES
// ========================================
function renderAddresses() {
  const container = document.getElementById('address-list');
  if (!container) return;
  
  container.innerHTML = MockData.addresses.map(addr => `
    <div class="address-card ${addr.isDefault ? 'default' : ''}" data-id="${addr.id}">
      <div class="address-card-header">
        <div class="address-card-label">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span class="address-card-name">${addr.label}</span>
        </div>
        <div class="address-card-actions">
          <button class="address-action-btn edit" onclick="editAddress(${addr.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="address-action-btn delete" onclick="deleteAddress(${addr.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
      <p class="address-card-text">${addr.address} ${addr.detail}</p>
    </div>
  `).join('');
}

function editAddress(addressId) {
  console.log('Edit address:', addressId);
  navigateTo('page-add-address');
}

function deleteAddress(addressId) {
  if (confirm('이 주소를 삭제하시겠습니까?')) {
    MockData.addresses = MockData.addresses.filter(a => a.id !== addressId);
    renderAddresses();
    showToast('주소가 삭제되었습니다.');
  }
}

function saveAddress(event) {
  event.preventDefault();
  showToast('주소가 저장되었습니다.');
  navigateTo('page-addresses');
}

// ========================================
// PAYMENT
// ========================================
// ========================================
// POINT SYSTEM
// ========================================
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
  const availablePoints = AppState.userPoints || 15000; // Mock: 15,000P
  const orderTotal = AppState.orderTotal || 29200;
  const minPayment = 5000;
  
  let pointsToUse = parseInt(pointInput?.value || 0);
  
  // Validate points
  const maxUsable = Math.min(availablePoints, orderTotal - minPayment);
  if (pointsToUse > maxUsable) {
    pointsToUse = maxUsable;
    if (pointInput) pointInput.value = pointsToUse;
  }
  if (pointsToUse < 0) {
    pointsToUse = 0;
    if (pointInput) pointInput.value = 0;
  }
  
  const finalAmount = orderTotal - pointsToUse;
  
  // Update display
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
}

function useAllPoints() {
  const availablePoints = AppState.userPoints || 15000;
  const orderTotal = AppState.orderTotal || 29200;
  const minPayment = 5000;
  
  const maxUsable = Math.min(availablePoints, orderTotal - minPayment);
  
  const pointInput = document.getElementById('point-amount');
  if (pointInput) {
    pointInput.value = maxUsable;
    updatePointUsage();
  }
}

function resetPointUsage() {
  const pointInput = document.getElementById('point-amount');
  if (pointInput) pointInput.value = 0;
  
  const orderTotal = AppState.orderTotal || 29200;
  const paymentTotalEl = document.getElementById('payment-total');
  if (paymentTotalEl) paymentTotalEl.textContent = `${orderTotal.toLocaleString()}원`;
  
  AppState.pointsUsed = 0;
  AppState.finalPayment = orderTotal;
}

function initPaymentPage() {
  const orderTotal = AppState.orderTotal || 29200;
  const availablePoints = AppState.userPoints || 15000; // Mock data
  
  // Set available points display
  const availableEl = document.getElementById('available-points');
  if (availableEl) availableEl.textContent = `${availablePoints.toLocaleString()}P`;
  
  // Set order total
  const paymentTotalEl = document.getElementById('payment-total');
  if (paymentTotalEl) paymentTotalEl.textContent = `${orderTotal.toLocaleString()}원`;
  
  const originalAmountEl = document.getElementById('original-amount');
  if (originalAmountEl) originalAmountEl.textContent = `${orderTotal.toLocaleString()}원`;
  
  // Reset point usage
  resetPointUsage();
}

function processPayment() {
  const pointsUsed = AppState.pointsUsed || 0;
  const finalPayment = AppState.finalPayment || AppState.orderTotal || 29200;
  
  // Deduct points if used
  if (pointsUsed > 0) {
    AppState.userPoints = (AppState.userPoints || 15000) - pointsUsed;
    showToast(`${pointsUsed.toLocaleString()}P 사용! 결제가 완료되었습니다.`);
  } else {
    showToast('결제가 완료되었습니다.');
  }
  
  // Add reward points (based on subtotal, not including delivery)
  const rewardRate = parseInt(localStorage.getItem('rewardRate') || '40');
  const subtotal = AppState.orderSubtotal || 26700;
  const earnedPoints = Math.floor(subtotal * rewardRate / 100);
  AppState.userPoints = (AppState.userPoints || 15000) + earnedPoints;
  
  setTimeout(() => {
    showToast(`${earnedPoints.toLocaleString()}P 적립되었습니다!`);
  }, 1500);
  
  setTimeout(() => navigateTo('page-orders'), 2500);
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
  
  // Create slides if not exist
  let slidesContainer = slider.querySelector('.slides-container');
  if (!slidesContainer) {
    // Just update the active slide
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
  }
  
  // Update dots
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
  // Auto slide
  setInterval(nextSlide, 5000);
  
  // Dot clicks
  const dots = document.querySelectorAll('.slider-dots .dot');
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      AppState.sliderIndex = idx;
      updateSlider();
    });
  });
}

// ========================================
// QUANTITY CONTROLS (Detail Page)
// ========================================
function setupQuantityControls() {
  const minusBtn = document.querySelector('.qty-btn.minus');
  const plusBtn = document.querySelector('.qty-btn.plus');
  const qtyValue = document.querySelector('.qty-value');
  const priceValue = document.querySelector('.price-value');
  const detailReward = document.getElementById('detail-reward');
  
  if (!minusBtn || !plusBtn) return;
  
  const rewardRate = parseInt(localStorage.getItem('rewardRate') || '40');
  
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
// ADDRESS LABEL BUTTONS
// ========================================
function setupLabelButtons() {
  const labelBtns = document.querySelectorAll('.label-btn');
  labelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      labelBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// ========================================
// AUTH HELPERS
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
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('로그인 되었습니다.');
      AppState.isLoggedIn = true;
      setTimeout(() => navigateTo('page-home'), 500);
    });
  }
  
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('회원가입이 완료되었습니다.');
      setTimeout(() => navigateTo('page-login'), 500);
    });
  }
}

// ========================================
// TOAST NOTIFICATION
// ========================================
function showToast(message, duration = 2000) {
  // Remove existing toast
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Create new toast
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

// Add toast animation styles
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
function initSplash() {
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
  }, 2500);
}

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize splash screen
  initSplash();
  
  // Setup category tabs
  setupCategoryTabs();
  
  // Setup slider
  setupSlider();
  
  // Setup quantity controls
  setupQuantityControls();
  
  // Setup option buttons
  setupOptionButtons();
  
  // Setup label buttons
  setupLabelButtons();
  
  // Setup auth forms
  setupAuthForms();
  
  // Initialize cart badge
  updateCartBadge(AppState.cartCount);
});

// Make functions globally available
window.navigateTo = navigateTo;
window.navigateFromHeader = navigateFromHeader;
window.navigateFromTab = navigateFromTab;
window.goBack = goBack;
window.openMenuDetail = openMenuDetail;
window.quickAddToCart = quickAddToCart;
window.addToCartAndNavigate = addToCartAndNavigate;
window.updateCartQuantity = updateCartQuantity;
window.removeCartItem = removeCartItem;
window.editAddress = editAddress;
window.deleteAddress = deleteAddress;
window.saveAddress = saveAddress;
window.processPayment = processPayment;
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.togglePassword = togglePassword;
window.togglePointUsage = togglePointUsage;
window.updatePointUsage = updatePointUsage;
window.useAllPoints = useAllPoints;
