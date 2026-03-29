import { createRoot } from 'react-dom/client'
import './index.css'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { RigidBody } from '@react-three/rapier'
import {Box, PerspectiveCamera, } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import SolarSystem from './SolarSystem'

createRoot(document.getElementById('root')).render(
  <Canvas>
    <color attach="background" args={['#FFFFFF']} />
    <SolarSystem />
    
  </Canvas>
)
