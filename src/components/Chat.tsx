import { useState, type FormEvent } from 'react'
import { checkAccount, normalizePhone } from '../api/greenApi'
import { useChat } from '../hooks/useChat'
import type { Credentials } from '../types'
import { MessageInput } from './MessageInput'
import { MessageList } from './MessageList'

interface ChatProps {
  credentials: Credentials
  onLogout: () => void
}

const STATE_LABELS: Record<string, string> = {
  authorized: 'авторизован',
  notAuthorized: 'не авторизован',
  starting: 'запускается',
  sleepMode: 'спящий режим',
  blocked: 'заблокирован',
  suspended: 'приостановлен',
  yellowCard: 'предупреждение',
}

export function Chat({ credentials, onLogout }: ChatProps) {
  const [recipient, setRecipient] = useState('')
  const [chatId, setChatId] = useState('')
  const [searching, setSearching] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const { messages, sending, error, stateInstance, stateError, send } = useChat(credentials, chatId)
  const stateLabel = stateError
    ? `ошибка: ${stateError}`
    : stateInstance
      ? STATE_LABELS[stateInstance] ?? stateInstance
      : 'проверка…'

  const handleStart = async (event: FormEvent) => {
    event.preventDefault()
    const phone = normalizePhone(recipient)
    if (phone.length < 11 || phone.length > 12) {
      setChatError('Введите номер в формате 79991234567 (РФ) или 375291234567 (РБ)')
      return
    }
    setSearching(true)
    setChatError(null)
    try {
      // chatId получателя в MAX — внутренний id, узнаём его по номеру.
      const account = await checkAccount(credentials, phone)
      if (!account.exist || !account.chatId) {
        setChatError('Аккаунт MAX с таким номером не найден')
        return
      }
      setChatId(account.chatId)
    } catch (cause) {
      setChatError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="chat">
      <header className="chat-header">
        <div>
          <strong>{chatId || 'Новый чат'}</strong>
          <span className="instance">
            инстанс {credentials.idInstance} ·{' '}
            <span className={`state state-${stateInstance || 'unknown'}`}>{stateLabel}</span>
          </span>
        </div>
        <button type="button" onClick={onLogout}>
          Выйти
        </button>
      </header>

      {chatId ? (
        <>
          <MessageList messages={messages} />
          {error && <p className="error">{error}</p>}
          <MessageInput disabled={sending} onSend={send} />
        </>
      ) : (
        <form className="new-chat" onSubmit={handleStart}>
          <label>
            Номер телефона получателя
            <input
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              placeholder="79991234567"
              required
            />
          </label>
          {chatError && <p className="error">{chatError}</p>}
          <button type="submit" disabled={searching}>
            {searching ? 'Поиск…' : 'Создать чат'}
          </button>
        </form>
      )}
    </div>
  )
}
