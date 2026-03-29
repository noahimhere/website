import { createRef, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BufferGeometry,
  Float32BufferAttribute,
  SphereGeometry,
  WireframeGeometry,
} from 'three'
import CameraController from './CameraController'

const sphereGeometry = new SphereGeometry(1, 16, 16)
const smallSphereGeometry = new SphereGeometry(1, 16, 16)
const wireSphereGeometry = new WireframeGeometry(smallSphereGeometry)

const planets = [
  { radius: 0.34, a: 15, e: 0.05, inclination: 0.1, orbitRotation: 0.2, speed: 0.2, phase: 0, color: '#c2fe0b' },
  { radius: 1, a: 40, e: 0.5, inclination: 0.35, orbitRotation: 1.1, speed: 0.1, phase: 1.2, color: '#01ffff' },
  { radius: 0.4, a: 65.8, e: 0.1, inclination: -0.2, orbitRotation: 2.2, speed: 0.07, phase: 2.4, color: '#ff0d1a' },
  { radius: 0.8, a: 55.8, e: 0.1, inclination: 0.5, orbitRotation: -0.7, speed: 0.02, phase: 5.4, color: '#29324f' },
  { radius: 0.3, a: 60, e: 0.9, inclination: 0.1, orbitRotation: 2, speed: 0.09, phase: 0, color: '#59b41d' }
]

const CAMERA_DISTANCE_MULTIPLIER = 0.5 //changes distance of planet from camera
const SUN_CAMERA_DISTANCE = 12
const SUN_CAMERA_HEIGHT = 4

function WireSphere({ radius = 1, color = 'white' }) {
  return (
    <lineSegments geometry={wireSphereGeometry} scale={radius}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  )
}

function OrbitPath({ a, e, color = '#444444', segments = 128 }) { //solving orbit path
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
        <OrbitPath a={a} e={e} color={selected ? color : '#444444'} />
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
  const planetRefs = useMemo(() => planets.map(() => createRef()), [])
  const focusTargets = useMemo(() => [sunRef, ...planetRefs], [planetRefs])
  const isSunSelected = selectedIndex === 0
  const selectedRadius = selectedIndex === 0 ? 3 : planets[selectedIndex - 1].radius

  useEffect(() => {
    function handleKeyDown(event) {
      const key = event.key.toLowerCase()

      if (key === 'a') {
        setSelectedIndex((current) => (current - 1 + focusTargets.length) % focusTargets.length)
      }

      if (key === 'd') {
        setSelectedIndex((current) => (current + 1) % focusTargets.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
        <WireSphere radius={selectedIndex === 0 ? 3.3 : 3} color="#880000" />
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