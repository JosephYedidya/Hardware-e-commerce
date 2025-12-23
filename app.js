/**
 * Main Application Logic
 * Handles all e-commerce functionality
 */

// ===== STATE =====
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let comparison = JSON.parse(localStorage.getItem('comparison')) || [];
let currentFilter = 'all';
let searchQuery = '';

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCartBadge();
  updateWishlistCount();
  updateComparisonBar();
  setupEventListeners();
  
  // Show promo banner after delay
  if (!sessionStorage.getItem('promoShown')) {
    setTimeout(() => {
      document.getElementById('promoBanner').classList.add('visible');
    }, 3000);
  }
});

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Search functionality
  document.getElementById('searchBar').addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderProducts();
  });

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderProducts();
    });
  });

  // Header scroll effect
  window.addEventListener('scroll', () => {
    document.querySelector('header').classList.toggle('scrolled', window.scrollY > 100);
    document.getElementById('backToTop').classList.toggle('visible', window.scrollY > 500);
  });

  // Back to top button
  document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Contact form submission
  document.getElementById('contactForm').addEventListener('submit', handleContactSubmit);

  // Close modals on outside click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // Escape key to close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.active').forEach(modal => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      });
    }
  });

  // Remove error on input
  document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
    input.addEventListener('input', () => input.classList.remove('error'));
  });
}

// ===== PRODUCT RENDERING =====
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const noResults = document.getElementById('noResults');
  
  const filtered = productsData.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery) || 
                         p.desc.toLowerCase().includes(searchQuery);
    const matchesFilter = currentFilter === 'all' || p.category === currentFilter;
    return matchesSearch && matchesFilter;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '';
    noResults.style.display = 'block';
    return;
  }

  noResults.style.display = 'none';
  grid.innerHTML = filtered.map(p => `
    <article class="product" data-id="${p.id}" data-category="${p.category}">
      <div class="product-rating">${'⭐'.repeat(p.rating)}${'☆'.repeat(5-p.rating)}</div>
      ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
      <button class="wishlist-btn ${isInWishlist(p.id) ? 'active' : ''}" 
              onclick="toggleWishlist(${p.id})"
              aria-label="${isInWishlist(p.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
        ${isInWishlist(p.id) ? '❤️' : '🤍'}
      </button>
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
      </div>
      <h3>${p.name}</h3>
      <p class="product-desc">${p.desc}</p>
      <div class="product-footer">
        <div class="product-footer-top">
          <p class="price">${formatPrice(p.price)}</p>
        </div>
        <div class="product-actions">
          <button class="add-cart-btn" id="addBtn-${p.id}" onclick="addToCart(${p.id}, this)">
            🛒 Ajouter
          </button>
          <button class="compare-btn-small ${isInComparison(p.id) ? 'active' : ''}" 
                  onclick="toggleComparison(${p.id})" 
                  aria-label="${isInComparison(p.id) ? 'Retirer de la comparaison' : 'Ajouter à la comparaison'}"
                  title="${isInComparison(p.id) ? 'Retirer de la comparaison' : 'Ajouter à la comparaison'}">
            📊
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

// ===== UTILITY FUNCTIONS =====
function formatPrice(price) {
  return price.toLocaleString('fr-FR') + ' FCFA';
}

function sanitizeInput(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== CART FUNCTIONS =====
function addToCart(id, btn) {
  const product = productsData.find(p => p.id === id);
  if (!product) return;
  
  const existing = cart.find(item => item.id === id);
  
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  
  saveCart();
  updateCartBadge();
  
  if (btn) {
    btn.classList.add('added');
    btn.innerHTML = '✓ Ajouté';
    setTimeout(() => {
      btn.classList.remove('added');
      btn.innerHTML = '🛒 Ajouter';
    }, 1500);
  }
  
  showToast('✅ Ajouté au panier!', 'success');
}

function updateQuantity(id, delta) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(id);
      return;
    }
    saveCart();
    updateCartBadge();
    renderCart();
  }
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  updateCartBadge();
  renderCart();
  showToast('🗑️ Produit retiré', 'info');
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

function renderCart() {
  const container = document.getElementById('cartItemsContainer');
  
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <p>Votre panier est vide</p>
      </div>
    `;
    return;
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  container.innerHTML = `
    <div class="cart-items">
      ${cart.map(item => `
        <div class="cart-item">
          <img src="${item.image}" alt="${sanitizeInput(item.name)}" class="cart-item-image">
          <div class="cart-item-info">
            <h4>${sanitizeInput(item.name)}</h4>
            <p class="cart-item-price">${formatPrice(item.price)}</p>
          </div>
          <div class="quantity-controls">
            <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)" aria-label="Diminuer la quantité">−</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)" aria-label="Augmenter la quantité">+</button>
          </div>
          <button class="remove-item" onclick="removeFromCart(${item.id})" aria-label="Retirer du panier">🗑️</button>
        </div>
      `).join('')}
    </div>
    <div class="cart-total">
      <div class="cart-total-row">
        <span>Total:</span>
        <span>${formatPrice(total)}</span>
      </div>
      <button class="checkout-btn" onclick="checkout()">
        💳 Procéder au paiement
      </button>
    </div>
  `;
}

function openCart() {
  renderCart();
  document.getElementById('cartModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartModal').classList.remove('active');
  document.body.style.overflow = '';
}

function checkout() {
  if (cart.length === 0) return;
  openPayment();
}

// ===== WISHLIST FUNCTIONS =====
function isInWishlist(id) {
  return wishlist.some(item => item.id === id);
}

function toggleWishlist(id) {
  const product = productsData.find(p => p.id === id);
  if (!product) return;
  
  if (isInWishlist(id)) {
    wishlist = wishlist.filter(item => item.id !== id);
    showToast('💔 Retiré des favoris', 'info');
  } else {
    wishlist.push(product);
    showToast('❤️ Ajouté aux favoris!', 'success');
  }
  
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateWishlistCount();
  renderProducts();
}

function updateWishlistCount() {
  document.getElementById('wishlistCount').textContent = wishlist.length;
}

function renderWishlist() {
  const container = document.getElementById('wishlistItemsContainer');
  
  if (wishlist.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">❤️</div>
        <p>Votre liste de souhaits est vide</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="cart-items">
      ${wishlist.map(item => `
        <div class="cart-item">
          <img src="${item.image}" alt="${sanitizeInput(item.name)}" class="cart-item-image">
          <div class="cart-item-info">
            <h4>${sanitizeInput(item.name)}</h4>
            <p class="cart-item-price">${formatPrice(item.price)}</p>
          </div>
          <button class="add-cart-btn" onclick="addFromWishlist(${item.id})">
            🛒 Ajouter
          </button>
        </div>
      `).join('')}
    </div>
  `;
}

function addFromWishlist(id) {
  addToCart(id, null);
  closeWishlist();
}

function openWishlist() {
  renderWishlist();
  document.getElementById('wishlistModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeWishlist() {
  document.getElementById('wishlistModal').classList.remove('active');
  document.body.style.overflow = '';
}

// ===== COMPARISON FUNCTIONS =====
function isInComparison(id) {
  return comparison.some(item => item.id === id);
}

function toggleComparison(id) {
  const product = productsData.find(p => p.id === id);
  if (!product) return;
  
  if (isInComparison(id)) {
    comparison = comparison.filter(item => item.id !== id);
    showToast('📊 Retiré de la comparaison', 'info');
  } else {
    if (comparison.length >= 3) {
      showToast('⚠️ Maximum 3 produits à comparer', 'error');
      return;
    }
    comparison.push(product);
    showToast('📊 Ajouté à la comparaison', 'success');
  }
  
  localStorage.setItem('comparison', JSON.stringify(comparison));
  updateComparisonBar();
  renderProducts();
}

function updateComparisonBar() {
  const bar = document.getElementById('comparisonBar');
  const itemsContainer = document.getElementById('comparisonItems');
  const compareBtn = document.getElementById('compareNowBtn');
  
  if (comparison.length === 0) {
    bar.classList.remove('visible');
    return;
  }
  
  bar.classList.add('visible');
  
  let html = comparison.map(p => `
    <div class="comparison-item">
      <img src="${p.image}" alt="${sanitizeInput(p.name)}">
    </div>
  `).join('');
  
  // Empty slots
  for (let i = comparison.length; i < 3; i++) {
    html += '<div class="comparison-item empty">+</div>';
  }
  
  itemsContainer.innerHTML = html;
  compareBtn.textContent = `Comparer (${comparison.length})`;
  compareBtn.disabled = comparison.length < 2;
}

function clearComparison() {
  comparison = [];
  localStorage.setItem('comparison', JSON.stringify(comparison));
  updateComparisonBar();
  renderProducts();
}

function openComparison() {
  if (comparison.length < 2) {
    showToast('⚠️ Sélectionnez au moins 2 produits', 'error');
    return;
  }
  
  renderComparison();
  document.getElementById('comparisonModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeComparison() {
  document.getElementById('comparisonModal').classList.remove('active');
  document.body.style.overflow = '';
}

function renderComparison() {
  const container = document.getElementById('comparisonContent');
  
  container.innerHTML = `
    <table class="comparison-table">
      <thead>
        <tr>
          <th>Caractéristique</th>
          ${comparison.map(p => `<th>${sanitizeInput(p.name)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Image</strong></td>
          ${comparison.map(p => `<td><img src="${p.image}" alt="${sanitizeInput(p.name)}"></td>`).join('')}
        </tr>
        <tr>
          <td><strong>Prix</strong></td>
          ${comparison.map(p => `<td><strong style="color:var(--primary)">${formatPrice(p.price)}</strong></td>`).join('')}
        </tr>
        <tr>
          <td><strong>Catégorie</strong></td>
          ${comparison.map(p => `<td>${categoryLabels[p.category] || p.category}</td>`).join('')}
        </tr>
        <tr>
          <td><strong>Description</strong></td>
          ${comparison.map(p => `<td>${sanitizeInput(p.desc)}</td>`).join('')}
        </tr>
        <tr>
          <td><strong>Note</strong></td>
          ${comparison.map(p => `<td>${'⭐'.repeat(p.rating)}${'☆'.repeat(5-p.rating)}</td>`).join('')}
        </tr>
      </tbody>
    </table>
  `;
}

// ===== FILTER BY CATEGORY =====
function filterByCategory(category) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`[data-filter="${category}"]`);
  if (btn) btn.classList.add('active');
  currentFilter = category;
  renderProducts();
  document.getElementById('produits').scrollIntoView({ behavior: 'smooth' });
}

// ===== THEME TOGGLE =====
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const icon = document.getElementById('themeIcon');
  icon.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
  localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

// Load saved theme
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
  document.getElementById('themeIcon').textContent = '☀️';
}

// ===== CONTACT FORM =====
function handleContactSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('contactName');
  const email = document.getElementById('contactEmail');
  const phone = document.getElementById('contactPhone');
  const message = document.getElementById('contactMessage');
  const submitBtn = document.getElementById('submitBtn');
  
  let isValid = true;

  // Reset errors
  [name, email, phone, message].forEach(el => el.classList.remove('error'));

  // Validation
  const nameValue = name.value.trim();
  if (!nameValue || nameValue.length > 100) {
    name.classList.add('error');
    isValid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailValue = email.value.trim();
  if (!emailValue || !emailRegex.test(emailValue) || emailValue.length > 255) {
    email.classList.add('error');
    isValid = false;
  }

  const phoneValue = phone.value.trim();
  if (phoneValue && !/^[0-9+\s\-()]{0,20}$/.test(phoneValue)) {
    phone.classList.add('error');
    isValid = false;
  }

  const messageValue = message.value.trim();
  if (!messageValue || messageValue.length > 1000) {
    message.classList.add('error');
    isValid = false;
  }

  if (isValid) {
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Envoi en cours...';
    
    // Simulate form submission
    setTimeout(() => {
      showToast('✅ Message envoyé avec succès!', 'success');
      document.getElementById('contactForm').reset();
      submitBtn.disabled = false;
      submitBtn.textContent = '📧 Envoyer le message';
    }, 1500);
  } else {
    showToast('❌ Veuillez corriger les erreurs', 'error');
  }
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'success') {
  // Remove existing toasts
  document.querySelectorAll('.toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = sanitizeInput(message);
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  
  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}

// ===== PROMO BANNER =====
function closePromo() {
  document.getElementById('promoBanner').classList.remove('visible');
  sessionStorage.setItem('promoShown', 'true');
}

// ===== PAYMENT FUNCTIONS =====
function openPayment() {
  renderPaymentSummary();
  renderPaymentItems();
  document.getElementById('paymentModal').classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Setup payment option selection
  setupPaymentOptions();
}

function closePayment() {
  document.getElementById('paymentModal').classList.remove('active');
  document.body.style.overflow = '';
  
  // Reset form
  resetPaymentForm();
}

function renderPaymentSummary() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 2500; // Frais de livraison fixe
  const total = subtotal + shipping;
  
  document.getElementById('paymentSubtotal').textContent = formatPrice(subtotal);
  document.getElementById('paymentShipping').textContent = formatPrice(shipping);
  document.getElementById('paymentTotal').textContent = formatPrice(total);
}

function renderPaymentItems() {
  const container = document.getElementById('paymentItems');
  
  container.innerHTML = cart.map(item => `
    <div class="payment-item">
      <div class="payment-item-info">
        <img src="${item.image}" alt="${sanitizeInput(item.name)}" class="payment-item-image">
        <div class="payment-item-details">
          <h4>${sanitizeInput(item.name)}</h4>
          <p>Qty: ${item.quantity}</p>
        </div>
      </div>
      <div class="payment-item-price">${formatPrice(item.price * item.quantity)}</div>
    </div>
  `).join('');
}

function setupPaymentOptions() {
  const paymentOptions = document.querySelectorAll('.payment-option');
  
  paymentOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Remove selected class from all options
      paymentOptions.forEach(opt => opt.classList.remove('selected'));
      
      // Add selected class to clicked option
      option.classList.add('selected');
      
      // Update confirm button state
      updateConfirmButtonState();
    });
  });
  
  // Setup form inputs
  const formInputs = document.querySelectorAll('#paymentModal input, #paymentModal textarea');
  formInputs.forEach(input => {
    input.addEventListener('input', updateConfirmButtonState);
  });
}

function updateConfirmButtonState() {
  const selectedOption = document.querySelector('.payment-option.selected');
  const confirmBtn = document.getElementById('confirmPaymentBtn');
  
  if (!selectedOption) {
    confirmBtn.disabled = true;
    return;
  }
  
  const method = selectedOption.dataset.method;
  let isValid = true;
  
  // Check method-specific validation
  if (method === 'orange-money') {
    const phone = document.getElementById('orangeNumber').value.trim();
    isValid = phone.length === 9 && phone.startsWith('6');
  } else if (method === 'mtn-mobile') {
    const phone = document.getElementById('mtnNumber').value.trim();
    isValid = phone.length === 9 && phone.startsWith('6');
  } else if (method === 'bank-transfer' || method === 'cash-delivery') {
    isValid = true; // No additional validation needed
  }
  
  // Check customer info
  const customerName = document.getElementById('customerName').value.trim();
  const customerPhone = document.getElementById('customerPhone').value.trim();
  const customerAddress = document.getElementById('customerAddress').value.trim();
  
  isValid = isValid && customerName.length > 0 && 
                  customerPhone.length > 0 && 
                  customerAddress.length > 0;
  
  confirmBtn.disabled = !isValid;
}

function resetPaymentForm() {
  // Reset payment options
  document.querySelectorAll('.payment-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  
  // Reset form inputs
  document.querySelectorAll('#paymentModal input, #paymentModal textarea').forEach(input => {
    input.value = '';
  });
  
  // Reset confirm button
  document.getElementById('confirmPaymentBtn').disabled = true;
}

function confirmPayment() {
  const selectedOption = document.querySelector('.payment-option.selected');
  const method = selectedOption.dataset.method;
  
  // Show loading state
  const btn = document.getElementById('confirmPaymentBtn');
  const btnText = btn.querySelector('.btn-text');
  const btnLoading = btn.querySelector('.btn-loading');
  
  btn.disabled = true;
  btnText.style.display = 'none';
  btnLoading.style.display = 'inline';
  
  // Get customer info
  const customerInfo = {
    name: document.getElementById('customerName').value.trim(),
    phone: document.getElementById('customerPhone').value.trim(),
    address: document.getElementById('customerAddress').value.trim()
  };
  
  // Get payment method specific info
  let paymentInfo = {};
  if (method === 'orange-money') {
    paymentInfo.phone = document.getElementById('orangeNumber').value.trim();
  } else if (method === 'mtn-mobile') {
    paymentInfo.phone = document.getElementById('mtnNumber').value.trim();
  }
  
  // Simulate payment processing
  setTimeout(() => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 2500;
    
    // Create order object
    const order = {
      id: Date.now(),
      items: [...cart],
      total: total,
      method: method,
      customer: customerInfo,
      payment: paymentInfo,
      date: new Date().toISOString(),
      status: 'confirmed'
    };
    
    // Save order (in real app, this would go to backend)
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart
    cart = [];
    saveCart();
    updateCartBadge();
    
    // Show success message
    let message = '';
    switch(method) {
      case 'orange-money':
        message = `🎉 Paiement Orange Money réussi! Commande #${order.id} confirmée.`;
        break;
      case 'mtn-mobile':
        message = `🎉 Paiement MTN Mobile Money réussi! Commande #${order.id} confirmée.`;
        break;
      case 'bank-transfer':
        message = `🏦 Virement bancaire enregistré! Commande #${order.id} en attente de validation.`;
        break;
      case 'cash-delivery':
        message = `💵 Commande #${order.id} enregistrée! Paiement à la livraison.`;
        break;
    }
    
    showToast(message, 'success');
    
    // Close payment modal
    closePayment();
    closeCart();
    
    // Reset button state
    btn.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
    
  }, 3000); // Simulate 3 second processing time
}
