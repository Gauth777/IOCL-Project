// ======================
// SAMPLE NEWS DATA
// Replace with API later
// ======================

const newsData = [

{
title:"IndianOil Digital Transformation Initiative",
description:"IndianOil expands digital innovation projects across refineries and business units.",
date:"2026-06-10",
month:"2026-06",
image:"https://picsum.photos/400/250?1",
url:"https://iocl.com/"
},

{
title:"Refinery Modernization Project",
description:"Major refinery modernization announced to improve efficiency.",
date:"2026-06-09",
month:"2026-06",
image:"https://picsum.photos/400/250?2",
url:"https://iocl.com/"
},

{
title:"Green Hydrogen Expansion",
description:"IndianOil invests heavily in green hydrogen infrastructure.",
date:"2026-06-08",
month:"2026-06",
image:"https://picsum.photos/400/250?3",
url:"https://iocl.com/"
},

{
title:"Pipeline Infrastructure Upgrade",
description:"New upgrades improve transportation efficiency.",
date:"2026-06-07",
month:"2026-06",
image:"https://picsum.photos/400/250?4",
url:"https://iocl.com/"
},

{
title:"AI Monitoring System",
description:"AI-powered monitoring deployed in refinery operations.",
date:"2026-06-06",
month:"2026-06",
image:"https://picsum.photos/400/250?5",
url:"https://iocl.com/"
},

{
title:"Solar Energy Program",
description:"IndianOil expands renewable energy projects.",
date:"2026-06-05",
month:"2026-06",
image:"https://picsum.photos/400/250?6",
url:"https://iocl.com/"
},

{
title:"Employee Skill Development",
description:"New employee upskilling initiatives launched.",
date:"2026-06-04",
month:"2026-06",
image:"https://picsum.photos/400/250?7",
url:"https://iocl.com/"
},

{
title:"New LPG Distribution Network",
description:"Improved LPG distribution across multiple states.",
date:"2026-06-03",
month:"2026-06",
image:"https://picsum.photos/400/250?8",
url:"https://iocl.com/"
},

{
title:"Research Collaboration",
description:"Research partnership with leading institutions.",
date:"2026-06-02",
month:"2026-06",
image:"https://picsum.photos/400/250?9",
url:"https://iocl.com/"
},

{
title:"Safety Excellence Award",
description:"IndianOil receives national safety recognition.",
date:"2026-06-01",
month:"2026-06",
image:"https://picsum.photos/400/250?10",
url:"https://iocl.com/"
}

];

// ======================
// RENDER NEWS
// ======================

function renderNews(data){

const newsContainer =
document.getElementById("newsContainer");

const featuredNews =
document.getElementById("featuredNews");

newsContainer.innerHTML = "";

// Top card as featured

if(data.length > 0){

featuredNews.innerHTML = `

<div class="featured-card">

<img src="${data[0].image}" alt="Featured">

<div class="featured-content">

<h3>${data[0].title}</h3>

<p>${data[0].description}</p>

<a href="${data[0].url}"
target="_blank"
class="read-more">

Read More →

</a>

</div>

</div>

`;

}

// Top 10 cards

data.slice(0,10).forEach(news => {

newsContainer.innerHTML += `

<div class="news-card">

<img src="${news.image}" alt="News">

<div class="news-content">

<h3>${news.title}</h3>

<p>${news.description}</p>

<div class="news-date">

${news.date}

</div>

<a href="${news.url}"
target="_blank"
class="read-more">

Read More →

</a>

</div>

</div>

`;

});

document.getElementById(
"totalNews"
).textContent = data.length;

}

// ======================
// FILTER NEWS
// ======================

function filterNews(){

let filtered = [...newsData];

const searchText =
document.getElementById(
"searchBox"
).value.toLowerCase();

const selectedMonth =
document.getElementById(
"monthFilter"
).value;

const selectedSort =
document.getElementById(
"sortFilter"
).value;

// Search

if(searchText){

filtered =
filtered.filter(news =>

news.title
.toLowerCase()
.includes(searchText)

||

news.description
.toLowerCase()
.includes(searchText)

);

}

// Month Filter

if(selectedMonth !== "all"){

filtered =
filtered.filter(news =>

news.month === selectedMonth

);

}

// Sorting

if(selectedSort === "newest"){

filtered.sort((a,b)=>

new Date(b.date) -
new Date(a.date)

);

}

if(selectedSort === "oldest"){

filtered.sort((a,b)=>

new Date(a.date) -
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

document.getElementById(
"selectedMonth"
).textContent =
selectedMonth === "all"
? "All"
: selectedMonth;

renderNews(filtered);

}

// ======================
// LIVE CLOCK
// ======================

function updateClock(){

const now = new Date();

const date =
now.toLocaleDateString();

const time =
now.toLocaleTimeString();

document.getElementById(
"currentDate"
).innerHTML =

`${date}<br>${time}`;

document.getElementById(
"liveTime"
).textContent = time;

}

updateClock();

setInterval(
updateClock,
1000
);

// ======================
// DARK MODE
// ======================

const darkBtn =
document.getElementById(
"darkModeBtn"
);

if(
localStorage.getItem(
"darkMode"
) === "enabled"
){

document.body.classList.add(
"dark"
);

}

darkBtn.addEventListener(
"click",
()=>{

document.body.classList.toggle(
"dark"
);

if(
document.body.classList.contains(
"dark"
)
){

localStorage.setItem(
"darkMode",
"enabled"
);

}else{

localStorage.setItem(
"darkMode",
"disabled"
);

}

}
);

// ======================
// EVENTS
// ======================

document.getElementById(
"searchBox"
).addEventListener(
"input",
filterNews
);

document.getElementById(
"monthFilter"
).addEventListener(
"change",
filterNews
);

document.getElementById(
"sortFilter"
).addEventListener(
"change",
filterNews
);

// ======================
// INITIAL LOAD
// ======================

renderNews(newsData);

// ======================
// FUTURE API INTEGRATION
// ======================

/*

fetch("YOUR_API_URL")

.then(response =>
response.json())

.then(data => {

renderNews(data);

})

.catch(error => {

console.error(error);

});

*/