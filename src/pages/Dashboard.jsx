import React from 'react'
import SectionContainer from '../components/SectionContainer'
import Card from '../components/Card'

const Dashboard = () => {
  const recent = [
    { id: 1, name: 'Wheat Scan', date: '2025-11-10', disease: 'Leaf Blight' },
    
  ]
  return (
    <div>
      <SectionContainer>
        <h2 className="text-xl font-semibold text-primary">Dashboard</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card--dark p-4">Crop Health: <div className="text-2xl font-bold">82%</div></Card>
          <Card className="card--dark p-4">Active Scans: <div className="text-2xl font-bold">4</div></Card>
          <Card className="card--dark p-4">Recommendations: <div className="text-2xl font-bold">5</div></Card>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold">Recent Scans</h3>
          <div className="mt-3 space-y-2">
            {recent.map((r) => (
              <div key={r.id} className="bg-white p-3 rounded shadow flex justify-between">
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-gray-500">{r.date}</div>
                </div>
                <div className="text-sm text-primary">{r.disease}</div>
              </div>
            ))}
          </div>
        </div>
      </SectionContainer>
    </div>
  )
}

export default Dashboard
