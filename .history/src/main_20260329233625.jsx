import { createRoot } from 'react-dom/client'
import './index.css'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { RigidBody } from '@react-three/rapier'
import {Box, OrbitControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import FallingBoxes from './FallingBoxes'

createRoot(document.getElementById('root')).render(
  <Canvas>
    <color attach="background" args={['#FFFFFF']} />
    
    <Suspense>
      <directionalLight position={[0, 5, 5]} intensity={1} />
      <ambientLight intensity={0.5} />
      <OrbitControls />
      <Physics>
        <RigidBody type='fixed' friction={2}>
          <Box position={[0, -1, 0]} args={[10, 1, 10]}>
            <meshStandardMaterial color="#333333"/>
          </Box>
        </RigidBody>
        <FallingBoxes />
      </Physics>
    </Suspense>
  </Canvas>
)
