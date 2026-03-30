import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import './index.css'
import { Canvas } from '@react-three/fiber'
import SolarSystem from './SolarSystem'

const SUN_RADIUS = 3

function App() {
  const [selectedBody, setSelectedBody] = useState(null)
  const [hoveredBody, setHoveredBody] = useState(null)
  const currentBody = !selectedBody || selectedBody.page

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
      <div className={`middletitle ${currentBody === 'home' ? 'is-visible' : 'is-hidden'}`} style={{ color: '#EEEECC' }}>
        <h1>
          <span className="stretch">NLINSEOK.COM</span>
        </h1>
      </div>
      <div className={`middletitle ${currentBody === 'aboutme' ? 'is-visible' : 'is-hidden'}`} style={{ color: '#c2fe0b' }}>
        <h1>
          <span className="stretch">BUYAN</span>
        </h1>
      </div>
      <div className={`middletitle ${currentBody === 'projects' ? 'is-visible' : 'is-hidden'}`} style={{ color: '#3C4FFF' }}>
        <h1>
          <span className="stretch">VINETA</span>
        </h1>
      </div>
      <div className={`middletitle ${currentBody === 'media' ? 'is-visible' : 'is-hidden'}`} style={{ color: '#AC35A8' }}>
        <h1>
          <span className="stretch">KITEZH</span>
        </h1>
      </div>
      <div className={`middletitle ${currentBody === 'github' ? 'is-visible' : 'is-hidden'}`} style={{ color: '#59b41d' }}>
        <h1>
          <span className="stretch">LENG</span>
        </h1>
      </div>
      <div className={`middletitle ${currentBody === 'contact' ? 'is-visible' : 'is-hidden'}`} style={{ color: '#3C4FFF' }}>
        <h1>
          <span className="stretch">ROTFRONT</span>
        </h1>
      </div>
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
