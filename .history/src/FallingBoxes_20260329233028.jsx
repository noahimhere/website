import { useEffect, useState } from 'react'
import RigidBox from './RigidCube'

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
          position: [(Math.random() - 0.5) * 4, 6, (Math.random() - 0.5) * 4],
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

  return (
    <>
      {boxes.map((box) => (
        <RigidBox key={box.id} position={box.position} />
      ))}
    </>
  )
}

export default FallingBoxes