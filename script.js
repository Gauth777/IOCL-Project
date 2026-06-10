// =========================
// SAMPLE NEWS DATA
// =========================

const newsData = [

{
title:"IndianOil Digital Transformation Initiative",
description:"IndianOil expands digital innovation projects across refineries and business units.",
date:"2026-06-10",
month:"2026-06",
category:"digital",
image:"assets/images/digital-transformation.jpg",
url:"https://iocl.com/"
},

{
title:"Refinery Modernization Project",
description:"Major refinery modernization announced to improve efficiency.",
date:"2026-06-09",
month:"2026-06",
category:"official",
image:"assets/images/refinery-modernization.jpg",
url:"https://iocl.com/"
},

{
title:"Green Hydrogen Expansion",
description:"IndianOil invests heavily in green hydrogen infrastructure.",
date:"2026-06-08",
month:"2026-06",
category:"csr",
image:"assets/images/green-hydrogen.jpg",
url:"https://iocl.com/"
},

{
title:"Pipeline Infrastructure Upgrade",
description:"New upgrades improve transportation efficiency.",
date:"2026-06-07",
month:"2026-06",
category:"official",
image:"assets/images/pipeline-upgrade.jpg",
url:"https://iocl.com/"
},

{
title:"AI Monitoring System",
description:"AI-powered monitoring deployed in refinery operations.",
date:"2026-06-06",
month:"2026-06",
category:"digital",
image:"assets/images/ai-monitoring.jpg",
url:"https://iocl.com/"
},

{
title:"Solar Energy Program",
description:"IndianOil expands renewable energy projects.",
date:"2026-06-05",
month:"2026-06",
category:"csr",
image:"assets/images/solar-energy.jpg",
url:"https://iocl.com/"
},

{
title:"Employee Skill Development",
description:"New employee upskilling initiatives launched.",
date:"2026-06-04",
month:"2026-06",
category:"recruitment",
image:"assets/images/skill-development.jpg",
url:"https://iocl.com/"
},

{
title:"New LPG Distribution Network",
description:"Improved LPG distribution across multiple states.",
date:"2026-06-03",
month:"2026-06",
category:"official",
image:"assets/images/lpg-network.jpg",
url:"https://iocl.com/"
},

{
title:"Research Collaboration",
description:"Research partnership with leading institutions.",
date:"2026-06-02",
month:"2026-06",
category:"financial",
image:"assets/images/research-collaboration.jpg",
url:"https://iocl.com/"
},

{
title:"Safety Excellence Award",
description:"IndianOil receives national safety recognition.",
date:"2026-06-01",
month:"2026-06",
category:"safety",
image:"assets/images/safety-award.jpg",
url:"https://iocl.com/"
}

];

// =========================
// RENDER NEWS
// =========================

function renderNews(data){

const newsContainer =
document.getElementById("newsContainer");

const featuredNews =
document.getElementById("featuredNews");

newsContainer.innerHTML = "";

// FEATURED NEWS

if(data.length > 0){

featuredNews.innerHTML = `

<div class="featured-card">

<img src="${data[0].image}" alt="Featured">

<div class="featured-content">

<span class="category">
${data[0].category}
</span>

<h3>
${data[0].title}
</h3>

<p>
${data[0].description}
</p>

<a
href="${data[0].url}"
target="_blank"
class="read-more">

Read More →

</a>

</div>

</div>

`;

}

// NEWS CARDS

data.slice(0,10).forEach(news=>{

newsContainer.innerHTML += `

<div class="news-card">

<img
src="${news.image}"
alt="${news.title}">

<div class="news-content">

<span class="category">
${news.category}
</span>

<h3>
${news.title}
</h3>

<p>
${news.description}
</p>

<p class="news-date">
${news.date}
</p>

<a
href="#"
class="read-more"
onclick="openModal(
'${news.title}',
'${news.date}',
'${news.description}'
)">

View Details →

</a>

<br><br>

<button
class="bookmark-btn"
onclick="bookmarkNews('${news.title}')">

⭐ Bookmark

</button>

</div>

</div>

`;

});

if(document.getElementById("totalNews")){

document.getElementById(
"totalNews"
).textContent = data.length;

}

}

// =========================
// TODAY'S HIGHLIGHTS
// =========================

function loadHighlights(){

    const container =
    document.getElementById(
        "highlightContainer"
    );

    if(!container) return;

    container.innerHTML = "";

    newsData
    .slice(0,3)
    .forEach(news => {

        container.innerHTML += `

        <div class="highlight-card">

            <h3 class="highlight-link">

                ${news.title}

                <span class="arrow">

                    →

                </span>

            </h3>

            <p>

                ${news.description}

            </p>

        </div>

        `;

    });

}
// =========================
// SEARCH + FILTER
// =========================

function filterNews(){

let filtered = [...newsData];

const searchBox =
document.getElementById(
"searchBox"
);

const monthFilter =
document.getElementById(
"monthFilter"
);

const sortFilter =
document.getElementById(
"sortFilter"
);

const searchText =
searchBox
? searchBox.value.toLowerCase()
: "";

const selectedMonth =
monthFilter
? monthFilter.value
: "all";

const selectedSort =
sortFilter
? sortFilter.value
: "newest";

// SEARCH

if(searchText){

filtered = filtered.filter(news =>

news.title
.toLowerCase()
.includes(searchText)

||

news.description
.toLowerCase()
.includes(searchText)

||

news.category
.toLowerCase()
.includes(searchText)

);

}

// MONTH FILTER

if(selectedMonth !== "all"){

filtered = filtered.filter(news =>

news.month === selectedMonth

);

}

// SORTING

if(selectedSort === "newest"){

filtered.sort((a,b)=>

new Date(b.date)
-
new Date(a.date)

);

}

if(selectedSort === "oldest"){

filtered.sort((a,b)=>

new Date(a.date)
-
new Date(b.date)

);

}

if(selectedSort === "title"){

filtered.sort((a,b)=>

a.title.localeCompare(
b.title
)

);

}

// UPDATE MONTH CARD

const monthCard =
document.getElementById(
"selectedMonth"
);

if(monthCard){

monthCard.textContent =

selectedMonth === "all"
? "All"
: selectedMonth;

}

renderNews(filtered);

}

// =========================
// INITIAL LOAD
// =========================

renderNews(newsData);

loadHighlights();
// =========================
// SEARCH SUGGESTIONS
// =========================

const searchInput =
document.getElementById(
"searchBox"
);

const suggestions =
document.getElementById(
"suggestions"
);

if(searchInput){

searchInput.addEventListener(
"input",
()=>{

const value =
searchInput.value
.toLowerCase();

if(suggestions){

suggestions.innerHTML="";

}

if(!value){

return;

}

newsData.forEach(news=>{

if(

news.title
.toLowerCase()
.includes(value)

){

if(suggestions){

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

if(suggestions){

suggestions.addEventListener(
"click",
e=>{

if(

e.target.classList.contains(
"suggestion-item"
)

){

searchInput.value =

e.target.textContent;

suggestions.innerHTML="";

filterNews();

}

});

}

// =========================
// CLEAR SEARCH
// =========================

const clearBtn =
document.getElementById(
"clearSearch"
);

if(clearBtn){

clearBtn.addEventListener(
"click",
()=>{

searchInput.value="";

if(suggestions){

suggestions.innerHTML="";

}

filterNews();

});

}

// =========================
// SEARCH HISTORY
// =========================

function saveSearchHistory(term){

if(

!term ||
term.length < 2

){

return;

}

let history =

JSON.parse(

localStorage.getItem(
"searchHistory"
)

) || [];

if(

!history.includes(term)

){

history.unshift(term);

}

history = history.slice(0,5);

localStorage.setItem(

"searchHistory",

JSON.stringify(history)

);

loadSearchHistory();

}

function loadSearchHistory(){

const container =

document.getElementById(
"searchHistory"
);

if(!container) return;

container.innerHTML="";

// const history =

// JSON.parse(

// localStorage.getItem(
// "searchHistory"
// )

// ) || [];
let history = JSON.parse(
localStorage.getItem(
"searchHistory"
)
);

if(!history){

    history = [];

}

history.forEach(item=>{

container.innerHTML += `

<div
class="history-item">

${item}

</div>

`;

});

}

loadSearchHistory();

// =========================
// CLEAR SEARCH HISTORY
// =========================


// =========================
// CLEAR SEARCH HISTORY
// =========================
const clearHistoryBtn =
document.getElementById("clearHistoryBtn");

if(clearHistoryBtn){

    clearHistoryBtn.addEventListener(
        "click",
        function(){

            localStorage.setItem(
                "searchHistory",
                JSON.stringify([])
            );

            document.getElementById(
                "searchHistory"
            ).innerHTML = "";

        }
    );

}
// =========================
// QUICK FILTERS
// =========================

document
// .querySelectorAll(
// ".filter-btn"
// )
document
.querySelectorAll(".filter-card")
.forEach(btn=>{

btn.addEventListener(
"click",
()=>{

const category =

btn.dataset.category;

if(
category === "all"
){

renderNews(
newsData
);

return;

}

const filtered =

newsData.filter(news=>

news.category
.toLowerCase() ===
category

);

renderNews(
filtered
);

});

});

// =========================
// VOICE SEARCH
// =========================

const voiceBtn =

document.getElementById(
"voiceSearchBtn"
);

if(

voiceBtn &&
"webkitSpeechRecognition"
in window

){

const recognition =

new webkitSpeechRecognition();

recognition.continuous =
false;

recognition.lang =
"en-IN";

recognition.interimResults =
false;

voiceBtn.addEventListener(
"click",
()=>{

recognition.start();

});

recognition.onresult =
event => {

const text =

event.results[0][0]
.transcript;

searchInput.value =
text;

filterNews();

};

recognition.onerror =
event => {

console.log(
event.error
);

};

}

// =========================
// FILTER DROPDOWNS
// =========================

const monthFilter =
document.getElementById(
"monthFilter"
);

if(monthFilter){

monthFilter.addEventListener(
"change",
filterNews
);

}

const sortFilter =
document.getElementById(
"sortFilter"
);

if(sortFilter){

sortFilter.addEventListener(
"change",
filterNews
);

}

// =========================
// NOTIFICATION CENTER
// =========================

const notificationBell =
document.getElementById(
"notificationBell"
);

const notificationPanel =
document.getElementById(
"notificationPanel"
);

if(
notificationBell &&
notificationPanel
){

notificationBell.addEventListener(
"click",
()=>{

if(
notificationPanel.style.display
=== "block"
){

notificationPanel.style.display =
"none";

}else{

notificationPanel.style.display =
"block";

}

});

}

// =========================
// BOOKMARKS
// =========================

function bookmarkNews(title){

let bookmarks =

JSON.parse(
localStorage.getItem(
"bookmarks"
)
) || [];

if(
!bookmarks.includes(title)
){

bookmarks.push(title);

}

localStorage.setItem(
"bookmarks",
JSON.stringify(bookmarks)
);

loadBookmarks();

}

function loadBookmarks(){

const container =
document.getElementById(
"bookmarkContainer"
);

if(!container) return;

container.innerHTML="";

const bookmarks =

JSON.parse(
localStorage.getItem(
"bookmarks"
)
) || [];

if(
bookmarks.length === 0
){

container.innerHTML =

"<p>No bookmarks yet.</p>";

return;

}

bookmarks.forEach(item=>{

container.innerHTML += `

<div class="bookmark-card">

⭐ ${item}

</div>

`;

});

}

loadBookmarks();

// =========================
// NEWS MODAL
// =========================

const modal =
document.getElementById(
"newsModal"
);

const closeModal =
document.getElementById(
"closeModal"
);

function openModal(
title,
date,
description
){

document.getElementById(
"modalTitle"
).textContent = title;

document.getElementById(
"modalDate"
).textContent = date;

document.getElementById(
"modalDescription"
).textContent =
description;

modal.style.display =
"block";

}

if(closeModal){

closeModal.addEventListener(
"click",
()=>{

modal.style.display =
"none";

});

}

window.addEventListener(
"click",
e=>{

if(
e.target === modal
){

modal.style.display =
"none";

}

});



// =========================
// SHARE BUTTONS
// =========================

const shareWhatsapp =
document.getElementById(
"shareWhatsapp"
);

if(shareWhatsapp){

shareWhatsapp.addEventListener(
"click",
()=>{

const title =

document.getElementById(
"modalTitle"
).textContent;

const url =

`https://wa.me/?text=${encodeURIComponent(title)}`;

window.open(
url,
"_blank"
);

});

}

const copyLink =
document.getElementById(
"copyLink"
);

if(copyLink){

copyLink.addEventListener(
"click",
()=>{

navigator.clipboard.writeText(
window.location.href
);

alert(
"Link copied!"
);

});

}

const shareEmail =
document.getElementById(
"shareEmail"
);

if(shareEmail){

shareEmail.addEventListener(
"click",
()=>{

const title =

document.getElementById(
"modalTitle"
).textContent;

window.location.href =

`mailto:?subject=${title}`;

});

}

// =========================
// DARK MODE
// =========================

const darkModeBtn =
document.getElementById(
"darkModeBtn"
);

if(darkModeBtn){

darkModeBtn.addEventListener(
"click",
()=>{

document.body.classList.toggle(
"dark"
);

});

}
// =========================
// REFRESH BUTTON
// =========================

const refreshBtn =

document.getElementById(
"refreshBtn"
);

if(refreshBtn){

refreshBtn.addEventListener(
"click",
()=>{

refreshBtn.classList.add(
"rotate"
);

setTimeout(()=>{

refreshBtn.classList.remove(
"rotate"
);

},800);
// alert(
// "News Refreshed Successfully"
// );
// =========================
// LAST SYNC
// =========================

function updateLastSync(){

    const now = new Date();

    const syncTime =

        now.toLocaleTimeString();

    document.getElementById(
        "lastSync"
    ).textContent =

    "✓ " + syncTime;

}

// Run once when page loads

updateLastSync();

// Reload dashboard data

renderNews(
newsData
);

loadHighlights();

updateLastUpdated();

});

}
// =========================
// LIVE DATE & TIME
// =========================

function updateClock(){

const now =
new Date();

const options = {

weekday:"long",
year:"numeric",
month:"long",
day:"numeric"

};

const dateText =

now.toLocaleDateString(
"en-IN",
options
);

const timeText =

now.toLocaleTimeString();

const currentDate =
document.getElementById(
"currentDate"
);

if(currentDate){

currentDate.innerHTML =

`${dateText}<br>${timeText}`;

}

const liveTime =
document.getElementById(
"liveTime"
);

if(liveTime){

liveTime.textContent =
timeText;

}

}

setInterval(
updateClock,
1000
);

updateClock();

// =========================
// LOADER
// =========================

window.addEventListener(
"load",
()=>{

setTimeout(()=>{

const loader =

document.getElementById(
"loader"
);

if(loader){

loader.style.display =
"none";

}

},800);

});

// =========================
// WEATHER WIDGET
// =========================

function loadWeather(){

const weatherCard =

document.getElementById(
"weatherCard"
);

if(!weatherCard) return;

weatherCard.innerHTML = `

<h3>
Barauni Refinery
</h3>

<p>
🌡️ 35°C
</p>

<p>
☀️ Sunny
</p>

`;

}

loadWeather();

// =========================
// BACK TO TOP BUTTON
// =========================

const topBtn =
document.getElementById(
"topBtn"
);

window.addEventListener(
"scroll",
()=>{

if(
window.scrollY > 300
){

topBtn.style.display =
"block";

}else{

topBtn.style.display =
"none";

}

});

if(topBtn){

topBtn.addEventListener(
"click",
()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

});

}

// =========================
// AUTO NOTIFICATIONS
// =========================

setTimeout(()=>{

const notificationList =

document.getElementById(
"notificationList"
);

if(notificationList){

notificationList.innerHTML += `

<li>
🚀 New Monthly Report Added
</li>

`;

}

const count =

document.getElementById(
"notificationCount"
);

if(count){

count.textContent =

parseInt(
count.textContent
) + 1;

}

},10000);

// =========================
// API STATUS
// =========================

const apiStatus =
document.getElementById(
"apiStatus"
);

if(apiStatus){

apiStatus.innerHTML =
"🟢 Connected";

}