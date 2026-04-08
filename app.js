const {
  ESPN_TO_LOCAL,
  GAMES,
  LOGO_MAP,
  RG,
  RLABELS,
  RPTS,
  RSHORT
} = globalThis.BRACKET_CONFIG;

// ============================================================
// STATE
// ============================================================
let appData = null;
let wiz = { step:0, name:'', picks:{} };
let prevRanks = {}; // track previous ranks for arrows

const WSTEPS = [
  { title:'Who Are You?',          type:'name' },
  { title:'First Four',            type:'games', games:['FF1','FF2','FF3','FF4'],                         sub:'Play-in round — pick the survivors (not scored)' },
  { title:'East — Round 1',        type:'games', games:['E1','E2','E3','E4','E5','E6','E7','E8'],         sub:'8 games · 10 pts each' },
  { title:'East — Round 2',        type:'games', games:['E9','E10','E11','E12'],                          sub:'Round of 32 · 20 pts each' },
  { title:'East — Sweet 16 & E8',  type:'games', games:['E13','E14','E15'],                              sub:'Sweet 16: 40 pts · Elite 8: 80 pts' },
  { title:'West — Round 1',        type:'games', games:['W1','W2','W3','W4','W5','W6','W7','W8'],         sub:'8 games · 10 pts each' },
  { title:'West — Round 2',        type:'games', games:['W9','W10','W11','W12'],                          sub:'Round of 32 · 20 pts each' },
  { title:'West — Sweet 16 & E8',  type:'games', games:['W13','W14','W15'],                              sub:'Sweet 16: 40 pts · Elite 8: 80 pts' },
  { title:'Midwest — Round 1',     type:'games', games:['M1','M2','M3','M4','M5','M6','M7','M8'],         sub:'8 games · 10 pts each' },
  { title:'Midwest — Round 2',     type:'games', games:['M9','M10','M11','M12'],                          sub:'Round of 32 · 20 pts each' },
  { title:'Midwest — Sweet 16 & E8',type:'games',games:['M13','M14','M15'],                              sub:'Sweet 16: 40 pts · Elite 8: 80 pts' },
  { title:'South — Round 1',       type:'games', games:['S1','S2','S3','S4','S5','S6','S7','S8'],         sub:'8 games · 10 pts each' },
  { title:'South — Round 2',       type:'games', games:['S9','S10','S11','S12'],                          sub:'Round of 32 · 20 pts each' },
  { title:'South — Sweet 16 & E8', type:'games', games:['S13','S14','S15'],                              sub:'Sweet 16: 40 pts · Elite 8: 80 pts' },
  { title:'Final Four',            type:'games', games:['FF5','FF6'],                                    sub:'160 pts each · who makes Indianapolis?' },
  { title:'National Championship', type:'games', games:['NC'],                                           sub:'320 pts · who cuts down the nets?' },
  { title:'Picks Submitted!',      type:'done' }
];

// ============================================================
// LOAD
// ============================================================
async function loadData() {
  try {
    const res = await fetch('data.json?_=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    appData = await res.json();
    onLoaded();
  } catch(e) {
    document.getElementById('lb-list').innerHTML =
      `<div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:16px 20px;font-family:var(--fm);font-size:16px;color:var(--red)">
        ⚠️ Could not load data.json. Make sure it's in the same folder as index.html.<br>
        If running locally, use a dev server (e.g. <code>python3 -m http.server</code>).
      </div>`;
    console.error(e);
  }
}

function onLoaded() {
  populateBktSelect();
  renderPills();
  renderLeaderboard();
  renderWizardStep();
  renderSidebar();
}

// ============================================================
// HELPERS
// ============================================================
function getTeams(gameId, picks, results) {
  const g = GAMES[gameId];
  if (!g) return ['TBD','TBD'];
  const r = results || {};
  const p = picks   || {};

  if (g.src) {
    const t1 = r[g.src[0]] || p[g.src[0]] || 'TBD';
    const t2 = r[g.src[1]] || p[g.src[1]] || 'TBD';
    return [t1, t2];
  }
  // R1 / FF — has fixed top, possibly FF-sourced bottom
  const top = g.top;
  let bot = g.bot;
  if (g.ffSrc) {
    bot = r[g.ffSrc] || p[g.ffSrc] || 'TBD';
  }
  return [top, bot || 'TBD'];
}

function seedFor(gameId, team) {
  const g = GAMES[gameId];
  if (!g) return null;
  if (team === g.top) return g.tSeed;
  if (team === g.bot) return g.bSeed;
  return null;
}

function score(picks, results) {
  const by = {};
  let total = 0;
  if (!picks || !results) return { total, by };
  for (const [gid, res] of Object.entries(results)) {
    const g = GAMES[gid];
    if (!g || !RPTS[g.round]) continue;
    if (picks[gid] === res) {
      const pts = RPTS[g.round];
      total += pts;
      by[g.round] = (by[g.round] || 0) + pts;
    }
  }
  return { total, by };
}

function accuracy(picks, results) {
  let correct=0, played=0;
  for (const [gid, res] of Object.entries(results||{})) {
    const g = GAMES[gid];
    if (!g || !RPTS[g.round]) continue;
    played++;
    if (picks && picks[gid] === res) correct++;
  }
  return { correct, played };
}

// Check if a team has been eliminated from the tournament
function isTeamEliminated(team, results) {
  if (!team || !results) return false;
  for (const [gid, winner] of Object.entries(results)) {
    const g = GAMES[gid];
    if (!g) continue;
    const [t1, t2] = getTeams(gid, null, results);
    // If the team was in this game and lost
    if ((t1 === team || t2 === team) && winner !== team) return true;
  }
  return false;
}

// Check if a pick is still alive (team hasn't been eliminated yet and game not yet played)
function isPickStillAlive(gid, pick, results) {
  if (!pick || !results) return true;
  if (results[gid]) return false; // game already played
  return !isTeamEliminated(pick, results);
}

function hasPicks(p) { return p.submitted && p.picks && Object.keys(p.picks).length > 0; }

// Convert an ET time string like "12:15 PM" to the viewer's local timezone
function convertETtoLocal(etTimeStr) {
  try {
    const match = etTimeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return etTimeStr;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    // Build a date string that JavaScript will parse as ET
    // Use a known date during EDT (March 20, 2026)
    // EDT = UTC-4, so add 4 hours to get UTC
    const utcHours = hours + 4;
    const utcDate = new Date(Date.UTC(2026, 2, 20, utcHours, minutes, 0));

    // Format in viewer's local timezone
    return utcDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch(e) {
    return etTimeStr;
  }
}

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function getRoundState(results) {
  const rounds = ['ff','r1','r2','s16','e8','ff2','nc'];
  const done = new Set(Object.keys(results || {}).map(id => GAMES[id]?.round).filter(Boolean));
  const allGamesByRound = {};

  for (const [gid, g] of Object.entries(GAMES)) {
    if (g.round) {
      if (!allGamesByRound[g.round]) allGamesByRound[g.round] = [];
      allGamesByRound[g.round].push(gid);
    }
  }

  const fullyComplete = new Set();
  for (const r of rounds) {
    const games = allGamesByRound[r] || [];
    if (games.length > 0 && games.every(gid => results?.[gid])) {
      fullyComplete.add(r);
    }
  }

  let currentRound = null;
  for (let i = 0; i < rounds.length; i++) {
    const r = rounds[i];
    if (done.has(r) && !fullyComplete.has(r)) {
      currentRound = r;
      break;
    }
    if (fullyComplete.has(r) && i < rounds.length - 1 && !done.has(rounds[i + 1])) {
      currentRound = rounds[i + 1];
      break;
    }
  }
  if (!currentRound) {
    for (const r of rounds) {
      if (!fullyComplete.has(r)) { currentRound = r; break; }
    }
  }

  return { rounds, done, fullyComplete, currentRound };
}

function isTournamentComplete(results) {
  return !!results?.NC;
}

function getEliminatedTeams(results) {
  const eliminatedTeams = new Set();
  for (const [gid, winner] of Object.entries(results || {})) {
    const g = GAMES[gid];
    if (!g) continue;
    const [t1, t2] = getTeams(gid, null, results);
    if (t1 && t1 !== winner) eliminatedTeams.add(t1);
    if (t2 && t2 !== winner) eliminatedTeams.add(t2);
  }
  return eliminatedTeams;
}

function maxPossibleScore(picks, results) {
  let total = score(picks, results).total;
  for (const [gid, g] of Object.entries(GAMES)) {
    if (!RPTS[g.round] || results?.[gid]) continue;
    if (picks?.[gid] && isPickStillAlive(gid, picks[gid], results)) {
      total += RPTS[g.round];
    }
  }
  return total;
}

function getParticipantRows(resultsOverride) {
  if (!appData) return [];
  const results = resultsOverride || appData.results || {};
  const rows = appData.participants.map(p => ({
    ...p,
    sc: score(p.picks, results),
    acc: accuracy(p.picks, results),
    maxPossible: maxPossibleScore(p.picks, results),
  }));

  rows.sort((a,b) => {
    const aH = hasPicks(a), bH = hasPicks(b);
    if (aH && !bH) return -1;
    if (!aH && bH) return 1;
    return (b.sc.total - a.sc.total)
      || (b.maxPossible - a.maxPossible)
      || a.name.localeCompare(b.name);
  });

  return rows;
}

function getLatestCompletedGame(results) {
  if (!appData?.schedule) return null;
  let latest = null;
  const dates = Object.keys(appData.schedule).sort();
  dates.forEach(date => {
    const day = appData.schedule[date];
    (day.games || []).forEach((sg, index) => {
      if (!results?.[sg.id]) return;
      const [t1, t2] = getTeams(sg.id, null, results);
      const winner = results[sg.id];
      const loser = winner === t1 ? t2 : t1;
      latest = { ...sg, label: day.label, date, order: index, winner, loser };
    });
  });
  return latest;
}

function renderTournamentPulse(rows, results) {
  const withPicks = rows.filter(p => hasPicks(p));
  if (!withPicks.length) return '';

  const leader = withPicks[0];
  const latest = getLatestCompletedGame(results);
  const { currentRound } = getRoundState(results);
  const tournamentComplete = isTournamentComplete(results);
  const deadChampions = withPicks.filter(p => p.picks?.NC && isTeamEliminated(p.picks.NC, results)).length;
  const trailingPack = withPicks.slice(1).filter(p => p.sc.total === withPicks[1]?.sc.total);
  let cushionMain = 'Solo board';
  let cushionSub = 'Only one bracket is currently in the field.';
  if (withPicks.length > 1) {
    const gap = leader.sc.total - withPicks[1].sc.total;
    if (gap === 0) {
      const tiedLeaders = withPicks.filter(p => p.sc.total === leader.sc.total).map(p => p.name);
      cushionMain = 'Tied up top';
      cushionSub = `${tiedLeaders.join(', ')} all sit at ${leader.sc.total} pts.`;
    } else {
      const chaserNames = trailingPack.map(p => p.name).join(', ');
      cushionMain = `${gap}-pt lead`;
      cushionSub = `${leader.name} over ${chaserNames} for 1st place.`;
    }
  }

  let humanPts = 0;
  let aiPts = 0;
  withPicks.forEach(p => {
    if (p.type === 'ai') aiPts += p.sc.total;
    else humanPts += p.sc.total;
  });
  const sideLead = humanPts === aiPts ? 'Dead even' : humanPts > aiPts ? 'Humans ahead' : 'AI ahead';
  const sideGap = Math.abs(humanPts - aiPts);

  if (tournamentComplete) {
    const runnerUp = withPicks[1];
    const winMargin = runnerUp ? leader.sc.total - runnerUp.sc.total : 0;
    const pickedChampion = leader.picks?.NC === results.NC;
    const sideWinner = humanPts === aiPts ? 'Draw' : humanPts > aiPts ? 'Humans win' : 'AI win';
    const sideSummary = sideGap ? `${sideWinner} by ${sideGap} total points` : 'Humans and AI finished level on total points';
    const cards = [
      {
        kicker: 'Tournament Final',
        main: esc(results.NC),
        sub: '2026 national champion'
      },
      {
        kicker: 'Bracket Winner',
        main: esc(leader.name),
        sub: `${leader.sc.total} pts${runnerUp ? ` · won by ${winMargin}` : ''}`
      },
      {
        kicker: 'Winning Ticket',
        main: pickedChampion ? `Picked ${esc(results.NC)}` : `Picked ${esc(leader.picks?.NC || '—')}`,
        sub: pickedChampion ? 'Closed it out with the correct champion pick' : 'Won the pool without the final champion pick'
      },
      {
        kicker: 'Humans vs AI',
        main: sideWinner,
        sub: sideSummary
      }
    ];

    return cards.map(card => `
      <div class="update-card">
        <div class="update-kicker">${card.kicker}</div>
        <div class="update-main">${card.main}</div>
        <div class="update-sub">${card.sub}</div>
      </div>
    `).join('');
  }

  const cards = [
    {
      kicker: 'Round Status',
      main: RLABELS[currentRound] || 'Tournament Live',
      sub: latest ? `${latest.label}` : 'Waiting on the next game block.'
    },
    {
      kicker: 'Leaderboard',
      main: esc(leader.name),
      sub: `${leader.sc.total} pts · max path ${leader.maxPossible}`
    },
    {
      kicker: 'Leader Cushion',
      main: cushionMain,
      sub: cushionSub
    },
    {
      kicker: 'Bracket Damage',
      main: `${deadChampions}/${withPicks.length}`,
      sub: `${deadChampions === 1 ? 'champion pick is dead' : 'champion picks are dead'} · ${sideLead}${sideGap ? ` by ${sideGap}` : ''}`
    }
  ];

  return cards.map(card => `
    <div class="update-card">
      <div class="update-kicker">${card.kicker}</div>
      <div class="update-main">${card.main}</div>
      <div class="update-sub">${card.sub}</div>
    </div>
  `).join('');
}

function renderWhoCanStillWin(rows) {
  const results = appData?.results || {};
  const withPicks = rows.filter(p => hasPicks(p));
  if (!withPicks.length) {
    return '<div class="callout-empty">Win paths will appear once picks are loaded</div>';
  }

  if (isTournamentComplete(results)) {
    return withPicks.slice(0, 3).map((p, idx) => {
      const place = idx === 0 ? 'Champion' : idx === 1 ? 'Runner-up' : 'Third place';
      const champHit = p.picks?.NC === results.NC;
      return `<div class="win-path">
        <div class="win-path-top">
          <div class="win-path-name">${esc(p.name)}</div>
          <div class="win-path-max">${p.sc.total}</div>
        </div>
        <div class="win-path-sub">${place} · ${champHit ? `picked ${esc(results.NC)}` : `champion pick: ${esc(p.picks?.NC || '—')}`}</div>
      </div>`;
    }).join('');
  }

  const currentLead = withPicks[0].sc.total;
  const aliveRows = withPicks
    .filter(p => p.maxPossible >= currentLead)
    .sort((a, b) => (b.maxPossible - a.maxPossible) || (b.sc.total - a.sc.total))
    .slice(0, 6);

  return aliveRows.map(p => {
    const margin = p.maxPossible - currentLead;
    const champAlive = p.picks?.NC && !isTeamEliminated(p.picks.NC, appData.results || {});
    const champText = p.picks?.NC ? `${champAlive ? 'champ alive' : 'champ dead'} · ${esc(p.picks.NC)}` : 'no champion pick';
    return `<div class="win-path">
      <div class="win-path-top">
        <div class="win-path-name">${esc(p.name)}</div>
        <div class="win-path-max">${p.maxPossible}</div>
      </div>
      <div class="win-path-sub">${p.sc.total} current · ${margin} pts above the current lead ceiling · ${champText}</div>
    </div>`;
  }).join('');
}

function fmtPct(num, den) {
  return den ? Math.round((num / den) * 100) : 0;
}

function teamSeed(team) {
  if (!team) return null;
  for (const g of Object.values(GAMES)) {
    if (g.top === team && g.tSeed != null) return g.tSeed;
    if (g.bot === team && g.bSeed != null) return g.bSeed;
  }
  return null;
}

function getPairwiseDifferenceCount(a, b) {
  let diff = 0;
  for (const gid of Object.keys(GAMES)) {
    if (a.picks?.[gid] && b.picks?.[gid] && a.picks[gid] !== b.picks[gid]) diff++;
  }
  return diff;
}

function getResultsViewModel(rows, results) {
  const withPicks = rows.filter(p => hasPicks(p));
  const humans = withPicks.filter(p => p.type !== 'ai');
  const ais = withPicks.filter(p => p.type === 'ai');
  const winner = withPicks[0];
  const runnerUp = withPicks[1];
  const third = withPicks[2];
  const champion = results.NC;
  const scoredGames = Object.entries(results)
    .filter(([gid]) => GAMES[gid] && RPTS[GAMES[gid].round])
    .map(([gid, winnerTeam]) => ({ gid, winner: winnerTeam, game: GAMES[gid] }));

  const championBoard = {};
  withPicks.forEach(p => {
    const team = p.picks?.NC || 'No champion';
    if (!championBoard[team]) championBoard[team] = [];
    championBoard[team].push(p.name);
  });

  const exactChampionPickers = withPicks.filter(p => p.picks?.NC === champion);
  const winnerMargin = runnerUp ? winner.sc.total - runnerUp.sc.total : winner.sc.total;
  const humanAvg = humans.length ? Math.round(humans.reduce((sum, p) => sum + p.sc.total, 0) / humans.length) : 0;
  const aiAvg = ais.length ? Math.round(ais.reduce((sum, p) => sum + p.sc.total, 0) / ais.length) : 0;

  const winnerEdges = scoredGames
    .filter(({ gid, winner: winnerTeam }) => winner.picks?.[gid] === winnerTeam)
    .map(({ gid, winner: winnerTeam, game }) => {
      const correctCount = withPicks.filter(p => p.picks?.[gid] === winnerTeam).length;
      return {
        gid,
        winner: winnerTeam,
        round: game.round,
        pts: RPTS[game.round],
        correctCount,
        edge: (withPicks.length - correctCount) * RPTS[game.round]
      };
    })
    .sort((a, b) => b.edge - a.edge || b.pts - a.pts)
    .slice(0, 6);

  const consensusTraps = scoredGames
    .map(({ gid, winner: winnerTeam, game }) => {
      const [t1, t2] = getTeams(gid, null, results);
      const correctCount = withPicks.filter(p => p.picks?.[gid] === winnerTeam).length;
      return {
        gid,
        winner: winnerTeam,
        loser: winnerTeam === t1 ? t2 : t1,
        round: game.round,
        pts: RPTS[game.round],
        correctCount,
        wrongCount: withPicks.length - correctCount
      };
    })
    .sort((a, b) => b.wrongCount - a.wrongCount || b.pts - a.pts)
    .slice(0, 6);

  const rareHits = consensusTraps
    .filter(game => game.correctCount > 0)
    .sort((a, b) => a.correctCount - b.correctCount || b.pts - a.pts)
    .slice(0, 6)
    .map(game => ({
      ...game,
      hitters: withPicks.filter(p => p.picks?.[game.gid] === game.winner).map(p => p.name)
    }));

  const aiHumanSplit = scoredGames
    .map(({ gid, winner: winnerTeam, game }) => {
      const aiHits = ais.filter(p => p.picks?.[gid] === winnerTeam).length;
      const humanHits = humans.filter(p => p.picks?.[gid] === winnerTeam).length;
      return {
        gid,
        winner: winnerTeam,
        round: game.round,
        aiHits,
        humanHits,
        aiRate: fmtPct(aiHits, ais.length),
        humanRate: fmtPct(humanHits, humans.length),
        gap: fmtPct(aiHits, ais.length) - fmtPct(humanHits, humans.length)
      };
    })
    .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
    .slice(0, 6);

  const roundOrder = ['r1', 'r2', 's16', 'e8', 'ff2', 'nc'];
  const roundLeaders = roundOrder.map(round => {
    const max = Math.max(...withPicks.map(p => p.sc.by?.[round] || 0));
    return {
      round,
      pts: max,
      leaders: withPicks.filter(p => (p.sc.by?.[round] || 0) === max && max > 0).map(p => p.name)
    };
  }).filter(item => item.pts > 0);

  const bracketStyles = withPicks.map(p => {
    let contrarian = 0;
    let upsetHits = 0;
    let lateRoundPoints = (p.sc.by?.ff2 || 0) + (p.sc.by?.nc || 0);

    scoredGames.forEach(({ gid, winner: winnerTeam }) => {
      const counts = {};
      withPicks.forEach(row => {
        const pick = row.picks?.[gid];
        if (pick) counts[pick] = (counts[pick] || 0) + 1;
      });
      const majorityPick = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (majorityPick && p.picks?.[gid] && p.picks[gid] !== majorityPick) contrarian++;

      const [t1, t2] = getTeams(gid, null, results);
      const loser = winnerTeam === t1 ? t2 : t1;
      const winnerSeed = teamSeed(winnerTeam);
      const loserSeed = teamSeed(loser);
      const upset = winnerSeed != null && loserSeed != null && winnerSeed > loserSeed;
      if (upset && p.picks?.[gid] === winnerTeam) upsetHits++;
    });

    return { name: p.name, type: p.type, contrarian, upsetHits, lateRoundPoints, champHit: p.picks?.NC === champion };
  });

  const mostContrarian = [...bracketStyles].sort((a, b) => b.contrarian - a.contrarian)[0];
  const chalkiest = [...bracketStyles].sort((a, b) => a.contrarian - b.contrarian)[0];
  const upsetKings = [...bracketStyles].sort((a, b) => b.upsetHits - a.upsetHits).slice(0, 2);
  const lateClosers = [...bracketStyles].sort((a, b) => b.lateRoundPoints - a.lateRoundPoints).slice(0, 2);

  let widestAI = null;
  let closestAI = null;
  let widestCross = null;
  for (let i = 0; i < withPicks.length; i++) {
    for (let j = i + 1; j < withPicks.length; j++) {
      const a = withPicks[i];
      const b = withPicks[j];
      const diff = getPairwiseDifferenceCount(a, b);
      const pair = { a: a.name, b: b.name, diff };
      if (a.type === 'ai' && b.type === 'ai') {
        if (!widestAI || diff > widestAI.diff) widestAI = pair;
        if (!closestAI || diff < closestAI.diff) closestAI = pair;
      }
      if (a.type !== b.type && (!widestCross || diff > widestCross.diff)) widestCross = pair;
    }
  }

  return {
    withPicks,
    winner,
    runnerUp,
    third,
    champion,
    championBoard,
    exactChampionPickers,
    winnerMargin,
    humanAvg,
    aiAvg,
    winnerEdges,
    consensusTraps,
    rareHits,
    aiHumanSplit,
    roundLeaders,
    mostContrarian,
    chalkiest,
    upsetKings,
    lateClosers,
    widestAI,
    closestAI,
    widestCross,
    humans,
    ais
  };
}

function renderResultsView(rowsOverride, resultsOverride) {
  const host = document.getElementById('results-content');
  if (!host || !appData) return;

  const results = resultsOverride || appData.results || {};
  const rows = rowsOverride || getParticipantRows(results);
  if (!isTournamentComplete(results)) {
    host.innerHTML = '<div class="empty-state">Final Results unlock after the championship game is logged</div>';
    return;
  }

  const model = getResultsViewModel(rows, results);
  const championLogo = teamLogo(model.champion);
  const championBoardHtml = Object.entries(model.championBoard)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([team, names]) => `
      <div class="result-chip-group">
        <div class="result-chip-head">
          ${teamLogo(team) ? `<img class="result-chip-logo" src="${teamLogo(team)}" alt="" loading="lazy" onerror="this.style.display='none'">` : ''}
          <span>${esc(team)}</span>
          <span class="result-chip-count">${names.length}</span>
        </div>
        <div class="result-chip-sub">${esc(names.join(', '))}</div>
      </div>
    `).join('');

  const pivotalHtml = model.winnerEdges.map(item => `
    <div class="story-row">
      <div class="story-main">${item.gid} · ${esc(item.winner)}</div>
      <div class="story-meta">${RLABELS[item.round]} · ${item.pts} pts · only ${item.correctCount}/${model.withPicks.length} got it right</div>
    </div>
  `).join('');

  const trapHtml = model.consensusTraps.map(item => `
    <div class="story-row">
      <div class="story-main">${esc(item.winner)} over ${esc(item.loser)}</div>
      <div class="story-meta">${item.gid} · ${RLABELS[item.round]} · ${item.wrongCount}/${model.withPicks.length} missed it</div>
    </div>
  `).join('');

  const rareHitHtml = model.rareHits.map(item => `
    <div class="story-row">
      <div class="story-main">${esc(item.winner)} landed for ${item.hitters.length === 1 ? item.hitters[0] : item.hitters.join(', ')}</div>
      <div class="story-meta">${item.gid} · ${RLABELS[item.round]} · ${item.correctCount}/${model.withPicks.length} correct</div>
    </div>
  `).join('');

  const splitHtml = model.aiHumanSplit.map(item => `
    <div class="split-row">
      <div>
        <div class="split-game">${item.gid} · ${esc(item.winner)}</div>
        <div class="split-sub">${RLABELS[item.round]} · ${item.gap > 0 ? 'AI read this better' : 'Humans read this better'}</div>
      </div>
      <div class="split-metrics">
        <span>AI ${item.aiHits}/${model.ais.length} (${item.aiRate}%)</span>
        <span>Humans ${item.humanHits}/${model.humans.length} (${item.humanRate}%)</span>
      </div>
    </div>
  `).join('');

  const roundLeaderHtml = model.roundLeaders.map(item => `
    <div class="round-card">
      <div class="round-card-top">
        <span>${RLABELS[item.round]}</span>
        <span>${item.pts}</span>
      </div>
      <div class="round-card-sub">${esc(item.leaders.join(', '))}</div>
    </div>
  `).join('');

  const standingsHtml = model.withPicks.map((p, idx) => `
    <div class="standing-row">
      <div class="standing-rank">${idx + 1}</div>
      <div class="standing-name">${esc(p.name)} <span class="standing-type">${p.type === 'ai' ? 'AI' : 'Human'}</span></div>
      <div class="standing-champ">${esc(p.picks?.NC || '—')}</div>
      <div class="standing-score">${p.sc.total}</div>
    </div>
  `).join('');

  host.innerHTML = `
    <div class="results-hero">
      <div class="results-hero-copy">
        <div class="results-kicker">Season Complete</div>
        <div class="results-title">${esc(model.winner.name)} won the pool. ${esc(model.champion)} won the title.</div>
        <div class="results-sub">The pool turned on one outcome more than any other: only ${model.exactChampionPickers.length} bracket picked ${esc(model.champion)} to win it all, and that bracket belonged to ${esc(model.winner.name)}.</div>
      </div>
      <div class="results-hero-side">
        <div class="results-hero-champ">${championLogo ? `<img class="results-hero-logo" src="${championLogo}" alt="" loading="lazy" onerror="this.style.display='none'">` : ''}</div>
        <div class="results-hero-stat">${esc(model.champion)}</div>
        <div class="results-hero-label">National Champion</div>
      </div>
    </div>

    <div class="results-stat-grid">
      <div class="results-stat-card">
        <div class="results-stat-value">${model.winner.sc.total}</div>
        <div class="results-stat-label">Winning Score</div>
        <div class="results-stat-sub">${esc(model.winner.name)} finished ${model.winnerMargin} points clear of ${esc(model.runnerUp.name)}</div>
      </div>
      <div class="results-stat-card">
        <div class="results-stat-value">${model.exactChampionPickers.length}/${model.withPicks.length}</div>
        <div class="results-stat-label">Correct Champion Picks</div>
        <div class="results-stat-sub">${model.exactChampionPickers.map(p => esc(p.name)).join(', ') || 'Nobody'} had ${esc(model.champion)} cutting down the nets</div>
      </div>
      <div class="results-stat-card">
        <div class="results-stat-value">${model.aiAvg}</div>
        <div class="results-stat-label">Average AI Score</div>
        <div class="results-stat-sub">Humans averaged ${model.humanAvg}, so the models finished ${model.aiAvg - model.humanAvg} points ahead on average</div>
      </div>
      <div class="results-stat-card">
        <div class="results-stat-value">${model.upsetKings[0]?.upsetHits || 0}</div>
        <div class="results-stat-label">Best Upset Read</div>
        <div class="results-stat-sub">${esc(model.upsetKings.map(x => x.name).join(', '))} nailed the most actual upset winners</div>
      </div>
    </div>

    <div class="results-podium">
      ${[model.winner, model.runnerUp, model.third].map((p, idx) => `
        <div class="podium-card podium-${idx + 1}">
          <div class="podium-place">${idx === 0 ? '1st' : idx === 1 ? '2nd' : '3rd'}</div>
          <div class="podium-name">${esc(p.name)}</div>
          <div class="podium-score">${p.sc.total}</div>
          <div class="podium-sub">${p.type === 'ai' ? 'AI model' : 'Team member'} · champion pick: ${esc(p.picks?.NC || '—')}</div>
        </div>
      `).join('')}
    </div>

    <div class="results-two-col">
      <div class="results-panel">
        <div class="results-panel-title">Why ${esc(model.winner.name)} Won</div>
        <div class="results-panel-sub">The biggest edges came when the field went the other way in the highest-leverage games.</div>
        <div class="story-list">${pivotalHtml}</div>
      </div>
      <div class="results-panel">
        <div class="results-panel-title">Champion Pick Map</div>
        <div class="results-panel-sub">The pool clustered around Duke and Arizona. Michigan belonged to exactly one bracket.</div>
        <div class="result-chip-grid">${championBoardHtml}</div>
      </div>
    </div>

    <div class="results-two-col">
      <div class="results-panel">
        <div class="results-panel-title">Bracket Breakers</div>
        <div class="results-panel-sub">These were the results that did the most damage to the field’s assumptions.</div>
        <div class="story-list">${trapHtml}</div>
      </div>
      <div class="results-panel">
        <div class="results-panel-title">Needle-Threaders</div>
        <div class="results-panel-sub">A few outcomes landed for only one or two brackets. Those calls separated people fast.</div>
        <div class="story-list">${rareHitHtml}</div>
      </div>
    </div>

    <div class="results-panel">
      <div class="results-panel-title">AI vs Humans</div>
      <div class="results-panel-sub">The models beat the team on average and widened the gap as the rounds got heavier.</div>
      <div class="results-mini-grid">
        <div class="mini-metric"><span>AI round hit rate</span><strong>${fmtPct(model.ais.reduce((sum, p) => sum + (p.acc?.correct || 0), 0), model.ais.length * Object.keys(results).filter(gid => GAMES[gid] && RPTS[GAMES[gid].round]).length)}%</strong></div>
        <div class="mini-metric"><span>Human round hit rate</span><strong>${fmtPct(model.humans.reduce((sum, p) => sum + (p.acc?.correct || 0), 0), model.humans.length * Object.keys(results).filter(gid => GAMES[gid] && RPTS[GAMES[gid].round]).length)}%</strong></div>
        <div class="mini-metric"><span>AI title hits</span><strong>${model.exactChampionPickers.filter(p => p.type === 'ai').length}/${model.ais.length}</strong></div>
        <div class="mini-metric"><span>Human title hits</span><strong>${model.exactChampionPickers.filter(p => p.type !== 'ai').length}/${model.humans.length}</strong></div>
      </div>
      <div class="split-list">${splitHtml}</div>
    </div>

    <div class="results-two-col">
      <div class="results-panel">
        <div class="results-panel-title">Bracket Fingerprints</div>
        <div class="results-fingerprint-grid">
          <div class="fingerprint-card">
            <div class="fingerprint-kicker">Most Contrarian</div>
            <div class="fingerprint-main">${esc(model.mostContrarian.name)}</div>
            <div class="fingerprint-sub">${model.mostContrarian.contrarian} picks against the field majority</div>
          </div>
          <div class="fingerprint-card">
            <div class="fingerprint-kicker">Most Chalk</div>
            <div class="fingerprint-main">${esc(model.chalkiest.name)}</div>
            <div class="fingerprint-sub">Stayed closest to the field consensus all tournament</div>
          </div>
          <div class="fingerprint-card">
            <div class="fingerprint-kicker">Most Split AI Pair</div>
            <div class="fingerprint-main">${esc(model.widestAI.a)} vs ${esc(model.widestAI.b)}</div>
            <div class="fingerprint-sub">${model.widestAI.diff} different picks</div>
          </div>
          <div class="fingerprint-card">
            <div class="fingerprint-kicker">Biggest Human/AI Gap</div>
            <div class="fingerprint-main">${esc(model.widestCross.a)} vs ${esc(model.widestCross.b)}</div>
            <div class="fingerprint-sub">${model.widestCross.diff} different picks</div>
          </div>
        </div>
      </div>
      <div class="results-panel">
        <div class="results-panel-title">Round Leaders</div>
        <div class="round-card-grid">${roundLeaderHtml}</div>
        <div class="results-panel-sub" style="margin-top:14px;">Late-round finishers: ${esc(model.lateClosers.map(x => `${x.name} (${x.lateRoundPoints})`).join(', '))}</div>
      </div>
    </div>

    <div class="results-panel">
      <div class="results-panel-title">Final Standings</div>
      <div class="standings-head">
        <span>Rank</span>
        <span>Bracket</span>
        <span>Champion Pick</span>
        <span>Pts</span>
      </div>
      <div class="standings-list">${standingsHtml}</div>
    </div>
  `;
}

function getFutureSwingGames(primary, secondary, results) {
  const swings = [];
  for (const [gid, g] of Object.entries(GAMES)) {
    if (!RPTS[g.round] || results?.[gid]) continue;
    const aPick = primary.picks?.[gid];
    const bPick = secondary.picks?.[gid];
    if (!aPick || !bPick || aPick === bPick) continue;

    const aAlive = isPickStillAlive(gid, aPick, results);
    const bAlive = isPickStillAlive(gid, bPick, results);
    if (!aAlive && !bAlive) continue;

    swings.push({
      gid,
      points: RPTS[g.round],
      aPick,
      bPick,
      aAlive,
      bAlive,
      round: g.round,
    });
  }

  swings.sort((a, b) => b.points - a.points || a.gid.localeCompare(b.gid));
  return swings;
}

function renderComparePanel(primary, secondary, results) {
  const secondaryScore = score(secondary.picks, results);
  const pointGap = primary.sc.total - secondaryScore.total;
  const pickDiffs = Object.keys(GAMES).filter(gid => primary.picks?.[gid] && secondary.picks?.[gid] && primary.picks[gid] !== secondary.picks[gid]).length;
  const swings = getFutureSwingGames(primary, secondary, results);
  const liveSwingPts = swings.reduce((sum, swing) => sum + swing.points, 0);
  const primaryChamp = primary.picks?.NC || 'No champion';
  const secondaryChamp = secondary.picks?.NC || 'No champion';

  const swingHtml = swings.slice(0, 6).map(swing => `
    <div class="compare-swing">
      <div class="compare-points">${swing.points}</div>
      <div>
        <div class="compare-swing-main">${esc(primary.name)}: ${esc(swing.aPick)} ${swing.aAlive ? '• alive' : '• dead'}<br>${esc(secondary.name)}: ${esc(swing.bPick)} ${swing.bAlive ? '• alive' : '• dead'}</div>
        <div class="compare-swing-sub">${swing.gid} · ${RLABELS[swing.round]}</div>
      </div>
    </div>
  `).join('');

  return `<div class="compare-wrap">
    <div class="compare-head">
      <div class="compare-title">${esc(primary.name)} vs ${esc(secondary.name)}</div>
      <div class="compare-sub">${esc(primaryChamp)} vs ${esc(secondaryChamp)}</div>
    </div>
    <div class="compare-grid">
      <div class="compare-stat">
        <div class="compare-stat-val" style="color:${pointGap >= 0 ? 'var(--green)' : 'var(--red)'}">${pointGap > 0 ? '+' : ''}${pointGap}</div>
        <div class="compare-stat-lbl">Current Points Gap</div>
      </div>
      <div class="compare-stat">
        <div class="compare-stat-val">${pickDiffs}</div>
        <div class="compare-stat-lbl">Different Picks</div>
      </div>
      <div class="compare-stat">
        <div class="compare-stat-val">${liveSwingPts}</div>
        <div class="compare-stat-lbl">Live Swing Points</div>
      </div>
    </div>
    <div class="compare-swings">
      ${swingHtml || `<div class="compare-empty">No future swing games remain between these brackets. The race is down to already-scored differences.</div>`}
    </div>
  </div>`;
}

// ============================================================
// NAVIGATION
// ============================================================
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  document.getElementById('nav-'  + name).classList.add('active');
  if (name === 'results') {
    renderResultsView();
  } else if (name === 'bracket') {
    renderBracket();
  } else {
    const champEl = document.getElementById('sidebar-champ');
    if (champEl) champEl.innerHTML = '';
  }
}

// ============================================================
// ROUND PILLS
// ============================================================
function renderPills() {
  const results = appData?.results || {};
  const { rounds, fullyComplete, currentRound } = getRoundState(results);
  const tournamentComplete = isTournamentComplete(results);

  const html = rounds.map(r => {
    let cls;
    if (tournamentComplete && r === 'nc') cls = 'rpill-final';
    else if (r === currentRound) cls = 'rpill-live';
    else if (fullyComplete.has(r)) cls = 'rpill-past';
    else cls = 'rpill-soon';
    return `<div class="rpill ${cls}">${RLABELS[r]}</div>`;
  }).join('');
  document.getElementById('round-pills').innerHTML = html;

  const played = Object.keys(results).length;
  let updatedText = appData?.meta?.updated || '—';
  // If updated contains a T, it's a full ISO timestamp — show relative time
  if (updatedText.includes('T')) {
    const updatedDate = new Date(updatedText);
    const diffMs = Date.now() - updatedDate.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) updatedText = 'just now';
    else if (diffMin < 60) updatedText = `${diffMin}m ago`;
    else if (diffMin < 1440) updatedText = `${Math.floor(diffMin/60)}h ago`;
    else updatedText = `${Math.floor(diffMin/1440)}d ago`;
  }
  document.getElementById('lb-meta').textContent =
    tournamentComplete
      ? `${played} games final · Tournament complete · Updated ${updatedText}`
      : `${played} game${played===1?'':'s'} complete · Updated ${updatedText}`;
}

// ============================================================
// BRACKET SELECT + NAV HELPER
// ============================================================
function populateBktSelect() {
  if (!appData) return;
  const sel = document.getElementById('bkt-select');
  const compareSel = document.getElementById('compare-select');
  if (!sel || !compareSel) return;
  const options = appData.participants.map(p =>
    '<option value="' + p.id + '">' + esc(p.name) + (p.type==='ai'?' (AI)':'') + '</option>'
  ).join('');
  sel.innerHTML = '<option value="">— Choose a participant —</option>' + options;
  compareSel.innerHTML = '<option value="">No comparison</option>' + options;
}

function viewBkt(id) {
  showView('bracket');
  const sel = document.getElementById('bkt-select');
  if (sel) { sel.value = id; renderBracket(); }
}

// ============================================================
// LEADERBOARD
// ============================================================
function renderLeaderboard() {
  if (!appData) return;
  const results = appData.results || {};
  const rows = getParticipantRows(results);

  // === HUMANS vs AI BAR ===
  let humanPts = 0, humanCount = 0, aiPts = 0, aiCount = 0;
  rows.forEach(p => {
    if (!hasPicks(p)) return;
    if (p.type === 'ai') { aiPts += p.sc.total; aiCount++; }
    else { humanPts += p.sc.total; humanCount++; }
  });
  const totalPts = humanPts + aiPts;
  const humanPct = totalPts > 0 ? (humanPts / totalPts * 100) : 50;
  const hvaEl = document.getElementById('hva-bar');
  if (humanCount > 0 && aiCount > 0) {
    hvaEl.innerHTML = `<div class="hva">
      <div class="hva-labels">
        <div class="hva-side hva-human">👤 Humans <span class="hva-pts">${humanPts}</span></div>
        <div class="hva-side hva-ai"><span class="hva-pts">${aiPts}</span> ⚡ AI</div>
      </div>
      <div class="hva-track"><div class="hva-fill" style="width:${humanPct}%"></div><div class="hva-mid"></div></div>
    </div>`;
  } else { hvaEl.innerHTML = ''; }
  document.getElementById('lb-updates').innerHTML = renderTournamentPulse(rows, results);
  const winPathsTitle = document.getElementById('wcw-title');
  if (winPathsTitle) winPathsTitle.textContent = isTournamentComplete(results) ? 'Final Podium' : 'Who Can Still Win';
  document.getElementById('wcw-list').innerHTML = renderWhoCanStillWin(rows);
  renderResultsView(rows, results);

  // === BEST PICK / WORST MISS CALLOUTS (right sidebar) ===
  const calloutsEl = document.getElementById('lb-callouts');
  const playedGames = Object.keys(results).filter(gid => GAMES[gid] && RPTS[GAMES[gid].round]);
  if (playedGames.length > 0) {
    if (isTournamentComplete(results)) {
      const styleRows = getResultsViewModel(rows, results);
      const champPickers = styleRows.exactChampionPickers.map(p => p.name).join(', ') || 'Nobody';
      const finalCallouts = [
        `<div class="callout"><div class="callout-icon">🏆</div><div class="callout-label">Winning Bracket</div><div class="callout-text">${esc(styleRows.winner.name)}</div><div class="callout-sub">${styleRows.winner.sc.total} points · won by ${styleRows.winnerMargin}</div></div>`,
        `<div class="callout"><div class="callout-icon">🎯</div><div class="callout-label">Correct Champion Pick</div><div class="callout-text">${esc(champPickers)}</div><div class="callout-sub">${esc(results.NC)} was the only title pick that paid off</div></div>`,
        `<div class="callout"><div class="callout-icon">🧨</div><div class="callout-label">Upset Hunters</div><div class="callout-text">${esc(styleRows.upsetKings.map(x => x.name).join(', '))}</div><div class="callout-sub">${styleRows.upsetKings[0]?.upsetHits || 0} actual upset hits</div></div>`
      ];
      calloutsEl.innerHTML = finalCallouts.join('');
    } else {
      // Best pick = correctly called the biggest upset (highest seed diff where lower seed won)
      let bestUpsetGid = null;
      let bestSeedDiff = 0;
      let bestWho = [];
      let worstGame = null;
      let worstMissCount = 0;
      for (const gid of playedGames) {
        const g = GAMES[gid];
        const winner = results[gid];
        // Calculate seed differential (only for R1 games with seeds)
        if (g.tSeed && g.bSeed) {
          const winnerSeed = winner === g.top ? g.tSeed : g.bSeed;
          const loserSeed = winner === g.top ? g.bSeed : g.tSeed;
          // It's an upset if the higher seed number (worse seed) won
          if (winnerSeed > loserSeed) {
            const diff = winnerSeed - loserSeed;
            if (diff > bestSeedDiff) {
              // Find who called it
              const gotIt = [];
              rows.forEach(p => {
                if (!hasPicks(p)) return;
                if (p.picks[gid] === winner) gotIt.push(p.name);
              });
              if (gotIt.length > 0) {
                bestSeedDiff = diff;
                bestUpsetGid = gid;
                bestWho = gotIt;
              }
            }
          }
        }
        // Worst miss = most people got it wrong
        let missedIt = 0;
        rows.forEach(p => {
          if (!hasPicks(p)) return;
          if (p.picks[gid] !== results[gid]) missedIt++;
        });
        if (missedIt > worstMissCount) {
          worstMissCount = missedIt; worstGame = gid;
        }
      }
      let calloutsHtml = '';
      if (bestUpsetGid && bestWho.length > 0) {
        const g = GAMES[bestUpsetGid];
        const winner = results[bestUpsetGid];
        const winnerSeed = winner === g.top ? g.tSeed : g.bSeed;
        const loserSeed = winner === g.top ? g.bSeed : g.tSeed;
        calloutsHtml += `<div class="callout"><div class="callout-icon">🔥</div><div class="callout-label">Best Pick</div><div class="callout-text">${bestWho.join(', ')}</div><div class="callout-sub">Called #${winnerSeed} ${esc(winner)} over #${loserSeed} in ${bestUpsetGid}</div></div>`;
      }
      if (worstGame && worstMissCount > rows.filter(p=>hasPicks(p)).length / 2) {
        const totalWithPicks = rows.filter(p=>hasPicks(p)).length;
        calloutsHtml += `<div class="callout"><div class="callout-icon">💀</div><div class="callout-label">Biggest Miss</div><div class="callout-text">${worstMissCount} of ${totalWithPicks} wrong</div><div class="callout-sub">${esc(results[worstGame])} won ${worstGame}</div></div>`;
      }
      // "Still alive" — who has the most unique teams in their bracket that are still in the tournament
      // A team is "eliminated" if they lost any game in the results
      const eliminatedTeams = getEliminatedTeams(results);

      let bestAlive = null;
      let bestAliveCount = 0;
      const withPicks = rows.filter(p => hasPicks(p));
      withPicks.forEach(p => {
        // Get all unique teams this person picked anywhere in their bracket
        const pickedTeams = new Set(Object.values(p.picks));
        // Count how many of those teams are still alive (not eliminated)
        let alive = 0;
        pickedTeams.forEach(team => {
          if (team && !eliminatedTeams.has(team)) alive++;
        });
        if (alive > bestAliveCount) { bestAliveCount = alive; bestAlive = p.name; }
      });
      if (bestAlive) {
        calloutsHtml += `<div class="callout"><div class="callout-icon">🎯</div><div class="callout-label">Healthiest Bracket</div><div class="callout-text">${esc(bestAlive)}</div><div class="callout-sub">${bestAliveCount} teams still alive</div></div>`;
      }
      calloutsEl.innerHTML = calloutsHtml;
    }
  } else {
    calloutsEl.innerHTML = '<div class="callout-empty">Insights will appear once Round of 64 results are logged</div>';
  }

  // === LEADERBOARD ROWS ===
  const RORDER = ['r1','r2','s16','e8','ff2','nc'];
  let rank = 0;
  let prevScore = null;
  let rowIndex = 0;
  const newRanks = {};
  const html = rows.map((p, i) => {
    const has = hasPicks(p);
    if (has) {
      rowIndex++;
      // Only increment rank if score is different from previous
      if (prevScore === null || p.sc.total !== prevScore) {
        rank = rowIndex;
      }
      prevScore = p.sc.total;
    }
    const rankDisp = has ? rank : '—';
    const rankCls  = has ? (rank===1?'r1':rank===2?'r2':rank===3?'r3':'') : '';
    const aiCls    = p.type==='ai' ? 'ai' : '';
    const tied = has && rows[i - 1] && hasPicks(rows[i - 1]) && rows[i - 1].sc.total === p.sc.total;

    // Track rank for arrows
    if (has) newRanks[p.id] = rank;

    // Rank change arrow
    let arrowHtml = '';
    if (has && prevRanks[p.id] !== undefined) {
      const diff = prevRanks[p.id] - rank;
      if (diff > 0) arrowHtml = `<span class="lb-rank-change up">▲${diff}</span>`;
      else if (diff < 0) arrowHtml = `<span class="lb-rank-change down">▼${Math.abs(diff)}</span>`;
      else arrowHtml = `<span class="lb-rank-change same">—</span>`;
    }

    // Champion pick with logo and elimination status
    let champHtml = '';
    if (has && p.picks?.NC) {
      const champ = p.picks.NC;
      const logo = teamLogo(champ);
      const elim = isTeamEliminated(champ, results);
      const cls = elim ? 'eliminated' : 'alive';
      champHtml = `<div class="lb-champ">${logo ? `<img class="lb-champ-logo" src="${logo}" alt="" loading="lazy" onerror="this.style.display='none'">` : ''}` +
        `<span class="lb-champ-name ${cls}">${elim ? '✗ ' : '🏆 '}${esc(champ)}</span></div>`;
    }

    const breakdown = has ? RORDER.map(r => {
      const pts = p.sc.by[r] || 0;
      return `<span class="${pts>0?'hit':''}">${RSHORT[r]}: ${pts}</span>`;
    }).join('') :
      `<span class="no-picks-msg">Picks not submitted · <a href="#" onclick="event.preventDefault();showView('enter')">Enter now →</a></span>`;
    const remaining = has ? Math.max(0, p.maxPossible - p.sc.total) : 0;
    const champOut = has && p.picks?.NC ? isTeamEliminated(p.picks.NC, results) : false;
    const outlook = has ? `
      <div class="lb-outlook">
        <span class="ceiling">Max ${p.maxPossible}</span>
        <span>Left ${remaining}</span>
        <span class="${champOut ? 'dead' : 'alive'}">${champOut ? 'Champion out' : 'Champion alive'}</span>
        ${tied ? '<span class="tie-note">Tied on current score</span>' : ''}
      </div>` : '';

    const delay = `animation-delay:${i*0.055}s`;
    const pts   = has ? p.sc.total : '—';
    const badge = p.type==='ai' ? `<span class="ai-badge">⚡ AI</span>` : `<span class="hu-badge">Human</span>`;

    return `
      <div class="lb-row ${rankCls} ${aiCls}" style="${delay}" onclick="viewBkt('${p.id}')">
        <div class="lb-rank">${rankDisp}${arrowHtml}</div>
        <div class="lb-info">
          <div class="lb-name">${esc(p.name)} ${badge}</div>
          ${champHtml}
          <div class="lb-breakdown">${breakdown}</div>
          ${outlook}
        </div>
        <div class="lb-score">
          <div class="lb-pts" style="${has && p.color ? 'color:'+p.color : ''}">${pts}</div>
          <div class="lb-pts-lbl">pts</div>
        </div>
      </div>`;
  }).join('');

  // Store ranks for next render
  prevRanks = newRanks;

  document.getElementById('lb-list').innerHTML = html || '<div class="empty-state">No participants yet</div>';
}

// ============================================================
// BRACKET VIEW — horizontal layout with SVG connectors
// ============================================================
const SLOT_H = 58;

function makeBracketSVG(sourceGameH, numSourceGames) {
  const W = 24, MX = 11;
  const H = numSourceGames * sourceGameH;
  const paths = [];
  for (let i = 0; i < numSourceGames / 2; i++) {
    const y1   = (2*i     * sourceGameH) + sourceGameH/2;
    const y2   = ((2*i+1) * sourceGameH) + sourceGameH/2;
    const ymid = (y1 + y2) / 2;
    paths.push('M0,' + y1.toFixed(1) + ' H' + MX + ' M0,' + y2.toFixed(1) + ' H' + MX + ' M' + MX + ',' + y1.toFixed(1) + ' V' + y2.toFixed(1) + ' M' + MX + ',' + ymid.toFixed(1) + ' H' + W);
  }
  return '<svg width="' + W + '" height="' + H + '" style="display:block" xmlns="http://www.w3.org/2000/svg"><path d="' + paths.join(' ') + '" fill="none" stroke="rgba(255,255,255,0.09)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

function renderBktSlot(team, seed, pick, result, allResults) {
  if (!team || team === 'TBD') {
    return `<div class="bkt-slot slot-tbd"><span class="bkt-name">TBD</span></div>`;
  }
  const seedHtml = seed != null ? `<span class="bkt-seed">${seed}</span>` : `<span class="bkt-seed"></span>`;
  const isPick = pick === team, isResult = result === team;
  let cls = 'slot-dim', ico = '';
  if      (isPick && isResult)       { cls = 'slot-correct'; ico = '✓'; }
  else if (isPick && result)         { cls = 'slot-wrong';   ico = '✗'; }
  else if (isPick && !result && allResults) {
    // Game not yet played — check if this pick is still alive
    const elim = isTeamEliminated(team, allResults);
    if (elim) { cls = 'slot-elim'; ico = '✗'; }
    else      { cls = 'slot-alive'; ico = '●'; }
  }
  else if (isPick)                   { cls = 'slot-pick';    ico = '●'; }
  else if (isResult)                 { cls = 'slot-actual'; }
  const icoHtml = ico ? `<span class="bkt-ico">${ico}</span>` : '';
  return `<div class="bkt-slot ${cls}">${seedHtml}<span class="bkt-name">${esc(team)}</span>${icoHtml}</div>`;
}

function renderBktGame(gid, picks, results) {
  const g = GAMES[gid];
  const [t1, t2] = getTeams(gid, picks, results);
  const s1 = g.src ? null : g.tSeed;
  const s2 = g.src ? null : g.bSeed;
  return `<div class="bkt-game">
    ${renderBktSlot(t1, s1, picks?.[gid], results?.[gid], results)}
    ${renderBktSlot(t2, s2, picks?.[gid], results?.[gid], results)}
  </div>`;
}

function renderRegion(region, meta, picks, results) {
  const rounds = [
    { key:'r1',  cls:'col-r1',  games: RG[region].r1,  label:'R64', pts:10 },
    { key:'r2',  cls:'col-r2',  games: RG[region].r2,  label:'R32', pts:20 },
    { key:'s16', cls:'col-s16', games: RG[region].s16, label:'S16', pts:40 },
    { key:'e8',  cls:'col-e8',  games: RG[region].e8,  label:'E8',  pts:80 }
  ];
  let inner = '<div class="bkt-inner">';
  rounds.forEach((rnd, idx) => {
    const gamesHtml = rnd.games.map(gid => renderBktGame(gid, picks, results)).join('');
    inner += `<div class="bkt-col"><div class="bkt-col-hd">${rnd.label} <span style="color:rgba(74,82,104,0.55)">${rnd.pts}pts</span></div><div class="bkt-games ${rnd.cls}">${gamesHtml}</div></div>`;
    if (idx < rounds.length - 1) {
      const srcH = SLOT_H * Math.pow(2, idx);
      inner += `<div class="bkt-conn">${makeBracketSVG(srcH, rnd.games.length)}</div>`;
    }
  });
  inner += '</div>';

  const allRoundGames = rounds.flatMap(r => r.games);
  let regionPts = 0;
  allRoundGames.forEach(gid => {
    if (results[gid] && picks?.[gid] === results[gid]) regionPts += RPTS[GAMES[gid].round];
  });
  const ptsBadge = regionPts > 0 ? `<span style="font-family:var(--fm);font-size:14px;color:var(--orange);font-weight:600">${regionPts} pts</span>` : '';

  return `<div class="bkt-region-wrap">
    <div class="bkt-region-head"><span>${meta.emoji} ${meta.label}</span>${ptsBadge}</div>
    <div class="bkt-scroll">${inner}</div>
  </div>`;
}

function gameLineHtml(gid, picks, results) {
  // kept for admin panel compatibility
  const [t1, t2] = getTeams(gid, picks, results);
  const pick = picks?.[gid], result = results?.[gid];
  function chip(team) {
    if (!team || team==='TBD') return `<span style="color:var(--muted);font-style:italic;font-size:17px">TBD</span>`;
    const isPick = pick===team, isResult = result===team;
    let cls;
    if (isPick && result) cls = pick===result ? 'tc-correct' : 'tc-wrong';
    else if (isPick)      cls = 'tc-pick';
    else if (isResult)    cls = 'tc-result';
    else                  cls = 'tc-other';
    return `<span class="tc ${cls}">${esc(team)}</span>`;
  }
  return `<div class="game-line">${chip(t1)}<span class="vs">vs</span>${chip(t2)}</div>`;
}

function renderBracket() {
  if (!appData) return;
  const id = document.getElementById('bkt-select').value;
  const compareId = document.getElementById('compare-select')?.value;
  const el = document.getElementById('bkt-content');
  if (!id) { el.innerHTML = '<div class="empty-state">Select a participant above</div>'; return; }
  const p = appData.participants.find(x => x.id === id);
  if (!p) return;
  if (!hasPicks(p)) { el.innerHTML = `<div class="empty-state">${esc(p.name)} hasn't submitted picks yet</div>`; return; }

  const picks = p.picks, results = appData.results || {};
  const sc = score(picks, results), acc = accuracy(picks, results);

  const statsHtml = `<div class="bkt-stats">
    <div class="bstat"><div class="bstat-val" style="color:${p.color||'var(--orange)'}">${sc.total}</div><div class="bstat-lbl">Points</div></div>
    <div class="bstat"><div class="bstat-val">${acc.played>0?Math.round(acc.correct/acc.played*100)+'%':'—'}</div><div class="bstat-lbl">Accuracy</div></div>
    <div class="bstat"><div class="bstat-val" style="color:var(--green)">${acc.correct}</div><div class="bstat-lbl">Correct</div></div>
    <div class="bstat"><div class="bstat-val" style="color:var(--red)">${acc.played-acc.correct}</div><div class="bstat-lbl">Wrong</div></div>
  </div>`;

  const regionMeta = {
    east:    { emoji:'🔵', label:'East'    },
    west:    { emoji:'🔴', label:'West'    },
    midwest: { emoji:'🟡', label:'Midwest' },
    south:   { emoji:'🟢', label:'South'   }
  };

  const regHtml = Object.keys(RG).map(r => renderRegion(r, regionMeta[r], picks, results)).join('');
  let compareHtml = '';
  if (compareId && compareId !== id) {
    const secondary = appData.participants.find(x => x.id === compareId);
    if (secondary && hasPicks(secondary)) {
      compareHtml = renderComparePanel({ ...p, sc }, secondary, results);
    }
  }

  const ff5t = getTeams('FF5', picks, results);
  const ff6t = getTeams('FF6', picks, results);
  const ffHtml = `<div class="bkt-ff-wrap">
    <div class="bkt-ff-card">
      <div class="region-head">🏟️ ${GAMES.FF5.label}</div>
      <div class="bkt-ff-inner">
        ${renderBktSlot(ff5t[0], null, picks['FF5'], results['FF5'], results)}
        ${renderBktSlot(ff5t[1], null, picks['FF5'], results['FF5'], results)}
      </div>
    </div>
    <div class="bkt-ff-card">
      <div class="region-head">🏟️ ${GAMES.FF6.label}</div>
      <div class="bkt-ff-inner">
        ${renderBktSlot(ff6t[0], null, picks['FF6'], results['FF6'], results)}
        ${renderBktSlot(ff6t[1], null, picks['FF6'], results['FF6'], results)}
      </div>
    </div>
  </div>`;

  const champ = picks['NC'], actual = results['NC'];
  const champColor = actual ? (champ===actual?'var(--green)':'var(--red)') : 'var(--gold)';
  const champCls = actual ? (champ===actual?'correct':'wrong') : '';
  const champLogo = teamLogo(champ);
  const champEl = document.getElementById('sidebar-champ');
  if (champ) {
    champEl.innerHTML = `<div class="sidebar-champ-card">
      <div class="sidebar-champ-lbl">${actual?'🏆 Actual Champion':'🎯 Predicted Champion'}</div>
      <div class="sidebar-champ-team ${champCls}">${esc(champ)}</div>
      ${champLogo ? `<img class="sidebar-champ-logo" src="${champLogo}" alt="${esc(champ)}" loading="lazy" onerror="this.style.display='none'">` : ''}
      ${actual&&champ!==actual?`<div class="sidebar-champ-actual">Actual: ${esc(actual)}</div>`:''}
    </div>`;
  } else {
    champEl.innerHTML = '';
  }

  el.innerHTML = statsHtml + compareHtml + regHtml + ffHtml;
}

// ============================================================
// WIZARD
// ============================================================
function renderWizardStep() {
  const wizard = document.getElementById('wizard');
  const step = WSTEPS[wiz.step];
  const pct  = (wiz.step / (WSTEPS.length - 1)) * 100;
  const prog = '<div class="w-prog"><div class="w-prog-bar" style="width:' + pct + '%"></div></div>';
  let body = '';

  if (step.type === 'name') {
    body = '<div class="w-title">' + step.title + '</div>' +
      '<div class="w-sub">Enter your name to start your bracket</div>' +
      '<input class="name-inp" id="w-name" type="text" placeholder="Your name..." value="' + esc(wiz.name) + '"' +
      ' oninput="wiz.name=this.value;document.getElementById(&#39;w-next&#39;).disabled=!this.value.trim()"' +
      ' onkeydown="if(event.key===&#39;Enter&#39;&amp;&amp;this.value.trim())wizNext()" />' +
      '<div class="name-hint">This is how you&#39;ll appear on the leaderboard.</div>';
  } else if (step.type === 'games') {
    const r = appData?.results || {};
    const gamesHtml = step.games.map(gid => {
      const [t1,t2] = getTeams(gid, wiz.picks, r);
      const picked  = wiz.picks[gid];
      const s1 = seedFor(gid, t1);
      const s2 = seedFor(gid, t2);
      const tbd1 = t1==='TBD', tbd2 = t2==='TBD';
      return `
        <div class="w-game">
          <div class="w-game-id">Game ${gid}</div>
          <div class="w-opts">
            <button class="w-btn ${picked===t1?'sel':''}" data-gid="${gid}" data-team="${esc(t1)}" ${tbd1?'disabled':''} onclick="wizPick('${gid}',this.dataset.team)">
              ${s1 ? `<span class="w-seed">#${s1}</span>` : ''}${esc(t1)}
            </button>
            <button class="w-btn ${picked===t2?'sel':''}" data-gid="${gid}" data-team="${esc(t2)}" ${tbd2?'disabled':''} onclick="wizPick('${gid}',this.dataset.team)">
              ${s2 ? `<span class="w-seed">#${s2}</span>` : ''}${esc(t2)}
            </button>
          </div>
        </div>`;
    }).join('');
    body = `
      <div class="w-title">${step.title}</div>
      <div class="w-sub">${step.sub||''}</div>
      <div class="w-games" id="w-games">${gamesHtml}</div>`;
  } else if (step.type === 'done') {
    const out = { name: wiz.name, type:'human', submitted:true, picks: wiz.picks };
    body = `
      <div class="w-done">
        <div class="w-done-icon">🎉</div>
        <h2>Picks Locked In!</h2>
        <p>Copy the JSON below and send to Spencer — he'll drop it into <code>data.json</code> and push to GitHub.</p>
        <div class="json-box" id="w-json">${esc(JSON.stringify(out, null, 2))}</div>
        <div class="copy-row">
          <button class="btn btn-primary" onclick="copyJson()">Copy to Clipboard</button>
          <button class="btn btn-secondary" onclick="initWiz()">Start Over</button>
        </div>
      </div>`;
  }

  // Nav buttons
  let nav = '';
  if (step.type !== 'done') {
    const canNext = step.type==='name' ? wiz.name.trim().length>0 :
                    step.games.every(g => wiz.picks[g]);
    const nextLabel = step.type==='name' ? 'Start →' :
                      wiz.step===WSTEPS.length-2 ? '🔒 Lock In Picks' : 'Next →';
    const back = wiz.step > 0 ? `<button class="btn btn-secondary" onclick="wizBack()">← Back</button>` : '';
    nav = `<div class="w-nav">${back}<button id="w-next" class="btn btn-primary" onclick="wizNext()" ${canNext?'':'disabled'}>${nextLabel}</button></div>`;
  }

  // Admin note on first picks step
  let instrNote = '';
  if (step.type==='name') {
    instrNote = `
      <div class="instr-box" style="margin-top:20px">
        <h3>📋 How This Works</h3>
        <ol>
          <li>Walk through each region and round picking your winners</li>
          <li>When done, you'll get a JSON snippet to copy</li>
          <li>Send it to Spencer → he pastes it into <code>data.json</code> and pushes to GitHub</li>
          <li>You'll appear on the live leaderboard within minutes</li>
          <li>Scores update automatically as games are played and Spencer logs results</li>
        </ol>
      </div>`;
  }

  wizard.innerHTML = prog + body + instrNote + nav;

  if (step.type==='name') setTimeout(() => document.getElementById('w-name')?.focus(), 80);
}

function wizPick(gid, team) {
  wiz.picks[gid] = team;
  // Update button styles for this game
  document.querySelectorAll(`[data-gid="${gid}"]`).forEach(btn => {
    btn.classList.toggle('sel', btn.dataset.team === team);
  });
  // Update next button
  const step = WSTEPS[wiz.step];
  if (step.type==='games') {
    const canNext = step.games.every(g => wiz.picks[g]);
    const nb = document.getElementById('w-next');
    if (nb) nb.disabled = !canNext;
  }
}

function wizNext() {
  if (wiz.step < WSTEPS.length-1) { wiz.step++; renderWizardStep(); }
}
function wizBack() {
  if (wiz.step > 0) { wiz.step--; renderWizardStep(); }
}
function initWiz() { wiz = { step:0, name:'', picks:{} }; renderWizardStep(); }

function copyJson() {
  const txt = document.getElementById('w-json')?.textContent || '';
  navigator.clipboard.writeText(txt).then(() => {
    const btn = document.querySelector('.copy-row .btn-primary');
    if (btn) { btn.textContent = '✓ Copied!'; setTimeout(() => btn.textContent='Copy to Clipboard', 2200); }
  }).catch(() => {
    // Fallback for non-secure contexts
    const ta = document.createElement('textarea');
    ta.value = txt; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
  });
}

// ============================================================
// ADMIN — PIN
// ============================================================
const ADMIN_PIN = '2026'; // Change this to whatever you want
let pinEntry = '';

function pinKey(k) {
  if (k === 'back') { pinEntry = pinEntry.slice(0,-1); updatePinDots(); return; }
  if (k === 'ok' || pinEntry.length === 4) {
    if (pinEntry.length < 4 && k !== 'ok') { pinEntry += k; updatePinDots(); }
    if (pinEntry.length === 4) checkPin();
    return;
  }
  pinEntry += k;
  updatePinDots();
  if (pinEntry.length === 4) setTimeout(checkPin, 80);
}

function updatePinDots() {
  for (let i=0;i<4;i++) {
    document.getElementById('pd'+i)?.classList.toggle('filled', i < pinEntry.length);
  }
}

function checkPin() {
  if (pinEntry === ADMIN_PIN) {
    document.getElementById('admin-gate').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    loadGhConfig();
    renderAdminRounds();
    renderAdminParticipants();
  } else {
    document.getElementById('pin-error').textContent = 'Incorrect PIN';
    pinEntry = '';
    updatePinDots();
    setTimeout(() => document.getElementById('pin-error').textContent = '', 1800);
  }
}

function adminLogout() {
  pinEntry = '';
  updatePinDots();
  document.getElementById('admin-gate').style.display = 'block';
  document.getElementById('admin-panel').style.display = 'none';
  document.getElementById('pin-error').textContent = '';
}

// ============================================================
// ADMIN — GITHUB CONFIG
// ============================================================
let ghConfig = {};
let pendingResults = {}; // changes not yet pushed; null means clear a committed result

function loadGhConfig() {
  try {
    const saved = localStorage.getItem('mm26_gh');
    if (saved) {
      ghConfig = JSON.parse(saved);
      document.getElementById('gh-owner').value  = ghConfig.owner  || '';
      document.getElementById('gh-repo').value   = ghConfig.repo   || '';
      document.getElementById('gh-branch').value = ghConfig.branch || 'main';
      document.getElementById('gh-token').value  = ghConfig.token  || '';
      if (ghConfig.owner && ghConfig.repo && ghConfig.token) {
        setGhStatus('ok', `${ghConfig.owner}/${ghConfig.repo}`);
        document.getElementById('gh-config').style.display = 'none';
      } else {
        setGhStatus('err', 'Configure GitHub first');
        document.getElementById('gh-config').style.display = 'block';
      }
    } else {
      // No saved config — show the form
      document.getElementById('gh-config').style.display = 'block';
    }
  } catch(e) {
    document.getElementById('gh-config').style.display = 'block';
  }
}

function saveGhConfig() {
  ghConfig = {
    owner:  document.getElementById('gh-owner').value.trim(),
    repo:   document.getElementById('gh-repo').value.trim(),
    branch: document.getElementById('gh-branch').value.trim() || 'main',
    token:  document.getElementById('gh-token').value.trim()
  };
  if (!ghConfig.owner || !ghConfig.repo || !ghConfig.token) {
    setGhStatus('err','Missing fields'); return;
  }
  localStorage.setItem('mm26_gh', JSON.stringify(ghConfig));
  setGhStatus('ok', `${ghConfig.owner}/${ghConfig.repo}`);
  document.getElementById('gh-config').style.display = 'none';
}

function toggleGhConfig() {
  const el = document.getElementById('gh-config');
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function setGhStatus(state, msg) {
  const dot = document.getElementById('gh-dot');
  const lbl = document.getElementById('gh-status-label');
  dot.className = 'gh-dot ' + (state==='ok' ? 'ok' : state==='err' ? 'err' : '');
  lbl.textContent = msg || '';
}

// ============================================================
// ADMIN — RESULTS ENTRY
// ============================================================
const ROUND_ORDER_ADMIN = [
  { key:'ff',  label:'First Four',            games:['FF1','FF2','FF3','FF4'] },
  { key:'r1',  label:'Round of 64',           games:['E1','E2','E3','E4','E5','E6','E7','E8','W1','W2','W3','W4','W5','W6','W7','W8','M1','M2','M3','M4','M5','M6','M7','M8','S1','S2','S3','S4','S5','S6','S7','S8'] },
  { key:'r2',  label:'Round of 32',           games:['E9','E10','E11','E12','W9','W10','W11','W12','M9','M10','M11','M12','S9','S10','S11','S12'] },
  { key:'s16', label:'Sweet 16',              games:['E13','E14','W13','W14','M13','M14','S13','S14'] },
  { key:'e8',  label:'Elite Eight',           games:['E15','W15','M15','S15'] },
  { key:'ff2', label:'Final Four',            games:['FF5','FF6'] },
  { key:'nc',  label:'National Championship', games:['NC'] }
];

function renderAdminRounds() {
  if (!appData) return;
  const results  = { ...(appData.results || {}) };
  Object.entries(pendingResults).forEach(([gid, winner]) => {
    if (gid === '__names_updated') return;
    if (winner == null) delete results[gid];
    else results[gid] = winner;
  });
  const container = document.getElementById('admin-rounds');

  container.innerHTML = ROUND_ORDER_ADMIN.map(rnd => {
    const pts = RPTS[rnd.key] ? `${RPTS[rnd.key]} pts/pick` : '';
    const gamesHtml = rnd.games.map(gid => {
      const [t1,t2] = getTeams(gid, null, results);
      const winner  = results[gid];
      const isPend  = Object.prototype.hasOwnProperty.call(pendingResults, gid);
      const g = GAMES[gid];

      const s1 = g?.tSeed; const s2 = g?.bSeed;
      const tbd = t1==='TBD'||t2==='TBD';

      const pendBadge = isPend ? `<span style="font-family:var(--fm);font-size:13px;color:var(--gold);text-transform:uppercase;letter-spacing:0.06em"> ●PENDING</span>` : '';
      const clearBtn  = winner ? `<button class="clear-btn" onclick="clearResult('${gid}')" title="Clear result">✕</button>` : '';

      const btn1cls = winner ? (winner===t1?'winner':'loser') : '';
      const btn2cls = winner ? (winner===t2?'winner':'loser') : '';

      return `
        <div class="admin-game">
          <div class="admin-game-id">${gid}${pendBadge}</div>
          <button class="team-btn ${btn1cls}" data-gid="${gid}" data-team="${esc(t1)}" onclick="setResult(this.dataset.gid, this.dataset.team)" ${tbd?'disabled':''}>
            ${s1?`<span class="tseed">#${s1}</span>`:''}${esc(t1)}
          </button>
          <span class="admin-vs">vs</span>
          <button class="team-btn ${btn2cls}" data-gid="${gid}" data-team="${esc(t2)}" onclick="setResult(this.dataset.gid, this.dataset.team)" ${tbd?'disabled':''}>
            ${s2?`<span class="tseed">#${s2}</span>`:''}${esc(t2)}
          </button>
          ${clearBtn}
        </div>`;
    }).join('');

    return `
      <div class="admin-round-card">
        <div class="admin-round-head">
          <span class="admin-round-label">${rnd.label}</span>
          <span class="admin-round-pts">${pts}</span>
        </div>
        ${gamesHtml}
      </div>`;
  }).join('');

  updatePushBar();
}

function setResult(gid, team) {
  if (!team || team==='TBD') return;
  pendingResults[gid] = team;
  renderAdminRounds();
  updatePushBar();
}

function clearResult(gid) {
  if (appData?.results?.[gid]) pendingResults[gid] = null;
  else delete pendingResults[gid];
  renderAdminRounds();
  updatePushBar();
}

function updatePushBar() {
  const resultKeys = Object.keys(pendingResults).filter(k => k !== '__names_updated');
  const n = resultKeys.length + (pendingResults.__names_updated ? 1 : 0);
  const btn = document.getElementById('push-btn');
  const pending = document.getElementById('push-pending');
  btn.disabled = n === 0;
  pending.innerHTML = n > 0 
    ? `<strong>${n}</strong> pending change${n===1?'':'s'} — not yet saved`
    : 'No pending changes';
  document.getElementById('push-status').textContent = '';
  document.getElementById('push-status').className   = 'push-status';
}

// ============================================================
// ADMIN — PARTICIPANT NAMES
// ============================================================
function renderAdminParticipants() {
  if (!appData) return;
  const html = appData.participants.map((p,i) => `
    <div class="p-card">
      <div class="p-card-top">
        <div class="p-dot" style="background:${p.color||'var(--muted)'}"></div>
        <div class="p-name">${esc(p.name)}</div>
        <span class="p-badge ${p.type}">${p.type==='ai'?'⚡ AI':'Human'}</span>
      </div>
      ${p.type==='human' ? `<input class="p-name-inp" data-idx="${i}" value="${esc(p.name)}" placeholder="Team member name..." oninput="appData.participants[${i}].name=this.value" />` : ''}
      <div class="p-status ${hasPicks(p)?'done':'pend'}">${hasPicks(p)?'✓ Picks submitted':'⏳ Awaiting picks'}</div>
    </div>`).join('');
  document.getElementById('admin-p-cards').innerHTML = html;
}

function saveParticipants() {
  // Merge participant name changes into pending push
  // We'll push the whole file so names are included
  pendingResults['__names_updated'] = true;
  pushResults();
}

// ============================================================
// ADMIN — PUSH TO GITHUB
// ============================================================
async function pushResults() {
  if (!ghConfig.owner || !ghConfig.repo || !ghConfig.token) {
    document.getElementById('gh-config').style.display = 'block';
    setGhStatus('err','Configure GitHub first');
    return;
  }

  // Build confirmation summary
  const resultKeys = Object.keys(pendingResults).filter(k => k !== '__names_updated');
  if (resultKeys.length > 0) {
    const summary = resultKeys.map(gid =>
      pendingResults[gid] == null ? `${gid}: clear result` : `${gid}: ${pendingResults[gid]}`
    ).join('\n');
    if (!confirm(`Push ${resultKeys.length} result${resultKeys.length===1?'':'s'}?\n\n${summary}\n\nConfirm?`)) return;
  }

  const statusEl = document.getElementById('push-status');
  const btn      = document.getElementById('push-btn');
  statusEl.textContent = 'Pushing…';
  statusEl.className   = 'push-status pushing';
  btn.disabled = true;

  // Merge pending into data
  const nameUpdated = pendingResults['__names_updated'];
  delete pendingResults['__names_updated'];
  const newResults = { ...(appData.results || {}) };
  Object.entries(pendingResults).forEach(([gid, winner]) => {
    if (winner == null) delete newResults[gid];
    else newResults[gid] = winner;
  });
  const newData    = { ...appData, results: newResults, meta: { ...appData.meta, updated: new Date().toISOString() } };

  const apiBase = `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/data.json`;
  const headers = {
    'Authorization': `token ${ghConfig.token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };

  try {
    // Get current SHA
    const getRes = await fetch(`${apiBase}?ref=${ghConfig.branch}`, { headers });
    if (!getRes.ok) throw new Error(`GET failed: ${getRes.status}`);
    const getJson = await getRes.json();
    const sha = getJson.sha;

    // Encode content
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(newData, null, 2))));
    const n = Object.keys(pendingResults).length;
    const msg = nameUpdated ? 'Update participant names' : `Log ${n} result${n===1?'':'s'} — ${new Date().toLocaleDateString()}`;

    // Push
    const putRes = await fetch(apiBase, {
      method: 'PUT', headers,
      body: JSON.stringify({ message: msg, content, sha, branch: ghConfig.branch })
    });

    if (!putRes.ok) {
      const e = await putRes.json();
      throw new Error(e.message || `PUT failed: ${putRes.status}`);
    }

    // Success — update local state
    appData.results = newResults;
    pendingResults  = {};
    statusEl.textContent = '✓ Pushed to GitHub!';
    statusEl.className   = 'push-status ok';
    setGhStatus('ok', `${ghConfig.owner}/${ghConfig.repo}`);
    renderLeaderboard();
    renderPills();
    renderAdminRounds();
    renderAdminParticipants();
    renderSidebar();
    renderBracket();
    setTimeout(() => { statusEl.textContent=''; statusEl.className='push-status'; }, 4000);

  } catch(err) {
    statusEl.textContent = '✗ ' + err.message;
    statusEl.className   = 'push-status err';
    btn.disabled = false;
    console.error(err);
  }
}

// ============================================================
// LIVE SCORES (via Cloudflare Worker proxy)
// Set this to your Cloudflare Worker URL after deploying cloudflare-worker.js
// Leave empty to disable live scores
// ============================================================
const LIVE_SCORES_URL = 'https://espn-scores.spencer-018.workers.dev';

let liveScoresByDate = {}; // { 'YYYY-MM-DD': { TeamName: { score, status, clock, period, detail } } }
let selectedSidebarDateKey = null;

function getSidebarLiveScores(dateKey) {
  return liveScoresByDate[dateKey] || {};
}

async function fetchLiveScores(dateKey) {
  if (!LIVE_SCORES_URL || !dateKey) return;
  try {
    const res = await fetch(`${LIVE_SCORES_URL}?date=${dateKey.replace(/-/g, '')}&_=${Date.now()}`);
    if (!res.ok) return;
    const data = await res.json();
    const newScores = {};
    (data.games || []).forEach(game => {
      const isLive = game.status === 'STATUS_IN_PROGRESS';
      const isFinal = game.status === 'STATUS_FINAL';
      const isHalf = game.status === 'STATUS_HALFTIME';
      if (!isLive && !isFinal && !isHalf) return;
      game.teams.forEach(t => {
        // Normalize team name using our mapping
        const localName = normalizeESPNName(t.name);
        if (localName) {
          newScores[localName] = {
            score: t.score,
            status: isFinal ? 'final' : 'live',
            clock: game.clock,
            period: game.period,
            detail: game.statusDetail
          };
        }
      });
    });
    liveScoresByDate[dateKey] = newScores;
    if (selectedSidebarDateKey === dateKey) renderSidebar();
  } catch(e) {
    // Silent fail
  }
}

// Simple ESPN name normalizer for live scores (subset of the full mapping in update-scores.js)
function normalizeESPNName(name) {
  return ESPN_TO_LOCAL[name] || null;
}

function teamLogo(name) {
  const id = LOGO_MAP[name];
  if (!id) return '';
  return 'https://a.espncdn.com/i/teamlogos/ncaa/500/' + id + '.png';
}

function getDefaultSidebarDateKey(dates) {
  if (isTournamentComplete(appData?.results || {})) {
    return dates[dates.length - 1] || null;
  }
  // Determine today's date in Eastern Time.
  let todayStr;
  try {
    const etFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' });
    todayStr = etFormatter.format(new Date());
  } catch(e) {
    const now = new Date();
    const etNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (-4 * 3600000));
    todayStr = etNow.toISOString().slice(0, 10);
  }
  return dates.find(d => d === todayStr)
    || dates.find(d => d > todayStr)
    || dates[dates.length - 1]
    || null;
}

function setSidebarDate(dateKey) {
  selectedSidebarDateKey = dateKey || null;
  renderSidebar();
  if (selectedSidebarDateKey && LIVE_SCORES_URL) fetchLiveScores(selectedSidebarDateKey);
}

function renderSidebar() {
  if (!appData?.schedule) {
    const sidebarEl = document.getElementById('sidebar');
    if (sidebarEl) sidebarEl.style.display = 'none';
    return;
  }

  const dates = Object.keys(appData.schedule).sort();
  if (!dates.length) {
    document.getElementById('sidebar').style.display = 'none';
    return;
  }

  if (!selectedSidebarDateKey || !dates.includes(selectedSidebarDateKey)) {
    selectedSidebarDateKey = getDefaultSidebarDateKey(dates);
  }
  const dateKey = selectedSidebarDateKey;

  if (!dateKey) {
    document.getElementById('sidebar').style.display = 'none';
    return;
  }

  const day = appData.schedule[dateKey];
  const results = appData.results || {};
  const liveScores = getSidebarLiveScores(dateKey);
  if (LIVE_SCORES_URL && !Object.prototype.hasOwnProperty.call(liveScoresByDate, dateKey)) {
    fetchLiveScores(dateKey);
  }

  const optionsHtml = dates.map(date => {
    const label = appData.schedule[date]?.label || date;
    const selected = date === dateKey ? ' selected' : '';
    return `<option value="${date}"${selected}>${esc(label)}</option>`;
  }).join('');
  document.getElementById('sidebar-date').innerHTML =
    `<select class="sidebar-date-select" aria-label="Select tournament date" onchange="setSidebarDate(this.value)">${optionsHtml}</select>`;

  const html = day.games.map(sg => {
    const g = GAMES[sg.id];
    if (!g) return '';
    const [t1, t2] = getTeams(sg.id, null, results);
    const s1 = g.tSeed, s2 = g.bSeed;
    const winner = results[sg.id];

    const logo1 = teamLogo(t1);
    const logo2 = teamLogo(t2);

    // Check for live scores from ESPN proxy
    const live1 = liveScores[t1];
    const live2 = liveScores[t2];
    const isLive = (live1 && live1.status === 'live') || (live2 && live2.status === 'live');
    const isESPNFinal = !winner && ((live1 && live1.status === 'final') || (live2 && live2.status === 'final'));
    const isFinal = winner || isESPNFinal;

    // Determine winner from ESPN data if data.json hasn't caught up
    let espnWinner = null;
    if (isESPNFinal && live1 && live2) {
      espnWinner = parseInt(live1.score) > parseInt(live2.score) ? t1 : t2;
    }
    const effectiveWinner = winner || espnWinner;

    const cls1 = effectiveWinner ? (effectiveWinner === t1 ? 'winner' : 'loser') : '';
    const cls2 = effectiveWinner ? (effectiveWinner === t2 ? 'winner' : 'loser') : '';

    // Show scores for live, ESPN-final, and data.json-final games
    const showScores = isLive || isFinal;
    const fallbackScore1 = sg.score1 != null ? String(sg.score1) : '';
    const fallbackScore2 = sg.score2 != null ? String(sg.score2) : '';
    const score1Val = live1?.score ?? fallbackScore1;
    const score2Val = live2?.score ?? fallbackScore2;
    const score1 = showScores && score1Val !== '' ? '<span class="sg-score">' + score1Val + '</span>' : '';
    const score2 = showScores && score2Val !== '' ? '<span class="sg-score">' + score2Val + '</span>' : '';

    let metaHtml;
    if (isFinal) {
      const detail = live1?.detail || live2?.detail || '';
      const finalLabel = detail.includes('OT') ? '✓ ' + esc(detail) : '✓ Final';
      metaHtml = '<span class="sg-final">' + finalLabel + '</span>';
    } else if (isLive) {
      const detail = (live1?.detail || live2?.detail || 'LIVE');
      metaHtml = '<span class="sg-live">' + esc(detail) + '</span>';
    } else {
      metaHtml = '<span class="sg-time">' + convertETtoLocal(sg.time) + '</span><span class="sg-tv">' + sg.tv + '</span>';
    }

    const rowCls = isFinal ? 'sg-item sg-done' : isLive ? 'sg-item sg-in-progress' : 'sg-item';

    return '<div class="' + rowCls + '">' +
      '<div class="sg-teams">' +
        '<div class="sg-team ' + cls1 + '">' +
          (logo1 ? '<img class="sg-logo" src="' + logo1 + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">' : '') +
          (s1 ? '<span class="sg-seed">' + s1 + '</span>' : '') +
          '<span>' + esc(t1) + '</span>' +
          score1 +
        '</div>' +
        '<div class="sg-team ' + cls2 + '">' +
          (logo2 ? '<img class="sg-logo" src="' + logo2 + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">' : '') +
          (s2 ? '<span class="sg-seed">' + s2 + '</span>' : '') +
          '<span>' + esc(t2) + '</span>' +
          score2 +
        '</div>' +
      '</div>' +
      '<div class="sg-meta">' + metaHtml + '</div>' +
    '</div>';
  }).join('');

  document.getElementById('sg-list').innerHTML = html || '<div style="padding:16px;font-family:var(--fm);font-size:16px;color:var(--muted)">No games scheduled</div>';
}

// ============================================================
// NEWS FEED
// ============================================================
async function fetchNews() {
  if (!LIVE_SCORES_URL) return;
  const feedEl = document.getElementById('news-feed');
  if (!feedEl) return;
  try {
    const res = await fetch(LIVE_SCORES_URL + '/news?_=' + Date.now());
    if (!res.ok) return;
    const data = await res.json();
    if (!data.articles || data.articles.length === 0) {
      feedEl.innerHTML = '<div class="news-loading">No news available</div>';
      return;
    }
    feedEl.innerHTML = data.articles.slice(0, 8).map(a => {
      const timeAgo = a.published ? getTimeAgo(a.published) : '';
      const thumb = a.image ? `<img class="news-thumb" src="${a.image}" alt="" loading="lazy" onerror="this.style.display='none'">` : '';
      const href = a.link ? ` href="${esc(a.link)}" target="_blank" rel="noopener"` : '';
      return `<a class="news-item"${href}>${thumb}<div class="news-text"><div class="news-headline">${esc(a.headline)}</div>${timeAgo ? `<div class="news-time">${timeAgo}</div>` : ''}</div></a>`;
    }).join('');
  } catch(e) {
    // Silent fail
  }
}

function getTimeAgo(dateStr) {
  try {
    const d = new Date(dateStr);
    const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return diffMin + 'm ago';
    if (diffMin < 1440) return Math.floor(diffMin / 60) + 'h ago';
    return Math.floor(diffMin / 1440) + 'd ago';
  } catch(e) { return ''; }
}

// ============================================================
// BOOT + AUTO-REFRESH
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  loadData();
  // Auto-refresh data.json every 60 seconds
  setInterval(() => {
    fetch('data.json?_=' + Date.now())
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        appData = data;
        renderPills();
        renderLeaderboard();
        renderSidebar();
        if (document.getElementById('view-bracket')?.classList.contains('active')) {
          renderBracket();
        }
      })
      .catch(() => {});
  }, 60000);
  // Poll live scores every 30 seconds (if Cloudflare Worker is configured)
  if (LIVE_SCORES_URL) {
    setInterval(() => {
      if (selectedSidebarDateKey) fetchLiveScores(selectedSidebarDateKey);
    }, 30000);
    fetchNews();
    setInterval(fetchNews, 300000); // refresh news every 5 minutes
  }
});
