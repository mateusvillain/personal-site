// Aviso no Discord quando alguém digita a senha de um case (webhook).
// Sem DISCORD_WEBHOOK_URL, ou se o Discord falhar, nada acontece:
// o acesso ao case nunca depende do aviso.

import { DEVICE_ICON, DEFAULT_DEVICE_ICON } from './_shared.js'

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL

export async function notifyUnlock({ caseKey, label, locale, device, city, region, country, at }) {
  if (!WEBHOOK_URL) return

  const place = [city, region, country].filter(Boolean).join(', ') || 'local desconhecido'
  const time = new Date(at).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'short'
  })
  const details = [
    `📍 ${place}`,
    device && `${DEVICE_ICON[device] || DEFAULT_DEVICE_ICON} ${device}`,
    locale && `🌐 ${locale.toUpperCase()}`,
    `🕒 ${time}`
  ].filter(Boolean)

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `🔓 **${label}** abriu o case **${caseKey}**\n${details.join(' · ')}`,
        // nunca menciona ninguém, mesmo se algum campo trouxer @
        allowed_mentions: { parse: [] }
      }),
      signal: AbortSignal.timeout(2000)
    })
    if (!res.ok) throw new Error(`Discord HTTP ${res.status}`)
  } catch (error) {
    console.error('Falha ao avisar no Discord:', error.message)
  }
}
