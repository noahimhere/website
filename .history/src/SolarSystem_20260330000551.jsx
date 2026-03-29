import React, { useRef, useState } from 'react'
import { WireframeGeometry } from 'three'

const geometry = new SphereGeometry(1, 32, 32);

function SolarSystem(){
    const meshRef = useRef()
    const [hovered, setHover] = useState(false)
    return(
        <>
        <mesh
        ref={meshRef}>
        
        <WireframeGeometry
        
        </mesh>
        </>
    )
}

export default SolarSystem