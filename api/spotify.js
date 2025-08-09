const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

export default async function handler(req, res) {
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
  const access_token = tokenData.access_token;

  // 2. Consulta música atual
  const nowPlayingResponse = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { Authorization: `Bearer ${access_token}` }
  });

  if (nowPlayingResponse.status === 204 || nowPlayingResponse.status > 400) {
    return res.status(200).json({ isPlaying: false });
  }

  const song = await nowPlayingResponse.json();

  const track = {
    isPlaying: song.is_playing,
    title: song.item.name,
    artist: song.item.artists.map(a => a.name).join(', '),
    album: song.item.album.name,
    albumImageUrl: song.item.album.images[0].url,
    songUrl: song.item.external_urls.spotify
  };

  return res.status(200).json(track);
}
