import { useEffect, useState } from 'react'
import { Box } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'

function FallingBoxes() {
  const [boxes, setBoxes] = useState([])

  useEffect(() => {
    const spawnRateMs = 500
    const lifeMs = 5000

    const spawnTimer = setInterval(() => {
      setBoxes((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          bornAt: Date.now(),
          position: [0, 6, 0],
          rotation: [Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI],
        },
      ])
    }, spawnRateMs)

    const cleanupTimer = setInterval(() => {
      const now = Date.now()
      setBoxes((current) =>
        current.filter((box) => now - box.bornAt < lifeMs)
      )
    }, 250)

    return () => {
      clearInterval(spawnTimer)
      clearInterval(cleanupTimer)
    }
  }, [])

  return boxes.map((box) => (
    <RigidBody key={box.id} type="dynamic" position={box.position} colliders="cuboid">
      <Box args={[1, 1, 1]}>
        <meshStandardMaterial color="orange" />
      </Box>
    </RigidBody>
  ))
}

export default FallingBoxes
