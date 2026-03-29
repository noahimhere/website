import React, { useRef, useState } from 'react'

function SolarSystem(){
    const meshRef = useRef()
    const [hovered, setHover] = useState(false)
    return(
        <>
        <mesh
        ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshWireframeMaterial color="yellow" />
        </mesh>
        </>
    )
}

export default SolarSystem