'use client'

import { useState } from 'react'

export default function TestEnrollPage() {
  const [result, setResult] = useState('')

  const testEnroll = async () => {
    try {
      const res = await fetch('/api/student/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId: '69bc5d1f4bf0a71aeddc1657' })
      })
      const data = await res.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (err: any) {
      setResult('Error: ' + err.message)
    }
  }

  return (
    <div className="p-8">
      <h1>Test Enroll API</h1>
      <button onClick={testEnroll} className="bg-blue-500 text-white px-4 py-2 rounded">
        Test Enroll
      </button>
      <pre className="mt-4 bg-gray-100 p-4 rounded">{result}</pre>
    </div>
  )
}
