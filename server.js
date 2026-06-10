const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios'); // For live GNews API calls
console.log('GNEWS_API_KEY from env:', process.env.GNEWS_API_KEY);
// Simple in-memory cache for live news (15-minute TTL)
const cache = {
  data: null,
  timestamp: 0,
  ttl: 15 * 60 * 1000 // 15 minutes in ms
};

const app = express();
const PORT = process.env.PORT || 3000;

// Helper to read news from JSON database
async function getNewsData() {
  // Return cached data if valid
  if (cache.data && (Date.now() - cache.timestamp) < cache.ttl) {
    return cache.data;
  }
  // Attempt live fetch from GNews API
  try {
    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) throw new Error('GNEWS_API_KEY not set');
    const response = await axios.get('https://gnews.io/api/v4/search', {
      params: {
        q: '"IOCL" OR "Indian Oil" OR "IndianOil" OR "Indian Oil Corporation"',
        lang: 'en',
        country: 'in',
        max: 50,
        token: apiKey
      }
    });
    const articles = response.data.articles || [];
    const transformed = articles.map(a => ({
      id: a.url,
      title: a.title,
      description: a.description,
      category: a.category || 'general',
      image: a.image,
      date: a.publishedAt,
      source: a.source?.name || '',
      url: a.url,
      featured: false
    }));
    // Cache result
    cache.data = transformed;
    cache.timestamp = Date.now();
    return transformed;
  } catch (err) {
    console.error('Live news fetch failed, falling back to static data:', err.message);
    // Fallback to static JSON file
    try {
      const dataPath = path.join(__dirname, 'data', 'news.json');
      const rawData = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(rawData);
    } catch (e) {
      console.error('Error reading fallback news data:', e);
      return [];
    }
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// REST API Endpoints
app.get('/api/news/all', async (req, res) => {
  const news = await getNewsData();
  res.json(news);
});

app.get('/api/news/top', async (req, res) => {
  const news = await getNewsData();
  res.json(news.slice(0, 10));
});

app.get('/api/news/featured', async (req, res) => {
  const news = await getNewsData();
  if (news.length > 0) {
    res.json(news[0]);
  } else {
    res.status(404).json({ error: 'No featured news found' });
  }
});

// Serve static assets from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to serve index.html for all other requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
