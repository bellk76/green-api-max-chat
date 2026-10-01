import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

function stubGreenApi() {
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = String(input)
    if (url.includes('getStateInstance')) return Promise.resolve(jsonResponse({ stateInstance: 'authorized' }))
    if (url.includes('checkAccount')) return Promise.resolve(jsonResponse({ exist: true, chatId: '10000000' }))
    if (url.includes('sendMessage')) return Promise.resolve(jsonResponse({ idMessage: 'm1' }))
    if (url.includes('receiveNotification')) return Promise.resolve(new Response('', { status: 200 }))
    if (url.includes('deleteNotification')) return Promise.resolve(jsonResponse({}))
    return Promise.resolve(new Response('', { status: 404 }))
  })
  vi.stubGlobal('fetch', fetchMock)
}

beforeEach(() => {
  localStorage.clear()
  stubGreenApi()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Приложение чата MAX', () => {
  it('вход, создание чата по номеру и отправка сообщения', async () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText(/Адрес API/), { target: { value: 'https://3100.api.green-api.com' } })
    fireEvent.change(screen.getByLabelText('idInstance'), { target: { value: '310022753411' } })
    fireEvent.change(screen.getByLabelText('apiTokenInstance'), { target: { value: 'token' } })
    fireEvent.click(screen.getByRole('button', { name: 'Подключиться' }))

    expect(await screen.findByText('авторизован')).toBeTruthy()

    fireEvent.change(screen.getByLabelText('Номер телефона получателя'), { target: { value: '79991234567' } })
    fireEvent.click(screen.getByRole('button', { name: 'Создать чат' }))

    expect(await screen.findByText('10000000')).toBeTruthy()

    fireEvent.change(screen.getByPlaceholderText('Введите сообщение'), { target: { value: 'Привет, MAX!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Отправить' }))

    expect(await screen.findByText('Привет, MAX!')).toBeTruthy()
  })
})
