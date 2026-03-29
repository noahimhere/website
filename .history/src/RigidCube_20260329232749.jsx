import { RigidBody } from '@react-three/rapier'
import {Box, OrbitControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'

function RigidBox(boxpose){
  return(
    <RigidBody type='dynamic'>
              <Box position={boxpose} args={[1, 1, 1]}>
                <meshStandardMaterial color="orange"/>
              </Box>
    </RigidBody>
  )
}

export default RigidBox;