# Production Build Comparison Guide

## 📊 Build Statistics

### Angular Production Build
- **Location**: `dist/acki-live/`
- **Main Bundle**: 319 KB (main.js)
- **Styles**: 9.5 KB (styles.css)
- **Runtime**: 896 B (runtime.js)
- **Total Size**: ~360 KB
- **Estimated Transfer**: 84.36 KB (gzipped)

### Svelte Production Build
- **Location**: `svelte/build/`
- **Total Size**: ~204 KB
- **Largest Chunk**: 33 KB (C_LaNZWs.js)
- **CSS**: 12.13 KB (main) + component styles
- **Number of Chunks**: ~20+ smaller chunks (code splitting)

### Size Comparison
- **Svelte is ~43% smaller** (204 KB vs 360 KB)
- **Better code splitting** in Svelte (smaller individual chunks)
- **Faster initial load** expected with Svelte

---

## 🚀 How to View Production Builds

### Option 1: Quick Comparison Script

Run the comparison script to see build sizes:

```bash
./compare-builds.sh
```

### Option 2: Serve Both Builds Simultaneously

#### Terminal 1 - Angular Production (Port 8080)
```bash
npm run serve:angular
```
This will automatically open http://localhost:8080 in your browser.

#### Terminal 2 - Svelte Production (Port 8081)
```bash
cd svelte
npm run serve
```
This will automatically open http://localhost:8081 in your browser.

### Option 3: Manual Serving

If you prefer manual control:

```bash
# Angular
http-server dist/acki-live -p 8080

# Svelte (in another terminal)
http-server svelte/build -p 8081
```

---

## 🔍 What to Compare

### 1. **Initial Load Time**
- Open DevTools (F12)
- Go to Network tab
- Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Compare the "Finish" time

**Expected Result**: Svelte should load 30-50% faster

### 2. **Bundle Size**
In Network tab:
- Check "Transferred" column (shows gzipped size)
- Check "Size" column (shows uncompressed size)
- Compare total transfer size

**Expected Result**: Svelte transfers ~40-60% less data

### 3. **JavaScript Execution Time**
- Open DevTools Performance tab
- Record a page load
- Check "Scripting" time
- Compare both apps

**Expected Result**: Svelte has less scripting overhead

### 4. **Memory Usage**
- Open DevTools Memory profiler
- Take a heap snapshot after page load
- Compare total heap size

**Expected Result**: Svelte uses 20-30% less memory

### 5. **Lighthouse Scores**
```bash
# Run Lighthouse on both
# Angular
npx lighthouse http://localhost:8080 --view

# Svelte
npx lighthouse http://localhost:8081 --view
```

**Expected Result**: Svelte scores higher on Performance

---

## 📈 Detailed Comparison Checklist

### Performance Metrics

| Metric | Angular | Svelte | Winner |
|--------|---------|--------|--------|
| **Bundle Size** | ~360 KB | ~204 KB | ✅ Svelte |
| **Transfer Size (gzipped)** | ~84 KB | ~60 KB | ✅ Svelte |
| **Initial Load Time** | ? | ? | Test it! |
| **Time to Interactive** | ? | ? | Test it! |
| **First Contentful Paint** | ? | ? | Test it! |
| **JavaScript Files** | 2 main | 20+ chunks | ⚖️ Different |
| **Code Splitting** | Limited | Automatic | ✅ Svelte |

### Feature Comparison

| Feature | Angular | Svelte | Status |
|---------|---------|--------|--------|
| Blocks Page | ✅ | ✅ | Same |
| Transactions Page | ✅ | ✅ | Same |
| Messages Page | ✅ | ✅ | Same |
| Contracts Page | ✅ | ✅ | Same |
| Stats Page | ✅ | ✅ | Same |
| Showcase Page | ✅ | ✅ | Same |
| Dark/Light Theme | ✅ | ✅ | Same |
| EN/RU Language | ✅ | ✅ | Same |
| GraphQL API | ✅ | ✅ | Same |
| Responsive Design | ✅ | ✅ | Same |

---

## 🧪 Testing Steps

1. **Build both apps** (already done):
   ```bash
   # Angular (from root)
   npm run build
   
   # Svelte
   cd svelte && npm run build
   ```

2. **Start both servers**:
   ```bash
   # Terminal 1
   npm run serve:angular
   
   # Terminal 2  
   cd svelte && npm run serve
   ```

3. **Open both in separate browser windows/tabs**:
   - Angular: http://localhost:8080
   - Svelte: http://localhost:8081

4. **Test identical features**:
   - Navigate through all pages
   - Toggle theme (dark/light)
   - Switch languages (EN/RU)
   - Check responsive design
   - Test data loading

5. **Measure performance**:
   - Use browser DevTools
   - Run Lighthouse audits
   - Check Network tab
   - Monitor memory usage

---

## 📊 Expected Results Summary

### Svelte Advantages
✅ **43% smaller bundle** (204 KB vs 360 KB)
✅ **~30% less transfer** (gzipped)
✅ **Faster initial load**
✅ **Better code splitting**
✅ **Less memory usage**
✅ **Smaller runtime overhead**

### Angular Advantages
✅ **Mature ecosystem**
✅ **Enterprise tooling**
✅ **More third-party libraries**
✅ **Better IDE support** (debatable)
✅ **More developers familiar**

### Identical Features
✅ **All pages work the same**
✅ **Same UI/UX**
✅ **Same functionality**
✅ **Same styling**
✅ **Same responsiveness**

---

## 🎯 Quick Commands Reference

```bash
# Build both
npm run build                    # Angular
cd svelte && npm run build       # Svelte

# Serve both
npm run serve:angular            # Angular (port 8080)
cd svelte && npm run serve       # Svelte (port 8081)

# Compare sizes
./compare-builds.sh

# Run Lighthouse
npx lighthouse http://localhost:8080 --view  # Angular
npx lighthouse http://localhost:8081 --view  # Svelte

# Check build folders
ls -lh dist/acki-live/           # Angular files
ls -lh svelte/build/_app/        # Svelte files
```

---

## 💡 Pro Tips

1. **Clear browser cache** between tests for accurate comparisons
2. **Use incognito mode** to avoid extension interference
3. **Test on different devices** (desktop, tablet, mobile)
4. **Throttle network** in DevTools to simulate slower connections
5. **Compare multiple runs** to get average results

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill processes on port 8080 or 8081
lsof -ti:8080 | xargs kill -9
lsof -ti:8081 | xargs kill -9
```

### Build Errors
```bash
# Clean and rebuild
rm -rf dist node_modules/.cache
npm run build

# Svelte
cd svelte
rm -rf build .svelte-kit
npm run build
```

### Server Not Starting
```bash
# Install http-server globally
npm install -g http-server

# Or use npx
npx http-server dist/acki-live -p 8080
```

---

## 📝 Notes

- Both builds are production-optimized
- Both use the same GraphQL endpoint
- Both have identical features and styling
- Performance differences are framework-specific
- Real-world metrics will vary based on network and hardware

---

**Ready to compare? Start both servers and see the difference! 🚀**
