import React, { useState, useCallback, useRef } from 'react'
import ScanResultCard from './ScanResultCard'
import useOfflineQueue from '../../hooks/useOfflineQueue'
import useNetworkStatus from '../../hooks/useNetworkStatus'
import { uploadScanImage, startScanProcessing, getScanResult } from '../../api/endpoints'
import { uploadToCloudinary } from '../../utils/cloudinary'

const ScanPage = () => {
  const [result, setResult] = useState(null)
  const [message, setMessage] = useState('')
  const [preview, setPreview] = useState(null)
  const [showCamera, setShowCamera] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
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
      setMessage('Uploading to Cloudinary...')
      // Upload to Cloudinary directly
      const cloudinaryUrl = await uploadToCloudinary(file)
      setPreview(cloudinaryUrl)
      setMessage('Upload successful! Image ready for analysis.')
    } catch (e) {
      console.error('Upload error:', e)
      setMessage(`Upload failed: ${e.message}`)
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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      setShowCamera(true)
      // Ensure video element gets the stream
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(err => {
            setMessage('Error playing video: ' + err.message)
          })
        }
      }, 100)
    } catch (err) {
      console.error('Camera error:', err)
      setMessage('Camera access denied. Please allow camera permissions.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop())
    }
    setShowCamera(false)
  }

  const capturePhoto = async () => {
    if (canvasRef.current && videoRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob((blob) => {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
        setPreview(canvas.toDataURL())
        handleFile(file)
        stopCamera()
      }, 'image/jpeg', 0.95)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold text-primary">Scan Crop</h2>
        <p className="text-sm text-gray-600 mt-1">Supported crops: Wheat</p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-dashed p-4 rounded text-center">
            <input aria-label="file-input" type="file" onChange={onInputChange} className="w-full" />
            <div className="mt-2 text-sm text-gray-500">Upload Image</div>
          </div>
          <div className="border p-4 rounded">
            {!showCamera ? (
              <>
                <div className="h-40 bg-gray-50 flex items-center justify-center text-gray-400 rounded">
                  {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover rounded" /> : 'Preview image'}
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="px-3 py-2 bg-primary text-white rounded flex-1">Analyze Crop Disease</button>
                  <button onClick={startCamera} className="px-3 py-2 border rounded flex-1">Camera Capture</button>
                </div>
              </>
            ) : (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-40 bg-black rounded object-cover"
                  style={{ display: 'block' }}
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="mt-3 flex gap-2">
                  <button onClick={capturePhoto} className="px-3 py-2 bg-green-600 text-white rounded flex-1">Capture</button>
                  <button onClick={stopCamera} className="px-3 py-2 border rounded flex-1">Cancel</button>
                </div>
              </>
            )}
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
