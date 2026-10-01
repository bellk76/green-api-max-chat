import { afterEach, describe, expect, it, vi } from 'vitest'
import { checkAccount, getStateInstance, normalizePhone, receiveNotification, sendMessage } from './greenApi'
import type { Credentials } from '../types'

const credentials: Credentials = {
  apiUrl: 'https://3100.api.green-api.com',
  idInstance: '310022753411',
  apiTokenInstance: 'token',
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('normalizePhone', () => {
  it('оставляет только цифры', () => {
    expect(normalizePhone('+7 (999) 123-45-67')).toBe('79991234567')
  })
})

describe('getStateInstance', () => {
  it('возвращает состояние инстанса', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(jsonResponse({ stateInstance: 'authorized' }))))
    await expect(getStateInstance(credentials)).resolves.toBe('authorized')
  })

  it('бросает ошибку с текстом от сервера (429)', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(jsonResponse({ description: 'Too many requests' }, 429))))
    await expect(getStateInstance(credentials)).rejects.toThrow('Too many requests')
  })
})

describe('checkAccount', () => {
  it('передаёт номер и возвращает chatId', async () => {
    const fetchMock = vi.fn((_input: RequestInfo | URL, _init?: RequestInit) =>
      Promise.resolve(jsonResponse({ exist: true, chatId: '10000000' })),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(checkAccount(credentials, '79991234567')).resolves.toEqual({ exist: true, chatId: '10000000' })

    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body))
    expect(body).toEqual({ phoneNumber: 79991234567 })
  })
})

describe('sendMessage', () => {
  it('возвращает idMessage', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(jsonResponse({ idMessage: 'm1' }))))
    await expect(sendMessage(credentials, '10000000', 'Привет')).resolves.toBe('m1')
  })
})

describe('receiveNotification', () => {
  it('возвращает null на пустой ответ', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response('', { status: 200 }))))
    await expect(receiveNotification(credentials)).resolves.toBeNull()
  })

  it('разбирает уведомление', async () => {
    const notification = { receiptId: 1, body: { typeWebhook: 'incomingMessageReceived' } }
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(jsonResponse(notification))))
    await expect(receiveNotification(credentials)).resolves.toEqual(notification)
  })
})
