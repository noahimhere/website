import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import './index.css'
import { Canvas } from '@react-three/fiber'
import SolarSystem from './SolarSystem'

const SUN_RADIUS = 3

function App() {
  const [selectedBody, setSelectedBody] = useState(null)
  const distanceFromSunCenter = selectedBody
    ? Math.hypot(
        selectedBody.position.x,
        selectedBody.position.y,
        selectedBody.position.z
      )
    : 0
  const altitudeFromSun = Math.max(0, distanceFromSunCenter - SUN_RADIUS)

  return (
    <>
      <Canvas camera={{ position: [0, 6, 14], fov: 50 }}>
        <color attach="background" args={['#010101']} />
        <SolarSystem onSelectionChange={setSelectedBody} />
      </Canvas>
      {selectedBody && (
        <div className="infoContainer" style={{ '--selected-color': selectedBody.color }}>
          <div>{selectedBody.name}</div>
          <div>radius: {selectedBody.radius}</div>
          <div>semi-major axis: {selectedBody.a}</div>
          <div>eccentricity: {selectedBody.e}</div>
          <div>inclination: {selectedBody.inclination}</div>
          <div>altitude: {altitudeFromSun.toFixed(2)}</div>
        </div>
      )}
    </>
  )
}

createRoot(document.getElementById('root')).render(<App />)
