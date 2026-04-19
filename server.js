const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cache = require('memory-cache');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// List Rekomendasi Kata Kunci Galau (Biar Beranda Variatif)
const rekomendasiGalau = [
    "Hindia Baskara Putra lagu sedih",
    "Virgoun surat cinta untuk starla sedih",
    "Nadin Amizah sedih",
    "Lomba Sihir galau",
    "Feby Putri lagu sedih",
    "Pamungkas sedih",
    "Bernadya lagu sedih",
    "Raim Laode Komang sedih"
];

app.get('/api/search', async (req, res) => {
    // Ambil random dari list galau jika query kosong
    const randomDefault = rekomendasiGalau[Math.floor(Math.random() * rekomendasiGalau.length)];
    const query = req.query.q || randomDefault;
    
    // 1. Cek Cache (30 Menit)
    const cachedResult = cache.get(query);
    if (cachedResult) {
        console.log(`[Cache] Menggunakan data simpanan untuk: ${query}`);
        return res.json(cachedResult);
    }

    try {
        console.log(`[API] Mencari lagu: ${query}`);
        
        // 2. Request ke TikWM dengan User-Agent iPhone (Biar gak kena blok)
        const response = await axios.get(`https://www.tikwm.com/api/feed/search`, {
            params: {
                keywords: query,
                count: 15,
                cursor: 0
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
            }
        });

        if (!response.data || !response.data.data || !response.data.data.videos) {
            return res.json([]);
        }

        const videos = response.data.data.videos
            .filter(v => v.music_info && v.music_info.play)
            .map(v => ({
                title: v.music_info.title,
                author: v.music_info.author,
                image: v.music_info.cover || v.cover,
                play_url: v.music_info.play
            }));

        // 3. Simpan ke Cache
        cache.put(query, videos, 1800000);

        res.json(videos);
    } catch (err) {
        console.error("Error VanzMusic:", err.message);
        res.status(500).json({ error: "Server lagi galau, coba lagi nanti." });
    }
});

// Port untuk lokal & production
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`VanzMusic siap galau di port ${PORT}`);
    });
}

module.exports = app; // Penting untuk Vercel
