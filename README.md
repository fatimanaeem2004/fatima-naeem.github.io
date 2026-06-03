# Fatima Naeem — Portfolio

Personal portfolio website showcasing projects in data engineering, machine learning, and AI/NLP.

**Live site:** https://your-username.github.io

---

## Overview

A fully static, single-page portfolio built with vanilla HTML, CSS, and JavaScript — no frameworks, no build step. Project cards are populated at runtime via the GitHub REST API, so they always reflect the latest repository metadata without manual updates.

## Features

- Animated hero with rotating typewriter text
- GitHub API integration — project descriptions, language breakdowns, star counts, and repository links are fetched live
- localStorage caching (1-hour TTL) to respect API rate limits
- Scroll-triggered reveal animations
- Fully responsive across mobile, tablet, and desktop

## Tech

| Layer | Details |
|-------|---------|
| Frontend | HTML5, CSS3 (custom properties, Grid, Flexbox), vanilla JavaScript (ES2020) |
| Data | GitHub REST API v3 (public, unauthenticated) |
| Deployment | GitHub Pages (static hosting) |

## Project Structure

```
├── index.html       — page structure
├── style.css        — all styling and animations
├── script.js        — GitHub API integration, typewriter, particles
├── config.js        — personal info, featured repos, skills
└── Fatima_Naeem_CV.pdf
```

## Configuration

All personal information and featured project selection is managed in `config.js`. To add or remove a project, update the `featuredRepos` array with the exact repository name and the site will reflect the change on next load.

```js
featuredRepos: [
  "repo-name",   // fetches description, languages, stars automatically
]
```

## Local Development

No build tools required. Open `index.html` directly in a browser, or serve locally:

```bash
npx serve .
# or
python -m http.server 8000
```

## Deployment

Deployed from the `main` branch root via GitHub Pages.

Settings → Pages → Source: Deploy from branch → `main` / `/ (root)`

---

*BS Computer Science · IBA Karachi · Class of 2026*
