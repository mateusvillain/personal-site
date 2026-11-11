// Utilitários compartilhados entre as funções da pasta api/.
import { createHash, timingSafeEqual } from 'node:crypto'

// Comparação de strings em tempo constante (o hash iguala os tamanhos).
export function safeEqual(a, b) {
  const ha = createHash('sha256').update(String(a)).digest()
  const hb = createHash('sha256').update(String(b)).digest()
  return timingSafeEqual(ha, hb)
}

// Ícone por tipo de aparelho (ver deviceFromRequest em _unlocks.js).
export const DEVICE_ICON = { celular: '📱', tablet: '📱', computador: '💻' }
export const DEFAULT_DEVICE_ICON = '🖥️'
