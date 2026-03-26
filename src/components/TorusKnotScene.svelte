<script>
  import { T, useTask } from '@threlte/core'
  import { Float } from '@threlte/extras'
  import { onMount, onDestroy } from 'svelte'
  import * as THREE from 'three'

  let groupRef = $state(null)
  let mouseX = $state(0)
  let mouseY = $state(0)
  let isMobile = $state(false)
  let geometries = $state([])

  let cleanup = () => {}

  /**
   * Creates a closed stadium/oval curve for a chain link.
   * The shape is elongated along Y with semicircular caps.
   */
  function createChainLinkGeometry(width, height, tubeRadius, tubularSegments, radialSegments) {
    const halfW = width / 2
    const straightH = (height - width) / 2
    const r = halfW

    const sLen = 2 * straightH
    const aLen = Math.PI * r
    const totalPerim = 2 * sLen + 2 * aLen

    const points = []
    const numPoints = 200

    for (let i = 0; i < numPoints; i++) {
      const t = i / numPoints
      const d = t * totalPerim
      let x, y

      if (d < sLen) {
        // Right straight going up
        x = r
        y = -straightH + d
      } else if (d < sLen + aLen) {
        // Top semicircle
        const angle = (d - sLen) / r
        x = r * Math.cos(angle)
        y = straightH + r * Math.sin(angle)
      } else if (d < 2 * sLen + aLen) {
        // Left straight going down
        const dd = d - sLen - aLen
        x = -r
        y = straightH - dd
      } else {
        // Bottom semicircle
        const dd = d - 2 * sLen - aLen
        const angle = Math.PI + dd / r
        x = r * Math.cos(angle)
        y = -straightH + r * Math.sin(angle)
      }

      points.push(new THREE.Vector3(x, y, 0))
    }

    const curve = new THREE.CatmullRomCurve3(points, true)
    return new THREE.TubeGeometry(curve, tubularSegments, tubeRadius, radialSegments, true)
  }

  let particleGeo = $state(null)

  onMount(() => {
    isMobile = window.innerWidth < 768

    const handler = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      mouseX = (clientX / window.innerWidth - 0.5) * 2
      mouseY = -(clientY / window.innerHeight - 0.5) * 2
    }

    window.addEventListener('mousemove', handler)
    window.addEventListener('touchmove', handler, { passive: true })

    // Generate chain link geometries
    const linkWidth = 1.2
    const linkHeight = 2.2
    const tubeR = 0.08
    const tSegs = isMobile ? 64 : 128
    const rSegs = isMobile ? 8 : 12

    const geom = createChainLinkGeometry(linkWidth, linkHeight, tubeR, tSegs, rSegs)
    geometries = [geom, geom, geom]

    // Atmospheric particles
    const particleCount = isMobile ? 80 : 200
    const positions = new Float32Array(particleCount * 3)
    const spread = 6
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread * 2
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 2
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeo = pGeo

    cleanup = () => {
      window.removeEventListener('mousemove', handler)
      window.removeEventListener('touchmove', handler)
      geom.dispose()
      pGeo.dispose()
    }
  })

  onDestroy(() => cleanup())

  let elapsed = 0

  useTask((delta) => {
    if (!groupRef) return
    elapsed += delta
    const lerpSpeed = 1 - Math.pow(0.03, delta)
    groupRef.rotation.y += (mouseX * 0.4 - groupRef.rotation.y) * lerpSpeed
    groupRef.rotation.x += (mouseY * 0.25 - groupRef.rotation.x) * lerpSpeed

    // Drift particles slowly
    if (particleGeo) {
      const pos = particleGeo.attributes.position
      for (let i = 0; i < pos.count; i++) {
        pos.array[i * 3 + 1] += delta * 0.08
        // Wrap around when drifting too high
        if (pos.array[i * 3 + 1] > 6) pos.array[i * 3 + 1] = -6
      }
      pos.needsUpdate = true
    }
  })

  // Chain link positions and rotations
  // Links alternate: flat (XY plane) vs perpendicular (rotated 90deg around Y)
  // Spaced along X so each passes through its neighbor
  const spacing = 1.15
  const links = [
    { x: -spacing, rotY: 0 },
    { x: 0,        rotY: Math.PI / 2 },
    { x: spacing,  rotY: 0 },
  ]
</script>

<T.PerspectiveCamera
  makeDefault
  position.z={isMobile ? 7 : 5.5}
  fov={50}
/>

<T.AmbientLight intensity={0.5} />

<Float
  floatingRange={[-0.12, 0.12]}
  rotationSpeed={[0.2, 0.5, 0.15]}
  rotationIntensity={0.2}
  floatIntensity={0.5}
  speed={1.2}
>
  <T.Group bind:ref={groupRef} scale={isMobile ? 0.8 : 1}>
    {#each links as link, i}
      {#if geometries[i]}
        <T.Mesh
          position.x={link.x}
          rotation.y={link.rotY}
          geometry={geometries[i]}
        >
          <T.MeshStandardMaterial color="#ffffff" wireframe />
        </T.Mesh>
      {/if}
    {/each}
  </T.Group>
</Float>

{#if particleGeo}
  <T.Points geometry={particleGeo}>
    <T.PointsMaterial
      color="#ffffff"
      size={0.015}
      transparent
      opacity={0.4}
      sizeAttenuation
      depthWrite={false}
    />
  </T.Points>
{/if}
