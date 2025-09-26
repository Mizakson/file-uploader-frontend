import { useEffect, useState } from 'react'

function App() {
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
      <h1>{dataContent}</h1>
    </>
  )
}

export default App
