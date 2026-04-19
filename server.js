const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cache = require('memory-cache');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Daftar kata kunci otomatis biar web gak mati gaya (Sad & Random)
const autoPlayKeywords = [
    "Bernadya", "Hindia", "Tulus", "Sal Priadi", 
    "Lagu Galau Indonesia", "Feby Putri", "Nadin Amizah", 
    "Gildcoustic", "Guyon Waton", "Juicy Luicy"
];

// Endpoint Pencarian Utama
app.get('/api/search', async (req, res) => {
    let query = req.query.q;

    // JIKA query kosong, ambil kata kunci acak dari daftar di atas
    if (!query || query.trim() === "") {
        query = autoPlayKeywords[Math.floor(Math.random() * autoPlayKeywords.length)];
    }

    const cacheKey = `search_${query}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
        return res.json(cachedData);
    }

    try {
        // Menggunakan API TikTok untuk mencari musik (Sesuai kebutuhan project Vanz)
        const response = await axios.get(`https://skizo.tech/api/tiktok-search?search=${encodeURIComponent(query)}&apikey=Ganz`);
        
        const results = response.data.map(item => ({
            title: item.title || "Unknown Title",
            author: item.author || "Unknown Artist",
            audio: item.audio || item.music,
            cover: item.cover || "https://files.catbox.moe/67v02n.jpg" // Default cover
        }));

        cache.put(cacheKey, results, 1000 * 60 * 60); // Cache 1 jam
        res.json(results);
    } catch (error) {
        console.error("Error fetching data:", error.message);
        res.status(500).json({ error: "Gagal mengambil data lagu." });
    }
});

// Endpoint untuk mendapatkan satu lagu acak (Bisa dipanggil pas lagu habis)
app.get('/api/random', async (req, res) => {
    const randomWord = autoPlayKeywords[Math.floor(Math.random() * autoPlayKeywords.length)];
    try {
        const response = await axios.get(`https://skizo.tech/api/tiktok-search?search=${encodeURIComponent(randomWord)}&apikey=Ganz`);
        const item = response.data[Math.floor(Math.random() * response.data.length)];
        res.json({
            title: item.title,
            author: item.author,
            audio: item.audio || item.music,
            cover: item.cover
        });
    } catch (e) {
        res.status(500).send("Error");
    }
});

app.listen(PORT, () => {
    console.log(`Server VanzMusic running on port ${PORT}`);
});
    
