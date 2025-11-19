import React from 'react'
// Use the static public path for the hero image to avoid bundling path issues.
// The file exists at `public/hero.png` (copied from `src/assets/hero.png`).
const HERO_PUBLIC_PATH = '/hero.png'
import { Link } from 'react-router-dom'

const LeafSVG = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g1" x1="0%" x2="100%" y1="0%" y2="0%">
        <stop offset="0%" stopColor="#F6FEF6" />
        <stop offset="100%" stopColor="#FFFFFF" />
      </linearGradient>
    </defs>
    <rect width="800" height="400" fill="url(#g1)" />
    <g fill="#18A558" fillOpacity="0.06">
      <path d="M600 50c40 10 80 50 40 90s-80 30-120 20-60-30-40-70 70-50 120-40z" />
      <path d="M150 90c30 5 60 30 40 60s-60 20-90 15-40-20-25-45 45-30 75-30z" />
    </g>
  </svg>
)

const HeroSection = () => {
  return (
    <section className="leaf-pattern">
      <LeafSVG />
      <div className="app-container">
        <div className="z-10 animate-slideUp">
          <h1>Fasal Rakshak — Smart Crop Protection</h1>
          <p className="mt-4 max-w-xl">Detect and manage crop diseases with AI-driven insights, community support and access to trusted agri-products. Mobile-first, offline-capable scanning.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link to="/scan" className="btn btn--primary">Scan Crop</Link>
            <Link to="/signup" className="btn btn--outline">Get Started</Link>
          </div>
        </div>
        <div className="z-10 animate-fadeIn mt-8 md:mt-0">
          <div className="card border border-gray-100/40 shadow-sm">
              {/* Hero image: wrapped for rounded corners + overlay */}
              <div className="relative overflow-hidden rounded-md group">
                <img
                  src={HERO_PUBLIC_PATH}
                  alt="Hero — farm illustration"
                  loading="lazy"
                  className="w-full h-72 sm:h-80 md:h-96 lg:h-[420px] object-cover"
                  onError={(e) => {
                    // If `/hero.png` fails to load (server/static issue), show a small inline SVG placeholder.
                    // Avoid infinite loop by clearing onerror first.
                    // eslint-disable-next-line no-param-reassign
                    e.currentTarget.onerror = null
                    // Small inline SVG placeholder (green background, 'hero' label).
                    // Using a data URL ensures something visible shows immediately for debugging.
                    /* eslint-disable-next-line no-param-reassign */
                    e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='600'><rect width='100%' height='100%' fill='%230f5132'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='36' fill='%23ffffff'>Hero</text></svg>"
                  }}
                />
                <div
                  className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0f5132]/25 to-transparent transition-opacity duration-500 ease-in-out opacity-40 group-hover:opacity-70"
                  aria-hidden="true"
                />
              </div>
            <div className="mt-4">Supported crops: Wheat, Rice, Potato, Tomato, etc.</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
