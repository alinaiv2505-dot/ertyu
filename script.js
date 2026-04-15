// ========== DOM CONTENT LOADED ==========
document.addEventListener('DOMContentLoaded', () => {
    
    // ========== 1. КОРЗИНА (полноценная) ==========
    let cart = [];
    
    // Загрузка корзины из localStorage
    function loadCartFromStorage() {
        const savedCart = localStorage.getItem('florist_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartCounters();
            renderCartItems();
        }
    }
    
    // Сохранение корзины в localStorage
    function saveCartToStorage() {
        localStorage.setItem('florist_cart', JSON.stringify(cart));
    }
    
    // Обновление счетчиков корзины
    function updateCartCounters() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCounters = document.querySelectorAll('.cart-count');
        cartCounters.forEach(counter => {
            counter.textContent = totalItems;
        });
    }
    
    // Добавление товара в корзину
    function addToCart(name, price, image = null) {
        const existingItem = cart.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: Date.now(),
                name: name,
                price: price,
                image: image || 'https://placehold.co/300x200/F9F3E9/C44536?text=' + encodeURIComponent(name),
                quantity: 1
            });
        }
        
        saveCartToStorage();
        updateCartCounters();
        renderCartItems();
        showNotification(`🌿 "${name}" добавлен в корзину`);
        
        // Вывод в консоль по требованию ТЗ
        console.log(`Товар "${name}" добавлен в корзину`);
    }
    
    // Отображение уведомления
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification-toast';
        notification.innerHTML = `
            <div style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #C44536;
                color: white;
                padding: 12px 24px;
                border-radius: 50px;
                z-index: 2000;
                animation: slideInRight 0.3s ease;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                font-family: 'Source Sans Pro', sans-serif;
            ">
                ${message}
            </div>
        `;
        
        // Добавляем анимацию, если ещё не добавлена
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.querySelector('div').style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Отображение товаров в корзине
    function renderCartItems() {
        const cartItemsContainer = document.getElementById('cartItems');
        if (!cartItemsContainer) return;
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart">Корзина пуста<br>🌸</div>';
            const totalElement = document.getElementById('cartTotal');
            if (totalElement) totalElement.textContent = '0 ₽';
            return;
        }
        
        cartItemsContainer.innerHTML = '';
        let total = 0;
        
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${item.price} ₽</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" data-index="${index}" data-change="-1">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" data-index="${index}" data-change="1">+</button>
                    </div>
                </div>
                <button class="remove-item" data-index="${index}">🗑️</button>
            `;
            cartItemsContainer.appendChild(cartItem);
        });
        
        const totalElement = document.getElementById('cartTotal');
        if (totalElement) totalElement.textContent = `${total} ₽`;
        
        // Обработчики для кнопок количества
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(btn.dataset.index);
                const change = parseInt(btn.dataset.change);
                
                if (cart[index]) {
                    const newQuantity = cart[index].quantity + change;
                    if (newQuantity <= 0) {
                        cart.splice(index, 1);
                    } else {
                        cart[index].quantity = newQuantity;
                    }
                    saveCartToStorage();
                    renderCartItems();
                    updateCartCounters();
                }
            });
        });
        
        // Обработчики для кнопок удаления
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(btn.dataset.index);
                const removedItem = cart[index];
                cart.splice(index, 1);
                saveCartToStorage();
                renderCartItems();
                updateCartCounters();
                showNotification(`🗑️ "${removedItem.name}" удалён из корзины`);
                console.log(`Товар "${removedItem.name}" удалён из корзины`);
            });
        });
    }
    
    // Открытие/закрытие корзины
    function openCart() {
        const cartModal = document.getElementById('cartModal');
        const cartOverlay = document.getElementById('cartOverlay');
        if (cartModal) cartModal.classList.add('open');
        if (cartOverlay) cartOverlay.classList.add('open');
        renderCartItems();
    }
    
    function closeCart() {
        const cartModal = document.getElementById('cartModal');
        const cartOverlay = document.getElementById('cartOverlay');
        if (cartModal) cartModal.classList.remove('open');
        if (cartOverlay) cartOverlay.classList.remove('open');
    }
    
    // Инициализация корзины
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', openCart);
    }
    
    const closeCartBtn = document.getElementById('closeCart');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', closeCart);
    }
    
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCart);
    }
    
    // Оформление заказа
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showNotification('Корзина пуста! Добавьте товары');
                return;
            }
            alert('Спасибо за заказ! Наш менеджер свяжется с вами для подтверждения.');
            console.log('Заказ оформлен:', cart);
            cart = [];
            saveCartToStorage();
            updateCartCounters();
            renderCartItems();
            closeCart();
            showNotification('✅ Заказ успешно оформлен!');
        });
    }
    
    // Обработчики кнопок "В корзину"
    function initAddToCartButtons() {
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            // Убираем старые обработчики, чтобы не было дублирования
            btn.removeEventListener('click', handleAddToCart);
            btn.addEventListener('click', handleAddToCart);
        });
    }
    
    function handleAddToCart(e) {
        e.stopPropagation();
        const btn = e.currentTarget;
        
        // Пытаемся найти карточку товара
        const card = btn.closest('.product-card');
        
        if (card) {
            const name = card.querySelector('h3')?.textContent || 'Товар';
            const priceText = card.querySelector('.price')?.textContent || '0';
            const price = parseInt(priceText.replace(/[^0-9]/g, ''));
            const img = card.querySelector('img')?.src;
            addToCart(name, price, img);
        } else {
            // Если кнопка с data-атрибутами
            const name = btn.getAttribute('data-name') || 
                        document.querySelector('h1')?.textContent || 
                        'Товар';
            const price = parseInt(btn.getAttribute('data-price')) || 
                         parseInt(document.querySelector('.price')?.textContent?.replace(/[^0-9]/g, '') || 0);
            const img = document.querySelector('.product-images img')?.src;
            addToCart(name, price, img);
        }
    }
    
    // ========== 2. ТЕКУЩИЙ ГОД В ФУТЕРЕ ==========
    const yearSpans = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();
    yearSpans.forEach(span => {
        span.textContent = currentYear;
    });
    
    // ========== 3. БУРГЕР-МЕНЮ ==========
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav');
    if (burger && nav) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('open');
        });
        
        // Закрываем меню при клике на ссылку
        document.querySelectorAll('.nav__link').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
            });
        });
    }
    
    // ========== 4. ТАБЫ НА СТРАНИЦЕ ТОВАРА ==========
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    if (tabBtns.length) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                tabContents.forEach(content => content.classList.remove('active'));
                const activeTab = document.getElementById(tabId);
                if (activeTab) activeTab.classList.add('active');
            });
        });
    }
    
    // ========== 5. КАЛЕНДАРЬ ДОСТАВКИ (минимальная дата - сегодня) ==========
    const deliveryDateInput = document.getElementById('deliveryDate');
    if (deliveryDateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        deliveryDateInput.min = `${yyyy}-${mm}-${dd}`;
        
        deliveryDateInput.addEventListener('change', (e) => {
            const selectedDate = e.target.value;
            if (selectedDate) {
                console.log(`Выбрана дата доставки: ${selectedDate}`);
            }
        });
    }
    
    // ========== 6. ФИЛЬТРАЦИЯ В КАТАЛОГЕ ==========
    const filterBtns = document.querySelectorAll('.filter-btn');
    const catalogGrid = document.getElementById('catalogGrid');
    
    // Товары для каталога
   // ========== ТОВАРЫ ДЛЯ КАТАЛОГА (МИНИМУМ 6 ШТ) ==========
const catalogProducts = [
    // Цветы (flowers)
    { 
        name: 'Роза красная', 
        category: 'flowers', 
        price: 350, 
        desc: 'Свежий срез, 50 см, 1 шт', 
        image: 'https://images.icon-icons.com/1478/PNG/512/rose_101950.png' 
    },
    { 
        name: 'Тюльпаны (10 шт)', 
        category: 'flowers', 
        price: 420, 
        desc: 'Весенние, 40 см, набор 10 шт', 
        image: 'https://images.icon-icons.com/1465/PNG/96/510tulip_100692.png' 
    },
    { 
        name: 'Пионы розовые', 
        category: 'flowers', 
        price: 650, 
        desc: 'Махровые, 50 см, 3 шт', 
        image: 'https://avatars.mds.yandex.net/i?id=6f56cba26420c1fded221bdd686b70a0c9ac4782-5233636-images-thumbs&n=13' 
    },
    
    // Комнатные растения (plants)
    { 
        name: 'Спатифиллум', 
        category: 'plants', 
        price: 1200, 
        desc: 'Очищает воздух, D12', 
        image: 'https://avatars.mds.yandex.net/i?id=4ed934ec27a33883f90dd0a406e101acc66e35eb-12371805-images-thumbs&n=13' 
    },
    { 
        name: 'Фикус Бенджамина', 
        category: 'plants', 
        price: 2100, 
        desc: 'Крупномер, высота 100 см', 
        image: 'https://s3.yutstroi.ru/stroymagpics/1088869700/1088869700_1n.jpg' 
    },
    { 
        name: 'Суккулент микс', 
        category: 'plants', 
        price: 450, 
        desc: 'Набор 3 шт, D8', 
        image: 'https://ir.ozone.ru/s3/multimedia-t/6342293897.jpg' 
    },
    { 
        name: 'Монстера', 
        category: 'plants', 
        price: 3500, 
        desc: 'Крупное растение, высота 120 см', 
        image: 'https://avatars.mds.yandex.net/get-mpic/11405706/2a0000018eb8d6bc9f4b449da3108bc6f266/orig' 
    },
    { 
        name: 'Замиокулькас', 
        category: 'plants', 
        price: 1800, 
        desc: 'Долларовое дерево, D15', 
        image: 'https://main-cdn.sbermegamarket.ru/big2/hlr-system/972/774/879/319/18/600021156347b4.jpg' 
    },
    
    // Кашпо и горшки (pots)
    { 
        name: 'Кашпо белое', 
        category: 'pots', 
        price: 890, 
        desc: 'Керамика, D15', 
        image: 'https://avatars.mds.yandex.net/get-mpic/4887676/img_id1973185544514265454.jpeg/orig' 
    },
    { 
        name: 'Горшок терракотовый', 
        category: 'pots', 
        price: 550, 
        desc: 'Для суккулентов, D12', 
        image: 'https://main-cdn.sbermegamarket.ru/big1/hlr-system/180/886/832/012/820/20/600014717585b0.jpeg' 
    },
    { 
        name: 'Кашпо подвесное', 
        category: 'pots', 
        price: 1200, 
        desc: 'Для ампельных растений', 
        image: 'https://avatars.mds.yandex.net/i?id=cfec779f672ef648e4b8122ba7a55610_l-5544335-images-thumbs&n=13' 
    },
    
    // Подарочные наборы (gifts)
    { 
        name: 'Набор "Уютный вечер"', 
        category: 'gifts', 
        price: 2500, 
        desc: 'Орхидея + кашпо + свеча', 
        image: 'https://ir.ozone.ru/s3/multimedia-a/6719185018.jpg' 
    },
    { 
        name: 'Набор "Зелёный оазис"', 
        category: 'gifts', 
        price: 3200, 
        desc: 'Суккуленты + горшки + подставка', 
        image: 'https://ir.ozone.ru/s3/multimedia-t/6342293897.jpg' 
    }
];
    
    function renderCatalog(category) {
        if (!catalogGrid) return;
        
        const filtered = category === 'all' ? catalogProducts : catalogProducts.filter(p => p.category === category);
        
        catalogGrid.innerHTML = '';
        filtered.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('data-name', product.name);
            card.setAttribute('data-price', product.price);
            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="price">${product.price} ₽</p>
                <p class="product-desc">${product.desc}</p>
                <div class="product-buttons">
                    <a href="product.html" class="btn btn-outline">Подробнее</a>
                    <button class="btn btn-primary add-to-cart">В корзину</button>
                </div>
            `;
            catalogGrid.appendChild(card);
        });
        
        initAddToCartButtons();
    }
    
    if (filterBtns.length && catalogGrid) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const category = btn.getAttribute('data-category');
                renderCatalog(category);
                console.log(`Фильтр изменён: ${category}`);
            });
        });
        renderCatalog('all');
    }
    
    // ========== 7. ПЕРЕКЛЮЧАТЕЛЬ ВИДА СЕТКИ (плитка/список) ==========
    const viewBtns = document.querySelectorAll('.view-btn');
    const catalogContainer = document.getElementById('catalogGrid');
    
    if (viewBtns.length && catalogContainer) {
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.getAttribute('data-view');
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                if (view === 'list') {
                    catalogContainer.classList.add('list-view');
                } else {
                    catalogContainer.classList.remove('list-view');
                }
                console.log(`Режим отображения: ${view === 'list' ? 'список' : 'плитка'}`);
            });
        });
    }
    
    // ========== 8. КОНФИГУРАТОР БУКЕТА ==========
    const configuratorForm = document.getElementById('bouquetConfigurator');
    const configuratorResult = document.getElementById('configuratorResult');
    const configuratorPrice = document.getElementById('configuratorPrice');
    
    if (configuratorForm) {
        const flowerSelect = document.getElementById('flowerType');
        const quantityInput = document.getElementById('flowerQuantity');
        const wrapperSelect = document.getElementById('wrapperType');
        
        const flowerPrices = {
            roses: 150,
            tulips: 120,
            lilies: 180,
            peonies: 250
        };
        
        const wrapperPrices = {
            paper: 100,
            mesh: 150,
            fabric: 200,
            none: 0
        };
        
        function updateBouquetPrice() {
            if (!flowerSelect || !quantityInput || !wrapperSelect) return;
            
            const flowerType = flowerSelect.value;
            const quantity = parseInt(quantityInput.value) || 0;
            const wrapperType = wrapperSelect.value;
            
            const flowerPrice = (flowerPrices[flowerType] || 0) * quantity;
            const wrapperPrice = wrapperPrices[wrapperType] || 0;
            const totalPrice = flowerPrice + wrapperPrice;
            
            if (configuratorPrice) {
                configuratorPrice.textContent = `${totalPrice} ₽`;
            }
            
            if (configuratorResult && quantity > 0) {
                const flowerNames = {
                    roses: 'роз',
                    tulips: 'тюльпанов',
                    lilies: 'лилий',
                    peonies: 'пионов'
                };
                const wrapperNames = {
                    paper: 'бумажную',
                    mesh: 'сетчатую',
                    fabric: 'тканевую',
                    none: 'без упаковки'
                };
                configuratorResult.innerHTML = `
                    <div style="background: #F9F3E9; padding: 15px; border-radius: 15px; margin-top: 15px;">
                        <p>🌿 Ваш букет: ${quantity} ${flowerNames[flowerType]} в ${wrapperNames[wrapperType]} упаковке</p>
                        <p>💰 Итого: ${totalPrice} ₽</p>
                        <button class="btn btn-primary add-to-cart-configurator" style="margin-top: 10px;">Добавить в корзину</button>
                    </div>
                `;
                
                const addBtn = configuratorResult.querySelector('.add-to-cart-configurator');
                if (addBtn) {
                    addBtn.addEventListener('click', () => {
                        const bouquetName = `Букет из ${quantity} ${flowerNames[flowerType]} в ${wrapperNames[wrapperType]} упаковке`;
                        addToCart(bouquetName, totalPrice);
                    });
                }
            } else if (configuratorResult && quantity === 0) {
                configuratorResult.innerHTML = '<p style="color: #C44536;">⚠️ Выберите количество цветов</p>';
            }
        }
        
        if (flowerSelect) flowerSelect.addEventListener('change', updateBouquetPrice);
        if (quantityInput) quantityInput.addEventListener('input', updateBouquetPrice);
        if (wrapperSelect) wrapperSelect.addEventListener('change', updateBouquetPrice);
        
        updateBouquetPrice();
    }
    
    // ========== 9. ПОДПИСКА НА РАССЫЛКУ ==========
    const subscribeForms = document.querySelectorAll('.subscribe-form');
    subscribeForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = form.querySelector('input[type="email"]');
            const email = emailInput?.value;
            if (email && email.includes('@')) {
                alert(`Спасибо за подписку, ${email}! Скидка 10% ждёт вас.`);
                console.log(`Подписка: ${email}`);
                form.reset();
            } else {
                alert('Введите корректный email');
            }
        });
    });
    
    // ========== 10. ФОРМА ОБРАТНОЙ СВЯЗИ ==========
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = contactForm.querySelector('#name')?.value || 'Пользователь';
            const email = contactForm.querySelector('#email')?.value;
            const message = contactForm.querySelector('#message')?.value;
            
            alert(`Сообщение отправлено! ${name}, мы свяжемся с вами.`);
            console.log(`Сообщение от ${name} (${email}): ${message}`);
            contactForm.reset();
        });
    }
    
    // ========== 11. АКТИВНАЯ ССЫЛКА В МЕНЮ ==========
    function setActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav__link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.add('active');
            } else if (currentPage === 'index.html' && href === 'index.html') {
                link.classList.add('active');
            } else if (currentPage === '' && href === 'index.html') {
                link.classList.add('active');
            }
        });
    }
    setActiveNavLink();
    
    // ========== 12. ПЛАВНАЯ ПРОКРУТКА ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '#/') {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    
    // ========== 13. ИНИЦИАЛИЗАЦИЯ ВСЕХ КНОПОК ==========
    initAddToCartButtons();
    
    // Загрузка корзины из localStorage
    loadCartFromStorage();
    
    console.log('Florist сайт загружен и готов к работе!');
});

// ========== ДОПОЛНИТЕЛЬНЫЕ ЭФФЕКТЫ ==========

// Затемнение картинок при наведении (добавляем динамически)
const styleForImages = document.createElement('style');
styleForImages.textContent = `
    .product-card img {
        transition: transform 0.3s, filter 0.3s;
    }
    .product-card:hover img {
        filter: brightness(0.95);
    }
    .blog-card img {
        transition: transform 0.3s;
    }
    .blog-card:hover img {
        transform: scale(1.05);
    }
    .product-card {
        transition: transform 0.3s, box-shadow 0.3s;
    }
    .product-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
    }
    .product-desc {
        font-size: 0.85rem;
        color: #666;
        margin-bottom: 15px;
    }
    .catalog-grid.list-view .product-card {
        display: flex;
        gap: 20px;
        text-align: left;
        align-items: center;
    }
    .catalog-grid.list-view .product-card img {
        width: 120px;
        height: 120px;
        object-fit: cover;
    }
    .catalog-grid.list-view .product-buttons {
        justify-content: flex-start;
    }
    .catalog-grid.list-view .product-desc {
        margin-bottom: 10px;
    }
`;
document.head.appendChild(styleForImages);
// Форма обратной связи
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = contactForm.querySelector('#name')?.value || 'Пользователь';
        const email = contactForm.querySelector('#email')?.value;
        const message = contactForm.querySelector('#message')?.value;
        
        alert(`Сообщение отправлено! ${name}, мы свяжемся с вами.`);
        console.log(`Сообщение от ${name} (${email}): ${message}`);
        contactForm.reset();
    });
}
/* ===== КОНФИГУРАТОР БУКЕТОВ ===== */

// Доступные цветы для конфигурации
const configFlowers = [
    { id: 'rose-red', category: 'flower', name: '🌹 Роза красная', price: 350, image: 'https://placehold.co/100x100/FFF0F0/C44536?text=Роза&font=roboto' },
    { id: 'rose-white', name: '🤍 Роза белая', price: 380, image: 'https://placehold.co/100x100/FFF0F0/C44536?text=Роза&font=roboto' },
    { id: 'tulip', name: '🌷 Тюльпан', price: 180, image: 'https://placehold.co/100x100/FFB7C5/C44536?text=Тюльпан&font=roboto' },
    { id: 'peony', name: '🌸 Пион', price: 650, image: 'https://placehold.co/100x100/FCE4EC/C44536?text=Пион&font=roboto' },
    { id: 'eucalyptus', name: '🌿 Эвкалипт', price: 120, image: 'https://placehold.co/100x100/E0F2E9/C44536?text=Эвкалипт&font=roboto' },
    { id: 'lavender', name: '💜 Лаванда', price: 200, image: 'https://placehold.co/100x100/E6E6FA/C44536?text=Лаванда&font=roboto' },
    { id: 'orchid', name: '🦋 Орхидея', price: 450, image: 'https://placehold.co/100x100/F5E6FF/C44536?text=Орхидея&font=roboto' },
    { id: 'baby-breath', name: '☁️ Гипсофила', price: 90, image: 'https://placehold.co/100x100/FFF9FB/C44536?text=Гипсофила&font=roboto' }
];

// Состояние конфигурации
let configCart = {};

// Инициализация конфигуратора
function initConfigurator() {
    renderConfigOptions();
    attachConfigHandlers();
}

// Рендеринг доступных цветов
function renderConfigOptions() {
    const container = document.getElementById('configOptions');
    if (!container) return;
    
    container.innerHTML = configFlowers.map(flower => `
        <div class="config-option" data-id="${flower.id}">
            <img src="${flower.image}" alt="${flower.name}" loading="lazy">
            <div class="config-option-info">
                <div class="config-option-name">${flower.name}</div>
                <div class="config-option-price">${flower.price} ₽</div>
            </div>
            <div class="config-option-controls">
                <button class="config-qty-btn minus" data-id="${flower.id}" ${configCart[flower.id] ? '' : 'disabled'}>−</button>
                <span class="config-qty-value" id="qty-${flower.id}">${configCart[flower.id] || 0}</span>
                <button class="config-qty-btn plus" data-id="${flower.id}">+</button>
            </div>
        </div>
    `).join('');
}

// Обновление сводки заказа
function updateConfigSummary() {
    const list = document.getElementById('configList');
    const totalEl = document.getElementById('configTotal');
    const orderBtn = document.getElementById('configOrderBtn');
    
    const items = Object.entries(configCart).filter(([_, qty]) => qty > 0);
    
    if (items.length === 0) {
        list.innerHTML = '<p class="empty-summary">Пока пусто...<br>🌿 Добавьте цветы слева</p>';
        totalEl.textContent = '0 ₽';
        orderBtn.disabled = true;
        return;
    }
    
    let html = '';
    let total = 0;
    
    items.forEach(([id, qty]) => {
        const flower = configFlowers.find(f => f.id === id);
        if (!flower) return;
        
        const itemTotal = flower.price * qty;
        total += itemTotal;
        
        html += `
            <div class="summary-item">
                <span class="summary-item-name">${flower.name}</span>
                <span class="summary-item-qty">× ${qty}</span>
                <span class="summary-item-price">${itemTotal} ₽</span>
                <button class="summary-item-remove" data-id="${id}">&times;</button>
            </div>
        `;
    });
    
    list.innerHTML = html;
    totalEl.textContent = `${total.toLocaleString('ru-RU')} ₽`;
    orderBtn.disabled = false;
    
    // Обновляем кнопки +/- в панели опций
    configFlowers.forEach(flower => {
        const qtyEl = document.getElementById(`qty-${flower.id}`);
        const minusBtn = document.querySelector(`.config-qty-btn.minus[data-id="${flower.id}"]`);
        if (qtyEl) qtyEl.textContent = configCart[flower.id] || 0;
        if (minusBtn) minusBtn.disabled = !configCart[flower.id];
    });
}

// Обработчики событий конфигуратора
function attachConfigHandlers() {
    const container = document.getElementById('configOptions');
    
    // Кнопки +/-
    container?.addEventListener('click', (e) => {
        if (e.target.classList.contains('plus') || e.target.classList.contains('minus')) {
            const id = e.target.dataset.id;
            const isPlus = e.target.classList.contains('plus');
            
            if (isPlus) {
                configCart[id] = (configCart[id] || 0) + 1;
            } else if (configCart[id] > 0) {
                configCart[id]--;
                if (configCart[id] === 0) delete configCart[id];
            }
            
            updateConfigSummary();
        }
    });
    
    // Удаление из сводки
    document.getElementById('configList')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('summary-item-remove')) {
            const id = e.target.dataset.id;
            delete configCart[id];
            updateConfigSummary();
        }
    });
    
    // Кнопка "Оформить"
    document.getElementById('configOrderBtn')?.addEventListener('click', () => {
        const items = Object.entries(configCart).filter(([_, qty]) => qty > 0);
        if (items.length === 0) return;
        
        let message = '🌸 Ваш заказ:\n\n';
        let total = 0;
        
        items.forEach(([id, qty]) => {
            const flower = configFlowers.find(f => f.id === id);
            if (!flower) return;
            const itemTotal = flower.price * qty;
            total += itemTotal;
            message += `${flower.name} × ${qty} = ${itemTotal} ₽\n`;
        });
        
        message += `\n💰 Итого: ${total} ₽`;
        
        alert(message + '\n\n✅ Спасибо! Менеджер свяжется с вами для уточнения деталей.');
        
        // Очистка после заказа
        configCart = {};
        updateConfigSummary();
    });
    
    // Кнопка "Очистить"
    document.getElementById('configClearBtn')?.addEventListener('click', () => {
        if (Object.keys(configCart).length === 0) return;
        if (confirm('Очистить выбранные цветы?')) {
            configCart = {};
            updateConfigSummary();
        }
    });
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initConfigurator();
});