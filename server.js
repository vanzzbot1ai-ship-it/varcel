// server.js - Versi Optimal
const express = require('express');
const axios = require('axios');
const app = express();

// Daftar keyword yang lebih luas agar algoritma terasa "pintar"
const vibes = ["Indie Pop Indonesia", "Lagu Galau", "Chill Vibes", "Acoustic", "Pop Melankolis"];

app.get('/api/get-song', async (req, res) => {
    // Memilih vibe secara acak untuk mensimulasikan "mengikuti mood"
    const randomVibe = vibes[Math.floor(Math.random() * vibes.length)];
    try {
        const response = await axios.get(`https://skizo.tech/api/tiktok-search?search=${encodeURIComponent(randomVibe)}&apikey=Ganz`);
        const items = response.data;
        const randomItem = items[Math.floor(Math.random() * items.length)];
        
        res.json({
            title: randomItem.title,
            author: randomItem.author,
            audio: randomItem.audio || randomItem.music,
            cover: randomItem.cover
        });
    } catch (e) {
        res.status(500).json({ error: "Server sibuk" });
    }
});

app.listen(3000, () => console.log("VanzMusic Engine Aktif"));
