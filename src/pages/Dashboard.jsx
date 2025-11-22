import React, { useState, useEffect } from 'react'
import SectionContainer from '../components/SectionContainer'
import Card from '../components/Card'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    cropHealth: 82,
    activeScans: 0,
    recommendations: 0,
    recentScans: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        // TODO: Replace with actual API endpoint to fetch user dashboard data
        // For now, using mock data
        setTimeout(() => {
          setDashboardData({
            cropHealth: 82,
            activeScans: 4,
            recommendations: 5,
            recentScans: [
              { id: 1, name: 'Wheat Scan', date: '2025-11-10', disease: 'Leaf Blight' },
              { id: 2, name: 'Wheat Scan', date: '2025-11-09', disease: 'Healthy' },
              { id: 3, name: 'Wheat Scan', date: '2025-11-08', disease: 'Rust' }
            ]
          })
          setLoading(false)
        }, 500)
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <SectionContainer>
        <div className="text-center text-gray-500">Loading dashboard...</div>
      </SectionContainer>
    )
  }

  return (
    <div>
      <SectionContainer>
        <h2 className="text-2xl font-semibold text-primary mb-6">Dashboard</h2>
        
        {/* Stats Grid */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="card--dark p-6">
            <div className="text-gray-600 text-sm font-medium">Crop Health</div>
            <div className="text-3xl font-bold text-emerald-600 mt-2">{dashboardData.cropHealth}%</div>
            <div className="text-xs text-gray-500 mt-2">Overall crop condition</div>
          </Card>
          <Card className="card--dark p-6">
            <div className="text-gray-600 text-sm font-medium">Active Scans</div>
            <div className="text-3xl font-bold text-emerald-600 mt-2">{dashboardData.activeScans}</div>
            <div className="text-xs text-gray-500 mt-2">Scans this month</div>
          </Card>
          <Card className="card--dark p-6">
            <div className="text-gray-600 text-sm font-medium">Recommendations</div>
            <div className="text-3xl font-bold text-emerald-600 mt-2">{dashboardData.recommendations}</div>
            <div className="text-xs text-gray-500 mt-2">Action items pending</div>
          </Card>
        </div>

        {/* Recent Scans */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Recent Scans</h3>
          {dashboardData.recentScans.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No scans yet</div>
          ) : (
            <div className="space-y-2">
              {dashboardData.recentScans.map((scan) => (
                <div key={scan.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{scan.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{new Date(scan.date).toLocaleDateString()}</div>
                  </div>
                  <div className={`text-sm font-semibold px-3 py-1 rounded ${
                    scan.disease === 'Healthy' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {scan.disease}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionContainer>
    </div>
  )
}

export default Dashboard
