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

// ============================================================
// TEAM NAME MAPPING: ESPN name → our data.json name
// ESPN uses full names; we use abbreviated versions in GAMES
// ============================================================
const ESPN_TO_LOCAL = {
  // East
  'Duke Blue Devils': 'Duke',
  'Duke': 'Duke',
  'Siena Saints': 'Siena',
  'Siena': 'Siena',
  'Ohio State Buckeyes': 'Ohio St.',
  'Ohio State': 'Ohio St.',
  'TCU Horned Frogs': 'TCU',
  'TCU': 'TCU',
  "St. John's Red Storm": "St. John's",
  "St. John's (NY) Red Storm": "St. John's",
  "St. John's": "St. John's",
  'Northern Iowa Panthers': 'UNI',
  'Northern Iowa': 'UNI',
  'UNI Panthers': 'UNI',
  'UNI': 'UNI',
  'N. Iowa': 'UNI',
  'Kansas Jayhawks': 'Kansas',
  'Kansas': 'Kansas',
  'California Baptist Lancers': 'Cal Baptist',
  'Cal Baptist': 'Cal Baptist',
  'Louisville Cardinals': 'Louisville',
  'Louisville': 'Louisville',
  'South Florida Bulls': 'South Florida',
  'South Florida': 'South Florida',
  'USF Bulls': 'South Florida',
  'Michigan State Spartans': 'Michigan St.',
  'Michigan State': 'Michigan St.',
  'Michigan St': 'Michigan St.',
  'North Dakota State Bison': 'N. Dakota St.',
  'North Dakota State': 'N. Dakota St.',
  'North Dakota St': 'N. Dakota St.',
  'NDSU Bison': 'N. Dakota St.',
  'UCLA Bruins': 'UCLA',
  'UCLA': 'UCLA',
  'UCF Knights': 'UCF',
  'UCF': 'UCF',
  'UConn Huskies': 'UConn',
  'Connecticut Huskies': 'UConn',
  'UConn': 'UConn',
  'Connecticut': 'UConn',
  'Furman Paladins': 'Furman',
  'Furman': 'Furman',

  // West
  'Arizona Wildcats': 'Arizona',
  'Arizona': 'Arizona',
  'LIU Sharks': 'LIU',
  'Long Island University Sharks': 'LIU',
  'LIU': 'LIU',
  'Villanova Wildcats': 'Villanova',
  'Villanova': 'Villanova',
  'Utah State Aggies': 'Utah St.',
  'Utah State': 'Utah St.',
  'Utah St': 'Utah St.',
  'Wisconsin Badgers': 'Wisconsin',
  'Wisconsin': 'Wisconsin',
  'High Point Panthers': 'High Point',
  'High Point': 'High Point',
  'Arkansas Razorbacks': 'Arkansas',
  'Arkansas': 'Arkansas',
  "Hawai'i Rainbow Warriors": 'Hawaii',
  'Hawaii Rainbow Warriors': 'Hawaii',
  'Hawaii': 'Hawaii',
  'BYU Cougars': 'BYU',
  'BYU': 'BYU',
  'Gonzaga Bulldogs': 'Gonzaga',
  'Gonzaga': 'Gonzaga',
  'Kennesaw State Owls': 'Kennesaw St.',
  'Kennesaw State': 'Kennesaw St.',
  'Kennesaw St': 'Kennesaw St.',
  'Miami Hurricanes': 'Miami (FL)',
  'Miami': 'Miami (FL)',
  'Missouri Tigers': 'Missouri',
  'Missouri': 'Missouri',
  'Purdue Boilermakers': 'Purdue',
  'Purdue': 'Purdue',
  'Queens Royals': 'Queens',
  'Queens (NC)': 'Queens',
  'Queens': 'Queens',

  // Midwest
  'Michigan Wolverines': 'Michigan',
  'Michigan': 'Michigan',
  'Georgia Bulldogs': 'Georgia',
  'Georgia': 'Georgia',
  'Saint Louis Billikens': 'Saint Louis',
  'Saint Louis': 'Saint Louis',
  'Texas Tech Red Raiders': 'Texas Tech',
  'Texas Tech': 'Texas Tech',
  'Akron Zips': 'Akron',
  'Akron': 'Akron',
  'Alabama Crimson Tide': 'Alabama',
  'Alabama': 'Alabama',
  'Hofstra Pride': 'Hofstra',
  'Hofstra': 'Hofstra',
  'Tennessee Volunteers': 'Tennessee',
  'Tennessee': 'Tennessee',
  'Virginia Cavaliers': 'Virginia',
  'Virginia': 'Virginia',
  'Wright State Raiders': 'Wright St.',
  'Wright State': 'Wright St.',
  'Wright St': 'Wright St.',
  'Kentucky Wildcats': 'Kentucky',
  'Kentucky': 'Kentucky',
  'Santa Clara Broncos': 'Santa Clara',
  'Santa Clara': 'Santa Clara',
  'Iowa State Cyclones': 'Iowa St.',
  'Iowa State': 'Iowa St.',
  'Iowa St': 'Iowa St.',
  'Tennessee State Tigers': 'Tennessee St.',
  'Tennessee State': 'Tennessee St.',
  'Tennessee St': 'Tennessee St.',

  // South
  'Florida Gators': 'Florida',
  'Florida': 'Florida',
  'Clemson Tigers': 'Clemson',
  'Clemson': 'Clemson',
  'Iowa Hawkeyes': 'Iowa',
  'Iowa': 'Iowa',
  'Vanderbilt Commodores': 'Vanderbilt',
  'Vanderbilt': 'Vanderbilt',
  'McNeese Cowboys': 'McNeese',
  'McNeese State Cowboys': 'McNeese',
  'McNeese': 'McNeese',
  'Nebraska Cornhuskers': 'Nebraska',
  'Nebraska': 'Nebraska',
  'Troy Trojans': 'Troy',
  'Troy': 'Troy',
  'North Carolina Tar Heels': 'N. Carolina',
  'North Carolina': 'N. Carolina',
  'UNC Tar Heels': 'N. Carolina',
  'VCU Rams': 'VCU',
  'VCU': 'VCU',
  'Illinois Fighting Illini': 'Illinois',
  'Illinois': 'Illinois',
  'Penn Quakers': 'Penn',
  'Pennsylvania Quakers': 'Penn',
  'Penn': 'Penn',
  "Saint Mary's Gaels": "Saint Mary's",
  "Saint Mary's": "Saint Mary's",
  "Saint Mary's (CA)": "Saint Mary's",
  'Texas A&M Aggies': 'Texas A&M',
  'Texas A&M': 'Texas A&M',
  'Houston Cougars': 'Houston',
  'Houston': 'Houston',
  'Idaho Vandals': 'Idaho',
  'Idaho': 'Idaho',

  // First Four
  'NC State Wolfpack': 'NC State',
  'NC State': 'NC State',
  'Texas Longhorns': 'Texas',
  'Texas': 'Texas',
  'UMBC Retrievers': 'UMBC',
  'UMBC': 'UMBC',
  'Howard Bison': 'Howard',
  'Howard': 'Howard',
  'SMU Mustangs': 'SMU',
  'SMU': 'SMU',
  'Miami (OH) RedHawks': 'Miami (OH)',
  'Miami (Ohio)': 'Miami (OH)',
  'Miami (OH)': 'Miami (OH)',
  'Prairie View A&M Panthers': 'Prairie View',
  'Prairie View A&M': 'Prairie View',
  'Prairie View': 'Prairie View',
  'Lehigh Mountain Hawks': 'Lehigh',
  'Lehigh': 'Lehigh',
};

// ============================================================
// GAME STRUCTURE — maps our game IDs to the two teams
// Must match the GAMES object in app.js
// ============================================================
const GAMES = {
  FF1: { top: 'NC State', bot: 'Texas' },
  FF2: { top: 'UMBC', bot: 'Howard' },
  FF3: { top: 'SMU', bot: 'Miami (OH)' },
  FF4: { top: 'Prairie View', bot: 'Lehigh' },
  E1: { top: 'Duke', bot: 'Siena' },
  E2: { top: 'Ohio St.', bot: 'TCU' },
  E3: { top: "St. John's", bot: 'UNI' },
  E4: { top: 'Kansas', bot: 'Cal Baptist' },
  E5: { top: 'Louisville', bot: 'South Florida' },
  E6: { top: 'Michigan St.', bot: 'N. Dakota St.' },
  E7: { top: 'UCLA', bot: 'UCF' },
  E8: { top: 'UConn', bot: 'Furman' },
  W1: { top: 'Arizona', bot: 'LIU' },
  W2: { top: 'Villanova', bot: 'Utah St.' },
  W3: { top: 'Wisconsin', bot: 'High Point' },
  W4: { top: 'Arkansas', bot: 'Hawaii' },
  W5: { top: 'BYU', bot: null, ffTeam: 'FF1' },   // bot comes from FF1 winner
  W6: { top: 'Gonzaga', bot: 'Kennesaw St.' },
  W7: { top: 'Miami (FL)', bot: 'Missouri' },
  W8: { top: 'Purdue', bot: 'Queens' },
  M1: { top: 'Michigan', bot: null, ffTeam: 'FF2' },
  M2: { top: 'Georgia', bot: 'Saint Louis' },
  M3: { top: 'Texas Tech', bot: 'Akron' },
  M4: { top: 'Alabama', bot: 'Hofstra' },
  M5: { top: 'Tennessee', bot: null, ffTeam: 'FF3' },
  M6: { top: 'Virginia', bot: 'Wright St.' },
  M7: { top: 'Kentucky', bot: 'Santa Clara' },
  M8: { top: 'Iowa St.', bot: 'Tennessee St.' },
  S1: { top: 'Florida', bot: null, ffTeam: 'FF4' },
  S2: { top: 'Clemson', bot: 'Iowa' },
  S3: { top: 'Vanderbilt', bot: 'McNeese' },
  S4: { top: 'Nebraska', bot: 'Troy' },
  S5: { top: 'N. Carolina', bot: 'VCU' },
  S6: { top: 'Illinois', bot: 'Penn' },
  S7: { top: "Saint Mary's", bot: 'Texas A&M' },
  S8: { top: 'Houston', bot: 'Idaho' },
};

// Later rounds — src references, winner determined by results
const LATER_GAMES = {
  E9:  ['E1','E2'],   E10: ['E3','E4'],   E11: ['E5','E6'],   E12: ['E7','E8'],
  E13: ['E9','E10'],  E14: ['E11','E12'], E15: ['E13','E14'],
  W9:  ['W1','W2'],   W10: ['W3','W4'],   W11: ['W5','W6'],   W12: ['W7','W8'],
  W13: ['W9','W10'],  W14: ['W11','W12'], W15: ['W13','W14'],
  M9:  ['M1','M2'],   M10: ['M3','M4'],   M11: ['M5','M6'],   M12: ['M7','M8'],
  M13: ['M9','M10'],  M14: ['M11','M12'], M15: ['M13','M14'],
  S9:  ['S1','S2'],   S10: ['S3','S4'],   S11: ['S5','S6'],   S12: ['S7','S8'],
  S13: ['S9','S10'],  S14: ['S11','S12'], S15: ['S13','S14'],
  FF5: ['E15','S15'], FF6: ['W15','M15'],
  NC:  ['FF5','FF6'],
};

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
  if (GAMES[gid]) {
    const g = GAMES[gid];
    let bot = g.bot;
    if (g.ffTeam && results[g.ffTeam]) bot = results[g.ffTeam];
    return [g.top, bot];
  }
  if (LATER_GAMES[gid]) {
    const [src1, src2] = LATER_GAMES[gid];
    return [results[src1] || null, results[src2] || null];
  }
  return [null, null];
}

// Find which of our game IDs matches a completed ESPN game
function matchGame(team1Local, team2Local, results) {
  // Check all game IDs (R1 + FF first, then later rounds)
  const allGids = [...Object.keys(GAMES), ...Object.keys(LATER_GAMES)];
  for (const gid of allGids) {
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
  const dataPath = path.join(__dirname, '..', 'data.json');
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
