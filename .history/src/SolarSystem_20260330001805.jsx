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
  { radius: 0.22, a: 2.5, e: 0.05, inclination: 0.1, speed: 1.4, phase: 0, color: '#7dd3fc' },
  { radius: 0.3, a: 12, e: 0.5, inclination: 0.35, speed: 0.9, phase: 1.2, color: '#fca5a5' },
  { radius: 0.4, a: 10.8, e: 0.1, inclination: -0.2, speed: 0.6, phase: 2.4, color: '#fde68a' },
]

function WireSphere({ radius = 1, color = 'white' }) {
  return (
    <lineSegments geometry={wireSphereGeometry} scale={radius}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  )
}

function OrbitPath({ a, e, color = '#444444', segments = 128 }) {
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

function Planet({ radius, a, e, inclination, speed, phase, color }) {
  const ref = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + phase
    const b = a * Math.sqrt(1 - e * e)

    if (ref.current) {
      ref.current.position.x = a * Math.cos(t) - a * e
      ref.current.position.z = b * Math.sin(t)
    }
  })

  return (
    <group rotation={[inclination, 0, 0]}>
      <OrbitPath a={a} e={e} />
      <group ref={ref}>
        <WireSphere radius={radius} color={color} />
      </group>
    </group>
  )
}

function SolarSystem() {
  return (
    <>
      <WireSphere radius={1} color="yellow" />
      {planets.map((planet, index) => (
        <Planet key={index} {...planet} />
      ))}
    </>
  )
}

export default SolarSystem