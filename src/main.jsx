import { createRoot } from 'react-dom/client'
import { useEffect, useRef, useState } from 'react'
import './index.css'
import { Canvas } from '@react-three/fiber'
import SolarSystem from './SolarSystem'

const SUN_RADIUS = 3
const TITLE_TYPING_DELAY_MS = 70
const TITLE_BACKSPACE_DELAY_MS = 45
const BODY_TITLES = {
  home: { text: 'NLINSEOK.COM', color: '#EEEECC' },
  aboutme: { text: 'BUYAN', color: '#c2fe0b' },
  projects: { text: 'VINETA', color: '#01ffff' },
  media: { text: 'KITEZH', color: '#AC35A8' },
  github: { text: 'LENG', color: '#59b41d' },
  contact: { text: 'ROTFRONT', color: '#3C4FFF' },
}

function App() {
  const [selectedBody, setSelectedBody] = useState(null)
  const [hoveredBody, setHoveredBody] = useState(null)
  const currentBody = !selectedBody || selectedBody.page
  const [typedTitle, setTypedTitle] = useState(BODY_TITLES.home.text)
  const displayedTitleRef = useRef(BODY_TITLES.home.text)
  const activeTitle = BODY_TITLES[currentBody] ?? BODY_TITLES.home

  const distanceFromSunCenter = selectedBody
    ? Math.hypot(
        selectedBody.position.x,
        selectedBody.position.y,
        selectedBody.position.z
      )
    : 0
  const altitudeFromSun = Math.max(0, distanceFromSunCenter - SUN_RADIUS)

  useEffect(() => {
    const nextTitle = activeTitle.text
    let timeoutId

    function updateDisplayedTitle(value) {
      displayedTitleRef.current = value
      setTypedTitle(value)
    }

    function typeForward(currentText) {
      if (currentText === nextTitle) {
        return
      }

      timeoutId = window.setTimeout(() => {
        const nextLength = currentText.length + 1
        const updatedText = nextTitle.slice(0, nextLength)
        updateDisplayedTitle(updatedText)
        typeForward(updatedText)
      }, TITLE_TYPING_DELAY_MS)
    }

    function backspace(currentText) {
      if (!currentText.length) {
        typeForward('')
        return
      }

      timeoutId = window.setTimeout(() => {
        const updatedText = currentText.slice(0, -1)
        updateDisplayedTitle(updatedText)
        backspace(updatedText)
      }, TITLE_BACKSPACE_DELAY_MS)
    }

    if (displayedTitleRef.current === nextTitle) {
      return undefined
    }

    backspace(displayedTitleRef.current)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [activeTitle])

  return (
    <>
      <div className="middletitle" style={{ color: activeTitle.color }}>
        <h1>
          <span className="stretch">{typedTitle}</span>
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
