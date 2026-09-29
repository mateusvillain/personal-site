/**
 * Letra da música tocando agora, usada no card do Spotify da home.
 *
 * GET /api/lyrics?title=&artist=&album=&duration=<segundos>
 * Resposta: { synced: [{ time: <ms>, text }] | null, plain: string | null, instrumental: boolean }
 *
 * O provedor atual é o LRCLIB (https://lrclib.net), que é público e não exige
 * chave. Para trocar de provedor, basta outra função com o mesmo retorno de
 * `fetchFromLrclib`.
 */

const LRCLIB_URL = 'https://lrclib.net/api';
// O LRCLIB pede um User-Agent identificando o app.
const USER_AGENT = 'mateusvillain.com (https://www.mateusvillain.com)';

const empty = { synced: null, plain: null, instrumental: false };

/** Converte LRC ("[01:23.45] texto") em linhas com tempo em milissegundos. */
function parseLrc(lrc) {
  const lines = [];

  for (const raw of lrc.split('\n')) {
    const match = raw.match(/^\[(\d+):(\d+(?:\.\d+)?)\](.*)$/);
    if (!match) continue;

    const time = Math.round((Number(match[1]) * 60 + Number(match[2])) * 1000);
    lines.push({ time, text: match[3].trim() });
  }

  return lines.length ? lines : null;
}

async function lrclib(path, params) {
  const response = await fetch(`${LRCLIB_URL}${path}?${new URLSearchParams(params)}`, {
    headers: { 'User-Agent': USER_AGENT }
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`LRCLIB ${path} respondeu ${response.status}`);

  return response.json();
}

async function fetchFromLrclib({ title, artist, album, duration }) {
  // Busca exata primeiro (exige duração com margem de ~2s); se falhar, cai na busca aberta.
  let record = await lrclib('/get', {
    track_name: title,
    artist_name: artist,
    ...(album && { album_name: album }),
    ...(duration && { duration })
  });

  if (!record) {
    const results = await lrclib('/search', { track_name: title, artist_name: artist });
    // A busca é aberta: descarta gravações de outra duração (ao vivo, versão estendida),
    // senão a letra sincronizada sai fora do tempo.
    const matches = duration
      ? results?.filter(r => Math.abs(r.duration - Number(duration)) <= 2)
      : results;
    record = matches?.find(r => r.syncedLyrics) ?? matches?.[0] ?? null;
  }

  if (!record) return empty;

  return {
    synced: record.syncedLyrics ? parseLrc(record.syncedLyrics) : null,
    plain: record.plainLyrics ?? null,
    instrumental: Boolean(record.instrumental)
  };
}

export default async function handler(req, res) {
  const { title, artist, album, duration } = req.query;

  if (!title || !artist) {
    return res.status(400).json({ error: 'Parâmetros title e artist são obrigatórios.' });
  }

  try {
    const lyrics = await fetchFromLrclib({ title, artist, album, duration });

    // A letra de uma faixa não muda; deixa a CDN guardar por um dia.
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json(lyrics);
  } catch (err) {
    console.error('[lyrics] erro ao buscar letra:', err);
    return res.status(200).json(empty);
  }
}
