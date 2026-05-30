# Elite Student Manager

## 🌐 Web (Vercel)
```bash
npm install
npm run build
# dist/ papkasini Vercel ga deploy qiling
```

## 🖥️ Windows (.exe) build qilish

### 1. O'rnatish
```bash
npm install
```

### 2. Test qilish (Electron oynasida)
```bash
npm run electron:dev
```

### 3. .exe build qilish
```bash
npm run electron:build
```
`release/` papkasida `EliteStudentManager-Setup-1.0.0.exe` fayl tayyor bo'ladi.

### 4. GitHub Releases ga yuklang
1. GitHub da yangi Release yarating
2. `.exe` faylni yuklang
3. `DownloadBanner.jsx` dagi linkni yangilang:
```
https://github.com/sardorma/elite-student-manager/releases/latest
```

## 📁 Loyiha tuzilishi
```
src/
  components/
    StudentRow.jsx     ← ❄️ Freeze + 🗑 Delete to'g'irlangan
    Sidebar.jsx        ← yangilangan
    DownloadBanner.jsx ← Windows yuklab olish banneri (yangi)
  App.jsx
electron/
  main.js              ← Electron asosiy fayl (yangi)
electron-builder.yml   ← .exe sozlamalari (yangi)
```
