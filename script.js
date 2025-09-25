// Food Inventory PWA - Main JavaScript

class FoodInventoryApp {
    constructor() {
        this.currentCategory = 'all';
        this.foodItems = [];
        this.editingItem = null;
        this.isScanning = false;
        this.scannerStream = null;
        
        this.initializeApp();
    }

    initializeApp() {
        this.loadDataFromStorage();
        this.setupEventListeners();
        this.renderInventory();
        this.updateStats();
        this.setupPWA();
        this.setDefaultExpiryDate();
    }

    // Data Management
    loadDataFromStorage() {
        const stored = localStorage.getItem('foodInventory');
        this.foodItems = stored ? JSON.parse(stored) : [];
    }

    saveDataToStorage() {
        localStorage.setItem('foodInventory', JSON.stringify(this.foodItems));
    }

    // Event Listeners
    setupEventListeners() {
        // Category navigation
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchCategory(e.target.dataset.category);
            });
        });

        // Add item form
        document.getElementById('toggleFormBtn').addEventListener('click', () => {
            this.toggleAddForm();
        });

        document.getElementById('addItemForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addFoodItem();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideAddForm();
        });

        // Barcode scanner
        document.getElementById('scanBarcodeBtn').addEventListener('click', () => {
            this.startBarcodeScanner();
        });

        document.getElementById('closeScannerBtn').addEventListener('click', () => {
            this.stopBarcodeScanner();
        });

        document.getElementById('manualEntryBtn').addEventListener('click', () => {
            this.stopBarcodeScanner();
        });

        // Edit modal
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            this.hideEditModal();
        });

        document.getElementById('editItemForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEditedItem();
        });

        document.getElementById('deleteItemBtn').addEventListener('click', () => {
            this.deleteItem();
        });

        // Install PWA
        document.getElementById('installBtn').addEventListener('click', () => {
            this.installPWA();
        });
    }

    // Category Management
    switchCategory(category) {
        this.currentCategory = category;
        
        // Update active button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        // Update title
        const titles = {
            'all': 'All Items',
            'produce': '🥬 Produce',
            'dairy': '🥛 Dairy',
            'meats': '🥩 Meats',
            'pantry': '🥫 Pantry',
            'frozen': '❄️ Frozen',
            'other': '📦 Other'
        };
        document.getElementById('categoryTitle').textContent = titles[category];

        this.renderInventory();
        this.updateStats();
    }

    // Form Management
    toggleAddForm() {
        const form = document.getElementById('addItemForm');
        const isHidden = form.classList.contains('hidden');
        
        if (isHidden) {
            this.showAddForm();
        } else {
            this.hideAddForm();
        }
    }

    showAddForm() {
        const form = document.getElementById('addItemForm');
        const toggleBtn = document.getElementById('toggleFormBtn');
        
        form.classList.remove('hidden');
        toggleBtn.textContent = '- Hide Form';
        
        // Set category if not 'all'
        if (this.currentCategory !== 'all') {
            document.getElementById('itemCategory').value = this.currentCategory;
        }
        
        document.getElementById('itemName').focus();
    }

    hideAddForm() {
        const form = document.getElementById('addItemForm');
        const toggleBtn = document.getElementById('toggleFormBtn');
        
        form.classList.add('hidden');
        toggleBtn.textContent = '+ Add Food Item';
        this.resetAddForm();
    }

    resetAddForm() {
        document.getElementById('addItemForm').reset();
        this.setDefaultExpiryDate();
    }

    setDefaultExpiryDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 7); // Default to 1 week from now
        document.getElementById('itemExpiry').value = tomorrow.toISOString().split('T')[0];
    }

    // Food Item Management
    addFoodItem() {
        const name = document.getElementById('itemName').value.trim();
        const quantity = document.getElementById('itemQuantity').value.trim();
        const expiry = document.getElementById('itemExpiry').value;
        const category = document.getElementById('itemCategory').value;

        if (!name || !quantity || !expiry || !category) {
            alert('Please fill in all fields');
            return;
        }

        const newItem = {
            id: Date.now(),
            name,
            quantity,
            expiryDate: expiry,
            category,
            dateAdded: new Date().toISOString()
        };

        this.foodItems.push(newItem);
        this.saveDataToStorage();
        this.renderInventory();
        this.updateStats();
        this.hideAddForm();

        // Show success message
        this.showToast(`Added ${name} to ${category}`);
    }

    editFoodItem(itemId) {
        const item = this.foodItems.find(i => i.id === itemId);
        if (!item) return;

        this.editingItem = item;
        
        // Populate edit form
        document.getElementById('editItemId').value = item.id;
        document.getElementById('editItemName').value = item.name;
        document.getElementById('editItemQuantity').value = item.quantity;
        document.getElementById('editItemExpiry').value = item.expiryDate;
        document.getElementById('editItemCategory').value = item.category;

        this.showEditModal();
    }

    saveEditedItem() {
        const id = parseInt(document.getElementById('editItemId').value);
        const name = document.getElementById('editItemName').value.trim();
        const quantity = document.getElementById('editItemQuantity').value.trim();
        const expiry = document.getElementById('editItemExpiry').value;
        const category = document.getElementById('editItemCategory').value;

        if (!name || !quantity || !expiry || !category) {
            alert('Please fill in all fields');
            return;
        }

        const itemIndex = this.foodItems.findIndex(i => i.id === id);
        if (itemIndex === -1) return;

        this.foodItems[itemIndex] = {
            ...this.foodItems[itemIndex],
            name,
            quantity,
            expiryDate: expiry,
            category
        };

        this.saveDataToStorage();
        this.renderInventory();
        this.updateStats();
        this.hideEditModal();

        this.showToast(`Updated ${name}`);
    }

    deleteItem() {
        if (!this.editingItem) return;

        if (confirm(`Delete ${this.editingItem.name}?`)) {
            this.foodItems = this.foodItems.filter(i => i.id !== this.editingItem.id);
            this.saveDataToStorage();
            this.renderInventory();
            this.updateStats();
            this.hideEditModal();

            this.showToast(`Deleted ${this.editingItem.name}`);
        }
    }

    // Modal Management
    showEditModal() {
        document.getElementById('editModal').classList.remove('hidden');
    }

    hideEditModal() {
        document.getElementById('editModal').classList.add('hidden');
        this.editingItem = null;
    }

    // Rendering
    renderInventory() {
        const container = document.getElementById('inventoryList');
        const emptyState = document.getElementById('emptyState');
        
        let filteredItems = this.foodItems;
        
        // Filter by category
        if (this.currentCategory !== 'all') {
            filteredItems = this.foodItems.filter(item => item.category === this.currentCategory);
        }

        // Sort by expiry date
        filteredItems.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

        if (filteredItems.length === 0) {
            container.innerHTML = '';
            container.appendChild(emptyState);
            return;
        }

        emptyState.remove();
        
        container.innerHTML = filteredItems.map(item => this.createFoodItemHTML(item)).join('');

        // Add click listeners to items
        container.querySelectorAll('.food-item').forEach(element => {
            element.addEventListener('click', () => {
                const itemId = parseInt(element.dataset.itemId);
                this.editFoodItem(itemId);
            });
        });
    }

    createFoodItemHTML(item) {
        const expiryStatus = this.getExpiryStatus(item.expiryDate);
        const categoryEmojis = {
            'produce': '🥬',
            'dairy': '🥛',
            'meats': '🥩',
            'pantry': '🥫',
            'frozen': '❄️',
            'other': '📦'
        };

        return `
            <div class="food-item category-${item.category} ${expiryStatus.class}" data-item-id="${item.id}">
                <div class="food-item-header">
                    <div class="food-item-name">${item.name}</div>
                    <div class="category-badge category-${item.category}">
                        ${categoryEmojis[item.category]} ${item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </div>
                </div>
                <div class="food-item-details">
                    <span class="quantity">${item.quantity}</span>
                    <span class="expiry-date ${expiryStatus.class}">
                        ${expiryStatus.text}
                    </span>
                </div>
            </div>
        `;
    }

    getExpiryStatus(expiryDate) {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return {
                class: 'expired',
                text: `Expired ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`
            };
        } else if (diffDays <= 3) {
            return {
                class: 'expiring-soon',
                text: diffDays === 0 ? 'Expires today' : `Expires in ${diffDays} day${diffDays !== 1 ? 's' : ''}`
            };
        } else {
            return {
                class: '',
                text: `Expires ${expiry.toLocaleDateString()}`
            };
        }
    }

    // Statistics
    updateStats() {
        let filteredItems = this.foodItems;
        
        if (this.currentCategory !== 'all') {
            filteredItems = this.foodItems.filter(item => item.category === this.currentCategory);
        }

        const itemCount = filteredItems.length;
        const expiringCount = filteredItems.filter(item => {
            const diffTime = new Date(item.expiryDate) - new Date();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 3 && diffDays >= 0;
        }).length;

        document.getElementById('itemCount').textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''}`;
        
        const expiringElement = document.getElementById('expiringCount');
        if (expiringCount > 0) {
            expiringElement.textContent = `${expiringCount} expiring soon`;
            expiringElement.classList.remove('hidden');
        } else {
            expiringElement.classList.add('hidden');
        }
    }

    // Barcode Scanner
    async startBarcodeScanner() {
        try {
            const scanner = document.getElementById('barcodeScanner');
            const video = document.getElementById('scannerVideo');
            
            scanner.classList.remove('hidden');
            this.isScanning = true;
            
            // Initialize QuaggaJS
            Quagga.init({
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: video,
                    constraints: {
                        width: 640,
                        height: 480,
                        facingMode: "environment"
                    }
                },
                decoder: {
                    readers: [
                        "code_128_reader",
                        "ean_reader",
                        "ean_8_reader",
                        "code_39_reader",
                        "code_39_vin_reader",
                        "codabar_reader",
                        "upc_reader",
                        "upc_e_reader",
                        "i2of5_reader"
                    ]
                },
                locate: true,
                locator: {
                    halfSample: true,
                    patchSize: "medium"
                }
            }, (err) => {
                if (err) {
                    console.error('QuaggaJS initialization error:', err);
                    alert('Camera initialization failed. Please try again.');
                    this.stopBarcodeScanner();
                    return;
                }
                Quagga.start();
                
                // Set up barcode detection
                Quagga.onDetected(this.onBarcodeDetected.bind(this));
            });
            
        } catch (error) {
            console.error('Camera access denied:', error);
            alert('Camera access is required for barcode scanning. Please allow camera permission and try again.');
            this.stopBarcodeScanner();
        }
    }

    stopBarcodeScanner() {
        const scanner = document.getElementById('barcodeScanner');
        
        this.isScanning = false;
        scanner.classList.add('hidden');
        
        // Stop QuaggaJS
        if (typeof Quagga !== 'undefined') {
            Quagga.stop();
        }
    }

    async onBarcodeDetected(result) {
        if (!this.isScanning) return;
        
        const barcode = result.codeResult.code;
        console.log('Barcode detected:', barcode);
        
        // Stop scanning immediately after detection
        this.stopBarcodeScanner();
        
        // Show loading message
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'loading-overlay';
        loadingMsg.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>Looking up product...</p>
            </div>
        `;
        document.body.appendChild(loadingMsg);
        
        try {
            // Lookup product using Open Food Facts API
            const product = await this.lookupProduct(barcode);
            
            if (product) {
                const productName = this.sanitizeString(product.product_name || 'Unknown Product');
                const category = this.mapCategoryFromAPI(product.categories_tags || []);
                
                if (confirm(`Found: ${productName}\nAdd to inventory?`)) {
                    document.getElementById('itemName').value = productName;
                    document.getElementById('itemCategory').value = category;
                    this.showAddForm();
                }
            } else {
                if (confirm(`Product not found in database.\nWould you like to add it manually?`)) {
                    this.showAddForm();
                }
            }
        } catch (error) {
            console.error('Product lookup failed:', error);
            if (confirm(`Could not lookup product.\nWould you like to add it manually?`)) {
                this.showAddForm();
            }
        } finally {
            // Remove loading message
            document.body.removeChild(loadingMsg);
        }
    }
    
    async lookupProduct(barcode) {
        const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.status === 1 && data.product) {
                return data.product;
            }
            return null;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
    
    sanitizeString(str) {
        if (!str) return 'Unknown Product';
        // Basic sanitization to prevent XSS
        return str.replace(/[<>'"&]/g, function(match) {
            const escapeMap = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '&': '&amp;'
            };
            return escapeMap[match];
        }).substring(0, 100); // Limit length
    }
    
    mapCategoryFromAPI(categoriesTags) {
        if (!categoriesTags || !Array.isArray(categoriesTags)) return 'other';
        
        const categoryMap = {
            'meat': 'meats',
            'beef': 'meats',
            'pork': 'meats',
            'chicken': 'meats',
            'poultry': 'meats',
            'fish': 'meats',
            'seafood': 'meats',
            'dairy': 'dairy',
            'milk': 'dairy',
            'cheese': 'dairy',
            'yogurt': 'dairy',
            'fruit': 'produce',
            'vegetable': 'produce',
            'produce': 'produce',
            'frozen': 'frozen',
            'beverage': 'other',
            'snack': 'pantry',
            'condiment': 'pantry',
            'sauce': 'pantry',
            'spice': 'pantry',
            'seasoning': 'pantry',
            'pickled': 'pantry',
            'pickle': 'pantry',
            'ginger': 'pantry',
            'canned': 'pantry',
            'jarred': 'pantry',
            'preserved': 'pantry',
            'pasta': 'pantry',
            'rice': 'pantry',
            'cereal': 'pantry',
            'bread': 'pantry',
            'bakery': 'pantry'
        };
        
        // Check categories for matches
        for (const tag of categoriesTags) {
            const category = tag.toLowerCase().replace(/^en:/, '');
            for (const [key, value] of Object.entries(categoryMap)) {
                if (category.includes(key)) {
                    return value;
                }
            }
        }
        
        return 'other';
    }

    // PWA functionality
    setupPWA() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }

        // Install prompt
        let deferredPrompt;
        const installBtn = document.getElementById('installBtn');

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            installBtn.style.display = 'block';
        });

        this.deferredPrompt = deferredPrompt;
    }

    async installPWA() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            this.deferredPrompt = null;
            document.getElementById('installBtn').style.display = 'none';
        }
    }

    // Utility
    showToast(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 12px 24px;
            border-radius: 24px;
            z-index: 1001;
            font-size: 14px;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FoodInventoryApp();
});