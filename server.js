const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios'); // For live GNews API calls
require("dotenv").config();
console.log("GNEWS key loaded:", Boolean(process.env.GNEWS_API_KEY));// Simple in-memory cache for live news (15-minute TTL)
const cache = {
  data: null,
  timestamp: 0,
  ttl: 15 * 60 * 1000 // 15 minutes in ms
};
const topicCaches = {};
function detectCategory(article) {
  const text = `${article.title || ""} ${article.description || ""} ${article.content || ""}`.toLowerCase();
  if (text.includes("recruitment") || text.includes("job") || text.includes("career")) {
    return "jobs";
  }
  if (text.includes("safety") || text.includes("accident") || text.includes("incident")) {
    return "safety";
  }
  return article.category || "general";
}

function getMonthFromDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date)) return "";
  return date.toLocaleString('default', { month: 'long' });
}
const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

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
        max: 10,
        token: apiKey
      }
    });
    const articles = response.data.articles || [];
    const transformed = articles.map(a => ({
      id: a.url,
      title: a.title,
      description: a.description,
      category: detectCategory(a),
      image: a.image,
      date: a.publishedAt,
      month: getMonthFromDate(a.publishedAt),
      source: a.source?.name || '',
      url: a.url,
      featured: false
    }));
    // Deduplicate by title+url (case-insensitive)
    const seen = new Set();
    const unique = [];
    for (const item of transformed) {
      const key = (item.title + item.url).toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }
    // Cache result
    cache.data = unique;
    cache.timestamp = Date.now();
    return unique;
  } catch (err) {
    console.error('Live news fetch failed, falling back to static data:', err.message);
    // Fallback to static JSON file
    try {
      const dataPath = path.join(__dirname, 'data', 'news.json');
      const rawData = fs.readFileSync(dataPath, 'utf8');
      const parsed = JSON.parse(rawData);
      // Enrich static data with month and category detection
      const enriched = parsed.map(item => ({
        ...item,
        category: item.category || 'general',
        month: getMonthFromDate(item.date),
        // Ensure proper url field if missing (use id if present)
        url: item.url || item.id || item.id,
      }));
      return enriched;
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

app.get('/api/news/topic/:topic', async (req, res) => {
  const topic = req.params.topic;
  const topicQueries = {
    barauni: '"Barauni Refinery" OR "Indian Oil Barauni" OR "IOCL Barauni"',
    official: '"Indian Oil Corporation" OR "IOCL" OR "IndianOil"',
    financial: '"Indian Oil" profit OR "Indian Oil" shares OR "IOCL" financial OR dividend',
    recruitment: '"IOCL recruitment" OR "Indian Oil recruitment" OR "IndianOil careers"',
    digital: '"Indian Oil" digital OR "IOCL" technology OR "IndianOil" automation',
    panipat: '"Panipat Refinery" OR "Indian Oil Panipat" OR "IOCL Panipat"',
    paradip: '"Paradip Refinery" OR "Indian Oil Paradip" OR "IOCL Paradip"',
    mathura: '"Mathura Refinery" OR "Indian Oil Mathura" OR "IOCL Mathura"',
    gujarat: '"Gujarat Refinery" OR "Indian Oil Gujarat Refinery" OR "IOCL Gujarat"',
    haldia: '"Haldia Refinery" OR "Indian Oil Haldia" OR "IOCL Haldia"',
    bongaigaon: '"Bongaigaon Refinery" OR "Indian Oil Bongaigaon" OR "IOCL Bongaigaon"',
    guwahati: '"Guwahati Refinery" OR "Indian Oil Guwahati" OR "IOCL Guwahati"',
    digboi: '"Digboi Refinery" OR "Indian Oil Digboi" OR "IOCL Digboi"'
  };

  if (!topicQueries[topic]) {
    return res.status(404).json({ error: 'Topic not found' });
  }

  // Check cache (15 min TTL)
  const cached = topicCaches[topic];
  if (cached && cached.data && (Date.now() - cached.timestamp) < 15 * 60 * 1000) {
    return res.json(cached.data);
  }

  try {
    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) throw new Error('GNEWS_API_KEY not set');

    const response = await axios.get('https://gnews.io/api/v4/search', {
      params: {
        q: topicQueries[topic],
        lang: 'en',
        country: 'in',
        max: 10,
        token: apiKey
      }
    });

    const articles = response.data.articles || [];
    if (articles.length === 0) {
      throw new Error('No articles returned from GNews');
    }

    const transformed = articles.slice(0, 3).map(a => ({
      id: a.url,
      title: a.title,
      description: a.description,
      category: topic,
      image: a.image,
      date: a.publishedAt,
      source: a.source?.name || '',
      url: a.url
    }));

    // Cache the result
    topicCaches[topic] = {
      data: transformed,
      timestamp: Date.now()
    };

    return res.json(transformed);
  } catch (err) {
    console.error(`Topic GNews fetch failed for ${topic}, falling back to static data:`, err.message);
    try {
      const fallbackPath = path.join(__dirname, 'data', 'topicFallback.json');
      const fallbackRaw = fs.readFileSync(fallbackPath, 'utf8');
      const fallbackJson = JSON.parse(fallbackRaw);
      const topicFallback = fallbackJson[topic] || [];
      return res.json(topicFallback);
    } catch (fallbackErr) {
      console.error(`Fallback data retrieval failed for ${topic}:`, fallbackErr);
      return res.json([]);
    }
  }
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
