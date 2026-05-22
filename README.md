Online : https://marulamsamosir.github.io/codecraft/

# CodeCraft Beautifier

> **Instant, online code formatter** untuk HTML, CSS, JavaScript, PHP, JSON, SQL, dan Java.
> Dibangun dengan jQuery, js-beautify, sql-formatter, dan Prism.js.

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|---|---|
| **7 Bahasa** | HTML · CSS · JavaScript · PHP · JSON · SQL · Java |
| **Instant Formatting** | Kode diformat otomatis saat mengetik (debounce 320ms) |
| **Syntax Highlighting** | Toggle highlight warna via Prism.js |
| **Auto-Detect Language** | Mendeteksi bahasa saat paste/drop file |
| **Line Numbers** | Nomor baris sinkron di panel input & output |
| **Drag & Drop** | Seret file langsung ke area input |
| **Download File** | Unduh hasil format sesuai ekstensi bahasa |
| **Copy to Clipboard** | Salin output 1 klik |
| **Indent Options** | 2 spasi / 4 spasi / Tab |
| **Wrap Lines** | Toggle bungkus baris panjang |
| **Keyboard Shortcuts** | Lihat tabel di bawah |
| **Dark Industrial UI** | Tema gelap bergaya terminal, responsif |

---

## 📁 Struktur File

```
code-beautifier/
├── index.html                  # Halaman utama aplikasi
├── assets/
│   ├── css/
│   │   └── style.css           # Stylesheet utama (dark industrial theme)
│   └── js/
│       ├── beautifier-config.js  # Konfigurasi & router formatter per bahasa
│       └── app.js              # Logic utama jQuery
└── README.md                   # Dokumentasi ini
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Aksi |
|---|---|
| `Ctrl + Enter` | Format / Beautify sekarang |
| `Ctrl + Shift + C` | Copy output ke clipboard |
| `Ctrl + Shift + D` | Download file output |
| `Tab` (di textarea) | Insert indentasi |
| `Shift + Tab` | Hapus indentasi |
| `Escape` | Tutup modal error |

---

## 🚀 Cara Penggunaan

### 1. Pilih Bahasa
Klik tombol bahasa di bar atas: **HTML · CSS · JavaScript · PHP · JSON · SQL · Java**

### 2. Masukkan Kode
Ada tiga cara:
- **Ketik langsung** di panel INPUT (kiri) → otomatis format saat mengetik
- **Paste** (`Ctrl+V`) langsung ke panel INPUT → bahasa terdeteksi otomatis
- **Drag & drop** file (`.html`, `.css`, `.js`, `.php`, `.json`, `.sql`, `.java`) ke panel INPUT

### 3. Lihat Hasil
Panel OUTPUT (kanan) menampilkan kode yang sudah diformat secara **instan**.

### 4. Opsi Tambahan
- **Indent**: Pilih 2 spasi, 4 spasi, atau Tab di dropdown kanan atas
- **Wrap Lines**: Centang untuk membungkus baris panjang
- **Highlight**: Klik tombol **Highlight** di panel output untuk menyalakan syntax coloring
- **Copy**: Klik tombol **Copy** untuk menyalin hasil
- **Download**: Klik tombol **Download** untuk mengunduh file

---

## 🛠️ Instalasi di Web Server

### Metode 1 — Buka Langsung (tanpa server)

Cukup buka file `index.html` di browser modern:
```
Klik dua kali → index.html
```
> ⚠️ Beberapa fitur clipboard mungkin terbatas di `file://` protocol.  
> Disarankan menggunakan web server lokal agar semua fitur berfungsi penuh.

---

### Metode 2 — Apache / XAMPP / WAMP / Laragon

1. Copy seluruh folder `code-beautifier/` ke direktori root web server:

   | Server | Path |
   |---|---|
   | XAMPP (Windows) | `C:\xampp\htdocs\code-beautifier\` |
   | WAMP (Windows) | `C:\wamp64\www\code-beautifier\` |
   | Laragon (Windows) | `C:\laragon\www\code-beautifier\` |
   | XAMPP (Linux/Mac) | `/opt/lampp/htdocs/code-beautifier/` |

2. Jalankan Apache dari control panel

3. Buka browser:
   ```
   http://localhost/code-beautifier/
   ```

---

### Metode 3 — Nginx

1. Copy folder ke direktori web Nginx (biasanya `/var/www/html/` atau `/usr/share/nginx/html/`):
   ```bash
   sudo cp -r code-beautifier/ /var/www/html/
   ```

2. Konfigurasi Nginx (contoh minimal di `/etc/nginx/sites-available/default`):
   ```nginx
   server {
       listen 80;
       server_name localhost;
       root /var/www/html;
       index index.html;

       location /code-beautifier/ {
           try_files $uri $uri/ =404;
       }
   }
   ```

3. Reload Nginx:
   ```bash
   sudo nginx -s reload
   ```

4. Buka:
   ```
   http://localhost/code-beautifier/
   ```

---

### Metode 4 — Node.js (http-server)

Cocok untuk development cepat tanpa konfigurasi server:

1. Install `http-server` (jika belum ada):
   ```bash
   npm install -g http-server
   ```

2. Masuk ke folder aplikasi:
   ```bash
   cd code-beautifier
   ```

3. Jalankan server:
   ```bash
   http-server -p 8080 --cors
   ```

4. Buka browser:
   ```
   http://localhost:8080
   ```

---

### Metode 5 — Python (SimpleHTTPServer)

Tanpa perlu install apapun selain Python:

```bash
# Python 3
cd code-beautifier
python3 -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

Buka: `http://localhost:8080`

---

### Metode 6 — Deploy ke VPS / Cloud Server

1. Upload semua file ke server (via FTP, SCP, atau Git):
   ```bash
   scp -r code-beautifier/ user@your-server:/var/www/html/
   ```

2. Pastikan permissions benar:
   ```bash
   chmod -R 755 /var/www/html/code-beautifier/
   ```

3. Konfigurasi virtual host Apache/Nginx sesuai domain Anda.

---

### Metode 7 — GitHub Pages / Netlify / Vercel (Gratis)

Aplikasi ini adalah static site — bisa di-deploy gratis di:

**GitHub Pages:**
1. Push folder ke repository GitHub
2. Settings → Pages → Source: `main` branch, folder `/`
3. Akses via `https://username.github.io/code-beautifier/`

**Netlify:**
1. Drag & drop folder `code-beautifier/` ke [netlify.com/drop](https://app.netlify.com/drop)
2. Langsung online dalam hitungan detik

**Vercel:**
```bash
npm install -g vercel
cd code-beautifier
vercel
```

---

## 📦 Library yang Digunakan

Semua library di-load via CDN (tidak perlu install), kecuali Anda ingin offline:

| Library | Versi | Kegunaan |
|---|---|---|
| [jQuery](https://jquery.com) | 3.7.1 | DOM manipulation & events |
| [js-beautify](https://github.com/beautify-web/js-beautify) | 1.15.1 | Format HTML, CSS, JavaScript, PHP |
| [sql-formatter](https://github.com/sql-formatter-org/sql-formatter) | 15.3.2 | Format SQL (multi-dialect) |
| [Prism.js](https://prismjs.com) | 1.29.0 | Syntax highlighting output |
| [Google Fonts](https://fonts.google.com) | — | Font JetBrains Mono + Syne |

---

## 🌐 Mode Offline (Tanpa Internet)

Untuk menjalankan sepenuhnya offline, download semua CDN file dan ubah path di `index.html`:

1. Download library:
   ```bash
   # Buat folder vendor
   mkdir -p assets/vendor

   # Download jQuery
   curl -o assets/vendor/jquery.min.js \
     https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js

   # Download js-beautify
   curl -o assets/vendor/beautify.min.js \
     https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.15.1/beautify.min.js
   curl -o assets/vendor/beautify-css.min.js \
     https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.15.1/beautify-css.min.js
   curl -o assets/vendor/beautify-html.min.js \
     https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.15.1/beautify-html.min.js

   # Download sql-formatter
   curl -o assets/vendor/sql-formatter.min.js \
     https://cdnjs.cloudflare.com/ajax/libs/sql-formatter/15.3.2/sql-formatter.min.js

   # Download Prism
   curl -o assets/vendor/prism-tomorrow.min.css \
     https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css
   curl -o assets/vendor/prism.min.js \
     https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js
   # (download prism components sesuai kebutuhan)
   ```

2. Ganti semua CDN URL di `index.html` dengan path lokal `assets/vendor/...`

---

## 🔧 Kustomisasi

### Mengubah Tema Warna
Edit variabel CSS di `assets/css/style.css` bagian `:root`:
```css
:root {
  --accent:     #5ee7a0;   /* Warna aksen utama (hijau) */
  --bg-void:    #0b0c0f;   /* Background terdalam */
  --bg-panel:   #13151d;   /* Background panel */
  /* ... */
}
```

### Mengubah Debounce Delay
Di `assets/js/app.js`, ubah nilai:
```javascript
const DEBOUNCE_MS = 320;  // ms setelah ketik terakhir sebelum format otomatis
```

### Menambah Bahasa Baru
1. Tambah entry di `LANGUAGES` object di `beautifier-config.js`
2. Tambah case di fungsi `beautify()`
3. Tambah tombol `<button class="lang-tab">` di `index.html`
4. Include Prism component yang sesuai

---

## 🖥️ Browser yang Didukung

| Browser | Versi Minimum |
|---|---|
| Chrome / Edge | 88+ |
| Firefox | 85+ |
| Safari | 14+ |
| Opera | 74+ |

> Internet Explorer **tidak didukung**.

---

## 📄 Lisensi

MIT License — bebas digunakan untuk proyek pribadi maupun komersial.

---

*CodeCraft Beautifier — Write messy, format instantly.*
