// =========================
// IOCL NEWS DASHBOARD
// =========================

let newsData = [];
let featuredNewsData = null;

// =========================
// UTILITY FUNCTIONS
// =========================

function updateLastSync() {
    const now = new Date();
    const syncTime = now.toLocaleTimeString();
    const lastSyncEl = document.getElementById("lastSync");
    if (lastSyncEl) {
        lastSyncEl.textContent = "\u2713 " + syncTime;
    }
}

function updateLastUpdated() {
    // Dummy function to prevent ReferenceError from original code
}

// =========================
// FETCH DASHBOARD DATA
// =========================

async function fetchDashboardData() {
    try {
        const allRes = await fetch('/api/news/all', { cache: 'no-store' });
        newsData = await allRes.json();

        // Sort by latest date
        newsData = [...newsData].sort((a, b) => new Date(b.date) - new Date(a.date));

        // Use first item as featured
        featuredNewsData = newsData[0] || null;

        // Render all sections using live data
        renderNews(newsData);
        loadHighlights(newsData);
        loadTopTicker(newsData);
        loadNotifications(newsData);
        renderBookmarks();
        updateLastSync();

        console.log('Live news loaded:', newsData.map(n => n.title));
    } catch (error) {
        console.error('Error fetching news from API:', error);
    }
}

// =========================
// RENDER NEWS CARDS
// =========================

function renderNews(data) {

    const newsContainer = document.getElementById("newsContainer");
    const featuredNews = document.getElementById("featuredNews");
    const featuredSection = document.querySelector(".featured");

    if (!newsContainer) return;

    newsContainer.innerHTML = "";

    // Determine if filters/search are active
    const searchBox = document.getElementById("searchBox");
    const isFiltering = (data.length !== newsData.length) ||
        (searchBox && searchBox.value.trim().length > 0);

    // FEATURED NEWS — hide when filtering
    if (featuredSection) {
        featuredSection.style.display = isFiltering ? "none" : "";
    }

    if (!isFiltering && featuredNewsData && featuredNews) {
        featuredNews.innerHTML = `
            <div class="featured-card">
                <img src="${featuredNewsData.image}" alt="Featured">
                <div class="featured-content">
                    <span class="category">${featuredNewsData.category}</span>
                    <h3>${featuredNewsData.title}</h3>
                    <p>${featuredNewsData.description}</p>
                    <a href="${featuredNewsData.url}" target="_blank" rel="noopener noreferrer" class="read-more">Read More \u2192</a>
                </div>
            </div>
        `;
    }

    // Update section heading
    const sectionTitle = document.querySelector(".section-title");
    if (sectionTitle) {
        if (isFiltering) {
            const searchText = searchBox ? searchBox.value.trim() : "";
            sectionTitle.textContent = searchText
                ? "Showing results for: " + searchText
                : "Filtered News";
        } else {
            sectionTitle.textContent = "Top Monthly News";
        }
    }

    // Sort data newest first
    const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));

    // NEWS CARDS
    sortedData.slice(0, 10).forEach(news => {
        const bookmarked = isBookmarked(news);
        const encodedUrl = encodeURIComponent(news.url);

        newsContainer.innerHTML += `
            <div class="news-card">
                <img src="${news.image}" alt="${news.title}">
                <div class="news-content">
                    <span class="category">${news.category}</span>
                    <h3>${news.title}</h3>
                    <p>${news.description}</p>
                    <p class="news-date">${news.date}</p>
                    <a href="${news.url}" target="_blank" rel="noopener noreferrer" class="read-more">View Details \u2192</a>
                    <br><br>
                    <button class="bookmark-btn ${bookmarked ? 'bookmarked' : ''}" data-url="${encodedUrl}">
                        ${bookmarked ? '\u2B50 Remove Bookmark' : '\u2606 Bookmark'}
                    </button>
                </div>
            </div>
        `;
    });

    // Attach bookmark event listeners using event delegation
    newsContainer.addEventListener('click', handleBookmarkClick);

    if (document.getElementById("totalNews")) {
        document.getElementById("totalNews").textContent = data.length;
    }
}

// =========================
// BOOKMARK EVENT HANDLER
// =========================

function handleBookmarkClick(e) {
    const btn = e.target.closest('.bookmark-btn');
    if (!btn) return;

    const encodedUrl = btn.getAttribute('data-url');
    if (!encodedUrl) return;

    const url = decodeURIComponent(encodedUrl);
    const news = newsData.find(item => item.url === url);
    if (news) {
        toggleBookmark(news);
    }
}

// =========================
// TODAY'S HIGHLIGHTS
// =========================

function loadHighlights(data) {
    const container = document.getElementById("highlightContainer");
    if (!container) return;

    const source = data || newsData;
    const latest = [...source]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);

    container.innerHTML = latest.map(news => `
        <div class="highlight-card">
            <h3>
                <a href="${news.url}" target="_blank" rel="noopener noreferrer" class="highlight-link">
                    ${news.title}
                    <span class="arrow">\u2192</span>
                </a>
            </h3>
            <p>${news.description || "No description available."}</p>
            <a href="${news.url}" target="_blank" rel="noopener noreferrer" class="read-more">
                Read More \u2192
            </a>
        </div>
    `).join("");
}

// =========================
// TOP TICKER (ANIMATED BAR)
// =========================

function loadTopTicker(data) {
    const ticker = document.getElementById("tickerContent") ||
        document.querySelector(".ticker marquee");

    if (!ticker) return;

    const source = data || newsData;
    const latest = [...source]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    ticker.innerHTML = latest
        .map(news => `
            <a href="${news.url}" target="_blank" rel="noopener noreferrer" class="ticker-link">
                \uD83D\uDCE2 ${news.title}
            </a>
        `)
        .join(' <span class="ticker-separator">|</span> ');
}

// =========================
// NOTIFICATIONS
// =========================

function loadNotifications(data) {
    const container = document.getElementById("notificationList");
    if (!container) return;

    const source = data || newsData;
    const latest = [...source]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 4);

    container.innerHTML = latest.map(news => `
        <li>
            <a href="${news.url}" target="_blank" rel="noopener noreferrer" class="notification-link">
                ${news.title}
                <span class="arrow">\u2192</span>
            </a>
        </li>
    `).join("");

    const badge = document.getElementById("notificationCount");
    if (badge) badge.textContent = latest.length;
}

// =========================
// SEARCH + FILTER
// =========================

function filterNews() {

    let filtered = [...newsData];

    const searchBox = document.getElementById("searchBox");
    const monthFilter = document.getElementById("monthFilter");
    const sortFilter = document.getElementById("sortFilter");

    const searchText = searchBox ? searchBox.value.toLowerCase() : "";
    const selectedMonth = monthFilter ? monthFilter.value : "all";
    const selectedSort = sortFilter ? sortFilter.value : "newest";

    // SEARCH
    if (searchText) {
        filtered = filtered.filter(news =>
            news.title.toLowerCase().includes(searchText) ||
            news.description.toLowerCase().includes(searchText) ||
            news.category.toLowerCase().includes(searchText)
        );
    }

    // MONTH FILTER
    if (selectedMonth !== "all") {
        filtered = filtered.filter(news => news.month === selectedMonth);
    }

    // SORTING
    if (selectedSort === "newest") {
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    if (selectedSort === "oldest") {
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    if (selectedSort === "title") {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    // UPDATE MONTH CARD
    const monthCard = document.getElementById("selectedMonth");
    if (monthCard) {
        monthCard.textContent = selectedMonth === "all" ? "All" : selectedMonth;
    }

    renderNews(filtered);
}

// =========================
// INITIAL LOAD
// =========================

fetchDashboardData();

// =========================
// SEARCH SUGGESTIONS
// =========================

const searchInput = document.getElementById("searchBox");
const suggestions = document.getElementById("suggestions");

if (searchInput) {
    searchInput.addEventListener("input", () => {
        const value = searchInput.value.toLowerCase();

        if (suggestions) {
            suggestions.innerHTML = "";
        }

        if (!value) {
            filterNews();
            return;
        }

        newsData.forEach(news => {
            if (news.title.toLowerCase().includes(value)) {
                if (suggestions) {
                    suggestions.innerHTML += `
                        <div class="suggestion-item">
                            ${news.title}
                        </div>
                    `;
                }
            }
        });

        saveSearchHistory(value);
        filterNews();
    });
}

// =========================
// CLICK SUGGESTION
// =========================

if (suggestions) {
    suggestions.addEventListener("click", e => {
        if (e.target.classList.contains("suggestion-item")) {
            searchInput.value = e.target.textContent.trim();
            suggestions.innerHTML = "";
            filterNews();
        }
    });
}

// =========================
// CLEAR SEARCH
// =========================

const clearBtn = document.getElementById("clearSearch");

if (clearBtn) {
    clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        if (suggestions) {
            suggestions.innerHTML = "";
        }
        filterNews();
    });
}

// =========================
// SEARCH HISTORY
// =========================

function saveSearchHistory(term) {
    if (!term || term.length < 2) return;

    let history = JSON.parse(localStorage.getItem("searchHistory")) || [];

    if (!history.includes(term)) {
        history.unshift(term);
    }

    history = history.slice(0, 5);

    localStorage.setItem("searchHistory", JSON.stringify(history));
    loadSearchHistory();
}

function loadSearchHistory() {
    const container = document.getElementById("searchHistory");
    if (!container) return;

    container.innerHTML = "";

    let history = JSON.parse(localStorage.getItem("searchHistory"));
    if (!history) {
        history = [];
    }

    history.forEach(item => {
        container.innerHTML += `
            <div class="history-item">
                ${item}
            </div>
        `;
    });
}

loadSearchHistory();

// =========================
// CLEAR SEARCH HISTORY
// =========================

const clearHistoryBtn = document.getElementById("clearHistoryBtn");

if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", function () {
        localStorage.setItem("searchHistory", JSON.stringify([]));
        document.getElementById("searchHistory").innerHTML = "";
    });
}

// =========================
// QUICK FILTERS & REFINERIES (TOPIC MODAL)
// =========================

document.querySelectorAll("[data-topic]").forEach(item => {
  item.addEventListener("click", async () => {
    const topic = item.dataset.topic;
    if (!topic) return;
    await openTopicModal(topic);
  });
});

async function openTopicModal(topic) {
  const modal = document.getElementById("topicModal");
  const modalTitle = document.getElementById("topicModalTitle");
  const modalContent = document.getElementById("topicModalContent");

  if (!modal || !modalTitle || !modalContent) return;

  const topicLabels = {
    barauni: "Barauni Refinery News",
    official: "Official IOCL News",
    financial: "Financial News",
    recruitment: "Recruitment News",
    digital: "Digital Projects News",
    panipat: "Panipat Refinery News",
    paradip: "Paradip Refinery News",
    mathura: "Mathura Refinery News",
    gujarat: "Gujarat Refinery News",
    haldia: "Haldia Refinery News",
    bongaigaon: "Bongaigaon Refinery News",
    guwahati: "Guwahati Refinery News",
    digboi: "Digboi Refinery News"
  };

  modalTitle.textContent = topicLabels[topic] || "Related News";
  modalContent.innerHTML = "<p>Loading related news...</p>";
  modal.classList.add("active");

  try {
    const res = await fetch(`/api/news/topic/${topic}`, { cache: "no-store" });
    const articles = await res.json();

    if (!Array.isArray(articles) || articles.length === 0) {
      modalContent.innerHTML = "<p>No related news found right now. Please try again later.</p>";
      return;
    }

    modalContent.innerHTML = articles.slice(0, 3).map(article => `
      <div class="topic-news-item">
        <h3>
          <a href="${article.url}" target="_blank" rel="noopener noreferrer">
            ${article.title}
          </a>
        </h3>
        <p>${article.description || "No description available."}</p>
        <small>${article.source || ""}</small>
        <br>
        <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="read-more">
          Read More →
        </a>
      </div>
    `).join("");
  } catch (error) {
    console.error("Topic news fetch failed:", error);
    modalContent.innerHTML = "<p>Unable to load related news right now.</p>";
  }
}

// Modal close behavior
const topicModal = document.getElementById("topicModal");
const closeTopicModalBtn = document.getElementById("closeTopicModal");

if (closeTopicModalBtn && topicModal) {
    closeTopicModalBtn.addEventListener("click", () => {
        topicModal.classList.remove("active");
    });
}

window.addEventListener("click", e => {
    if (e.target === topicModal) {
        topicModal.classList.remove("active");
    }
});

window.addEventListener("keydown", e => {
    if (e.key === "Escape" && topicModal && topicModal.classList.contains("active")) {
        topicModal.classList.remove("active");
    }
});

// =========================
// VOICE SEARCH
// =========================

const voiceBtn = document.getElementById("voiceSearchBtn");

if (voiceBtn && "webkitSpeechRecognition" in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-IN";
    recognition.interimResults = false;

    voiceBtn.addEventListener("click", () => {
        recognition.start();
    });

    recognition.onresult = event => {
        const text = event.results[0][0].transcript;
        searchInput.value = text;
        filterNews();
    };

    recognition.onerror = event => {
        console.log(event.error);
    };
}

// =========================
// FILTER DROPDOWNS
// =========================

const monthFilterEl = document.getElementById("monthFilter");

if (monthFilterEl) {
    monthFilterEl.addEventListener("change", filterNews);
}

const sortFilter = document.getElementById("sortFilter");

if (sortFilter) {
    sortFilter.addEventListener("change", filterNews);
}

// =========================
// NOTIFICATION CENTER
// =========================

const notificationBell = document.getElementById("notificationBell");
const notificationPanel = document.getElementById("notificationPanel");

if (notificationBell && notificationPanel) {
    notificationBell.addEventListener("click", () => {
        if (notificationPanel.style.display === "block") {
            notificationPanel.style.display = "none";
        } else {
            notificationPanel.style.display = "block";
        }
    });
}

// =========================
// BOOKMARKS
// =========================

function isBookmarked(news) {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    return bookmarks.some(item => item.url === news.url);
}

function toggleBookmark(news) {
    let bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");

    const exists = bookmarks.some(item => item.url === news.url);

    if (exists) {
        bookmarks = bookmarks.filter(item => item.url !== news.url);
    } else {
        bookmarks.push({
            title: news.title,
            url: news.url,
            description: news.description,
            image: news.image,
            category: news.category,
            date: news.date
        });
    }

    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));

    // Re-render affected sections
    renderNews(newsData);
    loadHighlights(newsData);
    renderBookmarks();
}

function removeBookmark(encodedUrl) {
    const url = decodeURIComponent(encodedUrl);
    let bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    bookmarks = bookmarks.filter(item => item.url !== url);
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    renderBookmarks();
    renderNews(newsData);
    loadHighlights(newsData);
}

function renderBookmarks() {
    const container = document.getElementById("bookmarkContainer");
    if (!container) return;

    container.innerHTML = "";

    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");

    if (bookmarks.length === 0) {
        container.innerHTML = "<p>No bookmarks yet.</p>";
        return;
    }

    container.innerHTML = bookmarks.map(item => {
        const encodedUrl = encodeURIComponent(item.url);
        return `
            <div class="bookmark-card">
                <div class="bookmark-card-content">
                    <strong>
                        <a href="${item.url}" target="_blank" rel="noopener noreferrer">\u2B50 ${item.title}</a>
                    </strong>
                    <p>${item.description || ""}</p>
                    <button class="bookmark-btn bookmarked bookmark-remove-btn" data-remove-url="${encodedUrl}">
                        Remove Bookmark
                    </button>
                </div>
            </div>
        `;
    }).join("");

    // Attach remove event listeners
    container.querySelectorAll('.bookmark-remove-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const encodedUrl = this.getAttribute('data-remove-url');
            if (encodedUrl) removeBookmark(encodedUrl);
        });
    });
}

renderBookmarks();

// =========================
// NEWS MODAL
// =========================

const modal = document.getElementById("newsModal");
const closeModalBtn = document.getElementById("closeModal");

function openModal(title, date, description) {
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalDate").textContent = date;
    document.getElementById("modalDescription").textContent = description;
    modal.style.display = "block";
}

if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });
}

window.addEventListener("click", e => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

// =========================
// SHARE BUTTONS
// =========================

const shareWhatsapp = document.getElementById("shareWhatsapp");

if (shareWhatsapp) {
    shareWhatsapp.addEventListener("click", () => {
        const title = document.getElementById("modalTitle").textContent;
        const url = `https://wa.me/?text=${encodeURIComponent(title)}`;
        window.open(url, "_blank");
    });
}

const copyLink = document.getElementById("copyLink");

if (copyLink) {
    copyLink.addEventListener("click", () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied!");
    });
}

const shareEmail = document.getElementById("shareEmail");

if (shareEmail) {
    shareEmail.addEventListener("click", () => {
        const title = document.getElementById("modalTitle").textContent;
        window.location.href = `mailto:?subject=${title}`;
    });
}

// =========================
// DARK MODE
// =========================

const darkModeBtn = document.getElementById("darkModeBtn");

if (darkModeBtn) {
    darkModeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark");
    });
}

// =========================
// REFRESH BUTTON
// =========================

const refreshBtn = document.getElementById("refreshBtn");

if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
        refreshBtn.classList.add("rotate");

        setTimeout(() => {
            refreshBtn.classList.remove("rotate");
        }, 800);

        // Fetch news dynamically from the REST API
        fetchDashboardData();
    });
}

// =========================
// LIVE DATE & TIME
// =========================

function updateClock() {
    const now = new Date();

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    const dateText = now.toLocaleDateString("en-IN", options);
    const timeText = now.toLocaleTimeString();

    const currentDate = document.getElementById("currentDate");
    if (currentDate) {
        currentDate.innerHTML = `${dateText}<br>${timeText}`;
    }

    const liveTime = document.getElementById("liveTime");
    if (liveTime) {
        liveTime.textContent = timeText;
    }
}

setInterval(updateClock, 1000);
updateClock();

// =========================
// LOADER
// =========================

window.addEventListener("load", () => {
    setTimeout(() => {
        const loader = document.getElementById("loader");
        if (loader) {
            loader.style.display = "none";
        }
    }, 800);
});

// =========================
// WEATHER WIDGET
// =========================

function loadWeather() {
    const weatherCard = document.getElementById("weatherCard");
    if (!weatherCard) return;

    weatherCard.innerHTML = `
        <h3>Barauni Refinery</h3>
        <p>\uD83C\uDF21\uFE0F 35\u00B0C</p>
        <p>\u2600\uFE0F Sunny</p>
    `;
}

loadWeather();

// =========================
// BACK TO TOP BUTTON
// =========================

const topBtn = document.getElementById("topBtn");

window.addEventListener("scroll", () => {
    if (topBtn) {
        if (window.scrollY > 300) {
            topBtn.style.display = "block";
        } else {
            topBtn.style.display = "none";
        }
    }
});

if (topBtn) {
    topBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

// =========================
// API STATUS
// =========================

const apiStatus = document.getElementById("apiStatus");

if (apiStatus) {
    apiStatus.innerHTML = "\uD83D\uDFE2 Connected";
}