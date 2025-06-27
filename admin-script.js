// Verificação de segurança aprimorada
function verifyAdminAccess() {
    if (!localStorage.getItem('adminAuthenticated')) {
        // Redireciona silenciosamente sem mostrar erro
        setTimeout(() => window.location.href = 'index.html', 500);
        return false;
    }
    return true;
}

// Verifica acesso ao carregar
if (!verifyAdminAccess()) {
    // Esconde o conteúdo enquanto redireciona
    document.body.style.opacity = '0';
}

// Variáveis globais
let editingProductId = null;

// Elementos DOM
const productForm = document.getElementById('productForm');
const productsList = document.getElementById('productsList');
const productSearch = document.getElementById('productSearch');
const logoutBtn = document.getElementById('logoutBtn');
const cancelBtn = document.getElementById('cancelBtn');
const imageUpload = document.getElementById('productImageUpload');
const imagePreview = document.getElementById('imagePreview');

// Função para carregar a lista de produtos
function loadProductsList(filter = '') {
    const productsList = document.getElementById('productsList');
    productsList.innerHTML = '';
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(filter.toLowerCase()) || 
        product.description.toLowerCase().includes(filter.toLowerCase())
    );
    
    if (filteredProducts.length === 0) {
        productsList.innerHTML = '<p class="no-products">Nenhum produto encontrado</p>';
        return;
    }
    
    filteredProducts.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-item';
        productElement.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-details">
                <h3>${product.name}</h3>
                <p>${product.category} - R$ ${product.price.toFixed(2)}</p>
            </div>
            <div class="product-actions">
                <button class="edit-btn" data-id="${product.id}">✏️</button>
                <button class="delete-btn" data-id="${product.id}">🗑️</button>
            </div>
        `;
        productsList.appendChild(productElement);
    });
    
    // Adiciona eventos aos botões
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.getAttribute('data-id'));
            deleteProduct(productId);
        });
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.getAttribute('data-id'));
            editProduct(productId);
        });
    });
}

// Função para editar produto
function editProduct(productId) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        alert('Produto não encontrado!');
        return;
    }
    
    editingProductId = productId;
    
    // Preenche o formulário com os dados do produto
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productDescription').value = product.description || '';
    
    // Preenche a imagem (URL ou preview)
    const imageUrlInput = document.getElementById('productImageUrl');
    const imagePreview = document.getElementById('imagePreview');
    
    if (product.image.startsWith('http') || product.image.startsWith('data:')) {
        imageUrlInput.value = product.image;
        imagePreview.innerHTML = `<img src="${product.image}" alt="Preview">`;
    } else {
        imageUrlInput.value = '';
        imagePreview.innerHTML = '<span>Pré-visualização da imagem</span>';
    }
    
    // Rola a página até o formulário
    document.querySelector('.product-form').scrollIntoView({ behavior: 'smooth' });
}

// Função para deletar produto
function deleteProduct(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        let products = JSON.parse(localStorage.getItem('products')) || [];
        products = products.filter(product => product.id !== id);
        localStorage.setItem('products', JSON.stringify(products));
        window.dispatchEvent(new Event('productsUpdated'));
        loadProductsList(productSearch.value);
        
        if (editingProductId === id) {
            resetForm();
        }
    }
}

// Função para resetar o formulário
function resetForm() {
    productForm.reset();
    editingProductId = null;
    imagePreview.innerHTML = '<span>Pré-visualização da imagem</span>';
    imageUpload.value = '';
}

// Event Listener para o formulário
productForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const productData = {
        id: editingProductId || Date.now(),
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        description: document.getElementById('productDescription').value,
        image: document.getElementById('productImageUrl').value || 
               (imagePreview.querySelector('img') ? imagePreview.querySelector('img').src : '')
    };

    let products = JSON.parse(localStorage.getItem('products')) || [];
    
    if (editingProductId) {
        // Atualiza produto existente
        const index = products.findIndex(p => p.id === editingProductId);
        if (index !== -1) {
            products[index] = productData;
        }
    } else {
        // Adiciona novo produto
        products.push(productData);
    }
    
    localStorage.setItem('products', JSON.stringify(products));
    window.dispatchEvent(new Event('productsUpdated'));
    loadProductsList(productSearch.value);
    resetForm();
});

// Event Listener para upload de imagem
imageUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            imagePreview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
            // Limpa o campo de URL quando um arquivo é selecionado
            document.getElementById('productImageUrl').value = '';
        };
        reader.readAsDataURL(file);
    }
});

// Event Listener para campo de URL de imagem
document.getElementById('productImageUrl').addEventListener('input', function(e) {
    const url = e.target.value.trim();
    if (url && /\.(jpeg|jpg|gif|png|webp)$/i.test(url)) {
        imagePreview.innerHTML = `<img src="${url}" alt="Preview" onerror="this.parentElement.innerHTML='<span>URL inválida</span>'">`;
        // Limpa o upload quando uma URL é inserida
        imageUpload.value = '';
    } else if (!url) {
        imagePreview.innerHTML = '<span>Pré-visualização da imagem</span>';
    }
});

// Event Listener para busca de produtos
productSearch.addEventListener('input', function() {
    loadProductsList(this.value);
});

// Event Listener para botão cancelar
cancelBtn.addEventListener('click', resetForm);

// Event Listener para botão de logout
logoutBtn.addEventListener('click', function() {
    if (confirm('Deseja sair do painel administrativo?')) {
        localStorage.removeItem('adminAuthenticated');
        window.location.href = 'index.html';
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadProductsList();
    
    // Verifica se há um produto sendo editado ao recarregar a página
    const products = JSON.parse(localStorage.getItem('products')) || [];
    if (editingProductId && !products.find(p => p.id === editingProductId)) {
        editingProductId = null;
    }
});

// Evento para atualizar a lista quando houver mudanças em outras abas
window.addEventListener('storage', function(e) {
    if (e.key === 'products') {
        loadProductsList(productSearch.value);
    }
});

// Evento para atualizar a lista quando produtos forem atualizados
window.addEventListener('productsUpdated', function() {
    loadProductsList(productSearch.value);
});