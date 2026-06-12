/* KM PACKAGES — Full CRUD, Cart, Slider */

const CART_KEY = 'km_cart';
const PRODUCTS_KEY = 'km_products';

const defaultProducts = [
  { id: 'p1', name: 'Standard Corrugated Box', price: 25, cat: 'corrugated', desc: '3-ply kraft cardboard, various sizes', imgKey: 'box1', tag: 'Best Seller' },
  { id: 'p2', name: 'Custom Printed Box', price: 45, cat: 'printed', desc: 'Full-color offset printing with logo', imgKey: 'box2' },
  { id: 'p3', name: 'Heavy-Duty Shipping Carton', price: 60, cat: 'shipping', desc: '5-ply reinforced walls', imgKey: 'box3' },
  { id: 'p4', name: 'Retail Display Box', price: 55, cat: 'retail', desc: 'Premium shelf-ready finish', imgKey: 'box4' },
  { id: 'p5', name: 'Die-Cut Custom Box', price: 80, cat: 'custom', desc: 'Unique shapes and inserts', imgKey: 'box5', tag: 'Custom' },
  { id: 'p6', name: 'Industrial Master Carton', price: 120, cat: 'industrial', desc: 'Large-format factory boxes', imgKey: 'box6' }
];

const slideTexts = [
  { tag: 'Premium Packaging', title: 'Premium Corrugated<br>Cardboard Boxes', desc: 'Strong kraft boxes for shipping, storage and delivery across Pakistan.' },
  { tag: 'Custom Printing', title: 'Branded Printed<br>Packaging Boxes', desc: 'High-quality offset printing — your logo, your design, our craftsmanship.' },
  { tag: 'Industrial Grade', title: 'Heavy-Duty Industrial<br>Cartons & Crates', desc: 'Reinforced large-format boxes built for factories and bulk shipments.' }
];

const IMG_MAP = typeof IMG !== 'undefined' ? IMG : {
  box1: 'assets/images/box1.jpg', box2: 'assets/images/box2.jpg', box3: 'assets/images/box3.jpg',
  box4: 'assets/images/box4.jpg', box5: 'assets/images/box5.jpg', box6: 'assets/images/box6.jpg',
  fallback: 'assets/images/placeholder.svg'
};

let products = [];
let cart = [];
let currentSlide = 0;
let slideTimer;

function getImg(key) {
  return IMG_MAP[key] || IMG_MAP.fallback;
}

function imgTag(key, alt) {
  const src = getImg(key || 'box1');
  const fb = IMG_MAP.fallback;
  return `<img src="${src}" alt="${alt}" onerror="this.onerror=null;this.src='${fb}'" />`;
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    products = loadProducts();
    cart = loadCart();
    renderProducts();
    renderCart();
    initSidebar();
    initCart();
    initSlider();
    initDropdown();
    initFilters();
    initCategoryPills();
    initCategoryCards();
    initCRUD();
    initCallButtons();
    initScrollSpy();
    initContactForm();
  } catch (err) {
    console.error('Init error:', err);
    showToast('Error loading site. Please refresh the page.');
  }
});

/* ===== CRUD: PRODUCTS ===== */
function loadProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem(PRODUCTS_KEY));
    if (Array.isArray(saved) && saved.length > 0) {
      return saved.map(p => ({
        id: p.id || ('p' + Date.now() + Math.random()),
        name: p.name || 'Unnamed Product',
        price: Number(p.price) || 0,
        cat: p.cat || 'corrugated',
        desc: p.desc || '',
        imgKey: p.imgKey || 'box1',
        tag: p.tag || ''
      }));
    }
  } catch (e) {
    localStorage.removeItem(PRODUCTS_KEY);
  }
  return defaultProducts.map(p => ({ ...p }));
}

function saveProducts() {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (!products.length) {
    grid.innerHTML = '<p class="empty-msg">No products yet. Click "+ Add Product" above.</p>';
    return;
  }

  products.forEach(p => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.cat = p.cat;
    card.dataset.id = p.id;
    card.innerHTML = `
      <div class="product-card-img">
        ${imgTag(p.imgKey, p.name)}
        ${p.tag ? `<span class="product-tag">${p.tag}</span>` : ''}
        <div class="product-actions">
          <button type="button" class="btn-action btn-edit" data-id="${p.id}" title="Edit product">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button type="button" class="btn-action btn-delete" data-id="${p.id}" title="Delete product">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          </button>
        </div>
      </div>
      <div class="product-card-body">
        <h3>${escapeHtml(p.name)}</h3>
        <p>${escapeHtml(p.desc || '')}</p>
        <span class="product-cat-label">${p.cat}</span>
        <div class="product-card-foot">
          <span class="product-price">Rs. ${p.price}<small>/pc</small></span>
          <button type="button" class="btn-cart" data-id="${p.id}">Add to Cart</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.btn-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = products.find(x => x.id === btn.dataset.id);
      if (p) {
        addToCart(p);
        btn.textContent = 'Added ✓';
        btn.classList.add('done');
        setTimeout(() => { btn.textContent = 'Add to Cart'; btn.classList.remove('done'); }, 1400);
      }
    });
  });

  grid.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      openModal('edit', btn.dataset.id);
    });
  });

  grid.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      if (confirm('Delete this product?')) deleteProduct(btn.dataset.id);
    });
  });
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function createProduct(data) {
  const product = {
    id: 'p' + Date.now(),
    name: data.name,
    price: parseInt(data.price, 10),
    cat: data.cat,
    desc: data.desc || '',
    imgKey: data.imgKey || 'box1',
    tag: 'New'
  };
  products.push(product);
  saveProducts();
  renderProducts();
  showToast('Product added: ' + product.name);
}

function updateProduct(id, data) {
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return;
  products[idx] = {
    ...products[idx],
    name: data.name,
    price: parseInt(data.price, 10),
    cat: data.cat,
    desc: data.desc || '',
    imgKey: data.imgKey || 'box1'
  };
  saveProducts();
  renderProducts();
  showToast('Product updated!');
}

function deleteProduct(id) {
  products = products.filter(p => p.id !== id);
  cart = cart.filter(i => i.id !== id);
  saveProducts();
  saveCart();
  renderProducts();
  renderCart();
  showToast('Product deleted');
}

/* ===== CRUD MODAL ===== */
function initCRUD() {
  const modal = document.getElementById('productModal');
  const overlay = document.getElementById('modalOverlay');
  const form = document.getElementById('productForm');
  const btnCreate = document.getElementById('btnCreate');

  if (!modal || !overlay || !form || !btnCreate) {
    console.error('CRUD elements missing');
    return;
  }

  function closeModal() {
    modal.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    form.reset();
    document.getElementById('editId').value = '';
  }

  btnCreate.addEventListener('click', (e) => {
    e.preventDefault();
    openModal('create');
  });

  document.querySelectorAll('.modal-close-btn').forEach(b => {
    b.addEventListener('click', (e) => { e.preventDefault(); closeModal(); });
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  modal.addEventListener('click', (e) => e.stopPropagation());

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('itemName').value.trim();
    const price = document.getElementById('itemPrice').value;
    if (!name || !price) {
      showToast('Please fill name and price');
      return;
    }
    const data = {
      name,
      price,
      cat: document.getElementById('itemCategory').value,
      desc: document.getElementById('itemDesc').value.trim(),
      imgKey: document.getElementById('itemImage').value
    };
    const editId = document.getElementById('editId').value;
    if (editId) updateProduct(editId, data);
    else createProduct(data);
    closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}

function openModal(mode, id) {
  const modal = document.getElementById('productModal');
  const overlay = document.getElementById('modalOverlay');
  if (!modal || !overlay) return;

  document.getElementById('modalTitle').textContent = mode === 'edit' ? 'Edit Product' : 'Add New Product';
  document.getElementById('modalSubmitBtn').textContent = mode === 'edit' ? 'Update Product' : 'Save Product';

  if (mode === 'edit' && id) {
    const p = products.find(x => x.id === id);
    if (p) {
      document.getElementById('editId').value = p.id;
      document.getElementById('itemName').value = p.name;
      document.getElementById('itemPrice').value = p.price;
      document.getElementById('itemCategory').value = p.cat;
      document.getElementById('itemDesc').value = p.desc || '';
      document.getElementById('itemImage').value = p.imgKey || 'box1';
    }
  } else {
    document.getElementById('editId').value = '';
    document.getElementById('productForm').reset();
  }

  modal.classList.add('open');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('itemName').focus(), 100);
}

/* ===== CALL BUTTONS ===== */
function initCallButtons() {
  document.querySelectorAll('.btn-call').forEach(btn => {
    btn.addEventListener('click', () => {
      const phone = btn.dataset.phone || '0300-9490436';
      const clean = phone.replace(/[^0-9+]/g, '');
      const tel = clean.startsWith('0') ? '+92' + clean.slice(1) : clean;

      showToast('Calling ' + phone + '...');

      try {
        window.location.href = 'tel:' + tel;
      } catch (e) {}

      if (navigator.clipboard) {
        navigator.clipboard.writeText(phone).catch(() => {});
      }

      const alt = document.createElement('a');
      alt.href = 'tel:' + tel;
      alt.style.display = 'none';
      document.body.appendChild(alt);
      alt.click();
      document.body.removeChild(alt);
    });
  });
}

/* ===== CART ===== */
function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

function addToCart(product) {
  const item = cart.find(i => i.id === product.id);
  const img = getImg(product.imgKey);
  if (item) item.qty++;
  else cart.push({ id: product.id, name: product.name, price: product.price, img, qty: 1 });
  saveCart();
  renderCart();
  showToast(product.name + ' added to cart');
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function getTotal() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }
function getCount() { return cart.reduce((s, i) => s + i.qty, 0); }

function renderCart() {
  const container = document.getElementById('cartItems');
  const empty = document.getElementById('cartEmpty');
  const footer = document.getElementById('cartFooter');
  if (!container) return;

  const count = getCount();
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
  const sub = document.getElementById('cartSubtitle');
  if (sub) sub.textContent = count + ' item' + (count !== 1 ? 's' : '');

  container.innerHTML = '';

  if (!cart.length) {
    if (empty) empty.classList.remove('hidden');
    if (footer) footer.hidden = true;
    return;
  }

  if (empty) empty.classList.add('hidden');
  if (footer) footer.hidden = false;

  cart.forEach(item => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <img class="cart-item-img" src="${item.img}" alt="${item.name}" onerror="this.src='${IMG_MAP.fallback}'" />
      <div class="cart-item-info">
        <div class="cart-item-name">${escapeHtml(item.name)}</div>
        <div class="cart-item-price">Rs. ${item.price} each</div>
        <div class="cart-item-row">
          <button type="button" class="qty-btn" data-id="${item.id}" data-d="-1">−</button>
          <span class="qty-num">${item.qty}</span>
          <button type="button" class="qty-btn" data-id="${item.id}" data-d="1">+</button>
          <button type="button" class="cart-remove" data-id="${item.id}">Remove</button>
        </div>
      </div>
    `;
    container.appendChild(el);
  });

  container.querySelectorAll('.qty-btn').forEach(b => {
    b.addEventListener('click', () => updateQty(b.dataset.id, parseInt(b.dataset.d, 10)));
  });
  container.querySelectorAll('.cart-remove').forEach(b => {
    b.addEventListener('click', () => removeFromCart(b.dataset.id));
  });

  const total = 'Rs. ' + getTotal().toLocaleString();
  const subEl = document.getElementById('cartSubtotal');
  const totEl = document.getElementById('cartTotal');
  if (subEl) subEl.textContent = total;
  if (totEl) totEl.textContent = total;
}

function initCart() {
  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) cartBtn.addEventListener('click', openCart);
  document.getElementById('cartClose')?.addEventListener('click', closeCart);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
  document.getElementById('cartShopLink')?.addEventListener('click', () => { closeCart(); scrollTo('products'); });
  document.getElementById('clearCartBtn')?.addEventListener('click', () => { cart = []; saveCart(); renderCart(); showToast('Cart cleared'); });
  document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    if (!cart.length) return;
    const lines = cart.map(i => '• ' + i.name + ' × ' + i.qty + ' = Rs. ' + (i.price * i.qty));
    const body = ['Order from KM PACKAGES:', '', ...lines, '', 'Total: Rs. ' + getTotal().toLocaleString()].join('\n');
    window.location.href = 'mailto:kmpackages@gmail.com?subject=' + encodeURIComponent('New Order') + '&body=' + encodeURIComponent(body);
    closeCart();
  });
}

function openCart() {
  document.getElementById('cartPanel')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cartPanel')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('active');
  document.body.style.overflow = '';
}

/* ===== SLIDER ===== */
function initSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.dot');
  if (!slides.length) return;

  function goTo(i) {
    currentSlide = ((i % slides.length) + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle('active', idx === currentSlide));
    dots.forEach((d, idx) => d.classList.toggle('active', idx === currentSlide));
    const t = slideTexts[currentSlide];
    const tag = document.getElementById('heroTag');
    const title = document.getElementById('heroTitle');
    const desc = document.getElementById('heroDesc');
    if (tag) tag.textContent = t.tag;
    if (title) title.innerHTML = t.title;
    if (desc) desc.textContent = t.desc;
  }

  document.getElementById('sliderPrev')?.addEventListener('click', () => { goTo(currentSlide - 1); resetTimer(); });
  document.getElementById('sliderNext')?.addEventListener('click', () => { goTo(currentSlide + 1); resetTimer(); });
  dots.forEach(d => d.addEventListener('click', () => { goTo(parseInt(d.dataset.i, 10)); resetTimer(); }));

  function resetTimer() {
    clearInterval(slideTimer);
    slideTimer = setInterval(() => goTo(currentSlide + 1), 5000);
  }
  resetTimer();
}

/* ===== SIDEBAR & NAV ===== */
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const open = () => { sidebar?.classList.add('open'); overlay?.classList.add('active'); document.body.style.overflow = 'hidden'; };
  const close = () => { sidebar?.classList.remove('open'); overlay?.classList.remove('active'); document.body.style.overflow = ''; };

  document.getElementById('menuBtn')?.addEventListener('click', open);
  document.getElementById('sidebarClose')?.addEventListener('click', close);
  overlay?.addEventListener('click', close);
  document.querySelectorAll('.sidebar-link').forEach(l => {
    l.addEventListener('click', () => {
      close();
      const href = l.getAttribute('href');
      if (href && href.startsWith('#')) {
        setTimeout(() => scrollTo(href.slice(1)), 300);
      }
    });
  });
}

function initScrollSpy() {
  const sections = ['home', 'categories', 'products', 'contact', 'about'];
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) setNav(e.target.id); });
  }, { rootMargin: '-35% 0 -50% 0' });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) obs.observe(el);
  });

  document.querySelectorAll('.nav-link, .footer-links a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        e.preventDefault();
        scrollTo(href.slice(1));
        setNav(href.slice(1));
      }
    });
  });
}

function setNav(id) {
  document.querySelectorAll('.nav-link, .sidebar-link').forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === '#' + id);
  });
}

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: 'smooth' });
    setNav(id);
  }
}

/* ===== FILTERS ===== */
function initDropdown() {
  const menu = document.getElementById('dropdownMenu');
  const trigger = document.getElementById('dropdownTrigger');
  if (!menu || !trigger) return;

  trigger.addEventListener('click', e => { e.stopPropagation(); menu.classList.toggle('open'); });
  menu.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
      document.getElementById('dropdownLabel').textContent = li.textContent;
      menu.classList.remove('open');
      filterProducts(li.dataset.value);
      setFilter(li.dataset.value);
      scrollTo('products');
    });
  });
  document.addEventListener('click', () => menu.classList.remove('open'));
}

function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filterProducts(btn.dataset.filter);
      setFilter(btn.dataset.filter);
    });
  });
}

function filterProducts(cat) {
  document.querySelectorAll('.product-card').forEach(c => {
    c.classList.toggle('hidden', cat !== 'all' && c.dataset.cat !== cat);
  });
}

function setFilter(cat) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === cat));
  document.querySelectorAll('.cat-pill').forEach(p => p.classList.toggle('active', p.dataset.cat === cat));
}

function initCategoryPills() {
  document.querySelectorAll('.cat-pill').forEach(p => {
    p.addEventListener('click', () => {
      filterProducts(p.dataset.cat);
      setFilter(p.dataset.cat);
      scrollTo('products');
      document.getElementById('sidebar')?.classList.remove('open');
      document.getElementById('sidebarOverlay')?.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

function initCategoryCards() {
  document.querySelectorAll('.cat-card').forEach(c => {
    c.addEventListener('click', () => {
      filterProducts(c.dataset.cat);
      setFilter(c.dataset.cat);
      scrollTo('products');
    });
  });
}

function initContactForm() {
  document.getElementById('contactForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const cat = document.getElementById('category');
    const msg = document.getElementById('message').value.trim();
    const body = ['Name: ' + name, 'Phone: ' + phone, 'Category: ' + cat.options[cat.selectedIndex].text, 'Message: ' + (msg || 'N/A')].join('\n');
    window.location.href = 'mailto:kmpackages@gmail.com?subject=' + encodeURIComponent('Inquiry from ' + name) + '&body=' + encodeURIComponent(body);
    e.target.reset();
    showToast('Opening email...');
  });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}
