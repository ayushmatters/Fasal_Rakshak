import React from 'react'

/**
 * Button component with variants: primary, secondary, outline, ghost
 * Keeps original API but adds `variant` prop and `disabled` handling
 */
const VARIANT_CLASSES = {
  primary: 'btn btn--primary',
  secondary: 'btn btn--secondary',
  outline: 'btn btn--outline',
  ghost: 'btn btn--ghost'
}

const Button = ({ children, onClick, className = '', type = 'button', variant = 'primary', disabled = false, ariaLabel }) => {
  const cls = `${VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary} ${className}`
  return (
    <button aria-label={ariaLabel} type={type} onClick={onClick} className={cls} disabled={disabled}>
      {children}
    </button>
  )
}

export default Button
