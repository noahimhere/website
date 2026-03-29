import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'

function CameraController({ targetRef, targetRadius = 5 }) {
  const { camera } = useThree()
  const desiredTarget = useMemo(() => new Vector3(), [])
  const smoothedTarget = useRef(new Vector3())
  const desiredPosition = useMemo(() => new Vector3(), [])
  const orbitRadius = useRef(14)
  const orbitHeight = useRef(6)
  const orbitAngle = useRef(0)
  const initialized = useRef(false)

  useFrame((_, delta) => {
    if (!targetRef?.current) {
      return
    }

    targetRef.current.getWorldPosition(desiredTarget)

    if (!initialized.current) {
      const initialOffset = camera.position.clone().sub(desiredTarget)
      orbitRadius.current = Math.hypot(initialOffset.x, initialOffset.z)
      orbitHeight.current = initialOffset.y
      orbitAngle.current = Math.atan2(initialOffset.z, initialOffset.x)
      smoothedTarget.current.copy(desiredTarget)
      initialized.current = true
    }

    smoothedTarget.current.lerp(desiredTarget, 0.08)
    const desiredOrbitRadius = Math.max(targetRadius * 7, 4)
    const desiredOrbitHeight = Math.max(targetRadius * 2.2, 1.6)
    orbitRadius.current += (desiredOrbitRadius - orbitRadius.current) * 0.08
    orbitHeight.current += (desiredOrbitHeight - orbitHeight.current) * 0.08
    orbitAngle.current += delta * 0.25

    desiredPosition.set(
      smoothedTarget.current.x + Math.cos(orbitAngle.current) * orbitRadius.current,
      smoothedTarget.current.y + orbitHeight.current,
      smoothedTarget.current.z + Math.sin(orbitAngle.current) * orbitRadius.current
    )

    camera.position.lerp(desiredPosition, 0.08)
    camera.lookAt(smoothedTarget.current)
  })

  return null
}

export default CameraController
