import type { Credentials, IncomingNotification } from '../types'

function endpoint(credentials: Credentials, method: string, suffix = ''): string {
  const base = credentials.apiUrl.replace(/\/+$/, '')
  return `${base}/waInstance${credentials.idInstance}/${method}/${credentials.apiTokenInstance}${suffix}`
}

async function readError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string; description?: string }
    return data.description || data.message || `HTTP ${response.status}`
  } catch {
    return `HTTP ${response.status}`
  }
}

export function normalizePhone(value: string): string {
  return value.replace(/\D/g, '')
}

export interface AccountCheck {
  exist: boolean
  chatId: string
}

// В MAX chatId — внутренний числовой id, а не номер телефона, поэтому получаем его у сервера.
export async function checkAccount(credentials: Credentials, phoneNumber: string): Promise<AccountCheck> {
  const response = await fetch(endpoint(credentials, 'checkAccount'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: Number(phoneNumber) }),
  })
  if (!response.ok) throw new Error(await readError(response))
  const data = (await response.json()) as { exist?: boolean; chatId?: string }
  return { exist: Boolean(data.exist), chatId: data.chatId ?? '' }
}

export async function sendMessage(credentials: Credentials, chatId: string, message: string): Promise<string> {
  const response = await fetch(endpoint(credentials, 'sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  })
  if (!response.ok) throw new Error(await readError(response))
  const data = (await response.json()) as { idMessage?: string }
  return data.idMessage ?? ''
}

export async function receiveNotification(credentials: Credentials): Promise<IncomingNotification | null> {
  const response = await fetch(endpoint(credentials, 'receiveNotification'))
  if (response.status === 400) return null
  if (!response.ok) throw new Error(await readError(response))
  const text = (await response.text()).trim()
  // Пустой ответ или "null" — очередь уведомлений пуста.
  if (!text || text === 'null') return null
  return JSON.parse(text) as IncomingNotification
}

export async function deleteNotification(credentials: Credentials, receiptId: number): Promise<void> {
  await fetch(endpoint(credentials, 'deleteNotification', `/${receiptId}`), { method: 'DELETE' })
}

export async function getStateInstance(credentials: Credentials): Promise<string> {
  const response = await fetch(endpoint(credentials, 'getStateInstance'))
  if (!response.ok) throw new Error(await readError(response))
  const data = (await response.json()) as { stateInstance?: string }
  return data.stateInstance ?? 'unknown'
}
