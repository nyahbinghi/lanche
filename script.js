// Dados dos produtos
let products = JSON.parse(localStorage.getItem('products')) || [
    {
        id: 1,
        name: "X-Burguer Especial",
        description: "Pão brioche, hambúrguer 180g, queijo e bacon",
        price: 24.90,
        category: "lanches",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60"
    },
    {
        id: 2,
        name: "Pizza Margherita",
        description: "Molho de tomate, mussarela e manjericão fresco",
        price: 49.90,
        category: "lanches",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60"
    },
    {
        id: 3,
        name: "Refrigerante Lata",
        description: "Lata 350ml - Escolha o sabor",
        price: 5.50,
        category: "bebidas",
        image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500&auto=format&fit=crop&q=60"
    }
];

// Carrinho de compras
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let adminMode = false;

// Funções de formatação
function formatPhoneNumber(phone) {
    const cleaned = ('' + phone).replace(/\D/g, '');
    const limited = cleaned.substring(0, 11);
    return limited.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

function formatMoney(value) {
    return value.toFixed(2).replace('.', ',');
}

// Elementos DOM
const elements = {
    menuGrid: document.getElementById('menuGrid'),
    cartItems: document.getElementById('cartItems'),
    cartTotal: document.getElementById('cartTotal'),
    cartCount: document.getElementById('cartCount'),
    cartCountMobile: document.querySelector('.cart-count-mobile'),
    searchInput: document.getElementById('searchInput'),
    categoryTabs: document.querySelectorAll('.tab'),
    sendOrderBtn: document.getElementById('sendOrderBtn'),
    customerName: document.getElementById('customerName'),
    customerPhone: document.getElementById('customerPhone'),
    customerAddress: document.getElementById('customerAddress'),
    deliveryType: document.getElementById('deliveryType'),
    paymentMethod: document.getElementById('paymentMethod'),
    changeAmount: document.getElementById('changeAmount'),
    cartBtnMobile: document.querySelector('.cart-btn-mobile'),
    adminHint: document.querySelector('.admin-hint')
};

// Função para formatar telefone durante a digitação (versão melhorada)
function formatPhoneInput(input) {
    // Guarda a posição do cursor
    const cursorPosition = input.selectionStart;
    const originalLength = input.value.length;
    
    // Remove tudo que não é dígito
    let value = input.value.replace(/\D/g, '');
    
    // Limita a 11 caracteres
    value = value.substring(0, 11);
    
    // Aplica a formatação
    let formattedValue = '';
    if (value.length > 0) {
        formattedValue = '(' + value.substring(0, 2);
        if (value.length > 2) {
            formattedValue += ') ' + value.substring(2, 7);
        }
        if (value.length > 7) {
            formattedValue += '-' + value.substring(7, 11);
        }
    }
    
    input.value = formattedValue;
    
    // Ajusta a posição do cursor
    if (originalLength > formattedValue.length) {
        // Se caracteres foram removidos (backspace/delete)
        input.setSelectionRange(cursorPosition, cursorPosition);
    } else {
        // Se caracteres foram adicionados (digitação normal)
        const addedChars = formattedValue.length - originalLength;
        input.setSelectionRange(cursorPosition + addedChars, cursorPosition + addedChars);
    }
}

// Configuração do campo de telefone (versão melhorada)
function setupPhoneFields() {
    const phoneInputs = [
        document.getElementById('customerPhone'),
        document.getElementById('customerPhonePickup'),
        document.getElementById('customerPhoneMobile'),
        document.getElementById('customerPhonePickupMobile')
    ];
    
    phoneInputs.forEach(input => {
        if (input) {
            // Formata durante a digitação
            input.addEventListener('input', function() {
                formatPhoneInput(this);
            });
            
            // Permite navegar com as setas e apagar livremente
            input.addEventListener('keydown', function(e) {
                // Permite Backspace e Delete em qualquer posição
                if (e.key === 'Backspace' || e.key === 'Delete') {
                    // Pega a posição do cursor
                    const cursorPosition = this.selectionStart;
                    
                    // Se estiver apagando um caractere de formatação
                    if (this.value[cursorPosition] === ')' || 
                        this.value[cursorPosition] === ' ' || 
                        this.value[cursorPosition] === '-') {
                        // Move o cursor para trás/apaga o dígito antes da formatação
                        e.preventDefault();
                        const newPosition = cursorPosition - 1;
                        const valueArray = this.value.split('');
                        valueArray.splice(newPosition, 1);
                        this.value = valueArray.join('');
                        this.setSelectionRange(newPosition, newPosition);
                    }
                }
            });
        }
    });
}

// Função para formatar valor monetário durante a digitação (versão final)
function formatMoneyInput(input) {
    // Guarda a posição do cursor e valores originais
    const cursorPosition = input.selectionStart;
    const originalValue = input.value;
    const isBackspace = (input.value.length < originalValue.length);
    
    // Remove tudo que não é dígito
    let cleanValue = input.value.replace(/[^\d]/g, '');
    
    // Permite apagar completamente
    if (cleanValue === '') {
        input.value = '';
        return;
    }
    
    // Remove zeros à esquerda, exceto se for o único dígito
    cleanValue = cleanValue.replace(/^0+/, '') || '0';
    
    // Separa parte inteira e decimal (os dois últimos dígitos são os centavos)
    let integerPart = cleanValue.slice(0, -2) || '0';
    let decimalPart = cleanValue.slice(-2);
    
    // Se não tem dígitos suficientes para centavos, ajusta
    while (decimalPart.length < 2) {
        decimalPart = '0' + decimalPart;
    }
    
    // Formata o valor com vírgula
    input.value = integerPart + ',' + decimalPart;
    
    // Calcula nova posição do cursor
    let newCursorPosition;
    
    if (isBackspace) {
        // Mantém posição relativa ao apagar
        newCursorPosition = Math.max(0, cursorPosition - (originalValue.length - input.value.length));
    } else {
        // Avança posição ao digitar
        newCursorPosition = cursorPosition + (input.value.length - originalValue.length);
        
        // Se digitou no final, mantém no final
        if (cursorPosition === originalValue.length) {
            newCursorPosition = input.value.length;
        }
    }
    
    // Garante que o cursor não fique antes da vírgula nos centavos
    const commaPosition = input.value.indexOf(',');
    if (newCursorPosition > commaPosition && newCursorPosition < commaPosition + 1) {
        newCursorPosition = commaPosition + 1;
    }
    
    // Limita a posição máxima
    newCursorPosition = Math.min(newCursorPosition, input.value.length);
    
    input.setSelectionRange(newCursorPosition, newCursorPosition);
}

// Configuração do campo de troco (versão final)
function setupChangeField() {
    const paymentMethod = document.getElementById('paymentMethod');
    const changeField = document.getElementById('changeField');
    const changeAmount = document.getElementById('changeAmount');
    
    // Mostra/oculta campo de troco conforme método de pagamento
    paymentMethod.addEventListener('change', function() {
        changeField.style.display = this.value === 'dinheiro' ? 'block' : 'none';
        if (this.value === 'dinheiro') {
            changeAmount.focus();
        }
    });
    
    if (changeAmount) {
        // Valor inicial formatado
        changeAmount.value = '0,00';
        
        // Ao focar, seleciona todo o texto se for o valor inicial
        changeAmount.addEventListener('focus', function() {
            if (this.value === '0,00') {
                this.setSelectionRange(0, this.value.length);
            }
        });
        
        // Ao perder o foco, garante formatação correta
        changeAmount.addEventListener('blur', function() {
            const parts = this.value.split(',');
            
            // Caso o usuário tenha apagado tudo
            if (this.value === '' || this.value === ',') {
                this.value = '0,00';
                return;
            }
            
            // Garante que tem vírgula e duas casas decimais
            if (parts.length === 1) {
                this.value = parts[0] + ',00';
            } else {
                const decimalPart = parts[1].length === 1 ? parts[1] + '0' : 
                                   parts[1].length === 0 ? '00' : 
                                   parts[1].substring(0, 2);
                this.value = (parts[0] || '0') + ',' + decimalPart;
            }
        });
        
        // Formata durante a digitação
        changeAmount.addEventListener('input', function() {
            formatMoneyInput(this);
        });
        
        // Permite apagar o valor inicial completamente
        changeAmount.addEventListener('keydown', function(e) {
            if ((e.key === 'Backspace' || e.key === 'Delete') && 
                (this.value === '0,00' || this.selectionStart === 0 && this.selectionEnd === this.value.length)) {
                this.value = '';
                e.preventDefault();
            }
            
            // Impede digitar vírgula manualmente
            if (e.key === ',') {
                e.preventDefault();
            }
        });
    }
}

// Configuração do campo de troco mobile
function setupMobileChangeField(changeAmountMobile) {
    if (!changeAmountMobile) return;
    
    changeAmountMobile.value = '0,00';
    
    changeAmountMobile.addEventListener('focus', function() {
        if (this.value === '0,00') {
            this.setSelectionRange(0, this.value.length);
        }
    });
    
    changeAmountMobile.addEventListener('blur', function() {
        const parts = this.value.split(',');
        
        if (this.value === '' || this.value === ',') {
            this.value = '0,00';
            return;
        }
        
        if (parts.length === 1) {
            this.value = parts[0] + ',00';
        } else {
            const decimalPart = parts[1].length === 1 ? parts[1] + '0' : 
                               parts[1].length === 0 ? '00' : 
                               parts[1].substring(0, 2);
            this.value = (parts[0] || '0') + ',' + decimalPart;
        }
    });
    
    changeAmountMobile.addEventListener('input', function() {
        formatMoneyInput(this);
    });
    
    changeAmountMobile.addEventListener('keydown', function(e) {
        if ((e.key === 'Backspace' || e.key === 'Delete') && 
            (this.value === '0,00' || this.selectionStart === 0 && this.selectionEnd === this.value.length)) {
            this.value = '';
            e.preventDefault();
        }
        
        if (e.key === ',') {
            e.preventDefault();
        }
    });
}

// Função para adicionar produto ao carrinho
function addToCart(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCart();
}

// Atualizar carrinho
function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    elements.cartCount.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`;
    elements.cartCountMobile.textContent = totalItems;
    
    if (cart.length === 0) {
        elements.cartItems.innerHTML = `
            <div class="empty-cart">
                <div class="empty-icon">🛒</div>
                <p>Seu carrinho está vazio</p>
            </div>
        `;
        elements.cartTotal.textContent = 'R$ 0,00';
        return;
    }
    
    let itemsHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        itemsHTML += `
            <div class="cart-item">
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">R$ ${formatMoney(item.price)}</div>
                </div>
                <div class="item-actions">
                    <button class="quantity-btn decrease" data-index="${index}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn increase" data-index="${index}">+</button>
                    <button class="remove-btn" data-index="${index}">🗑️</button>
                </div>
            </div>
        `;
    });
    
    elements.cartItems.innerHTML = itemsHTML;
    elements.cartTotal.textContent = `R$ ${formatMoney(total)}`;
    
    document.querySelectorAll('.quantity-btn.decrease').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
            } else {
                cart.splice(index, 1);
            }
            updateCart();
        });
    });
    
    document.querySelectorAll('.quantity-btn.increase').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            cart[index].quantity += 1;
            updateCart();
        });
    });
    
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            cart.splice(index, 1);
            updateCart();
        });
    });
}

// Configuração do modal do carrinho
function setupCartModal() {
    const modal = document.createElement('div');
    modal.className = 'cart-modal';
    modal.innerHTML = `
        <div class="cart-modal-content">
            <div class="cart-header">
                <h2>Seu Pedido</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="cart-items-mobile"></div>
            
            <div class="checkout-form-mobile">
                <div class="form-group">
                    <label for="deliveryTypeMobile">Tipo de Pedido</label>
                    <select id="deliveryTypeMobile" class="form-control">
                        <option value="entrega">Entrega</option>
                        <option value="retirada">Retirada no Local</option>
                    </select>
                </div>

                <div id="deliveryFieldsMobile">
                    <div class="form-group">
                        <label for="customerNameMobile">Nome*</label>
                        <input type="text" id="customerNameMobile" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="customerPhoneMobile">Telefone*</label>
                        <input type="tel" id="customerPhoneMobile" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="customerAddressMobile">Endereço Completo*</label>
                        <textarea id="customerAddressMobile" class="form-control" required></textarea>
                    </div>
                </div>

                <div id="pickupFieldsMobile" style="display: none;">
                    <div class="form-group">
                        <label for="customerNamePickupMobile">Nome*</label>
                        <input type="text" id="customerNamePickupMobile" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="customerPhonePickupMobile">Telefone*</label>
                        <input type="tel" id="customerPhonePickupMobile" class="form-control">
                    </div>
                </div>

                <div id="paymentFieldsMobile">
                    <div class="form-group">
                        <label for="paymentMethodMobile">Forma de Pagamento*</label>
                        <select id="paymentMethodMobile" class="form-control" required>
                            <option value="">Selecione...</option>
                            <option value="dinheiro">Dinheiro</option>
                            <option value="pix">PIX</option>
                            <option value="cartao">Cartão</option>
                        </select>
                    </div>
                    <div class="form-group" id="changeFieldMobile" style="display: none;">
                        <label for="changeAmountMobile">Troco para quanto?</label>
                        <input type="text" id="changeAmountMobile" class="form-control" placeholder="Ex: 50,00" value="0,00">
                    </div>
                </div>
            </div>
            
            <div class="cart-summary-mobile">
                <div class="total-row">
                    <span>Total</span>
                    <span class="total-price">R$ 0,00</span>
                </div>
                <button class="checkout-btn" id="sendOrderMobileBtn">
                    <span class="whatsapp-icon">📱</span>
                    Enviar pedido via WhatsApp
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const deliveryTypeMobile = modal.querySelector('#deliveryTypeMobile');
    const paymentMethodMobile = modal.querySelector('#paymentMethodMobile');
    const changeAmountMobile = modal.querySelector('#changeAmountMobile');
    const customerPhoneMobile = modal.querySelector('#customerPhoneMobile');
    const customerPhonePickupMobile = modal.querySelector('#customerPhonePickupMobile');
    
    function updateMobileFieldsDisplay() {
        const deliveryFieldsMobile = modal.querySelector('#deliveryFieldsMobile');
        const pickupFieldsMobile = modal.querySelector('#pickupFieldsMobile');
        
        if (deliveryTypeMobile.value === 'retirada') {
            deliveryFieldsMobile.style.display = 'none';
            pickupFieldsMobile.style.display = 'block';
            
            modal.querySelector('#customerNamePickupMobile').required = true;
            modal.querySelector('#customerPhonePickupMobile').required = true;
            modal.querySelector('#customerNameMobile').required = false;
            modal.querySelector('#customerPhoneMobile').required = false;
            modal.querySelector('#customerAddressMobile').required = false;
        } else {
            deliveryFieldsMobile.style.display = 'block';
            pickupFieldsMobile.style.display = 'none';
            
            modal.querySelector('#customerNameMobile').required = true;
            modal.querySelector('#customerPhoneMobile').required = true;
            modal.querySelector('#customerAddressMobile').required = true;
            modal.querySelector('#customerNamePickupMobile').required = false;
            modal.querySelector('#customerPhonePickupMobile').required = false;
        }
    }
    
    deliveryTypeMobile.addEventListener('change', updateMobileFieldsDisplay);
    updateMobileFieldsDisplay();
    
    paymentMethodMobile.addEventListener('change', function() {
        const changeFieldMobile = modal.querySelector('#changeFieldMobile');
        changeFieldMobile.style.display = this.value === 'dinheiro' ? 'block' : 'none';
    });

    // Configuração do campo de troco mobile
    setupMobileChangeField(changeAmountMobile);

    // Configuração do campo de telefone mobile
    if (customerPhoneMobile) {
        customerPhoneMobile.addEventListener('input', function() {
            formatPhoneInput(this);
        });
    }
    
    if (customerPhonePickupMobile) {
        customerPhonePickupMobile.addEventListener('input', function() {
            formatPhoneInput(this);
        });
    }

    elements.cartBtnMobile.addEventListener('click', () => {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        updateCartModal(modal);
    });

    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
}

function updateCartModal(modal) {
    const itemsContainer = modal.querySelector('.cart-items-mobile');
    const summaryContainer = modal.querySelector('.cart-summary-mobile');
    
    if (cart.length === 0) {
        itemsContainer.innerHTML = `
            <div class="empty-cart">
                <div class="empty-icon">🛒</div>
                <p>Seu carrinho está vazio</p>
            </div>
        `;
    } else {
        let itemsHTML = '';
        let total = 0;
        
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            itemsHTML += `
                <div class="cart-item">
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-price">R$ ${formatMoney(item.price)}</div>
                    </div>
                    <div class="item-actions">
                        <button class="quantity-btn decrease" data-index="${index}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn increase" data-index="${index}">+</button>
                        <button class="remove-btn" data-index="${index}">🗑️</button>
                    </div>
                </div>
            `;
        });
        itemsContainer.innerHTML = itemsHTML;
        
        summaryContainer.querySelector('.total-price').textContent = `R$ ${formatMoney(total)}`;
    }
    
    itemsContainer.querySelectorAll('.quantity-btn.decrease').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
            } else {
                cart.splice(index, 1);
            }
            updateCart();
            updateCartModal(modal);
        });
    });
    
    itemsContainer.querySelectorAll('.quantity-btn.increase').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            cart[index].quantity += 1;
            updateCart();
            updateCartModal(modal);
        });
    });
    
    itemsContainer.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            cart.splice(index, 1);
            updateCart();
            updateCartModal(modal);
        });
    });
    
    modal.querySelector('#sendOrderMobileBtn').addEventListener('click', sendOrder);
}

// Modo Admin Konami Code
function initAdminMode() {
    const konamiCode = ['a', 'r', 'r'];
    let inputSequence = [];
    
    document.addEventListener('keydown', function(e) {
        inputSequence.push(e.key);
        
        if (inputSequence.length > konamiCode.length) {
            inputSequence.shift();
        }
        
        if (inputSequence.join() === konamiCode.join()) {
            adminMode = true;
            localStorage.setItem('adminMode', 'true');
            window.location.href = 'admin-login.html';
        }
    });
}

function setupAdminLongPress() {
    let pressTimer;
    
    elements.adminHint.addEventListener('touchstart', (e) => {
        pressTimer = setTimeout(() => {
            activateAdminMode();
        }, 3000);
    });
    
    elements.adminHint.addEventListener('touchend', () => {
        clearTimeout(pressTimer);
    });
}

function activateAdminMode() {
    adminMode = true;
    localStorage.setItem('adminMode', 'true');
    updateAdminUI();
}

function updateAdminUI() {
    if (adminMode) {
        elements.adminHint.style.backgroundColor = 'var(--primary)';
        elements.adminHint.style.color = 'white';
        elements.adminHint.textContent = 'Modo Admin Ativo (Clique para acessar)';
        elements.adminHint.onclick = () => window.location.href = 'admin-login.html';
    } else {
        elements.adminHint.style.backgroundColor = '';
        elements.adminHint.style.color = '';
        elements.adminHint.textContent = 'admin';
        elements.adminHint.onclick = null;
    }
}

// Carregar produtos
function loadProducts(filter = '', category = 'all') {
    elements.menuGrid.innerHTML = '';
    
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(filter.toLowerCase()) || 
                             product.description.toLowerCase().includes(filter.toLowerCase());
        const matchesCategory = category === 'all' || product.category === category;
        return matchesSearch && matchesCategory;
    });
    
    if (filteredProducts.length === 0) {
        elements.menuGrid.innerHTML = '<p class="no-results">Nenhum produto encontrado</p>';
        return;
    }
    
    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">R$ ${formatMoney(product.price)}</span>
                    <button class="add-to-cart" data-id="${product.id}">+ Adicionar</button>
                </div>
            </div>
        `;
        elements.menuGrid.appendChild(productCard);
    });
    
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });
}

// Enviar pedido via WhatsApp
function sendOrder() {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }

    const isMobile = window.innerWidth <= 768;
    
    let deliveryType, paymentMethod, changeAmount, name, phone, address;
    
    if (isMobile) {
        deliveryType = document.getElementById('deliveryTypeMobile').value;
        paymentMethod = document.getElementById('paymentMethodMobile').value;
        changeAmount = document.getElementById('changeAmountMobile').value || '0,00';
        
        if (deliveryType === 'entrega') {
            name = document.getElementById('customerNameMobile').value.trim();
            phone = document.getElementById('customerPhoneMobile').value.trim();
            address = document.getElementById('customerAddressMobile').value.trim();
            
            if (!name || !phone || !address || !paymentMethod) {
                alert('Por favor, preencha todos os campos para entrega!');
                return;
            }
        } else {
            name = document.getElementById('customerNamePickupMobile').value.trim();
            phone = document.getElementById('customerPhonePickupMobile').value.trim();
            
            if (!name || !phone || !paymentMethod) {
                alert('Por favor, preencha seu nome e telefone para retirada!');
                return;
            }
        }
    } else {
        deliveryType = document.getElementById('deliveryType').value;
        paymentMethod = document.getElementById('paymentMethod').value;
        changeAmount = document.getElementById('changeAmount').value || '0,00';
        
        if (deliveryType === 'entrega') {
            name = document.getElementById('customerName').value.trim();
            phone = document.getElementById('customerPhone').value.trim();
            address = document.getElementById('customerAddress').value.trim();
            
            if (!name || !phone || !address || !paymentMethod) {
                alert('Por favor, preencha todos os campos para entrega!');
                return;
            }
        } else {
            name = document.getElementById('customerNamePickup').value.trim();
            phone = document.getElementById('customerPhonePickup').value.trim();
            
            if (!name || !phone || !paymentMethod) {
                alert('Por favor, preencha seu nome e telefone para retirada!');
                return;
            }
        }
    }

    let message = `*NOVO PEDIDO - Ôxe que Delícia* 🍔🍕\n\n`;
    message += `*Tipo de Entrega:* ${deliveryType === 'retirada' ? '🛵 Retirada no Local' : '🚚 Entrega'}\n`;
    message += `*Cliente:* 👤 ${name}\n`;
    message += `*Telefone:* 📞 ${formatPhoneNumber(phone)}\n`;
    if (deliveryType === 'entrega') message += `*Endereço:* 🏠 ${address}\n`;
    message += `*Pagamento:* 💰 ${paymentMethod === 'dinheiro' ? 'Dinheiro' : paymentMethod === 'pix' ? 'PIX' : 'Cartão'}`;
    if (paymentMethod === 'dinheiro') {
        message += ` (Troco para R$ ${changeAmount})`;
    }
    
    message += `\n\n*ITENS DO PEDIDO:*\n`;
    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.quantity}x ${item.name} - R$ ${formatMoney(item.price * item.quantity)}\n`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `\n*TOTAL DO PEDIDO:* R$ ${formatMoney(total)}\n\n*Obrigado pelo seu pedido!* ❤️`;

    const whatsappNumber = '5582998360516';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    cart = [];
    updateCart();
    localStorage.setItem('cart', JSON.stringify(cart));
    
    const modal = document.querySelector('.cart-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    if (isMobile) {
        document.getElementById('customerNameMobile').value = '';
        document.getElementById('customerPhoneMobile').value = '';
        document.getElementById('customerAddressMobile').value = '';
        document.getElementById('customerNamePickupMobile').value = '';
        document.getElementById('customerPhonePickupMobile').value = '';
        document.getElementById('paymentMethodMobile').value = '';
        document.getElementById('changeAmountMobile').value = '0,00';
    } else {
        document.getElementById('customerName').value = '';
        document.getElementById('customerPhone').value = '';
        document.getElementById('customerAddress').value = '';
        document.getElementById('customerNamePickup').value = '';
        document.getElementById('customerPhonePickup').value = '';
        document.getElementById('paymentMethod').value = '';
        document.getElementById('changeAmount').value = '0,00';
    }
}

// Configurar opções de entrega/retirada
function setupDeliveryOptions() {
    const deliveryFields = document.getElementById('deliveryFields');
    const pickupFields = document.getElementById('pickupFields');
    
    function updateFieldsDisplay() {
        if (elements.deliveryType.value === 'retirada') {
            if (deliveryFields) deliveryFields.style.display = 'none';
            if (pickupFields) pickupFields.style.display = 'block';
            
            document.getElementById('customerNamePickup').required = true;
            document.getElementById('customerPhonePickup').required = true;
            document.getElementById('customerName').required = false;
            document.getElementById('customerPhone').required = false;
            document.getElementById('customerAddress').required = false;
        } else {
            if (deliveryFields) deliveryFields.style.display = 'block';
            if (pickupFields) pickupFields.style.display = 'none';
            
            document.getElementById('customerName').required = true;
            document.getElementById('customerPhone').required = true;
            document.getElementById('customerAddress').required = true;
            document.getElementById('customerNamePickup').required = false;
            document.getElementById('customerPhonePickup').required = false;
        }
    }
    
    elements.deliveryType.addEventListener('change', updateFieldsDisplay);
    updateFieldsDisplay();
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('cart')) {
        cart = JSON.parse(localStorage.getItem('cart'));
    }
    
    setupCartModal();
    setupAdminLongPress();
    initAdminMode();
    loadProducts();
    setupDeliveryOptions();
    setupChangeField();
    setupPhoneFields();
    updateCart();
    
    elements.searchInput.addEventListener('input', (e) => {
        const activeTab = document.querySelector('.tab.active');
        const category = activeTab ? activeTab.getAttribute('data-category') : 'all';
        loadProducts(e.target.value, category);
    });

    elements.categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            elements.categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadProducts(elements.searchInput.value, tab.getAttribute('data-category'));
        });
    });

    elements.sendOrderBtn.addEventListener('click', sendOrder);

    window.addEventListener('productsUpdated', () => {
        products = JSON.parse(localStorage.getItem('products')) || [];
        loadProducts();
    });
    
    window.addEventListener('storage', (e) => {
        if (e.key === 'products') {
            products = JSON.parse(e.newValue) || [];
            loadProducts();
        }
        if (e.key === 'cart') {
            cart = JSON.parse(e.newValue) || [];
            updateCart();
        }
    });

    if (window.location.pathname.includes('admin-login.html') && localStorage.getItem('adminMode') !== 'true') {
        window.location.href = 'index.html';
    }
});

// Função de teste para WhatsApp
function testWhatsApp() {
    const testMsg = "Teste de mensagem - Ôxe Que Delícia";
    const phone = "5582998360516";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(testMsg)}`;
    
    window.open(url, '_blank');
}