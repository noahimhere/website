import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BufferGeometry,
  Float32BufferAttribute,
  SphereGeometry,
  WireframeGeometry,
} from 'three'

const sphereGeometry = new SphereGeometry(1, 16, 16)
const smallSphereGeometry = new SphereGeometry(1, 16, 16)
const wireSphereGeometry = new WireframeGeometry(smallSphereGeometry)

const planets = [
  { radius: 0.34, a: 15, e: 0.05, inclination: 0.1, orbitRotation: 0.2, speed: 1.4, phase: 0, color: '#7dd3fc' },
  { radius: 0.6, a: 40, e: 0.5, inclination: 0.35, orbitRotation: 1.1, speed: 0.9, phase: 1.2, color: '#fca5a5' },
  { radius: 0.4, a: 65.8, e: 0.1, inclination: -0.2, orbitRotation: 2.2, speed: 0.6, phase: 2.4, color: '#fde68a' },
  { radius: 0.8, a: 55.8, e: 0.1, inclination: 0.5, orbitRotation: -0.7, speed: 0.3, phase: 5.4, color: '#4ec246' },
  { radius: 0.3, a: 75, e: 0.9, inclination: 0.1, orbitRotation: 2, speed: 0.5, phase: 0, color: '#7dd3fc' }
]

function WireSphere({ radius = 1, color = 'white' }) {
  return (
    <lineSegments geometry={wireSphereGeometry} scale={radius}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  )
}

function OrbitPath({ a, e, color = '#FF0000', segments = 128 }) { //solving orbit path
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

function Planet({ radius, a, e, inclination, orbitRotation = 0, speed, phase, color }) {
  const ref = useRef()

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
        <OrbitPath a={a} e={e} />
        <group ref={ref}>
          <WireSphere radius={radius} color={color} />
        </group>
      </group>
    </group>
  )
}

function SolarSystem() {
  return (
    <>
      <WireSphere radius={3} color="#FFFF00" />
      {planets.map((planet, index) => (
        <Planet key={index} {...planet} />
      ))}
    </>
  )
}

export default SolarSystem