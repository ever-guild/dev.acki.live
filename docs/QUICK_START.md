# Quick Start Guide

## Running Both Projects Side-by-Side

This guide helps you run both the Angular and Svelte versions simultaneously for comparison.

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

---

## 🅰️ Angular Version

### Install Dependencies
```bash
# From the root directory
npm install
```

### Start Development Server
```bash
npm start
```

The Angular app will run on **http://localhost:4200**

### Build for Production
```bash
npm run build
```

---

## 💚 Svelte Version

### Install Dependencies
```bash
# Navigate to svelte folder
cd svelte
npm install
```

### Start Development Server
```bash
npm run dev
```

The Svelte app will run on **http://localhost:5173**

### Build for Production
```bash
npm run build
npm run preview  # Preview production build
```

---

## 🔄 Running Both Simultaneously

### Terminal 1 (Angular)
```bash
npm start
# Opens on http://localhost:4200
```

### Terminal 2 (Svelte)
```bash
cd svelte
npm run dev
# Opens on http://localhost:5173
```

Now you can compare both versions side-by-side!

---

## 📊 What to Compare

### 1. **Performance**
- Open DevTools Performance tab
- Measure initial load time
- Check bundle sizes in Network tab
- Monitor memory usage

### 2. **Developer Experience**
- Compare code structure
- Note build times
- Test hot module replacement
- Review code readability

### 3. **Features**
Both versions include:
- ✅ Blocks page
- ✅ Transactions page
- ✅ Messages page
- ✅ Contracts page
- ✅ Statistics page
- ✅ Showcase page
- ✅ Dark/Light theme
- ✅ EN/RU language switching
- ✅ Responsive design

### 4. **Bundle Size**
After building both:

**Angular**:
```bash
npm run build
# Check dist/acki-live/browser/
```

**Svelte**:
```bash
cd svelte
npm run build
# Check build/
```

Compare the sizes of the output directories.

---

## 🎯 Key Differences to Notice

### Angular
- Larger initial bundle (~250-400 KB)
- Slightly slower initial load
- More files and boilerplate
- Class-based components
- Dependency injection

### Svelte
- Smaller bundle (~50-150 KB)
- Faster initial load
- Less boilerplate
- Single-file components
- Direct imports

---

## 📝 Testing Checklist

- [ ] Navigate through all pages in both versions
- [ ] Toggle dark/light theme
- [ ] Switch between EN/RU languages
- [ ] Check mobile responsiveness
- [ ] Measure page load times
- [ ] Review code in both projects
- [ ] Compare build output sizes
- [ ] Test hot reload in development

---

## 🐛 Troubleshooting

### Angular Port Already in Use
```bash
ng serve --port 4201
```

### Svelte Port Already in Use
```bash
npm run dev -- --port 5174
```

### Clear Node Modules
```bash
# Angular
rm -rf node_modules package-lock.json
npm install

# Svelte
cd svelte
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Further Reading

- See `ANGULAR_VS_SVELTE.md` for detailed comparison
- See `svelte/README.md` for Svelte-specific docs
- See `README.md` for Angular-specific docs

---

## 💡 Tips

1. Keep both dev servers running for easy switching
2. Use browser's responsive mode to test mobile
3. Clear cache when switching between versions
4. Use DevTools Lighthouse for performance comparison
5. Check bundle analyzer for size breakdown

Happy comparing! 🚀
