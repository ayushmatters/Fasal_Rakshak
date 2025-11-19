import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => (
  <footer>
    <div className="app-container">
      <div>
        <h4>About</h4>
        <p className="mt-2">Fasal Rakshak helps farmers detect crop diseases and access recommendations.</p>
      </div>
      <div>
        <h4>Quick Links</h4>
        <ul className="mt-2 space-y-1">
          <li><Link to="/" className="text-text-muted hover:text-accent transition-colors">Home</Link></li>
          <li><Link to="/scan" className="text-text-muted hover:text-accent transition-colors">Scan Crop</Link></li>
          <li><Link to="/community" className="text-text-muted hover:text-accent transition-colors">Community</Link></li>
          <li><Link to="/products" className="text-text-muted hover:text-accent transition-colors">Agri Products</Link></li>
        </ul>
      </div>
      <div>
        <h4>Contact</h4>
        <p className="mt-2">
          <a href="mailto:support@fasalrakshak.example" className="text-text-muted hover:text-accent transition-colors">
            support@fasalrakshak.example
          </a>
        </p>
        <p className="mt-3">
          <a href="tel:+919876543210" className="text-text-muted hover:text-accent transition-colors">
            +91 98765 43210
          </a>
        </p>
      </div>
    </div>
    <div className="w-full text-center mt-6 text-text-muted">
      © {new Date().getFullYear()} Fasal Rakshak. All rights reserved.
    </div>
  </footer>
)

export default Footer

