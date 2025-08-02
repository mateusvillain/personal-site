export default async function handler(req, res) {
  const apiKey = process.env.TIMEZONEDB_KEY;
  const url = `https://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey}&format=json&by=zone&zone=America/Sao_Paulo`;

  try {
    const resposta = await fetch(url);
    const dados = await resposta.json();

    const data = new Date(dados.formatted);
    const offset = dados.gmtOffset / 3600;
    const fuso = `UTC${offset >= 0 ? `+${offset}` : offset}`;

    const horas = data.getHours();
    const minutos = data.getMinutes().toString().padStart(2, '0');
    const horas12 = horas % 12 || 12;
    const ampm = horas >= 12 ? 'PM' : 'AM';

    const horaFinal = `${horas12}:${minutos} ${ampm} ${fuso}`;

    res.status(200).json({ hora: horaFinal });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar hora' });
  }
}
