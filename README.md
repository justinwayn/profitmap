# ProfitMap — MVP

A living directory of profitable one-person SaaS: which niches pay rent, what stack they run, and where the first 500 users came from.

## Run it ($0, no build step)

This is a **static site** — no dependencies, no server, no build.

```bash
cd app
python3 -m http.server 8000
# open http://localhost:8000
```

Or deploy as-is to **Cloudflare Pages** / **GitHub Pages** / **Netlify Drop** (drag the `app/` folder).

> Note: opening `index.html` directly via `file://` will fail to load `data/directory.json`
> due to browser CORS rules — always serve over HTTP, even locally.

## What's inside

| Path | Purpose |
|---|---|
| `index.html` | Landing hero + directory browser + niche scores + pricing + submission + digest forms |
| `css/styles.css` | Dark theme, responsive |
| `js/app.js` | Search, filters (niche / revenue band / pricing), sort, detail modal, niche-score computation, form persistence via `localStorage` |
| `data/directory.json` | **51 real directory entries** — name, URL, founder, team size, revenue band + note, pricing model + price point, tech stack, niche, acquisition channels, description, verified source |

All 51 entries are real companies/founders with publicly self-reported revenue
(HN threads, Indie Hackers, founder blogs, the MIT-licensed TechSolopreneurs list).
Revenue bands are approximate ranges, not audited figures.

## Data model (per entry)

```json
{
  "id": "bannerbear",
  "name": "Bannerbear",
  "url": "https://www.bannerbear.com",
  "founder": "Jon Yongfook",
  "team_size": "1",
  "revenue_band": "$50-100K MRR",
  "revenue_note": "~$1M ARR (~$80K/mo) self-reported",
  "pricing_model": "Subscription (usage-based)",
  "price_point": "$49-$399/mo",
  "tech_stack": "Ruby on Rails",
  "niche": "Marketing",
  "acquisition_channels": ["SEO/Content", "X/Twitter"],
  "description": "API for auto-generating social images and videos.",
  "verified_source": "TechSolopreneurs (self-reported)"
}
```

## Adding entries

Edit `data/directory.json` directly, or regenerate via the seed script pattern
(`entries` list → JSON). Keep the `verified_source` field honest — only real,
publicly reported companies.

## Roadmap (from brief)

- [ ] Weekly digest backend (Beehiiv/Substack free tier) — currently captures emails to `localStorage`
- [ ] Founder verification flow (Stripe link / screenshot review) — submissions currently queue in `localStorage`
- [ ] CSV export + Pro tier ($12/mo) with full channel data
- [ ] Niche Deep-Dive Report template ($49 one-time)
- [ ] Grow directory toward 150+ entries

## Cost

$0. No paid APIs, no cloud services, no secrets. Nothing to configure.
