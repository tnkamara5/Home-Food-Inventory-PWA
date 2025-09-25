# Food Inventory PWA 🍎

A mobile-first Progressive Web App for tracking your kitchen food inventory with categories and expiry dates.

## Features ✨

- **📱 Mobile-First Design** - Optimized for phone use with large touch-friendly buttons
- **🏷️ Category Organization** - Organize items by Produce, Dairy, Meats, Pantry, Frozen, and Other
- **📅 Expiry Tracking** - Color-coded warnings for expired and expiring soon items
- **📷 Barcode Scanning** - Use your camera to scan barcodes (with manual entry fallback)
- **💾 Offline Storage** - All data saved locally in your browser
- **⚡ PWA Features** - Installable on your phone, works offline
- **🎨 Category Color Coding** - Visual organization with category-specific colors

## Live Demo 🚀

Visit: https://tnkamara5.github.io/Home-Food-Inventory-PWA/`

## Installation 📲

### As a PWA (Recommended)
1. Visit the live demo link on your phone
2. Look for the "Install App" button or browser install prompt
3. Add to your home screen for quick access

### Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/food-inventory-pwa.git
cd food-inventory-pwa

# Serve locally (Python 3)
python3 -m http.server 8000

# Or serve locally (Node.js)
npx serve .

# Open in browser
# Visit http://localhost:8000
```

## How to Use 📖

1. **Add Items**: Tap "Add Food Item" and fill in details or scan a barcode
2. **Organize**: Items are automatically organized by category with color coding
3. **Track Expiry**: Items expiring soon show in yellow, expired items in red
4. **Manage**: Tap any item to edit or delete it
5. **Filter**: Use category tabs to view specific food types

## Category System 🗂️

- 🥬 **Produce** - Fruits, vegetables, fresh herbs
- 🥛 **Dairy** - Milk, cheese, yogurt, butter
- 🥩 **Meats** - Fresh meat, poultry, seafood
- 🥫 **Pantry** - Canned goods, dry goods, condiments
- ❄️ **Frozen** - Frozen foods, ice cream
- 📦 **Other** - Everything else

## Technical Details 🛠️

- **Framework**: Vanilla HTML, CSS, JavaScript (no dependencies)
- **Storage**: Browser localStorage for offline functionality
- **PWA**: Complete service worker implementation
- **Camera**: Web Camera API for barcode scanning
- **Responsive**: Mobile-first CSS with touch optimization
- **Offline**: Full offline functionality with service worker caching

## Browser Support 🌐

- ✅ Chrome 88+ (full support)
- ✅ Safari 14+ (full support)
- ✅ Firefox 85+ (PWA features limited)
- ✅ Edge 88+ (full support)

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on mobile devices
5. Submit a pull request

## License 📄

MIT License - feel free to use this for your own projects!

## Screenshots 📸

*Add screenshots here showing the app in use*

---

Built with ❤️ for better kitchen organization
