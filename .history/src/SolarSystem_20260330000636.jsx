import React, { useRef, useState } from 'react'
import { WireframeGeometry } from 'three'

const wiresphere = new WireframeGeometry(new SphereGeometry(1, 32, 32));

function SolarSystem(){
    const meshRef = useRef()
    const [hovered, setHover] = useState(false)
    return(
        <>
        <mesh
        ref={meshRef}>
        geometry={wiresphere}
        </mesh>
        </>
    )
}

export default SolarSystem