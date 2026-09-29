const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

const notPlaying = { isPlaying: false };

export default async function handler(req, res) {
  try {
    // 1. Pega novo access token usando o refresh token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token
      })
    });

    const tokenData = await tokenResponse.json();

    // Um token revogado deixa o player sumir sem aviso; registra para aparecer nos logs da Vercel.
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('[spotify] falha ao renovar token:', tokenResponse.status, tokenData.error, tokenData.error_description);
      return res.status(200).json(notPlaying);
    }

    // 2. Consulta música atual
    const nowPlayingResponse = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    if (nowPlayingResponse.status === 204) {
      return res.status(200).json(notPlaying);
    }

    if (!nowPlayingResponse.ok) {
      console.error('[spotify] falha ao consultar música atual:', nowPlayingResponse.status, await nowPlayingResponse.text());
      return res.status(200).json(notPlaying);
    }

    const song = await nowPlayingResponse.json();

    // Podcasts e anúncios chegam sem `item` de faixa.
    if (!song.item || song.currently_playing_type !== 'track') {
      return res.status(200).json(notPlaying);
    }

    const track = {
      isPlaying: song.is_playing,
      id: song.item.id,
      title: song.item.name,
      artist: song.item.artists.map(a => a.name).join(', '),
      album: song.item.album.name,
      albumImageUrl: song.item.album.images[0]?.url,
      songUrl: song.item.external_urls.spotify,
      progressMs: song.progress_ms,
      durationMs: song.item.duration_ms
    };

    return res.status(200).json(track);
  } catch (err) {
    console.error('[spotify] erro inesperado:', err);
    return res.status(200).json(notPlaying);
  }
}
