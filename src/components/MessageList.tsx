import type { ChatMessage } from '../types'

interface MessageListProps {
  messages: ChatMessage[]
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return <p className="empty">Сообщений пока нет</p>
  }

  return (
    <div className="messages">
      {messages.map((message) => (
        <div key={message.id} className={message.outgoing ? 'bubble bubble-out' : 'bubble bubble-in'}>
          <span className="bubble-text">{message.text}</span>
          <span className="bubble-time">{formatTime(message.timestamp)}</span>
        </div>
      ))}
    </div>
  )
}
