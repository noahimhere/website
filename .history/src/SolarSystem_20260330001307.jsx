import React, { useRef, useState } from 'react'
import { WireframeGeometry, SphereGeometry } from 'three'

const wiresphere = new WireframeGeometry(new SphereGeometry(1, 16, 16));

function SolarSystem() {
    return (
        <>
      <lineSegments geometry={wiresphere} position={[0, 0, 0]}>
        <lineBasicMaterial color="yellow" />
      </lineSegments>
      
      </>
    )
  }

export default SolarSystem