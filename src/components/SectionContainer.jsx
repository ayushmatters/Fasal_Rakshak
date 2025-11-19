import React from 'react'

const SectionContainer = ({ children, className = '' }) => (
  <section className={`max-w-5xl mx-auto px-4 py-8 ${className}`}>{children}</section>
)

export default SectionContainer
