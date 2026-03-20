/**
 * Cloudflare Worker: ESPN NCAA Scoreboard Proxy
 * 
 * Proxies ESPN's public scoreboard API with CORS headers
 * so the bracket challenge page can fetch live scores client-side.
 * 
 * Deploy to Cloudflare Workers (free tier: 100k requests/day)
 * 
 * Setup:
 * 1. Go to dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. Paste this code → Deploy
 * 3. Note the worker URL (e.g. https://espn-scores.your-subdomain.workers.dev)
 * 4. Update LIVE_SCORES_URL in app.js with your worker URL
 */

export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Only allow scoreboard requests
    const espnUrl = 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=50';
    
    // Add date param if provided
    const date = url.searchParams.get('date');
    const finalUrl = date ? `${espnUrl}&dates=${date}` : espnUrl;

    try {
      const response = await fetch(finalUrl, {
        headers: { 'User-Agent': 'TechneMM/1.0' }
      });
      
      const data = await response.json();
      
      // Slim down the response — only send what we need
      const games = (data.events || []).map(event => {
        const comp = event.competitions?.[0];
        if (!comp) return null;
        
        const status = comp.status?.type?.name || 'STATUS_SCHEDULED';
        const clock = comp.status?.displayClock || '';
        const period = comp.status?.period || 0;
        const statusDetail = comp.status?.type?.shortDetail || '';
        
        const teams = (comp.competitors || []).map(c => ({
          name: c.team?.displayName || c.team?.shortDisplayName || '',
          shortName: c.team?.abbreviation || '',
          score: c.score || '0',
          seed: c.curatedRank?.current || null,
          winner: c.winner || false,
          logo: c.team?.logo || ''
        }));
        
        return {
          id: event.id,
          status,
          statusDetail,
          clock,
          period,
          teams
        };
      }).filter(Boolean);

      return new Response(JSON.stringify({ games, timestamp: new Date().toISOString() }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Cache-Control': 'public, max-age=30'
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};
