const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cache = require('memory-cache');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Kata kunci ringkas agar API Skizo tidak overload/error
const autoPlayKeywords = ["Bernadya", "Hindia", "Tulus", "Sal Priadi", "Feby Putri"];

app.get('/api/search', async (req, res) => {
    let query = req.query.q;

    if (!query || query.trim() === "") {
        query = autoPlayKeywords[Math.floor(Math.random() * autoPlayKeywords.length)];
    }

    const cacheKey = `search_${query}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
        return res.json(cachedData);
    }

    try {
        const response = await axios.get(`https://skizo.tech/api/tiktok-search?search=${encodeURIComponent(query)}&apikey=Ganz`);
        
        // Mengembalikan format s.image dan s.play_url asli bawaan awalmu agar tidak bentrok
        const results = response.data.map(item => ({
            title: item.title || "Unknown Title",
            author: item.author || "Unknown Artist",
            play_url: item.audio || item.music,
            image: item.cover || "https://files.catbox.moe/67v02n.jpg"
        }));

        cache.put(cacheKey, results, 1000 * 60 * 60);
        res.json(results);
    } catch (error) {
        console.error("Error fetching data:", error.message);
        res.status(500).json({ error: "Gagal mengambil data lagu." });
    }
});

app.get('/api/random', async (req, res) => {
    const randomWord = autoPlayKeywords[Math.floor(Math.random() * autoPlayKeywords.length)];
    try {
        const response = await axios.get(`https://skizo.tech/api/tiktok-search?search=${encodeURIComponent(randomWord)}&apikey=Ganz`);
        const item = response.data[Math.floor(Math.random() * response.data.length)];
        res.json({
            title: item.title,
            author: item.author,
            play_url: item.audio || item.music,
            image: item.cover
        });
    } catch (e) {
        res.status(500).send("Error");
    }
});

app.listen(PORT, () => {
    console.log(`Server VanzMusic running on port ${PORT}`);
});
