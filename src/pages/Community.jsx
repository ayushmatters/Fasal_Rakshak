import React, { useState } from 'react'
import SectionContainer from '../components/SectionContainer'

const PostCard = ({ post }) => (
  <div className="bg-white p-3 rounded shadow">
    <div className="font-medium">{post.title}</div>
    <div className="text-sm text-gray-600 mt-1">{post.body}</div>
  </div>
)

const Community = () => {
  const [posts, setPosts] = useState([{ id: 1, title: 'Wheat disease?', body: 'Leaves turning brown...' }])
  const [open, setOpen] = useState(false)
  const [body, setBody] = useState('')

  const create = () => {
    setPosts((p) => [{ id: Date.now(), title: body.slice(0, 30) || 'Question', body }, ...p])
    setBody('')
    setOpen(false)
  }

  return (
    <div>
      <SectionContainer>
        <h2 className="text-xl font-semibold text-primary">Community</h2>
        <div className="mt-4 space-y-3">
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      </SectionContainer>

      <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 bg-primary text-white p-3 rounded-full shadow-lg">Ask</button>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-4 rounded max-w-md w-full">
            <h3 className="font-semibold">Ask a Question</h3>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} className="w-full p-2 border mt-2" />
            <div className="mt-2 flex justify-end gap-2"><button onClick={() => setOpen(false)} className="px-3 py-1">Cancel</button><button onClick={create} className="px-3 py-1 bg-primary text-white rounded">Post</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Community
