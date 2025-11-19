import React, { useEffect } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'

// Parallax + load animations for the hero section.
// - Mouse move drives motion values (desktop)
// - Reduced effect on touch / coarse pointers
// - Fade-in + slide-up on load for children
// - Small floating loop for a decorative badge

const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.06, ease: 'easeOut', duration: 0.6 }
  }
}

const childVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { ease: 'easeOut', duration: 0.5 } }
}

const HeroAnimation = ({ children, bg, imageRefId = 'hero-image' }) => {
  const mvX = useMotionValue(0)
  const mvY = useMotionValue(0)

  // Transforms for different layers: background (least), image (mid), foreground (most)
  const bgX = useTransform(mvX, (v) => `${v * 0.02}px`)
  const bgY = useTransform(mvY, (v) => `${v * 0.02}px`)

  const imgX = useTransform(mvX, (v) => `${v * 0.04}px`)
  const imgY = useTransform(mvY, (v) => `${v * 0.04}px`)

  const fgX = useTransform(mvX, (v) => `${v * 0.08}px`)
  const fgY = useTransform(mvY, (v) => `${v * 0.08}px`)

  // Decorative badge floating (pure CSS/Framer Motion on its own later)

  useEffect(() => {
    // On touch devices reduce the parallax effect by resetting motion values
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(pointer: coarse)')
      if (mq.matches) {
        mvX.set(0)
        mvY.set(0)
      }
    }
  }, [mvX, mvY])

  function handleMove(e) {
    // Only run on non-coarse pointers
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(pointer: coarse)')
      if (mq.matches) return
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) - rect.width / 2
    const y = (e.clientY - rect.top) - rect.height / 2

    // gentle damping by dividing values
    mvX.set(x / 20)
    mvY.set(y / 20)
  }

  function handleLeave() {
    mvX.set(0)
    mvY.set(0)
  }

  return (
    <motion.div
      className="relative overflow-hidden"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Background layer - moves least */}
      <motion.div
        style={{ x: bgX, y: bgY }}
        className="absolute inset-0 pointer-events-none"
        aria-hidden
      >
        {bg}
      </motion.div>

      {/* Main content container where children will live. If `children` is a function
          we call it with the motion transforms so callers can assign different
          layers (mid / fg) explicitly. Otherwise, wrap children with foreground transforms. */}
      <div className="relative z-10">
        {typeof children === 'function'
          ? children({ fg: { x: fgX, y: fgY }, mid: { x: imgX, y: imgY }, childVariants })
          : React.Children.map(children, (child) => (
              <motion.div variants={childVariants} style={{ x: fgX, y: fgY }}>
                {child}
              </motion.div>
            ))}
      </div>

      {/* Floating small decorative element (badge) */}
      <motion.div
        className="absolute right-6 top-6 w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center text-white shadow-lg"
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, repeatType: 'loop', duration: 3, ease: 'easeInOut' }}
        aria-hidden
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
          <path d="M12 2L15 8H9L12 2Z" fill="currentColor" />
        </svg>
      </motion.div>
    </motion.div>
  )
}

export default HeroAnimation
