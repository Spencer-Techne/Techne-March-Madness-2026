#!/usr/bin/env node
/**
 * update-scores.js
 * 
 * Fetches completed NCAA tournament game results from ESPN's public API
 * and updates data.json with winners mapped to our game ID structure.
 * 
 * ESPN endpoint (no auth required):
 * https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard
 * 
 * Optional query params:
 *   ?dates=20260319  — specific date (YYYYMMDD)
 *   ?groups=100      — NCAA tournament games only (group 100)
 *   ?limit=100       — max results
 */

const fs = require('fs');
const https = require('https');
const path = require('path');
const { ESPN_TO_LOCAL, GAMES } = require('./bracket-config.js');

// ============================================================
// HELPERS
// ============================================================
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'TechneMM/1.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Failed to parse JSON: ' + e.message)); }
      });
    }).on('error', reject);
  });
}

function normalizeTeamName(espnName) {
  if (!espnName) return null;
  // Try exact match first
  if (ESPN_TO_LOCAL[espnName]) return ESPN_TO_LOCAL[espnName];
  // Try without mascot (take first N words before common suffixes)
  const cleaned = espnName.trim();
  if (ESPN_TO_LOCAL[cleaned]) return ESPN_TO_LOCAL[cleaned];
  // Fuzzy: check if any key starts with or contains the ESPN name
  for (const [key, val] of Object.entries(ESPN_TO_LOCAL)) {
    if (cleaned.startsWith(key) || key.startsWith(cleaned)) return val;
  }
  return null;
}

// Get the two teams for a game ID given current results
function getTeamsForGame(gid, results) {
  const g = GAMES[gid];
  if (!g) return [null, null];
  if (g.src) {
    return [results[g.src[0]] || null, results[g.src[1]] || null];
  }
  let bot = g.bot;
  if (g.ffSrc && results[g.ffSrc]) bot = results[g.ffSrc];
  return [g.top, bot];
}

// Find which of our game IDs matches a completed ESPN game
function matchGame(team1Local, team2Local, results) {
  for (const gid of Object.keys(GAMES)) {
    if (results[gid]) continue; // already have result
    const [t1, t2] = getTeamsForGame(gid, results);
    if (!t1 || !t2) continue;
    if ((t1 === team1Local && t2 === team2Local) ||
        (t1 === team2Local && t2 === team1Local)) {
      return gid;
    }
  }
  return null;
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  const dataPath = path.join(__dirname, 'data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const results = data.results || {};

  // Determine which dates to check — today and yesterday (for late games)
  const now = new Date();
  const today = now.toISOString().slice(0, 10).replace(/-/g, '');
  const yesterday = new Date(now - 86400000).toISOString().slice(0, 10).replace(/-/g, '');
  const datesToCheck = [today, yesterday];

  let newResults = 0;
  const loggedGames = [];

  for (const dateStr of datesToCheck) {
    const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?dates=${dateStr}&groups=100&limit=100`;
    console.log(`Fetching scores for ${dateStr}...`);

    let scoreboard;
    try {
      scoreboard = await fetchJSON(url);
    } catch (e) {
      console.error(`Failed to fetch ${dateStr}: ${e.message}`);
      continue;
    }

    const events = scoreboard?.events || [];
    console.log(`  Found ${events.length} events`);

    for (const event of events) {
      const competition = event?.competitions?.[0];
      if (!competition) continue;

      // Only process completed games
      const status = competition?.status?.type?.name;
      if (status !== 'STATUS_FINAL') continue;

      const competitors = competition.competitors || [];
      if (competitors.length !== 2) continue;

      // Find winner
      const winner = competitors.find(c => c.winner === true);
      const loser = competitors.find(c => c.winner !== true);
      if (!winner || !loser) continue;

      const winnerName = winner.team?.displayName || winner.team?.shortDisplayName || winner.team?.name;
      const loserName = loser.team?.displayName || loser.team?.shortDisplayName || loser.team?.name;

      const winnerLocal = normalizeTeamName(winnerName);
      const loserLocal = normalizeTeamName(loserName);

      if (!winnerLocal) {
        console.log(`  ⚠ Could not map winner: "${winnerName}"`);
        continue;
      }
      if (!loserLocal) {
        console.log(`  ⚠ Could not map loser: "${loserName}"`);
        continue;
      }

      // Match to our game ID
      const gid = matchGame(winnerLocal, loserLocal, results);
      if (!gid) {
        // Could be a non-tournament game or already logged
        continue;
      }

      // Log it
      results[gid] = winnerLocal;
      newResults++;
      const winScore = winner.score;
      const loseScore = loser.score;
      loggedGames.push(`  ✓ ${gid}: ${winnerLocal} ${winScore || ''} def. ${loserLocal} ${loseScore || ''}`);
    }
  }

  if (newResults > 0) {
    data.results = results;
    data.meta.updated = new Date().toISOString();
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log(`\n${newResults} new result(s) logged:`);
    loggedGames.forEach(l => console.log(l));
  } else {
    console.log('\nNo new results to log.');
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
