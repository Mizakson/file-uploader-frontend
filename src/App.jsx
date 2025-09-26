import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    const dataFetchTest = async () => {
      try {
        const response = await fetch(`${API_URL}/api/test`)

        if (!response.ok) {
          throw new Error('HTTP Error: Status ', response.status)
        }

        let data = await response.json()
        console.log(data)
        setData(data)
        setError(null)

      } catch (err) {
        setError(err.message)
        console.error('Error fetching data: ', err.message)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    dataFetchTest()

  }, [API_URL])

  let dataContent

  if (loading) {
    dataContent = <p>Loading data...</p>
  } else if (error) {
    dataContent = <p style={{ color: 'red' }}>Error fetching data: {error}</p>
  } else if (data && data.message) {
    dataContent = <p>{data.message}</p>
  } else {
    dataContent = <p>No data recieved.</p>
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <h2>{dataContent}</h2>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
