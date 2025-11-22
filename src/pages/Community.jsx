import React, { useState, useEffect } from 'react'
import SectionContainer from '../components/SectionContainer'
import { getCommunityPosts, createPost } from '../api/endpoints'
import { useAuth } from '../app/AuthProvider'

const PostCard = ({ post }) => (
  <div className="bg-white p-4 rounded shadow">
    <div className="font-medium text-lg">{post.title}</div>
    <div className="text-sm text-gray-500 mt-1">{post.author?.name || 'Anonymous'}</div>
    <div className="text-sm text-gray-600 mt-2">{post.body}</div>
    {post.createdAt && <div className="text-xs text-gray-400 mt-2">{new Date(post.createdAt).toLocaleDateString()}</div>}
  </div>
)

const Community = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({ title: '', body: '' })
  const [submitting, setSubmitting] = useState(false)

  // Fetch posts on mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const res = await getCommunityPosts()
        setPosts(res?.data || [])
        setError(null)
      } catch (err) {
        setError('Failed to load posts')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.body.trim()) {
      setError('Title and body are required')
      return
    }

    try {
      setSubmitting(true)
      const res = await createPost(formData)
      if (res?.data) {
        setPosts([res.data, ...posts])
        setFormData({ title: '', body: '' })
        setOpen(false)
        setError(null)
      }
    } catch (err) {
      setError('Failed to create post')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <SectionContainer>
        <h2 className="text-xl font-semibold text-primary">Community</h2>
        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
        
        <div className="mt-4 space-y-3">
          {loading ? (
            <div className="text-center text-gray-500">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-center text-gray-500">No posts yet. Be the first to ask!</div>
          ) : (
            posts.map((p) => <PostCard key={p._id || p.id} post={p} />)
          )}
        </div>
      </SectionContainer>

      {user && (
        <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-emerald-700 transition-colors">
          Ask
        </button>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 shadow-xl">
            <h3 className="font-semibold text-lg">Ask a Question</h3>
            <input
              type="text"
              placeholder="Question title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded mt-3"
            />
            <textarea
              placeholder="Describe your question..."
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded mt-3 h-24"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-emerald-700 disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Community
