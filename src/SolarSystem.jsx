import { createRef, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BufferGeometry,
  BoxGeometry,
  Color,
  Float32BufferAttribute,
  SphereGeometry,
  Vector3,
  WireframeGeometry,
} from 'three'
import CameraController from './CameraController'

const smallSphereGeometry = new SphereGeometry(1, 16, 16)
const smallCubeGeometry = new BoxGeometry(0.5, 0.5, 0.5)
const wireSphereGeometry = new WireframeGeometry(smallSphereGeometry)
const wireCubeGeometry = new WireframeGeometry(smallCubeGeometry)
const DYSON_SWARM_COUNT = 140
const DYSON_SWARM_ORBIT_DISTANCE = 4.9
const DYSON_SWARM_CUBE_SIZE = 0.1
const DYSON_SWARM_COLOR = '#999999'
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
const SUN = {
  name: 'SUN',
  page:"home",
  radius: 3,
  a: 0,
  e: 0,
  inclination: 0,
  color: '#FF0D1A',
  satellites: createDysonSwarmSatellites(),
}

// Add a `satellites` array to any body to attach orbiting objects with custom models.
const planets = [
  { name: 'BUYAN', page: "aboutme", radius: 0.34, a: 15.23, e: 0.05, inclination: 0.1, orbitRotation: 0.2, speed: 0.2, phase: 0, color: '#c2fe0b', ring: false},
  {
    name: 'VINETA',
    page: "projects",
    radius: 1.12,
    a: 40.12,
    e: 0.5,
    inclination: 0.35,
    orbitRotation: 1.1,
    speed: 0.17,
    phase: 1.2,
    color: '#01ffff',
    ring: true,
    ringWidth: 0.01,
    ringColor: '#7ffcff',
    innerRing: 1,
    ringRotation: [Math.PI / 2.5, 1.3245, 0],
    satellites: [
      {
        name: 'VINETA RELAY',
        distance: 1.5,
        speed: 1.5,
        phase: 0.2,
        inclination: 0.1,
        orbitRotation: 0.3,
        size: 0.2,
        color: '#fff1a8',
        model: SatelliteWireCubeModel,
      },
    ],
  },
  { name: 'KITEZH', page:"media", radius: 1.54, a: 65.81, e: 0.7, inclination: -0.2, orbitRotation: 2.2, speed: 0.12, phase: 2.4, color: '#AC35A8', ring: false },
  { name: 'ROTFRONT', page: "contact", radius: 1.85, a: 55.86, e: 0.1, inclination: 0.5, orbitRotation: -0.7, speed: 0.05, phase: 5.4, color: '#3C4FFF', ring: true, ringWidth: 2.5, ringColor: '#3C4FFF', innerRing: 0.5, ringRotation: [Math.PI / 1.7, 0, 0] },
  { name: 'LENG', page: "github", radius: 0.87, a: 60.5, e: 0.9, inclination: 0.1, orbitRotation: 2, speed: 0.12, phase: 0, color: '#59b41d', ring: false }
]

const CAMERA_DISTANCE_MULTIPLIER = 4 //changes distance of planet from camera
const SUN_CAMERA_DISTANCE = 50
const SUN_CAMERA_HEIGHT = 4
const ORBIT_PATH_SATURATION_MULTIPLIER = 1

function WireSphere({ radius = 1, color = 'white' }) {
  return (
    <lineSegments geometry={wireSphereGeometry} scale={radius}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  )
}

function getScaleVector(scale = 1) {
  return Array.isArray(scale) ? scale : [scale, scale, scale]
}

function SatelliteWireCubeModel({ color = 'white', scale = 0.2 }) {
  return (
    <lineSegments geometry={wireCubeGeometry} scale={getScaleVector(scale)}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  )
}

function SatelliteSolidCubeModel({ color = 'white', scale = 0.2 }) {
  return (
    <mesh geometry={smallCubeGeometry} scale={getScaleVector(scale)}>
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

function SatelliteWireSphereModel({ color = 'white', scale = 0.2 }) {
  return (
    <lineSegments geometry={wireSphereGeometry} scale={getScaleVector(scale)}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  )
}

export const satelliteModels = {
  wireCube: SatelliteWireCubeModel,
  solidCube: SatelliteSolidCubeModel,
  wireSphere: SatelliteWireSphereModel,
}

function createDysonSwarmSatellites(count = DYSON_SWARM_COUNT) {
  return Array.from({ length: count }, (_, index) => {
    const spinDirection = index % 2 === 0 ? 1 : -1

    return {
      name: `SWARM ${index + 1}`,
      a: DYSON_SWARM_ORBIT_DISTANCE,
      e: 0,
      inclination: Math.asin(-1 + (2 * (index + 0.5)) / count),
      orbitRotation: index * GOLDEN_ANGLE,
      speed: 0.45,
      phase: index * GOLDEN_ANGLE * 1.7,
      size: DYSON_SWARM_CUBE_SIZE,
      color: DYSON_SWARM_COLOR,
      model: SatelliteWireCubeModel,
      showOrbit: false,
      spin: [
        0.85 * spinDirection,
        1.1 * -spinDirection,
        0.55 * spinDirection,
      ],
    }
  })
}

function Ring({ innerRadius = 1, outerRadius = 1.1, color = 'white', rotation = [0, 0, 0] }) {
  const hasValidRadii =
    Number.isFinite(innerRadius) &&
    Number.isFinite(outerRadius) &&
    innerRadius > 0 &&
    outerRadius > innerRadius

  const innerGeometry = useMemo(() => {
    if (!hasValidRadii) {
      return null
    }

    const points = []
    const segments = 64

    for (let i = 0; i <= segments; i += 1) {
      const angle = (i / segments) * Math.PI * 2
      points.push(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius, 0)
    }

    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute(points, 3))
    return geometry
  }, [hasValidRadii, innerRadius])

  const outerGeometry = useMemo(() => {
    if (!hasValidRadii) {
      return null
    }

    const points = []
    const segments = 64

    for (let i = 0; i <= segments; i += 1) {
      const angle = (i / segments) * Math.PI * 2
      points.push(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius, 0)
    }

    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute(points, 3))
    return geometry
  }, [hasValidRadii, outerRadius])

  if (!innerGeometry || !outerGeometry) {
    return null
  }

  return (
    <group rotation={rotation}>
      <line geometry={innerGeometry}>
        <lineBasicMaterial color={color} />
      </line>
      <line geometry={outerGeometry}>
        <lineBasicMaterial color={color} />
      </line>
    </group>
  )
}

function getOrbitColor(color, selected) {
  if (selected) {
    return color
  }

  const adjustedColor = new Color(color)
  const hsl = { h: 0, s: 0, l: 0 }
  adjustedColor.getHSL(hsl)
  adjustedColor.setHSL(
    hsl.h,
    hsl.s * ORBIT_PATH_SATURATION_MULTIPLIER,
    Math.min(1, hsl.l + 0.05)
  )
  return `#${adjustedColor.getHexString()}`
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

function OrbitingSatellites({ satellites = [] }) {
  if (!satellites.length) {
    return null
  }

  const satelliteRefs = useRef([])
  const normalizedSatellites = useMemo(
    () =>
      satellites.map((satellite) => {
        const semiMajorAxis = satellite.a ?? satellite.distance ?? 2
        const orbitEccentricity = satellite.e ?? satellite.eccentricity ?? 0

        return {
          ...satellite,
          a: semiMajorAxis,
          e: orbitEccentricity,
          inclination: satellite.inclination ?? 0,
          orbitRotation: satellite.orbitRotation ?? 0,
          speed: satellite.speed ?? 1,
          phase: satellite.phase ?? 0,
          color: satellite.color ?? 'white',
          size: satellite.size ?? 0.2,
          model: satellite.model ?? SatelliteWireCubeModel,
          showOrbit: satellite.showOrbit ?? false,
          orbitColor: satellite.orbitColor ?? satellite.color ?? 'white',
          orbitSegments: satellite.orbitSegments ?? 64,
          spin: satellite.spin ?? [0, 0, 0],
        }
      }),
    [satellites]
  )

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime()

    for (let index = 0; index < normalizedSatellites.length; index += 1) {
      const satellite = normalizedSatellites[index]
      const ref = satelliteRefs.current[index]

      if (!ref) {
        continue
      }

      const meanAnomaly = elapsedTime * satellite.speed + satellite.phase
      const eccentricAnomaly = solveEccentricAnomaly(meanAnomaly, satellite.e)
      const semiMinorAxis = satellite.a * Math.sqrt(1 - satellite.e * satellite.e)

      ref.position.x = satellite.a * (Math.cos(eccentricAnomaly) - satellite.e)
      ref.position.z = semiMinorAxis * Math.sin(eccentricAnomaly)
      ref.rotation.x = elapsedTime * satellite.spin[0]
      ref.rotation.y = elapsedTime * satellite.spin[1]
      ref.rotation.z = elapsedTime * satellite.spin[2]
    }
  })

  return (
    <>
      {normalizedSatellites.map((satellite, index) => {
        const Model = satellite.model

        return (
          <group key={satellite.name ?? index} rotation={[0, satellite.orbitRotation, 0]}>
            <group rotation={[satellite.inclination, 0, 0]}>
              {satellite.showOrbit && (
                <OrbitPath
                  a={satellite.a}
                  e={satellite.e}
                  color={satellite.orbitColor}
                  segments={satellite.orbitSegments}
                />
              )}
              <group
                ref={(node) => {
                  satelliteRefs.current[index] = node
                }}
              >
                <Model color={satellite.color} scale={satellite.size} satellite={satellite} />
              </group>
            </group>
          </group>
        )
      })}
    </>
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
  ring,
  ringColor,
  ringWidth = 0.2,
  innerRing = 0.15,
  ringRotation = [0, 0, 0],
  satellites = [],
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
        <OrbitPath a={a} e={e} color={getOrbitColor(color, selected)} />
        <group ref={ref}>
          <WireSphere radius={radius} color={color} />
          {ring && (
            <Ring
              innerRadius={radius + innerRing}
              outerRadius={radius + innerRing + ringWidth}
              color={ringColor ?? color}
              rotation={ringRotation}
            />
          )}
          <OrbitingSatellites satellites={satellites} />
        </group>
      </group>
    </group>
  )
}

function SolarSystem({ onSelectionChange }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const sunRef = useRef()
  const lastInputTimeRef = useRef(0)
  const touchStartRef = useRef({ x: 0, y: 0 })
  const lastSelectionReportTimeRef = useRef(0)
  const selectedPosition = useMemo(() => new Vector3(), [])
  const planetRefs = useMemo(() => planets.map(() => createRef()), [])
  const focusTargets = useMemo(() => [sunRef, ...planetRefs], [planetRefs])
  const isSunSelected = selectedIndex === 0
  const selectedBody = isSunSelected ? SUN : planets[selectedIndex - 1]
  const selectedRadius = selectedBody.radius
  const focusTargetCount = focusTargets.length

  useFrame(() => {
    const selectedTarget = focusTargets[selectedIndex]

    if (!onSelectionChange || !selectedTarget?.current) {
      return
    }

    const now = performance.now()
    if (now - lastSelectionReportTimeRef.current < 100) {
      return
    }
    lastSelectionReportTimeRef.current = now

    selectedTarget.current.getWorldPosition(selectedPosition)
    onSelectionChange({
      ...selectedBody,
      index: selectedIndex,
      position: {
        x: selectedPosition.x,
        y: selectedPosition.y,
        z: selectedPosition.z,
      },
    })
  })

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
      <group ref={sunRef}>
        <WireSphere radius={selectedIndex === 0 ? 3.3 : SUN.radius} color={SUN.color} />
        <OrbitingSatellites satellites={SUN.satellites} />
      </group>
      {planets.map((planet, index) => (
        <Planet
          key={index}
          {...planet}
          selected={index + 1 === selectedIndex}
          planetRef={planetRefs[index]}
        />
      ))}
      <CameraController
        targetRef={focusTargets[selectedIndex]}
        targetRadius={selectedRadius}
        distanceMultiplier={CAMERA_DISTANCE_MULTIPLIER}
        fixedDistance={isSunSelected ? SUN_CAMERA_DISTANCE : undefined}
        fixedHeight={isSunSelected ? SUN_CAMERA_HEIGHT : undefined}
      />
    </>
  )
}

export default SolarSystem