import { useState, type FormEvent } from 'react'
import type { Credentials } from '../types'

interface LoginFormProps {
  initial: Credentials
  onSubmit: (credentials: Credentials) => void
}

export function LoginForm({ initial, onSubmit }: LoginFormProps) {
  const [apiUrl, setApiUrl] = useState(initial.apiUrl)
  const [idInstance, setIdInstance] = useState(initial.idInstance)
  const [apiTokenInstance, setApiTokenInstance] = useState(initial.apiTokenInstance)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit({
      apiUrl: apiUrl.trim(),
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
    })
  }

  return (
    <form className="login" onSubmit={handleSubmit}>
      <h1>Чат MAX через GREEN-API</h1>
      <p className="hint">Введите учётные данные инстанса из личного кабинета GREEN-API.</p>

      <label>
        Адрес API (apiUrl)
        <input value={apiUrl} onChange={(event) => setApiUrl(event.target.value)} placeholder="https://api.green-api.com" required />
        <small className="field-hint">
          Смотрите в личном кабинете GREEN-API, может выглядеть как https://3100.api.green-api.com
        </small>
      </label>

      <label>
        idInstance
        <input value={idInstance} onChange={(event) => setIdInstance(event.target.value)} required />
      </label>

      <label>
        apiTokenInstance
        <input value={apiTokenInstance} onChange={(event) => setApiTokenInstance(event.target.value)} required />
      </label>

      <button type="submit">Подключиться</button>
    </form>
  )
}
