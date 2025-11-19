import React from 'react'

/**
 * Card component with optional header and footer slots.
 * Keeps existing structure; styling uses tokens and utilities.
 */
const Card = ({ children, header, footer, className = '' }) => (
  <div className={`card ${className}`}>
    {header && <div className="mb-3">{header}</div>}
    <div>{children}</div>
    {footer && <div className="mt-3 text-sm text-muted">{footer}</div>}
  </div>
)

export default Card
