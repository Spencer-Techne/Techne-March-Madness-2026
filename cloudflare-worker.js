/**
 * Cloudflare Worker: ESPN NCAA Scoreboard + News Proxy
 * 
 * Routes:
 *   /       → Live scores (scoreboard)
 *   /news   → Latest NCAAM headlines
 */

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Cache-Control': 'public, max-age=30'
    };

    try {
      if (path === '/news') {
        return handleNews(corsHeaders);
      }
      return handleScores(url, corsHeaders);
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};

async function handleScores(url, corsHeaders) {
  const espnUrl = 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=50';
  const date = url.searchParams.get('date');
  const finalUrl = date ? `${espnUrl}&dates=${date}` : espnUrl;

  const response = await fetch(finalUrl, {
    headers: { 'User-Agent': 'TechneMM/1.0' }
  });
  const data = await response.json();

  const games = (data.events || []).map(event => {
    const comp = event.competitions?.[0];
    if (!comp) return null;
    return {
      id: event.id,
      status: comp.status?.type?.name || 'STATUS_SCHEDULED',
      statusDetail: comp.status?.type?.shortDetail || '',
      clock: comp.status?.displayClock || '',
      period: comp.status?.period || 0,
      teams: (comp.competitors || []).map(c => ({
        name: c.team?.displayName || c.team?.shortDisplayName || '',
        shortName: c.team?.abbreviation || '',
        score: c.score || '0',
        seed: c.curatedRank?.current || null,
        winner: c.winner || false,
        logo: c.team?.logo || ''
      }))
    };
  }).filter(Boolean);

  return new Response(JSON.stringify({ games, timestamp: new Date().toISOString() }), {
    headers: corsHeaders
  });
}

async function handleNews(corsHeaders) {
  const espnUrl = 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/news?limit=15';

  const response = await fetch(espnUrl, {
    headers: { 'User-Agent': 'TechneMM/1.0' }
  });
  const data = await response.json();

  const articles = (data.articles || []).map(a => ({
    headline: a.headline || '',
    description: a.description || '',
    published: a.published || '',
    link: a.links?.web?.href || a.links?.api?.news?.href || '',
    image: a.images?.[0]?.url || '',
    type: a.type || 'Article'
  })).filter(a => a.headline);

  return new Response(JSON.stringify({ articles, timestamp: new Date().toISOString() }), {
    headers: { ...corsHeaders, 'Cache-Control': 'public, max-age=300' }
  });
}
