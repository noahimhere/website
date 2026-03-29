import { createRoot } from 'react-dom/client'
import './index.css'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import SolarSystem from './SolarSystem'

createRoot(document.getElementById('root')).render(
  <Canvas camera={{ position: [0, 6, 14], fov: 50 }}>
    <color attach="background" args={['#000000']} />
    <OrbitControls />
    <SolarSystem />
  </Canvas>
)
