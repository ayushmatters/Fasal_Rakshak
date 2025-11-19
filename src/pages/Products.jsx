import React, { useState } from 'react'
import SectionContainer from '../components/SectionContainer'

const ProductCard = ({ p }) => (
  <div className="bg-white p-3 rounded shadow">
    <div className="font-medium">{p.name}</div>
    <div className="text-sm text-gray-600">₹{p.price}</div>
    <div className="mt-2"><button className="px-3 py-1 bg-primary text-white rounded">Add to Cart</button></div>
  </div>
)

const Products = () => {
  const [products] = useState([{ id:1, name:'Fertilizer A', price:499 }, { id:2, name:'Pesticide B', price:799 }])
  return (
    <SectionContainer>
      <h2 className="text-xl font-semibold text-primary">Agri Products</h2>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </SectionContainer>
  )
}

export default Products
