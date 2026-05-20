<script>
  import { T, useTask } from '@threlte/core'
  import { Float } from '@threlte/extras'
  import { onMount, onDestroy } from 'svelte'
  import * as THREE from 'three'
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

  let groupRef = $state(null)
  let mouseX = $state(0)
  let mouseY = $state(0)
  let isMobile = $state(false)
  let particleGeo = $state(null)
  let tvScene = $state(null)
  let mixer = $state(null)

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

    // Load TV model – add directly to the Three.js group (bypasses Svelte reactivity)
    const loader = new GLTFLoader()
    const waitForGroup = () => {
      if (!groupRef) return requestAnimationFrame(waitForGroup)
      loader.load(
        '/models/tv/scene.gltf',
        (gltf) => {
          groupRef.add(gltf.scene)
          if (gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(gltf.scene)
            for (const clip of gltf.animations) {
              mixer.clipAction(clip).play()
            }
          }
        },
        undefined,
        (err) => {
          console.error('GLTF load error:', err)
        }
      )
    }
    waitForGroup()

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
      pGeo.dispose()
    }
  })

  onDestroy(() => cleanup())

  useTask((delta) => {
    if (mixer) mixer.update(delta)

    if (!groupRef) return
    const lerpSpeed = 1 - Math.pow(0.03, delta)
    groupRef.rotation.y += (mouseX * 0.4 + Math.PI - groupRef.rotation.y) * lerpSpeed
    groupRef.rotation.x += (mouseY * 0.25 - groupRef.rotation.x) * lerpSpeed

    // Drift particles slowly
    if (particleGeo) {
      const pos = particleGeo.attributes.position
      for (let i = 0; i < pos.count; i++) {
        pos.array[i * 3 + 1] += delta * 0.08
        if (pos.array[i * 3 + 1] > 6) pos.array[i * 3 + 1] = -6
      }
      pos.needsUpdate = true
    }
  })
</script>

<T.PerspectiveCamera
  makeDefault
  position.z={isMobile ? 9 : 7}
  fov={50}
/>

<T.AmbientLight intensity={0.8} />
<T.DirectionalLight position={[3, 4, 5]} intensity={0.5} />

<Float
  floatingRange={[-0.12, 0.12]}
  rotationSpeed={[0.2, 0.5, 0.15]}
  rotationIntensity={0.2}
  floatIntensity={0.5}
  speed={1.2}
>
  <T.Group bind:ref={groupRef} scale={isMobile ? 0.005 : 0.007} position.x={0} position.y={-1.2} rotation.y={Math.PI}></T.Group>
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
