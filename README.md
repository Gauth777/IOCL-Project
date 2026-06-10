# IOCL News Dashboard

A real-time news monitoring and analytics platform for IndianOil Corporation Limited (IOCL) with a Node.js/Express backend and a dynamic frontend.

## Project Structure

```text
IOCL-Project/
├── package.json
├── server.js
├── data/
│   └── news.json
└── public/
    ├── index.html
    ├── style.css
    ├── script.js
    └── assets/
        └── images/
```

## Setup & Running the Project

Ensure you have [Node.js](https://nodejs.org/) installed.

1. **Install Dependencies**:
   Install express and configure local packages.
   ```bash
   npm install
   ```

2. **Start the Server**:
   ```bash
   npm start
   ```

3. **Access the Application**:
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

## API Test URLs

Verify backend endpoint functionality:
- **Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)
- **All News**: [http://localhost:3000/api/news/all](http://localhost:3000/api/news/all)
- **Top 10 News**: [http://localhost:3000/api/news/top](http://localhost:3000/api/news/top)
- **Featured News**: [http://localhost:3000/api/news/featured](http://localhost:3000/api/news/featured)

## Features
- Real-time news monitoring system fetched dynamically from the REST API.
- News search with voice search integration.
- Dynamic filtering by month and categories.
- Bookmarks and search history persistence using local storage.
- Dark mode toggle.
- Clean backend implementation using Express serving only static public assets and REST routes.
