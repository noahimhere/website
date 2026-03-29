import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'

function CameraController({
  targetRef,
  targetRadius = 1,
  distanceMultiplier = 7,
  minDistance = 4,
  heightMultiplier = 2.2,
  minHeight = 1.6,
  fixedDistance,
  fixedHeight,
}) {
  const { camera } = useThree()
  const desiredTarget = useMemo(() => new Vector3(), [])
  const desiredPosition = useMemo(() => new Vector3(), [])
  const currentLookTarget = useRef(new Vector3())
  const orbitAngle = useRef(0)
  const activeTargetRef = useRef(targetRef)
  const transitionStartPosition = useRef(new Vector3())
  const transitionStartTarget = useRef(new Vector3())
  const transitionProgress = useRef(1)
  const initialized = useRef(false)

  useFrame((_, delta) => {
    if (!targetRef?.current) {
      return
    }

    targetRef.current.getWorldPosition(desiredTarget)

    if (!initialized.current) {
      const initialOffset = camera.position.clone().sub(desiredTarget)
      orbitAngle.current = Math.atan2(initialOffset.z, initialOffset.x)
      currentLookTarget.current.copy(desiredTarget)
      activeTargetRef.current = targetRef
      initialized.current = true
    }

    if (activeTargetRef.current !== targetRef) {
      activeTargetRef.current = targetRef
      transitionStartPosition.current.copy(camera.position)
      transitionStartTarget.current.copy(currentLookTarget.current)
      transitionProgress.current = 0
    }

    const desiredOrbitRadius =
      fixedDistance ?? Math.max(targetRadius * distanceMultiplier, minDistance)
    const desiredOrbitHeight =
      fixedHeight ?? Math.max(targetRadius * heightMultiplier, minHeight)
    orbitAngle.current += delta * 0.25

    desiredPosition.set(
      desiredTarget.x + Math.cos(orbitAngle.current) * desiredOrbitRadius,
      desiredTarget.y + desiredOrbitHeight,
      desiredTarget.z + Math.sin(orbitAngle.current) * desiredOrbitRadius
    )

    if (transitionProgress.current < 1) {
      transitionProgress.current = Math.min(transitionProgress.current + delta * 1.5, 1)
      const easedProgress = 1 - (1 - transitionProgress.current) ** 3
      camera.position.lerpVectors(transitionStartPosition.current, desiredPosition, easedProgress)
      currentLookTarget.current.lerpVectors(
        transitionStartTarget.current,
        desiredTarget,
        easedProgress
      )
    } else {
      camera.position.copy(desiredPosition)
      currentLookTarget.current.copy(desiredTarget)
    }

    camera.lookAt(currentLookTarget.current)
  })

  return null
}

export default CameraController
