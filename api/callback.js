export default async function handler(req, res) {
  const code = req.query.code || null;

  if (!code) {
    return res.status(400).send('Código não encontrado.');
  }

  const authString = Buffer.from(
    process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
  ).toString('base64');

  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + authString,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code,
        redirect_uri: `https://https://personal-site-kohl-psi.vercel.app/api/callback`,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();

    return res.status(200).json(tokenData);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Erro ao obter token.');
  }
}
