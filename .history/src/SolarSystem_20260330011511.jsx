import { createRef, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BufferGeometry,
  Float32BufferAttribute,
  SphereGeometry,
  WireframeGeometry,
} from 'three'
import CameraController from './CameraController'

const smallSphereGeometry = new SphereGeometry(1, 16, 16)
const wireSphereGeometry = new WireframeGeometry(smallSphereGeometry)

const planets = [
  { radius: 0.34, a: 15, e: 0.05, inclination: 0.1, orbitRotation: 0.2, speed: 0.2, phase: 0, color: '#c2fe0b' },
  { radius: 1, a: 40, e: 0.5, inclination: 0.35, orbitRotation: 1.1, speed: 0.1, phase: 1.2, color: '#01ffff' },
  { radius: 1.5, a: 65.8, e: 0.1, inclination: -0.2, orbitRotation: 2.2, speed: 0.07, phase: 2.4, color: '#AC35A8' },
  { radius: 1.8, a: 55.8, e: 0.1, inclination: 0.5, orbitRotation: -0.7, speed: 0.02, phase: 5.4, color: '#3C4FFF' },
  { radius: 0.8, a: 60, e: 0.9, inclination: 0.1, orbitRotation: 2, speed: 0.09, phase: 0, color: '#59b41d' }
]

const CAMERA_DISTANCE_MULTIPLIER = 1 //changes distance of planet from camera
const SUN_CAMERA_DISTANCE = 50
const SUN_CAMERA_HEIGHT = 4

function WireSphere({ radius = 1, color = 'white' }) {
  return (
    <lineSegments geometry={wireSphereGeometry} scale={radius}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  )
}

function OrbitPath({ a, e, color, segments = 128 }) { //solving orbit path
  const geometry = useMemo(() => {
    const b = a * Math.sqrt(1 - e * e)
    const points = []

    for (let i = 0; i <= segments; i += 1) {
      const t = (i / segments) * Math.PI * 2
      const x = a * Math.cos(t) - a * e
      const z = b * Math.sin(t)
      points.push(x, 0, z)
    }

    const orbitGeometry = new BufferGeometry()
    orbitGeometry.setAttribute('position', new Float32BufferAttribute(points, 3))
    return orbitGeometry
  }, [a, e, segments])

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} />
    </line>
  )
}

function solveEccentricAnomaly(meanAnomaly, eccentricity, iterations = 5) { // super fast speed when high eccentricity low alt
  let eccentricAnomaly = meanAnomaly

  for (let i = 0; i < iterations; i += 1) {
    eccentricAnomaly -=
      (eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly) /
      (1 - eccentricity * Math.cos(eccentricAnomaly))
  }

  return eccentricAnomaly
}

function Planet({
  radius,
  a,
  e,
  inclination,
  orbitRotation = 0,
  speed,
  phase,
  color,
  selected = false,
  planetRef,
}) {
  const ref = planetRef

  useFrame(({ clock }) => {
    const meanAnomaly = clock.getElapsedTime() * speed + phase
    const eccentricAnomaly = solveEccentricAnomaly(meanAnomaly, e)
    const b = a * Math.sqrt(1 - e * e)

    if (ref.current) {
      ref.current.position.x = a * (Math.cos(eccentricAnomaly) - e)
      ref.current.position.z = b * Math.sin(eccentricAnomaly)
    }
  })

  return (
    <group rotation={[0, orbitRotation, 0]}>
      <group rotation={[inclination, 0, 0]}>
        <OrbitPath a={a} e={e} color={color} />
        <group ref={ref}>
          <WireSphere radius={selected ? radius * 1.15 : radius} color={color} />
        </group>
      </group>
    </group>
  )
}

function SolarSystem() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const sunRef = useRef()
  const lastInputTimeRef = useRef(0)
  const touchStartRef = useRef({ x: 0, y: 0 })
  const planetRefs = useMemo(() => planets.map(() => createRef()), [])
  const focusTargets = useMemo(() => [sunRef, ...planetRefs], [planetRefs])
  const isSunSelected = selectedIndex === 0
  const selectedRadius = selectedIndex === 0 ? 3 : planets[selectedIndex - 1].radius
  const focusTargetCount = focusTargets.length

  function selectPrevious() {
    setSelectedIndex((current) => (current - 1 + focusTargetCount) % focusTargetCount)
  }

  function selectNext() {
    setSelectedIndex((current) => (current + 1) % focusTargetCount)
  }

  useEffect(() => {
    const inputCooldownMs = 300
    const swipeThresholdPx = 50

    function canTriggerInput() {
      const now = Date.now()

      if (now - lastInputTimeRef.current < inputCooldownMs) {
        return false
      }

      lastInputTimeRef.current = now
      return true
    }

    function handleKeyDown(event) {
      const key = event.key.toLowerCase()

      if (key === 'a' && canTriggerInput()) {
        selectPrevious()
      }

      if (key === 'd' && canTriggerInput()) {
        selectNext()
      }
    }

    function handleWheel(event) {
      if (!canTriggerInput()) {
        return
      }

      if (event.deltaY > 0) {
        selectNext()
      } else if (event.deltaY < 0) {
        selectPrevious()
      }
    }

    function handleTouchStart(event) {
      const touch = event.touches[0]

      if (!touch) {
        return
      }

      touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    }

    function handleTouchEnd(event) {
      const touch = event.changedTouches[0]

      if (!touch) {
        return
      }

      const dx = touch.clientX - touchStartRef.current.x
      const dy = touch.clientY - touchStartRef.current.y

      if (Math.abs(dx) < swipeThresholdPx || Math.abs(dx) < Math.abs(dy)) {
        return
      }

      if (!canTriggerInput()) {
        return
      }

      if (dx < 0) {
        selectNext()
      } else {
        selectPrevious()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [focusTargetCount])

  return (
    <>
      <CameraController
        targetRef={focusTargets[selectedIndex]}
        targetRadius={selectedRadius}
        distanceMultiplier={CAMERA_DISTANCE_MULTIPLIER}
        fixedDistance={isSunSelected ? SUN_CAMERA_DISTANCE : undefined}
        fixedHeight={isSunSelected ? SUN_CAMERA_HEIGHT : undefined}
      />
      <group ref={sunRef}>
        <WireSphere radius={selectedIndex === 0 ? 3.3 : 3} color="#FF0D1A" />
      </group>
      {planets.map((planet, index) => (
        <Planet
          key={index}
          {...planet}
          selected={index + 1 === selectedIndex}
          planetRef={planetRefs[index]}
        />
      ))}
    </>
  )
}

export default SolarSystem