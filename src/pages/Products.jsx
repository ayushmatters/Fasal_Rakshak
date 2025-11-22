import React, { useState, useEffect } from 'react'
import SectionContainer from '../components/SectionContainer'
import { getProducts } from '../api/endpoints'

const ProductCard = ({ product }) => (
  <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
    {product.image && <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded mb-3" />}
    <div className="font-semibold text-lg">{product.name}</div>
    <div className="text-sm text-gray-600 mt-1">{product.description}</div>
    <div className="mt-2 text-emerald-600 font-semibold">₹{product.price}</div>
    <div className="mt-3">
      <button className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-emerald-700 transition-colors">
        Add to Cart
      </button>
    </div>
  </div>
)

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const res = await getProducts()
        setProducts(res?.data || [])
        setError(null)
      } catch (err) {
        setError('Failed to load products')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  return (
    <SectionContainer>
      <h2 className="text-xl font-semibold text-primary">Agri Products</h2>
      {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
      
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center text-gray-500">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">No products available</div>
        ) : (
          products.map((p) => <ProductCard key={p._id || p.id} product={p} />)
        )}
      </div>
    </SectionContainer>
  )
}

export default Products
