import { useEffect, useState } from 'react'
import { apiUrl } from './api'
import './App.css'

type Analytics = {
  activeUsers: number
  pageViews: number
  timestamp: string
}

function App() {
  const [data, setData] = useState<Analytics | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const res = await fetch(apiUrl('/api/analytics'))
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData(await res.json())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'fetch failed')
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="app">
      <h1>Real-Time Analytics</h1>
      {error && <p className="error">Error: {error}</p>}
      {data ? (
        <div className="stats">
          <div className="card">
            <span className="label">Active Users</span>
            <span className="value">{data.activeUsers}</span>
          </div>
          <div className="card">
            <span className="label">Page Views</span>
            <span className="value">{data.pageViews}</span>
          </div>
          <p className="ts">
            Updated: {new Date(data.timestamp).toLocaleTimeString()}
          </p>
        </div>
      ) : (
        !error && <p>Loading…</p>
      )}
    </div>
  )
}

export default App
