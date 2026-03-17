<script>
  import { onMount } from "svelte";

  export let photos = []; // Array of { src: string, thumb: string }

  let expandedIndex = -1;
  let thumbRect = null;
  let phase = "idle"; // "idle" | "expanding" | "expanded" | "collapsing"
  let imageEls = [];
  let overlayEl;
  let overlayImageStyle = "";

  function computeOverlayStyle() {
    if (!thumbRect) {
      overlayImageStyle = "";
      return;
    }

    if (phase === "expanding") {
      overlayImageStyle = `
        left: ${thumbRect.left}px;
        top: ${thumbRect.top}px;
        width: ${thumbRect.width}px;
        height: ${thumbRect.height}px;
        transition: none;
      `;
    } else if (phase === "expanded") {
      const img = imageEls[expandedIndex];
      const aspectRatio = img
        ? img.naturalWidth / img.naturalHeight
        : thumbRect.width / thumbRect.height;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxW = vw * 0.5;
      const maxH = vh * 0.7;

      let targetW, targetH;
      if (aspectRatio > maxW / maxH) {
        targetW = maxW;
        targetH = maxW / aspectRatio;
      } else {
        targetH = maxH;
        targetW = maxH * aspectRatio;
      }

      const targetLeft = (vw - targetW) / 2;
      const targetTop = (vh - targetH) / 2;

      overlayImageStyle = `
        left: ${targetLeft}px;
        top: ${targetTop}px;
        width: ${targetW}px;
        height: ${targetH}px;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      `;
    } else if (phase === "collapsing") {
      overlayImageStyle = `
        left: ${thumbRect.left}px;
        top: ${thumbRect.top}px;
        width: ${thumbRect.width}px;
        height: ${thumbRect.height}px;
        transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      `;
    } else {
      overlayImageStyle = "";
    }
  }

  $: phase, thumbRect, expandedIndex, computeOverlayStyle();

  function handleClick(index) {
    if (phase === "collapsing" || phase === "expanding") return;

    const img = imageEls[index];
    if (!img) return;

    thumbRect = img.getBoundingClientRect();
    expandedIndex = index;
    phase = "expanding";
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        phase = "expanded";
      });
    });
  }

  function handleClose() {
    if (phase !== "expanded") return;

    const img = imageEls[expandedIndex];
    if (img) {
      thumbRect = img.getBoundingClientRect();
    }

    phase = "collapsing";

    setTimeout(() => {
      expandedIndex = -1;
      phase = "idle";
      thumbRect = null;
      document.body.style.overflow = "";
    }, 380);
  }
</script>

<div class="photo-grid">
  {#each photos as photo, i}
    <div
      class="photo-item"
      on:click={() => handleClick(i)}
    >
      <img
        src={photo.thumb}
        alt=""
        loading="lazy"
        decoding="async"
        bind:this={imageEls[i]}
      />
    </div>
  {/each}
</div>

{#if expandedIndex >= 0}
  <div
    class="overlay"
    class:visible={phase === "expanded"}
    on:click={handleClose}
    bind:this={overlayEl}
  >
    <div class="overlay-backdrop"></div>
    <img
      src={photos[expandedIndex].src}
      alt=""
      class="overlay-image"
      style={overlayImageStyle}
    />
  </div>
{/if}

<style>
  .photo-grid {
    columns: 10;
    column-gap: 3px;
    padding: 0 0.25rem;
    line-height: 0;
  }

  .photo-item {
    break-inside: avoid;
    margin-bottom: 3px;
    overflow: hidden;
    cursor: pointer;
    line-height: 0;
  }

  .photo-item img {
    width: 100%;
    display: block;
    opacity: 0.85;
    transition: opacity 0.3s ease;
  }

  .photo-item:hover img {
    opacity: 1;
  }

  /* Overlay */
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 60;
    pointer-events: auto;
  }

  .overlay-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0);
    transition: background 0.4s ease;
  }

  .overlay.visible .overlay-backdrop {
    background: rgba(0, 0, 0, 0.85);
  }

  .overlay-image {
    position: fixed;
    z-index: 1;
    object-fit: contain;
    pointer-events: auto;
  }

  /* Responsive */
  @media (max-width: 1023px) {
    .photo-grid {
      columns: 6;
      column-gap: 3px;
    }

    .photo-item {
      margin-bottom: 3px;
    }
  }

  @media (max-width: 768px) {
    .photo-grid {
      columns: 4;
      column-gap: 2px;
    }

    .photo-item {
      margin-bottom: 2px;
    }
  }

  @media (max-width: 480px) {
    .photo-grid {
      columns: 3;
      column-gap: 2px;
    }

    .photo-item {
      margin-bottom: 2px;
    }
  }
</style>
