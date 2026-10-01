import { useState, type FormEvent } from 'react'

interface MessageInputProps {
  disabled: boolean
  onSend: (text: string) => void
}

export function MessageInput({ disabled, onSend }: MessageInputProps) {
  const [text, setText] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const value = text.trim()
    if (!value) return
    onSend(value)
    setText('')
  }

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Введите сообщение"
        disabled={disabled}
      />
      <button type="submit" disabled={disabled || !text.trim()}>
        Отправить
      </button>
    </form>
  )
}
