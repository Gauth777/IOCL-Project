const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios'); // For live GNews API calls
require("dotenv").config();
console.log("GNEWS key loaded:", Boolean(process.env.GNEWS_API_KEY));// Simple in-memory cache for live news (5-hour TTL)
const CACHE_TTL_MS = 5 * 60 * 60 * 1000; // 5 hours

const cache = {
  data: null,
  timestamp: 0,
  ttl: CACHE_TTL_MS
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

function isValidHttpUrl(value) {
  try {
    const parsedUrl = new URL(value);
    return (
      parsedUrl.protocol === "http:" ||
      parsedUrl.protocol === "https:"
    );
  } catch {
    return false;
  }
}

function transformTopicArticle(article, topic, matchType) {
  if (
    !article ||
    !article.title ||
    !isValidHttpUrl(article.url)
  ) {
    return null;
  }

  return {
    id: article.url,
    title: article.title,
    description:
      article.description ||
      article.content ||
      "No description available.",
    category: topic,
    image:
      article.image ||
      "assets/images/refinery-modernization.jpg",
    date:
      article.publishedAt ||
      article.date ||
      new Date().toISOString(),
    source:
      article.source?.name ||
      article.source ||
      "News Source",
    url: article.url,
    matchType
  };
}

function deduplicateArticles(articles) {
  const seenUrls = new Set();
  const seenTitles = new Set();

  return articles.filter(article => {
    const normalizedUrl =
      String(article.url || "").trim().toLowerCase();

    const normalizedTitle =
      String(article.title || "").trim().toLowerCase();

    if (!normalizedUrl || !normalizedTitle) {
      return false;
    }

    if (
      seenUrls.has(normalizedUrl) ||
      seenTitles.has(normalizedTitle)
    ) {
      return false;
    }

    seenUrls.add(normalizedUrl);
    seenTitles.add(normalizedTitle);
    return true;
  });
}

const topicQueries = {
  financial:
    '("Indian Oil" OR IndianOil OR IOCL) AND (profit OR revenue OR shares OR dividend OR financial OR results)',

  recruitment:
    '("Indian Oil" OR IndianOil OR IOCL) AND (recruitment OR jobs OR vacancy OR apprentice OR careers)',

  digital:
    '("Indian Oil" OR IndianOil OR IOCL) AND (digital OR technology OR automation OR artificial intelligence OR cybersecurity)',

  barauni:
    'Barauni AND (refinery OR IndianOil OR IOCL OR "Indian Oil")',

  panipat:
    'Panipat AND (refinery OR petrochemical OR IndianOil OR IOCL OR "Indian Oil")',

  paradip:
    'Paradip AND (refinery OR IndianOil OR IOCL OR "Indian Oil")',

  mathura:
    'Mathura AND (refinery OR IndianOil OR IOCL OR "Indian Oil")',

  gujarat:
    '"Gujarat Refinery" OR (Gujarat AND (IndianOil OR IOCL OR "Indian Oil"))',

  haldia:
    'Haldia AND (refinery OR IndianOil OR IOCL OR "Indian Oil")',

  bongaigaon:
    'Bongaigaon AND (refinery OR IndianOil OR IOCL OR "Indian Oil")',

  guwahati:
    '"Guwahati Refinery" OR (Guwahati AND (IndianOil OR IOCL OR "Indian Oil"))',

  digboi:
    'Digboi AND (refinery OR IndianOil OR IOCL OR "Indian Oil")'
};

const broaderTopicQueries = {
  financial:
    '"Indian Oil" OR IndianOil OR IOCL',

  recruitment:
    '"Indian Oil" OR IndianOil OR IOCL',

  digital:
    '"Indian Oil" OR IndianOil OR IOCL',

  barauni:
    'Barauni refinery',

  panipat:
    'Panipat refinery',

  paradip:
    'Paradip refinery',

  mathura:
    'Mathura refinery',

  gujarat:
    'Gujarat refinery',

  haldia:
    'Haldia refinery',

  bongaigaon:
    'Bongaigaon refinery',

  guwahati:
    'Guwahati refinery',

  digboi:
    'Digboi refinery'
};

async function fetchTopicFromGNews(query, topic, matchType) {
  const apiKey = process.env.GNEWS_API_KEY;

  if (!apiKey) {
    throw new Error("GNEWS_API_KEY not set");
  }

  const response = await axios.get(
    "https://gnews.io/api/v4/search",
    {
      params: {
        q: query,
        lang: "en",
        max: 10,
        sortby: "relevance",
        in: "title,description,content",
        token: apiKey
      },
      timeout: 10000
    }
  );

  const rawArticles = Array.isArray(
    response.data?.articles
  )
    ? response.data.articles
    : [];

  console.log(
    `Topic ${topic} (${matchType}):`,
    response.data?.totalArticles || 0,
    "total articles,",
    rawArticles.length,
    "returned"
  );

  return deduplicateArticles(
    rawArticles
      .map(article =>
        transformTopicArticle(
          article,
          topic,
          matchType
        )
      )
      .filter(Boolean)
  ).slice(0, 3);
}

app.get("/api/news/topic/:topic", async (req, res) => {
  const topic = String(
    req.params.topic || ""
  ).toLowerCase();

  const supportedTopics = [
    "official",
    "financial",
    "recruitment",
    "digital",
    "barauni",
    "panipat",
    "paradip",
    "mathura",
    "gujarat",
    "haldia",
    "bongaigaon",
    "guwahati",
    "digboi"
  ];

  if (!supportedTopics.includes(topic)) {
    return res.status(404).json({
      error: "Topic not found"
    });
  }

  const cached = topicCaches[topic];

  if (
    cached?.data?.length &&
    Date.now() - cached.timestamp < CACHE_TTL_MS
  ) {
    return res.json(cached.data);
  }

  try {
    let results = [];

    if (topic === "official") {
      const newsData = await getNewsData();
      results = newsData
        .filter(article =>
          article &&
          article.title &&
          article.url &&
          isValidHttpUrl(article.url)
        )
        .slice(0, 3)
        .map(article => ({
          ...article,
          category: "official",
          matchType: "direct-live"
        }));
    } else {
      results = await fetchTopicFromGNews(
        topicQueries[topic],
        topic,
        "direct-live"
      );

      if (results.length === 0) {
        results = await fetchTopicFromGNews(
          broaderTopicQueries[topic],
          topic,
          "broader-live"
        );
      }

      if (results.length === 0) {
        const newsData = await getNewsData();
        results = newsData
          .filter(article =>
            article &&
            article.title &&
            article.url &&
            isValidHttpUrl(article.url)
          )
          .slice(0, 3)
          .map(article => ({
            ...article,
            category: topic,
            matchType: "general-live"
          }));
      }
    }

    results = deduplicateArticles(results)
      .filter(article =>
        isValidHttpUrl(article.url)
      )
      .slice(0, 3);

    if (results.length === 0) {
      return res.status(503).json({
        error:
          "No live IOCL news is currently available."
      });
    }

    topicCaches[topic] = {
      data: results,
      timestamp: Date.now()
    };

    return res.json(results);

  } catch (error) {
    console.error(
      `Topic request failed for ${topic}:`,
      error.response?.status ||
      error.message
    );

    // Final live safety net:
    // reuse already-cached main live news, if available.
    const mainLiveNews = Array.isArray(cache.data)
      ? cache.data
          .filter(article =>
            article &&
            article.title &&
            isValidHttpUrl(article.url)
          )
          .slice(0, 3)
          .map(article => ({
            ...article,
            category: topic,
            matchType: "general-live"
          }))
      : [];

    if (mainLiveNews.length > 0) {
      topicCaches[topic] = {
        data: mainLiveNews,
        timestamp: Date.now()
      };

      return res.json(mainLiveNews);
    }

    return res.status(503).json({
      error:
        "Live news service is temporarily unavailable."
    });
  }
}); // closes app.get('/api/news/topic/:topic')

  app.get('/api/news/top', async (req, res) => {
    const news = await getNewsData();
    res.json(news.slice(0, 10));
  });

  app.get('/api/news/featured', async (req, res) => {
    const news = await getNewsData();

    if (news.length > 0) {
      res.json(news[0]);
    } else {
      res.status(404).json({
        error: 'No featured news found'
      });
    }
  });

  // Serve static assets from public directory
  app.use(express.static(path.join(__dirname, 'public')));

  // Serve frontend for unmatched routes
  app.get('*', (req, res) => {
    res.sendFile(
      path.join(__dirname, 'public', 'index.html')
    );
  });

  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });