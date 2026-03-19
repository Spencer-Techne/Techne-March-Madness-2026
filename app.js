
// ============================================================
// BRACKET STRUCTURE — hardcoded, doesn't change
// ============================================================
const GAMES = {
  FF1: { round:'ff',  top:'NC State',     tSeed:11, bot:'Texas',         bSeed:11, feedsTo:'W5' },
  FF2: { round:'ff',  top:'UMBC',         tSeed:16, bot:'Howard',        bSeed:16, feedsTo:'M1' },
  FF3: { round:'ff',  top:'SMU',          tSeed:11, bot:'Miami (OH)',     bSeed:11, feedsTo:'M5' },
  FF4: { round:'ff',  top:'Prairie View', tSeed:16, bot:'Lehigh',        bSeed:16, feedsTo:'S1' },

  E1: { round:'r1', region:'east',    top:'Duke',         tSeed:1,  bot:'Siena',         bSeed:16 },
  E2: { round:'r1', region:'east',    top:'Ohio St.',     tSeed:8,  bot:'TCU',           bSeed:9  },
  E3: { round:'r1', region:'east',    top:"St. John's",   tSeed:5,  bot:'UNI',           bSeed:12 },
  E4: { round:'r1', region:'east',    top:'Kansas',       tSeed:4,  bot:'Cal Baptist',   bSeed:13 },
  E5: { round:'r1', region:'east',    top:'Louisville',   tSeed:6,  bot:'South Florida', bSeed:11 },
  E6: { round:'r1', region:'east',    top:'Michigan St.', tSeed:3,  bot:'N. Dakota St.', bSeed:14 },
  E7: { round:'r1', region:'east',    top:'UCLA',         tSeed:7,  bot:'UCF',           bSeed:10 },
  E8: { round:'r1', region:'east',    top:'UConn',        tSeed:2,  bot:'Furman',        bSeed:15 },

  E9:  { round:'r2',  region:'east',    src:['E1','E2']   },
  E10: { round:'r2',  region:'east',    src:['E3','E4']   },
  E11: { round:'r2',  region:'east',    src:['E5','E6']   },
  E12: { round:'r2',  region:'east',    src:['E7','E8']   },
  E13: { round:'s16', region:'east',    src:['E9','E10']  },
  E14: { round:'s16', region:'east',    src:['E11','E12'] },
  E15: { round:'e8',  region:'east',    src:['E13','E14'] },

  W1: { round:'r1', region:'west',    top:'Arizona',    tSeed:1,  bot:'LIU',           bSeed:16 },
  W2: { round:'r1', region:'west',    top:'Villanova',  tSeed:8,  bot:'Utah St.',      bSeed:9  },
  W3: { round:'r1', region:'west',    top:'Wisconsin',  tSeed:5,  bot:'High Point',    bSeed:12 },
  W4: { round:'r1', region:'west',    top:'Arkansas',   tSeed:4,  bot:'Hawaii',        bSeed:13 },
  W5: { round:'r1', region:'west',    top:'BYU',        tSeed:6,  bot:null,            bSeed:11, ffSrc:'FF1' },
  W6: { round:'r1', region:'west',    top:'Gonzaga',    tSeed:3,  bot:'Kennesaw St.',  bSeed:14 },
  W7: { round:'r1', region:'west',    top:'Miami (FL)', tSeed:7,  bot:'Missouri',      bSeed:10 },
  W8: { round:'r1', region:'west',    top:'Purdue',     tSeed:2,  bot:'Queens',        bSeed:15 },

  W9:  { round:'r2',  region:'west',    src:['W1','W2']   },
  W10: { round:'r2',  region:'west',    src:['W3','W4']   },
  W11: { round:'r2',  region:'west',    src:['W5','W6']   },
  W12: { round:'r2',  region:'west',    src:['W7','W8']   },
  W13: { round:'s16', region:'west',    src:['W9','W10']  },
  W14: { round:'s16', region:'west',    src:['W11','W12'] },
  W15: { round:'e8',  region:'west',    src:['W13','W14'] },

  M1: { round:'r1', region:'midwest', top:'Michigan',   tSeed:1,  bot:null,            bSeed:16, ffSrc:'FF2' },
  M2: { round:'r1', region:'midwest', top:'Georgia',    tSeed:8,  bot:'Saint Louis',   bSeed:9  },
  M3: { round:'r1', region:'midwest', top:'Texas Tech', tSeed:5,  bot:'Akron',         bSeed:12 },
  M4: { round:'r1', region:'midwest', top:'Alabama',    tSeed:4,  bot:'Hofstra',       bSeed:13 },
  M5: { round:'r1', region:'midwest', top:'Tennessee',  tSeed:6,  bot:null,            bSeed:11, ffSrc:'FF3' },
  M6: { round:'r1', region:'midwest', top:'Virginia',   tSeed:3,  bot:'Wright St.',    bSeed:14 },
  M7: { round:'r1', region:'midwest', top:'Kentucky',   tSeed:7,  bot:'Santa Clara',   bSeed:10 },
  M8: { round:'r1', region:'midwest', top:'Iowa St.',   tSeed:2,  bot:'Tennessee St.', bSeed:15 },

  M9:  { round:'r2',  region:'midwest', src:['M1','M2']   },
  M10: { round:'r2',  region:'midwest', src:['M3','M4']   },
  M11: { round:'r2',  region:'midwest', src:['M5','M6']   },
  M12: { round:'r2',  region:'midwest', src:['M7','M8']   },
  M13: { round:'s16', region:'midwest', src:['M9','M10']  },
  M14: { round:'s16', region:'midwest', src:['M11','M12'] },
  M15: { round:'e8',  region:'midwest', src:['M13','M14'] },

  S1: { round:'r1', region:'south',   top:'Florida',     tSeed:1,  bot:null,           bSeed:16, ffSrc:'FF4' },
  S2: { round:'r1', region:'south',   top:'Clemson',     tSeed:8,  bot:'Iowa',         bSeed:9  },
  S3: { round:'r1', region:'south',   top:'Vanderbilt',  tSeed:5,  bot:'McNeese',      bSeed:12 },
  S4: { round:'r1', region:'south',   top:'Nebraska',    tSeed:4,  bot:'Troy',         bSeed:13 },
  S5: { round:'r1', region:'south',   top:'N. Carolina', tSeed:6,  bot:'VCU',          bSeed:11 },
  S6: { round:'r1', region:'south',   top:'Illinois',    tSeed:3,  bot:'Penn',         bSeed:14 },
  S7: { round:'r1', region:'south',   top:"Saint Mary's",tSeed:7,  bot:'Texas A&M',    bSeed:10 },
  S8: { round:'r1', region:'south',   top:'Houston',     tSeed:2,  bot:'Idaho',        bSeed:15 },

  S9:  { round:'r2',  region:'south',   src:['S1','S2']   },
  S10: { round:'r2',  region:'south',   src:['S3','S4']   },
  S11: { round:'r2',  region:'south',   src:['S5','S6']   },
  S12: { round:'r2',  region:'south',   src:['S7','S8']   },
  S13: { round:'s16', region:'south',   src:['S9','S10']  },
  S14: { round:'s16', region:'south',   src:['S11','S12'] },
  S15: { round:'e8',  region:'south',   src:['S13','S14'] },

  FF5: { round:'ff2', label:'East vs South',    src:['E15','S15'] },
  FF6: { round:'ff2', label:'West vs Midwest',  src:['W15','M15'] },
  NC:  { round:'nc',  label:'National Championship', src:['FF5','FF6'] }
};

const RG = {
  east:    { r1:['E1','E2','E3','E4','E5','E6','E7','E8'], r2:['E9','E10','E11','E12'], s16:['E13','E14'], e8:['E15'] },
  west:    { r1:['W1','W2','W3','W4','W5','W6','W7','W8'], r2:['W9','W10','W11','W12'], s16:['W13','W14'], e8:['W15'] },
  midwest: { r1:['M1','M2','M3','M4','M5','M6','M7','M8'], r2:['M9','M10','M11','M12'], s16:['M13','M14'], e8:['M15'] },
  south:   { r1:['S1','S2','S3','S4','S5','S6','S7','S8'], r2:['S9','S10','S11','S12'], s16:['S13','S14'], e8:['S15'] }
};

const RLABELS = { ff:'First Four', r1:'Round of 64', r2:'Round of 32', s16:'Sweet 16', e8:'Elite 8', ff2:'Final Four', nc:'Championship' };
const RPTS    = { r1:10, r2:20, s16:40, e8:80, ff2:160, nc:320 };
const RSHORT  = { r1:'R64', r2:'R32', s16:'S16', e8:'E8', ff2:'FF', nc:'NC' };

// ============================================================
// STATE
// ============================================================
let appData = null;
let wiz = { step:0, name:'', picks:{} };
let prevRanks = {}; // track previous ranks for arrows

const WSTEPS = [
  { title:'Who Are You?',          type:'name' },
  { title:'First Four',            type:'games', games:['FF1','FF2','FF3','FF4'],                         sub:'Play-in round — pick the survivors' },
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

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ============================================================
// NAVIGATION
// ============================================================
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  document.getElementById('nav-'  + name).classList.add('active');
}

// ============================================================
// ROUND PILLS
// ============================================================
function renderPills() {
  const results = appData?.results || {};
  const done = new Set(Object.keys(results).map(id => GAMES[id]?.round).filter(Boolean));
  const rounds = ['ff','r1','r2','s16','e8','ff2','nc'];
  const html = rounds.map(r => {
    const cls = done.has(r) ? 'rpill-done' : 'rpill-soon';
    return `<div class="rpill ${cls}">${RLABELS[r]}</div>`;
  }).join('');
  document.getElementById('round-pills').innerHTML = html;

  const played = Object.keys(results).length;
  document.getElementById('lb-meta').textContent = `${played} game${played===1?'':'s'} complete · Last updated ${appData?.meta?.updated || '—'}`;
}

// ============================================================
// BRACKET SELECT + NAV HELPER
// ============================================================
function populateBktSelect() {
  if (!appData) return;
  const sel = document.getElementById('bkt-select');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Choose a participant —</option>' +
    appData.participants.map(p =>
      '<option value="' + p.id + '">' + esc(p.name) + (p.type==='ai'?' (AI)':'') + '</option>'
    ).join('');
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

  const rows = appData.participants.map(p => ({
    ...p, sc: score(p.picks, results), acc: accuracy(p.picks, results)
  }));

  rows.sort((a,b) => {
    const aH = hasPicks(a), bH = hasPicks(b);
    if (aH && !bH) return -1;
    if (!aH && bH) return 1;
    return b.sc.total - a.sc.total;
  });

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

  // === BEST PICK / WORST MISS CALLOUTS ===
  const calloutsEl = document.getElementById('lb-callouts');
  const playedGames = Object.keys(results).filter(gid => GAMES[gid] && RPTS[GAMES[gid].round]);
  if (playedGames.length > 0) {
    // Best pick: highest point single correct pick, with who got it
    let bestPick = null;
    let bestPts = 0;
    let bestWho = [];
    let worstGame = null;
    let worstMissCount = 0;
    for (const gid of playedGames) {
      const g = GAMES[gid];
      const pts = RPTS[g.round] || 0;
      let gotIt = [], missedIt = [];
      rows.forEach(p => {
        if (!hasPicks(p)) return;
        if (p.picks[gid] === results[gid]) gotIt.push(p.name);
        else missedIt.push(p.name);
      });
      // Best pick = fewest people got it right AND high points
      if (gotIt.length > 0 && gotIt.length <= 3 && pts >= bestPts) {
        bestPts = pts; bestPick = gid; bestWho = gotIt;
      }
      // Worst miss = most people got it wrong
      if (missedIt.length > worstMissCount) {
        worstMissCount = missedIt.length; worstGame = gid;
      }
    }
    let calloutsHtml = '<div class="lb-callouts">';
    if (bestPick && bestWho.length > 0 && bestWho.length < rows.filter(p=>hasPicks(p)).length) {
      calloutsHtml += `<div class="callout"><div class="callout-icon">🔥</div><div class="callout-label">Best Pick</div><div class="callout-text">${bestWho.join(', ')}</div><div class="callout-sub">Called ${esc(results[bestPick])} in ${bestPick} (+${bestPts} pts)</div></div>`;
    }
    if (worstGame && worstMissCount > rows.filter(p=>hasPicks(p)).length / 2) {
      const totalWithPicks = rows.filter(p=>hasPicks(p)).length;
      calloutsHtml += `<div class="callout"><div class="callout-icon">💀</div><div class="callout-label">Biggest Miss</div><div class="callout-text">${worstMissCount} of ${totalWithPicks} wrong</div><div class="callout-sub">${esc(results[worstGame])} won ${worstGame}</div></div>`;
    }
    calloutsHtml += '</div>';
    calloutsEl.innerHTML = (bestPick || worstGame) ? calloutsHtml : '';
  } else { calloutsEl.innerHTML = ''; }

  // === LEADERBOARD ROWS ===
  const RORDER = ['r1','r2','s16','e8','ff2','nc'];
  let rank = 0;
  const newRanks = {};
  const html = rows.map((p, i) => {
    const has = hasPicks(p);
    if (has) rank++;
    const rankDisp = has ? rank : '—';
    const rankCls  = has ? (rank===1?'r1':rank===2?'r2':rank===3?'r3':'') : '';
    const aiCls    = p.type==='ai' ? 'ai' : '';

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
  const champColor = actual ? (champ===actual?'var(--green)':'var(--red)') : (p.color||'var(--orange)');
  const champHtml = `<div class="champ-display">
    <div class="champ-lbl">${actual?'🏆 Actual Champion':'🎯 Predicted Champion'}</div>
    <div class="champ-team" style="color:${champColor}">${esc(champ)||'Not picked'}</div>
    ${actual&&champ!==actual?`<div style="margin-top:8px;font-family:var(--fm);font-size:16px;color:var(--muted)">Actual: ${esc(actual)}</div>`:''}
  </div>`;

  el.innerHTML = statsHtml + regHtml + ffHtml + champHtml;
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
let pendingResults = {}; // changes not yet pushed

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
      }
    }
  } catch(e) {}
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
  const results  = { ...appData.results, ...pendingResults };
  const container = document.getElementById('admin-rounds');

  container.innerHTML = ROUND_ORDER_ADMIN.map(rnd => {
    const pts = RPTS[rnd.key] ? `${RPTS[rnd.key]} pts/pick` : '';
    const gamesHtml = rnd.games.map(gid => {
      const [t1,t2] = getTeams(gid, null, results);
      const winner  = results[gid];
      const isPend  = pendingResults[gid];
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
          <button class="team-btn ${btn1cls}" onclick="setResult('${gid}','${esc(t1)}')" ${tbd?'disabled':''}>
            ${s1?`<span class="tseed">#${s1}</span>`:''}${esc(t1)}
          </button>
          <span class="admin-vs">vs</span>
          <button class="team-btn ${btn2cls}" onclick="setResult('${gid}','${esc(t2)}')" ${tbd?'disabled':''}>
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
  delete pendingResults[gid];
  if (appData?.results?.[gid]) delete appData.results[gid]; // remove from base too if clearing committed
  renderAdminRounds();
  updatePushBar();
}

function updatePushBar() {
  const n = Object.keys(pendingResults).length;
  const btn = document.getElementById('push-btn');
  const pending = document.getElementById('push-pending');
  btn.disabled = n === 0;
  pending.innerHTML = n > 0 
    ? `<strong>${n}</strong> pending result${n===1?'':'s'} — not yet saved`
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
    toggleGhConfig();
    setGhStatus('err','Configure GitHub first');
    return;
  }

  // Build confirmation summary
  const resultKeys = Object.keys(pendingResults).filter(k => k !== '__names_updated');
  if (resultKeys.length > 0) {
    const summary = resultKeys.map(gid => `${gid}: ${pendingResults[gid]}`).join('\n');
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
  const newResults = { ...(appData.results || {}), ...pendingResults };
  const newData    = { ...appData, results: newResults, meta: { ...appData.meta, updated: new Date().toISOString().slice(0,10) } };

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
    setTimeout(() => { statusEl.textContent=''; statusEl.className='push-status'; }, 4000);

  } catch(err) {
    statusEl.textContent = '✗ ' + err.message;
    statusEl.className   = 'push-status err';
    btn.disabled = false;
    console.error(err);
  }
}

// ============================================================
// SIDEBAR — TODAY'S GAMES
// ============================================================
const LOGO_MAP = {
  'Duke':'150','Siena':'399','Ohio St.':'194','TCU':'2628','St. John\'s':'2599',
  'N. Iowa':'2460','Kansas':'2305','Cal Baptist':'2856','Louisville':'97',
  'South Florida':'58','Michigan St.':'127','N. Dakota St.':'2449','UCLA':'26',
  'UCF':'2116','UConn':'41','Furman':'231','Arizona':'12','LIU':'288',
  'Villanova':'2918','Utah St.':'328','Wisconsin':'275','High Point':'2314',
  'Arkansas':'8','Hawaii':'62','BYU':'252','Texas':'251','Gonzaga':'2250',
  'Kennesaw St.':'2320','Miami (FL)':'2390','Missouri':'142','Purdue':'2509',
  'Queens':'2514','Michigan':'130','Howard':'47','Georgia':'61','Saint Louis':'139',
  'Texas Tech':'2641','Akron':'2006','Alabama':'333','Hofstra':'2275',
  'Tennessee':'2633','Miami (OH)':'193','SMU':'2567','Virginia':'258',
  'Wright St.':'2750','Kentucky':'96','Santa Clara':'2541','Iowa St.':'66',
  'Tennessee St.':'2634','Florida':'57','Prairie View':'2504','Lehigh':'2329',
  'Clemson':'228','Iowa':'2294','Vanderbilt':'238','McNeese':'2377',
  'Nebraska':'158','Troy':'2653','N. Carolina':'153','VCU':'2670',
  'Illinois':'356','Penn':'219','Saint Mary\'s':'2535','Texas A&M':'245',
  'Houston':'248','Idaho':'70','NC State':'152','UMBC':'2378'
};

function teamLogo(name) {
  const id = LOGO_MAP[name];
  if (!id) return '';
  return 'https://a.espncdn.com/i/teamlogos/ncaa/500/' + id + '.png';
}

function renderSidebar() {
  if (!appData?.schedule) {
    document.getElementById('sidebar').style.display = 'none';
    return;
  }

  // Determine which day to show: today (ET), or closest upcoming
  const now = new Date();
  // Approximate ET offset (UTC-5 during EDT, UTC-4 during EST — March is EDT)
  const etOffset = -4;
  const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
  const etNow = new Date(utcMs + (etOffset * 3600000));
  const todayStr = etNow.toISOString().slice(0, 10);

  const dates = Object.keys(appData.schedule).sort();
  // Show today if available, otherwise show next upcoming, otherwise show most recent
  let dateKey = dates.find(d => d === todayStr)
    || dates.find(d => d > todayStr)
    || dates[dates.length - 1];

  if (!dateKey) {
    document.getElementById('sidebar').style.display = 'none';
    return;
  }

  const day = appData.schedule[dateKey];
  const results = appData.results || {};

  document.getElementById('sidebar-date').textContent = day.label;

  const html = day.games.map(sg => {
    const g = GAMES[sg.id];
    if (!g) return '';
    const [t1, t2] = getTeams(sg.id, null, results);
    const s1 = g.tSeed, s2 = g.bSeed;
    const winner = results[sg.id];

    const logo1 = teamLogo(t1);
    const logo2 = teamLogo(t2);

    const cls1 = winner ? (winner === t1 ? 'winner' : 'loser') : '';
    const cls2 = winner ? (winner === t2 ? 'winner' : 'loser') : '';

    const metaHtml = winner
      ? '<span class="sg-final">Final</span>'
      : '<span class="sg-time">' + sg.time + '</span><span class="sg-tv">' + sg.tv + '</span>';

    return '<div class="sg-item">' +
      '<div class="sg-teams">' +
        '<div class="sg-team ' + cls1 + '">' +
          (logo1 ? '<img class="sg-logo" src="' + logo1 + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">' : '') +
          (s1 ? '<span class="sg-seed">' + s1 + '</span>' : '') +
          '<span>' + esc(t1) + '</span>' +
        '</div>' +
        '<div class="sg-team ' + cls2 + '">' +
          (logo2 ? '<img class="sg-logo" src="' + logo2 + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">' : '') +
          (s2 ? '<span class="sg-seed">' + s2 + '</span>' : '') +
          '<span>' + esc(t2) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="sg-meta">' + metaHtml + '</div>' +
    '</div>';
  }).join('');

  document.getElementById('sg-list').innerHTML = html || '<div style="padding:16px;font-family:var(--fm);font-size:16px;color:var(--muted)">No games scheduled</div>';
}

// ============================================================
// BOOT + AUTO-REFRESH
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  loadData();
  // Auto-refresh every 60 seconds
  setInterval(() => {
    fetch('data.json?_=' + Date.now())
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        appData = data;
        renderPills();
        renderLeaderboard();
        renderSidebar();
      })
      .catch(() => {}); // silent fail on auto-refresh
  }, 60000);
});
