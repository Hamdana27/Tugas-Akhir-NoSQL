# 💰 tugas_besar_nosql

Sistem Manajemen Data Transaksi Keuangan Sederhana menggunakan **Node.js**, **MongoDB**, dan **Redis**.

---

## 📄 Deskripsi Proyek

Proyek ini merupakan implementasi prototipe arsitektur penyimpanan data transaksi keuangan berbasis NoSQL. MongoDB digunakan untuk menyimpan **riwayat transaksi**, sedangkan Redis digunakan sebagai **cache berperforma tinggi** untuk menyimpan dan mengambil data **saldo akun pengguna secara real-time**.

---

## ✨ Fitur

- Mencatat transaksi keuangan baru
- Menampilkan riwayat transaksi (dapat difilter berdasarkan ID pengirim/penerima)
- Memperbarui status transaksi
- Mengecek saldo pengguna dari Redis secara real-time
- Antarmuka pengguna web sederhana menggunakan HTML + Tailwind CSS

---

## 🔧 Teknologi yang Digunakan

- **Backend:** Node.js, Express.js  
- **Database Utama:** MongoDB (Document Store)  
- **Cache:** Redis (Key-Value Store)  
- **Frontend:** HTML, JavaScript, Tailwind CSS  
- **Editor:** Visual Studio Code (VSCode)

---

## ⚙️ Prasyarat

Pastikan Anda telah menginstal:

- [Node.js dan npm](https://nodejs.org/en/download/)
- [MongoDB Community Edition](https://www.mongodb.com/try/download/community)
- [Redis untuk Windows (by tporadowski)](https://github.com/tporadowski/redis/releases)
- [Visual Studio Code (VSCode)](https://code.visualstudio.com/)

> Redis versi Windows bisa dijalankan dengan mudah. Unduh ZIP/MSI dari link di atas, ekstrak, dan jalankan `redis-server.exe`.

---

## 🧰 Langkah-Langkah Menjalankan Proyek

### 1. **Buka VSCode dan Buka Folder Proyek**
- Jalankan VSCode.
- Klik **File > Open Folder** lalu pilih folder `tugas_besar_nosql`.

### 2. **Buka Terminal VSCode**
- Tekan `Ctrl + ~` (atau menu Terminal → New Terminal).

### 3. **Inisialisasi dan Instalasi Dependensi**
```bash
npm init -y
npm install express mongodb redis body-parser cors
npm install --save-dev nodemon
````

---

## 📥 Menyiapkan Layanan dan Data

### 4. **Jalankan MongoDB**

Pastikan MongoDB sudah terinstal dan aktif:

```bash
net start MongoDB
```

> Jika gagal, pastikan `mongod` sudah dikonfigurasi sebagai service.

### 5. **Jalankan Redis Server**

Masuk ke folder hasil ekstraksi Redis dan jalankan:

```bash
redis-server.exe
```

Biarkan terminal ini tetap terbuka saat server berjalan.

### 6. **Masukkan Data Awal ke MongoDB**

Buka terminal baru:

```bash
mongosh
```

Lalu jalankan:

```javascript
use transaksi_keuangan

db.transaksi.insertMany([
  { "_id": "TRX-001", "id_pengirim": "USER-001", "id_penerima": "USER-002", "jumlah": 150000.00, "mata_uang": "IDR", "timestamp": new ISODate("2025-07-09T10:30:00Z"), "status": "berhasil", "deskripsi": "Pembayaran belanja online" },
  { "_id": "TRX-002", "id_pengirim": "USER-003", "id_penerima": "USER-001", "jumlah": 50000.00, "mata_uang": "IDR", "timestamp": new ISODate("2025-07-09T11:00:00Z"), "status": "pending", "deskripsi": "Top up saldo" },
  { "_id": "TRX-003", "id_pengirim": "USER-002", "id_penerima": "USER-004", "jumlah": 25.50, "mata_uang": "USD", "timestamp": new ISODate("2025-07-09T12:15:00Z"), "status": "berhasil", "deskripsi": "Pembayaran layanan cloud" },
  { "_id": "TRX-004", "id_pengirim": "USER-001", "id_penerima": "USER-003", "jumlah": 75000.00, "mata_uang": "IDR", "timestamp": new ISODate("2025-07-09T13:00:00Z"), "status": "gagal", "deskripsi": "Transfer ke teman" },
  { "_id": "TRX-005", "id_pengirim": "USER-004", "id_penerima": "USER-001", "jumlah": 100.00, "mata_uang": "USD", "timestamp": new ISODate("2025-07-09T14:00:00Z"), "status": "berhasil", "deskripsi": "Pembayaran tagihan" }
])

db.transaksi.createIndex({ id_pengirim: 1 })
db.transaksi.createIndex({ id_penerima: 1 })
db.transaksi.createIndex({ timestamp: -1 })
db.transaksi.createIndex({ status: 1 })
db.transaksi.createIndex({ id_pengirim: 1, timestamp: -1 })
db.transaksi.createIndex({ id_penerima: 1, timestamp: -1 })
```

### 7. **Masukkan Data Saldo ke Redis**

Buka terminal lain dan jalankan:

```bash
redis-cli
```
Masukkan:
```bash
SET saldo:USER-001 1000000
SET saldo:USER-002 500000
SET saldo:USER-003 750000
SET saldo:USER-004 200000
```

---

## 🚀 Menjalankan Server

### 8. **Jalankan Server Node.js**
Kembali ke terminal proyek di VSCode, jalankan:

```bash
npm start atau node server.js atau nodemon server.js
```
Jika berhasil:
```
Terhubung ke MongoDB
Terhubung ke Redis
Server berjalan di http://localhost:3000
```

### 9. **Akses Aplikasi di Browser**

Buka browser dan kunjungi:
```
http://localhost:3000
```
---

## 📁 Struktur Folder Proyek

```bash
tugas_besar_nosql/
├── public/              # Berisi HTML, CSS, JS (frontend)
├── server.js            # Server utama
├── package.json         # Konfigurasi npm
├── README.md            # Dokumentasi ini
```

---

## 📌 Catatan Tambahan

* Pastikan Redis dan MongoDB berjalan sebelum menjalankan `server.js`.
* Jika terjadi error "npm is not recognized" atau "node is not recognized", pastikan PATH environment sudah teratur.
* Redis Windows dari tporadowski sangat stabil untuk kebutuhan lokal dan edukasi.

---

## 👨‍💻 Lisensi

Lisensi MIT – Bebas digunakan, dimodifikasi, dan dibagikan untuk pembelajaran dan pengembangan.