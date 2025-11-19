import React from 'react'

const PageHeader = ({ title, subtitle }) => (
  <div className="py-6 border-b mb-6">
    <div className="max-w-5xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-primary">{title}</h1>
      {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
    </div>
  </div>
)

export default PageHeader
