<script>
  import { Canvas } from '@threlte/core'
  import TorusKnotScene from './TorusKnotScene.svelte'
</script>

<div class="three-container">
  <Canvas>
    <TorusKnotScene />
  </Canvas>
</div>

<style>
  .three-container {
    position: absolute;
    inset: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
  }

  .three-container :global(canvas) {
    display: block;
    width: 100% !important;
    height: 100% !important;
  }
</style>
