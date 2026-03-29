import { RigidBody } from '@react-three/rapier'
import {Box, OrbitControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'

function RigidBox(props){
  return(
    <RigidBody type='dynamic'>
              <Box {...props} args={[1, 10, 1]}>
                <meshStandardMaterial color="orange"/>
              </Box>
    </RigidBody>
  )
}

export default RigidBox;