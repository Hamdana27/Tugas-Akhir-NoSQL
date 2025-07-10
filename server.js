// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const redis = require('redis');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors());

// Konfigurasi MongoDB
const mongoUrl = 'mongodb://localhost:27017';
const mongoClient = new MongoClient(mongoUrl);
const dbName = 'transaksi_keuangan';
let db;

// Konfigurasi Redis
const redisClient = redis.createClient({
    url: 'redis://localhost:6379'
});

// Fungsi koneksi MongoDB
async function connectMongoDB() {
    try {
        await mongoClient.connect();
        console.log('✅ Terhubung ke MongoDB');
        db = mongoClient.db(dbName);
    } catch (error) {
        console.error('❌ Gagal terhubung ke MongoDB:', error);
        process.exit(1);
    }
}

// Fungsi koneksi Redis
async function connectRedis() {
    redisClient.on('connect', () => {
        console.log('✅ Terhubung ke Redis');
    });

    redisClient.on('error', (err) => {
        console.error('❌ Gagal terhubung ke Redis:', err);
        process.exit(1);
    });

    await redisClient.connect();
}

// Jalankan koneksi sebelum server aktif
async function startServer() {
    await connectMongoDB();
    await connectRedis();

    // Endpoint 1: Mencatat Transaksi Baru
    app.post('/api/transaksi', async (req, res) => {
        const { _id, id_pengirim, id_penerima, jumlah, mata_uang, status, deskripsi } = req.body;
        const newTransaction = {
            _id: _id,
            id_pengirim,
            id_penerima,
            jumlah: parseFloat(jumlah),
            mata_uang,
            timestamp: new Date(),
            status,
            deskripsi: deskripsi || ""
        };

        try {
            await db.collection('transaksi').insertOne(newTransaction);

            if (status === 'berhasil') {
                await redisClient.decrBy(`saldo:${id_pengirim}`, parseFloat(jumlah));
                await redisClient.incrBy(`saldo:${id_penerima}`, parseFloat(jumlah));
            }

            res.status(201).json({
                message: 'Transaksi berhasil dicatat dan saldo diperbarui',
                transaction: newTransaction
            });
        } catch (error) {
            console.error('Error saat mencatat transaksi:', error);
            res.status(500).json({ error: 'Gagal mencatat transaksi', details: error.message });
        }
    });

    // Endpoint 2: Melihat Riwayat Transaksi
    app.get('/api/transaksi', async (req, res) => {
        const { id_pengirim, id_penerima } = req.query;
        let query = {};
        if (id_pengirim) query.id_pengirim = id_pengirim;
        if (id_penerima) query.id_penerima = id_penerima;

        try {
            const transactions = await db.collection('transaksi').find(query).sort({ timestamp: -1 }).toArray();
            res.status(200).json(transactions);
        } catch (error) {
            console.error('Error saat mengambil riwayat transaksi:', error);
            res.status(500).json({ error: 'Gagal mengambil riwayat transaksi', details: error.message });
        }
    });

    // Endpoint 3: Mencari Transaksi Berdasarkan ID
    app.get('/api/transaksi/:id', async (req, res) => {
        const transactionId = req.params.id;
        try {
            const transaction = await db.collection('transaksi').findOne({ _id: transactionId });
            if (transaction) {
                res.status(200).json(transaction);
            } else {
                res.status(404).json({ message: 'Transaksi tidak ditemukan' });
            }
        } catch (error) {
            console.error('Error saat mencari transaksi:', error);
            res.status(500).json({ error: 'Gagal mencari transaksi', details: error.message });
        }
    });

    // Endpoint 4: Memperbarui Status Transaksi
    app.put('/api/transaksi/:id/status', async (req, res) => {
        const transactionId = req.params.id;
        const { new_status } = req.body;

        try {
            const result = await db.collection('transaksi').updateOne(
                { _id: transactionId },
                { $set: { status: new_status } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
            }

            res.status(200).json({ message: 'Status transaksi berhasil diperbarui' });
        } catch (error) {
            console.error('Error saat memperbarui status transaksi:', error);
            res.status(500).json({ error: 'Gagal memperbarui status transaksi', details: error.message });
        }
    });

    // Endpoint 5: Mengambil Saldo Pengguna dari Redis
    app.get('/api/saldo/:id', async (req, res) => {
        const userId = req.params.id;
        try {
            const saldo = await redisClient.get(`saldo:${userId}`);
            if (saldo !== null) {
                res.status(200).json({ id_pengguna: userId, saldo: parseFloat(saldo) });
            } else {
                res.status(404).json({ message: 'Saldo pengguna tidak ditemukan (default 0)', id_pengguna: userId, saldo: 0 });
            }
        } catch (error) {
            console.error('Error saat mengambil saldo:', error);
            res.status(500).json({ error: 'Gagal mengambil saldo', details: error.message });
        }
    });

    // Jalankan server setelah koneksi berhasil
    app.listen(PORT, () => {
        console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    });
}

startServer();
