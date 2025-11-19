import { useCallback } from 'react'

const KEY = 'fasal-rakshak-upload-queue'

function readQueue() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

function writeQueue(q) {
  try { localStorage.setItem(KEY, JSON.stringify(q)) } catch (e) { }
}

export default function useOfflineQueue() {
  const enqueue = useCallback((payload) => {
    const q = readQueue()
    q.push({ id: Date.now(), payload })
    writeQueue(q)
  }, [])

  const drain = useCallback(async (uploader) => {
    const q = readQueue()
    if (!q.length) return
    for (const item of q.slice()) {
      try {
        // uploader should be an async fn that accepts payload
        // if it throws, stop draining
        // eslint-disable-next-line no-await-in-loop
        await uploader(item.payload)
        // remove item
        const current = readQueue().filter((x) => x.id !== item.id)
        writeQueue(current)
      } catch (e) {
        // stop on first failure
        break
      }
    }
  }, [])

  const peek = useCallback(() => readQueue(), [])

  return { enqueue, drain, peek }
}
