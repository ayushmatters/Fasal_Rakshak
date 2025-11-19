import React from 'react'

const ScanResultCard = ({ result }) => {
  if (!result) return null
  return (
    <div>
      <h3>Result: {result.disease}</h3>
      <p>Confidence: {(result.confidence * 100).toFixed(0)}%</p>
      <div>
        <strong>Recommendations</strong>
        <ul>
          {result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </div>
    </div>
  )
}

export default ScanResultCard
