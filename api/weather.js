export default async function handler(req, res) {
  const apiKey = process.env.OPENWEATHER_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=Criciuma,BR&units=metric&appid=${apiKey}&lang=pt_br`;

  const emojiClima = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'Haze': '🌫️',
    'Smoke': '🌫️',
  };

  try {
    const resposta = await fetch(url);
    const dados = await resposta.json();

    const temp = Math.round(dados.main.temp);
    const clima = dados.weather[0].main;
    const emoji = emojiClima[clima] || '🌡️';

    res.status(200).json({ clima: `${temp < 10 && temp >= 0 ? '0' + temp : temp} °C ${emoji}` });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar clima' });
  }
}