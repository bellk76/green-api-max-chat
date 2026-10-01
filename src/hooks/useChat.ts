import { useCallback, useEffect, useRef, useState } from 'react'
import { deleteNotification, getStateInstance, receiveNotification, sendMessage } from '../api/greenApi'
import type { ChatMessage, Credentials } from '../types'

const POLL_INTERVAL = 5000

export function useChat(credentials: Credentials, chatId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stateInstance, setStateInstance] = useState('')
  const [stateError, setStateError] = useState('')
  // Кэш актуального chatId: цикл опроса читает его, не пересоздавая эффект.
  const activeChat = useRef(chatId)

  useEffect(() => {
    activeChat.current = chatId
  }, [chatId])

  const refreshState = useCallback(async () => {
    try {
      setStateInstance(await getStateInstance(credentials))
      setStateError('')
    } catch (cause) {
      setStateInstance('unknown')
      setStateError(cause instanceof Error ? cause.message : String(cause))
    }
  }, [credentials])

  useEffect(() => {
    let cancelled = false
    getStateInstance(credentials)
      .then((value) => {
        if (cancelled) return
        setStateInstance(value)
        setStateError('')
      })
      .catch((cause) => {
        if (cancelled) return
        setStateInstance('unknown')
        setStateError(cause instanceof Error ? cause.message : String(cause))
      })
    return () => {
      cancelled = true
    }
  }, [credentials])

  useEffect(() => {
    let cancelled = false
    let timer: number | undefined

    // Цикл опроса уведомлений с паузой (ограничения частоты запросов GREEN-API).
    const poll = async () => {
      try {
        while (!cancelled) {
          const notification = await receiveNotification(credentials)
          if (cancelled) return
          if (!notification) break
          const { body, receiptId } = notification
          if (body.typeWebhook === 'incomingMessageReceived') {
            const text = body.messageData?.textMessageData?.textMessage
            const from = body.senderData?.chatId ?? ''
            if (text && from === activeChat.current) {
              setMessages((prev) => [
                ...prev,
                {
                  id: body.idMessage ?? String(receiptId),
                  chatId: from,
                  text,
                  outgoing: false,
                  timestamp: body.timestamp ?? Date.now(),
                },
              ])
            }
          }
          await deleteNotification(credentials, receiptId)
        }
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause))
      } finally {
        if (!cancelled) timer = window.setTimeout(poll, POLL_INTERVAL)
      }
    }

    void poll()

    return () => {
      cancelled = true
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [credentials])

  const send = useCallback(
    async (text: string) => {
      const value = text.trim()
      if (!value || !chatId) return
      setSending(true)
      setError(null)
      try {
        const id = await sendMessage(credentials, chatId, value)
        setMessages((prev) => [...prev, { id, chatId, text: value, outgoing: true, timestamp: Date.now() }])
        // Состояние могло измениться (авторизация, лимиты) — обновляем индикатор.
        void refreshState()
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : String(cause))
      } finally {
        setSending(false)
      }
    },
    [credentials, chatId, refreshState],
  )

  return { messages, sending, error, stateInstance, stateError, send }
}
