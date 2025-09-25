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
        
        // Force UI update immediately
        setTimeout(() => {
            this.renderInventory();
            this.updateStats();
        }, 0);
        
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
        
        // Force UI update immediately
        setTimeout(() => {
            this.renderInventory();
            this.updateStats();
        }, 0);
        
        this.hideEditModal();

        this.showToast(`Updated ${name}`);
    }

    deleteItem() {
        if (!this.editingItem) return;

        if (confirm(`Delete ${this.editingItem.name}?`)) {
            const itemName = this.editingItem.name;
            this.foodItems = this.foodItems.filter(i => i.id !== this.editingItem.id);
            this.saveDataToStorage();
            
            // Force UI update immediately
            setTimeout(() => {
                this.renderInventory();
                this.updateStats();
            }, 0);
            
            this.hideEditModal();

            this.showToast(`Deleted ${itemName}`);
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
            
            // First, manually get the camera stream to ensure it works on mobile Safari
            this.scannerStream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 640, max: 1280 },
                    height: { ideal: 480, max: 720 }
                }
            });
            
            // Set the stream to the video element
            video.srcObject = this.scannerStream;
            
            // Wait for video to be ready
            await new Promise((resolve) => {
                video.onloadedmetadata = resolve;
            });
            
            // Force video to play on mobile
            try {
                await video.play();
            } catch (playError) {
                console.warn('Video autoplay failed:', playError);
                // Try without audio
                video.muted = true;
                await video.play();
            }
            
            // Initialize QuaggaJS with the video element that now has a stream
            Quagga.init({
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: video,
                    constraints: {
                        width: video.videoWidth || 640,
                        height: video.videoHeight || 480,
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
        const video = document.getElementById('scannerVideo');
        
        this.isScanning = false;
        scanner.classList.add('hidden');
        
        // Stop QuaggaJS
        if (typeof Quagga !== 'undefined') {
            Quagga.stop();
        }
        
        // Stop the camera stream
        if (this.scannerStream) {
            this.scannerStream.getTracks().forEach(track => track.stop());
            this.scannerStream = null;
        }
        
        // Clear video source
        video.srcObject = null;
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
                const containerSize = product.container_size || '';
                
                if (confirm(`Found: ${productName}${containerSize ? ` (${containerSize})` : ''}\nAdd to inventory?`)) {
                    document.getElementById('itemName').value = productName;
                    document.getElementById('itemCategory').value = category;
                    if (containerSize) {
                        document.getElementById('itemQuantity').value = containerSize;
                    }
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
        // Try multiple APIs in sequence for better coverage
        const apis = [
            {
                name: 'Open Food Facts',
                lookup: () => this.lookupOpenFoodFacts(barcode)
            },
            {
                name: 'UPC Database',
                lookup: () => this.lookupUPCDatabase(barcode)
            },
            {
                name: 'Barcode Spider',
                lookup: () => this.lookupBarcodeSpider(barcode)
            }
        ];
        
        for (const api of apis) {
            try {
                console.log(`Trying ${api.name}...`);
                const product = await api.lookup();
                if (product) {
                    console.log(`Found product in ${api.name}`);
                    return product;
                }
            } catch (error) {
                console.warn(`${api.name} failed:`, error.message);
                continue; // Try next API
            }
        }
        
        console.log('No product found in any database');
        return null;
    }
    
    async lookupOpenFoodFacts(barcode) {
        const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 1 && data.product) {
            // Normalize to common format
            return {
                product_name: data.product.product_name,
                categories_tags: data.product.categories_tags,
                container_size: this.extractContainerSize(data.product.product_name, data.product.quantity),
                source: 'Open Food Facts'
            };
        }
        return null;
    }
    
    async lookupUPCDatabase(barcode) {
        const url = `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.code === 'OK' && data.items && data.items.length > 0) {
            const item = data.items[0];
            // Normalize to common format
            return {
                product_name: item.title,
                categories_tags: this.categorizeBrandAndTitle(item.brand, item.title),
                container_size: this.extractContainerSize(item.title, item.size),
                source: 'UPC Database'
            };
        }
        return null;
    }
    
    async lookupBarcodeSpider(barcode) {
        // Note: Barcode Spider requires API key, so we'll skip it for now
        // Users can add their own API key if they want this service
        console.log('Barcode Spider skipped (requires API key)');
        return null;
    }
    
    categorizeBrandAndTitle(brand, title) {
        // Create category tags from brand and title for non-Open Food Facts APIs
        const text = `${brand || ''} ${title || ''}`.toLowerCase();
        const categories = [];
        
        // Food category detection
        if (text.match(/sauce|sriracha|ketchup|mustard|mayo|dressing/)) {
            categories.push('en:condiments');
        } else if (text.match(/spice|seasoning|pepper|salt|garlic/)) {
            categories.push('en:spices');
        } else if (text.match(/snack|chip|cracker|cookie/)) {
            categories.push('en:snacks');
        } else if (text.match(/cereal|oat|granola/)) {
            categories.push('en:cereals');
        } else if (text.match(/pasta|noodle|spaghetti/)) {
            categories.push('en:pasta');
        } else if (text.match(/soup|broth|stock/)) {
            categories.push('en:soups');
        } else if (text.match(/rice|grain|quinoa/)) {
            categories.push('en:grains');
        } else if (text.match(/oil|vinegar|cooking/)) {
            categories.push('en:cooking-aids');
        } else if (text.match(/bean|lentil|chickpea/)) {
            categories.push('en:legumes');
        }
        
        return categories.length > 0 ? categories : ['en:unknown'];
    }
    
    extractContainerSize(productName, quantity) {
        // Try to extract container size from product name or quantity field
        const text = `${productName || ''} ${quantity || ''}`.toLowerCase();
        
        // Common size patterns
        const sizePatterns = [
            // Fluid ounces
            /(\d+(?:\.\d+)?)\s*fl\.?\s*oz/i,
            /(\d+(?:\.\d+)?)\s*fluid\s*ounce/i,
            
            // Regular ounces
            /(\d+(?:\.\d+)?)\s*oz(?![a-z])/i,
            /(\d+(?:\.\d+)?)\s*ounce/i,
            
            // Pounds
            /(\d+(?:\.\d+)?)\s*lbs?/i,
            /(\d+(?:\.\d+)?)\s*pounds?/i,
            
            // Grams
            /(\d+(?:\.\d+)?)\s*g(?![a-z])/i,
            /(\d+(?:\.\d+)?)\s*grams?/i,
            
            // Kilograms
            /(\d+(?:\.\d+)?)\s*kg/i,
            /(\d+(?:\.\d+)?)\s*kilograms?/i,
            
            // Milliliters
            /(\d+(?:\.\d+)?)\s*ml/i,
            /(\d+(?:\.\d+)?)\s*milliliters?/i,
            
            // Liters
            /(\d+(?:\.\d+)?)\s*l(?![a-z])/i,
            /(\d+(?:\.\d+)?)\s*liters?/i,
            /(\d+(?:\.\d+)?)\s*litres?/i,
            
            // Count/pieces
            /(\d+)\s*count/i,
            /(\d+)\s*ct/i,
            /(\d+)\s*pack/i,
            /(\d+)\s*pieces?/i,
            /(\d+)\s*pc/i
        ];
        
        // Try each pattern
        for (const pattern of sizePatterns) {
            const match = text.match(pattern);
            if (match) {
                const number = match[1];
                const unit = this.normalizeUnit(match[0]);
                return `${number} ${unit}`;
            }
        }
        
        // If no pattern matches, return empty string
        return '';
    }
    
    normalizeUnit(matchedText) {
        const text = matchedText.toLowerCase();
        
        // Normalize units to consistent format
        if (text.includes('fl') || text.includes('fluid')) return 'fl oz';
        if (text.includes('oz') || text.includes('ounce')) return 'oz';
        if (text.includes('lb') || text.includes('pound')) return 'lbs';
        if (text.includes('kg') || text.includes('kilogram')) return 'kg';
        if (text.includes('gram') && !text.includes('kilogram')) return 'g';
        if (text.includes('ml') || text.includes('milliliter')) return 'ml';
        if (text.includes('liter') || text.includes('litre')) return 'L';
        if (text.includes('count') || text.includes('ct')) return 'count';
        if (text.includes('pack')) return 'pack';
        if (text.includes('piece') || text.includes('pc')) return 'pieces';
        
        return 'units'; // fallback
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