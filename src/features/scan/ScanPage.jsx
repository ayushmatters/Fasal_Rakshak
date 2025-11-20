import React, { useState, useCallback } from 'react'
import ScanResultCard from './ScanResultCard'
import useOfflineQueue from '../../hooks/useOfflineQueue'
import useNetworkStatus from '../../hooks/useNetworkStatus'
import { uploadScanImage, startScanProcessing, getScanResult } from '../../api/endpoints'

const ScanPage = () => {
  const [result, setResult] = useState(null)
  const [message, setMessage] = useState('')
  const online = useNetworkStatus()
  const { enqueue, drain, peek } = useOfflineQueue()

  const handleFile = useCallback(async (file) => {
    setMessage('')
    const payload = { name: file.name, size: file.size, type: file.type }
    if (!online) {
      enqueue(payload)
      setMessage('You are offline — upload queued and will be sent when online')
      return
    }

    try {
      setMessage('Uploading...')
      // Upload to server
      const resp = await uploadScanImage(file)
      const id = resp?.data?.id || resp?.data?.scan?._id
      setMessage('Upload accepted, processing...')
      await startScanProcessing(id)
      // Poll for result
      let attempts = 0
      const poll = async () => {
        attempts += 1
        const r = await getScanResult(id)
        if (r.data && r.data.status === 'complete') {
          setResult(r.data.result)
          setMessage('Scan completed')
        } else if (attempts < 10) {
          setTimeout(poll, 700)
        } else {
          setMessage('Scan still processing; please refresh later')
        }
      }
      poll()
    } catch (e) {
      setMessage('Upload failed — queued for retry')
      enqueue(payload)
    }
  }, [online, enqueue])

  React.useEffect(() => {
    let active = true
    if (online) {
      ;(async () => {
        try {
          await drain(async (payload) => {
            const r = await fakeUploader(payload)
            if (active) setResult(r)
          })
          setTimeout(() => { if (active) setMessage((q) => q || 'Queued uploads completed') }, 0)
        } catch (e) {}
      })()
    }
    return () => { active = false }
  }, [online, drain])

  const onInputChange = (e) => {
    const f = e.target.files && e.target.files[0]
    if (f) handleFile(f)
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold text-primary">Scan Crop</h2>
        <p className="text-sm text-gray-600 mt-1">Supported crops: Wheat, Rice, Potato, Tomato, etc.</p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-dashed p-4 rounded text-center">
            <input aria-label="file-input" type="file" onChange={onInputChange} className="w-full" />
            <div className="mt-2 text-sm text-gray-500">Upload Image</div>
          </div>
          <div className="border p-4 rounded">
            <div className="h-40 bg-gray-50 flex items-center justify-center text-gray-400">Preview image</div>
            <div className="mt-3 flex gap-2">
              <button className="px-3 py-2 bg-primary text-white rounded">Analyze Crop Disease</button>
              <button className="px-3 py-2 border rounded">Camera Capture</button>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <button onClick={() => {
            const q = peek()
            alert(`Queued items: ${q.length}`)
          }} className="text-xs text-gray-500">Show Queue</button>
        </div>

        {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
        {result && <ScanResultCard result={result} />}
      </div>
    </div>
  )
}

export default ScanPage
