import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import './index.css'
import { Canvas } from '@react-three/fiber'
import SolarSystem from './SolarSystem'

const SUN_RADIUS = 3

function App() {
  const [selectedBody, setSelectedBody] = useState(null)
  const [hoveredBody, setHoveredBody] = useState(null)
  const showTitle = !selectedBody || selectedBody.page === 'home'
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
      <h1 className={`middletitle ${showTitle ? 'is-visible' : 'is-hidden'}`}>
        <span className="stretch">NLINSEOK.COM</span>
      </h1>
      <Canvas
        className="sceneCanvas"
        camera={{ position: [0, 6, 14], fov: 50 }}
        gl={{ alpha: true }}
        style={{ background: 'transparent' }}
        onPointerLeave={() => setHoveredBody(null)}
      >
        {/* <color attach="background" args={['#010101']} /> */}
        <SolarSystem onSelectionChange={setSelectedBody} onHoverChange={setHoveredBody} />
      </Canvas>
      {hoveredBody && (
        <div
          className="hoverLabel"
          style={{
            left: hoveredBody.pointer.x,
            top: hoveredBody.pointer.y,
            color: hoveredBody.color,
          }}
        >
          {hoveredBody.name}
        </div>
      )}
      {selectedBody && (
        <div className="infoContainer" style={{ '--selected-color': selectedBody.color }}>
          <div>{selectedBody.name}</div>
          <div>page: {selectedBody.page}</div>
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
