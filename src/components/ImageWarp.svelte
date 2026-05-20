<script>
  import { onMount } from "svelte";

  let container;

  onMount(async () => {
    const THREE = await import("three");

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Orthographic camera – maps 1:1 to container pixels
    const camera = new THREE.OrthographicCamera(
      -0.5, 0.5, 0.5, -0.5, 0.1, 10
    );
    camera.position.z = 1;

    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Load the photo as a texture
    const texture = await new Promise((resolve, reject) => {
      new THREE.TextureLoader().load("/aboutme.jpg", resolve, undefined, reject);
    });
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // Shader material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uStrength: { value: 0.0 },
        uRadius: { value: 0.25 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform vec2 uMouse;
        uniform float uStrength;
        uniform float uRadius;
        varying vec2 vUv;

        void main() {
          vec2 diff = vUv - uMouse;
          float dist = length(diff);
          float power = exp(-dist * dist / (2.0 * uRadius * uRadius));
          vec2 dir = diff / (dist + 0.001);
          vec2 distortedUv = vUv + dir * power * uStrength;
          distortedUv = clamp(distortedUv, 0.0, 1.0);
          gl_FragColor = texture2D(uTexture, distortedUv);
        }
      `,
    });

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    scene.add(plane);

    // Smooth animation targets
    let targetMouse = { x: 0.5, y: 0.5 };
    let targetStrength = 0.0;
    let hovering = false;

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      targetMouse.x = (e.clientX - rect.left) / rect.width;
      targetMouse.y = 1.0 - (e.clientY - rect.top) / rect.height;
      hovering = true;
      targetStrength = 0.15;
    };

    const onMouseLeave = () => {
      hovering = false;
      targetStrength = 0.0;
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);

    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Smooth lerp for mouse position and strength
      const mouse = material.uniforms.uMouse.value;
      mouse.x += (targetMouse.x - mouse.x) * 0.08;
      mouse.y += (targetMouse.y - mouse.y) * 0.08;

      material.uniforms.uStrength.value +=
        (targetStrength - material.uniforms.uStrength.value) * 0.06;

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      material.dispose();
      texture.dispose();
    };
  });
</script>

<div bind:this={container} class="warp-container"></div>

<style>
  .warp-container {
    position: absolute;
    inset: 0;
    z-index: 1;
    cursor: grab;
  }

  @media (max-width: 768px) {
    .warp-container {
      display: none;
    }
  }
</style>
