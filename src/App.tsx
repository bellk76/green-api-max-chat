import { useCallback, useState } from 'react'
import { Chat } from './components/Chat'
import { LoginForm } from './components/LoginForm'
import type { Credentials } from './types'

const STORAGE_KEY = 'green-api-credentials'

const EMPTY: Credentials = {
  apiUrl: 'https://api.green-api.com',
  idInstance: '',
  apiTokenInstance: '',
}

function loadCredentials(): Credentials {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<Credentials>) }
  } catch {
    return EMPTY
  }
}

export default function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(() => {
    const saved = loadCredentials()
    return saved.idInstance && saved.apiTokenInstance ? saved : null
  })

  const handleLogin = useCallback((next: Credentials) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setCredentials(next)
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setCredentials(null)
  }, [])

  return (
    <div className="app">
      {credentials ? (
        <Chat credentials={credentials} onLogout={handleLogout} />
      ) : (
        <LoginForm initial={loadCredentials()} onSubmit={handleLogin} />
      )}
    </div>
  )
}
