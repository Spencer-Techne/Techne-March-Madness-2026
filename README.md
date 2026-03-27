# Techne × AI — 2026 March Madness Bracket Challenge

A live bracket challenge web app that pits **7 Techne Media team members** against **5 AI models** (Claude Sonnet, Claude Haiku, ChatGPT, Gemini, Gemini FAST) across the full 2026 NCAA Men's Basketball Tournament.

**Live site:** [spencer-techne.github.io/Techne-March-Madness-2026](https://spencer-techne.github.io/Techne-March-Madness-2026)

---

## How It Works

- `bracket-config.js` holds the shared bracket graph, round metadata, logo map, and ESPN name mapping
- `app.js` fetches `data.json` on page load
- All bracket logic, scoring, and rendering happens client-side — no backend, no build step
- To update scores: edit `data.json` → push to GitHub → page reflects changes immediately
- The **Admin panel** (PIN: `2026`) can push `data.json` updates directly to GitHub via the API
- The GitHub Actions workflow in `.github/workflows/update-scores.yml` can update `data.json` automatically

## Files

| File | Purpose |
|---|---|
| `index.html` | All HTML + CSS |
| `bracket-config.js` | Shared tournament structure and mappings used by both the site and the updater |
| `app.js` | Main browser logic for rendering, scoring, admin tools, and live refresh |
| `data.json` | All bracket picks + results + schedule — the only file that changes during the tournament |
| `update-scores.js` | Node script that fetches ESPN tournament results and updates `data.json` |
| `techne-logo.png` | Basketball-textured Techne hexagon logo |

## Features

- **Leaderboard** — ranked by total points, round-by-round breakdown, AI vs Human badges
- **Bracket viewer** — horizontal bracket layout with SVG connectors, color-coded picks (correct/wrong/pending)
- **Today's Games sidebar** — team logos, seeds, tip times (ET), TV networks, auto-updates when results are logged
- **Enter Picks wizard** — step-by-step bracket entry for late additions
- **Admin panel** — PIN-gated, push results directly to GitHub without touching a terminal

## Scoring

| Round | Points |
|---|---|
| Round of 64 | 10 |
| Round of 32 | 20 |
| Sweet 16 | 40 |
| Elite Eight | 80 |
| Final Four | 160 |
| Championship | 320 |

**Max possible: 1,920 pts**

## Participants

### AI (5)
| Name | Champion Pick |
|---|---|
| Claude (Sonnet) | Duke |
| Claude Haiku | UConn |
| ChatGPT | Duke |
| Gemini | Michigan |
| Gemini FAST | Arizona |

### Human (7)
| Name | Champion Pick |
|---|---|
| Spencer | Alabama |
| Terry | Florida |
| Riley | Florida |
| Jeremy | Clemson |
| Zach | Arizona |
| RJ | Duke |
| Ben | Arizona |

## Local Development

```bash
python3 -m http.server
# Open http://localhost:8000
```

The `fetch('data.json')` call requires a server context — won't work from `file://`.

## Admin: Logging Results

1. Go to the **Admin** tab → enter PIN `2026`
2. Configure GitHub API (owner, repo, branch, PAT token) — saves to localStorage
3. Click the winning team for each completed game
4. Hit **Push Results** — commits directly to the repo

Results update the leaderboard and sidebar automatically on next page load.
