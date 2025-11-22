import React from 'react'
import { Link } from 'react-router-dom'
import SectionContainer from '../components/SectionContainer'
import SignupSection from '../components/SignupSection'

const Hero = () => (
  <div className="leaf-pattern bg-gradient-to-br from-white to-leaf pagebg py-16">
    <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      <div className="animate-slideUp">
        <h2 className="text-3xl md:text-4xl font-bold text-primary">Fasal Rakshak — Smart Wheat Protection

</h2>
        <p className="mt-4 text-gray-700">Detects early. Alerts instantly. Harvests securely.</p>
        <div className="mt-6 flex gap-3">
          <Link to="/scan" className="px-4 py-2 bg-primary text-white rounded shadow hover:opacity-95">Scan Crop</Link>
          <Link to="/signup" className="px-4 py-2 border border-primary text-primary rounded hover:bg-primary/5">Get Started</Link>
        </div>
      </div>
      <div className="animate-fadeIn">
        <img src="/src/assets/hero.png" alt="Wheat crop scanning" className="w-full h-full object-cover rounded-lg shadow-lg" />
      </div>
    </div>
  </div>
)

const Home = () => (
  <div>
    <Hero />
    <div className="px-4">
      <SignupSection />
    </div>
    <SectionContainer>
      <h3 className="text-xl font-semibold">Why use Fasal Rakshak?</h3>
      <p className="mt-2 text-gray-600">Fast, offline-capable scanning, actionable recommendations and a community of farmers.</p>
    </SectionContainer>
  </div>
)

export default Home
