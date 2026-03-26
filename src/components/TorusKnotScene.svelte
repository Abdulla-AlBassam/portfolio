<script>
  import { T, useTask } from '@threlte/core'
  import { Float } from '@threlte/extras'
  import { onMount, onDestroy } from 'svelte'

  let groupRef = $state(null)
  let mouseX = $state(0)
  let mouseY = $state(0)
  let isMobile = $state(false)

  let cleanup = () => {}

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

    cleanup = () => {
      window.removeEventListener('mousemove', handler)
      window.removeEventListener('touchmove', handler)
    }
  })

  onDestroy(() => cleanup())

  useTask((delta) => {
    if (!groupRef) return
    const lerpSpeed = 1 - Math.pow(0.03, delta)
    groupRef.rotation.y += (mouseX * 0.4 - groupRef.rotation.y) * lerpSpeed
    groupRef.rotation.x += (mouseY * 0.25 - groupRef.rotation.x) * lerpSpeed
  })

  // Chain link config: 5 interlocking torus rings
  // Each link alternates rotation 90 degrees and is spaced along X
  const linkRadius = 1.0
  const tubeRadius = 0.15
  const segments = isMobile ? [32, 16] : [48, 24]
  const spacing = 1.7

  const links = [
    { x: -spacing, rotZ: 0 },
    { x: 0,        rotZ: Math.PI / 2 },
    { x: spacing,  rotZ: 0 },
  ]
</script>

<T.PerspectiveCamera
  makeDefault
  position.z={isMobile ? 6 : 4.5}
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
    {#each links as link}
      <T.Mesh
        position.x={link.x}
        rotation.z={link.rotZ}
      >
        <T.TorusGeometry args={[linkRadius, tubeRadius, segments[1], segments[0]]} />
        <T.MeshStandardMaterial color="#ffffff" wireframe />
      </T.Mesh>
    {/each}
  </T.Group>
</Float>
