<script>
  import { onMount, onDestroy } from "svelte";

  export let photos = []; // Array of { src: string, thumb: string, mid: string }

  let expandedIndex = -1;
  let thumbRect = null;
  let phase = "idle"; // "idle" | "expanding" | "expanded" | "collapsing"
  let imageEls = [];
  let overlayEl;
  let overlayImageStyle = "";
  let lastOpenedEl = null;

  function altFromSrc(src) {
    const name = src.split("/").pop().replace(/\.\w+$/, "");
    return `Film photograph ${name}`;
  }

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
      const isMobile = vw <= 768;
      const maxW = isMobile ? vw * 0.92 : vw * 0.85;
      const maxH = isMobile ? vh * 0.8 : vh * 0.85;

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

    lastOpenedEl = img.closest(".photo-item");
    thumbRect = img.getBoundingClientRect();
    expandedIndex = index;
    phase = "expanding";
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        phase = "expanded";
        // Move focus into the lightbox
        if (overlayEl) overlayEl.focus();
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
      // Return focus to the thumbnail that opened the lightbox
      if (lastOpenedEl) {
        lastOpenedEl.focus();
        lastOpenedEl = null;
      }
    }, 380);
  }

  function handleKeydown(e) {
    if (expandedIndex < 0) return;

    if (e.key === "Escape") {
      handleClose();
    } else if (e.key === "ArrowRight" && phase === "expanded") {
      navigatePhoto(1);
    } else if (e.key === "ArrowLeft" && phase === "expanded") {
      navigatePhoto(-1);
    }
  }

  function navigatePhoto(direction) {
    const next = expandedIndex + direction;
    if (next < 0 || next >= photos.length) return;

    const img = imageEls[next];
    if (img) thumbRect = img.getBoundingClientRect();
    expandedIndex = next;
    phase = "expanding";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        phase = "expanded";
      });
    });
  }

  function handleItemKeydown(e, index) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick(index);
    }
  }

  let cleanupKeydown;

  onMount(() => {
    document.addEventListener("keydown", handleKeydown);
    cleanupKeydown = () => document.removeEventListener("keydown", handleKeydown);
  });

  onDestroy(() => {
    if (cleanupKeydown) cleanupKeydown();
  });
</script>

<div class="photo-grid" role="list" aria-label="Photography gallery">
  {#each photos as photo, i}
    <div
      class="photo-item"
      role="listitem"
    >
      <button
        class="photo-button"
        on:click={() => handleClick(i)}
        on:keydown={(e) => handleItemKeydown(e, i)}
        aria-label="View {altFromSrc(photo.src)} in lightbox"
      >
        <img
          src={photo.thumb}
          alt={altFromSrc(photo.src)}
          loading="lazy"
          decoding="async"
          bind:this={imageEls[i]}
        />
      </button>
    </div>
  {/each}
</div>

{#if expandedIndex >= 0}
  <div
    class="overlay"
    class:visible={phase === "expanded"}
    on:click={handleClose}
    bind:this={overlayEl}
    role="dialog"
    aria-modal="true"
    aria-label="Photo lightbox — {altFromSrc(photos[expandedIndex].src)}"
    tabindex="-1"
  >
    <div class="overlay-backdrop"></div>
    <button class="close-button" on:click={handleClose} aria-label="Close lightbox">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
    {#if expandedIndex > 0}
      <button class="nav-button nav-prev" on:click|stopPropagation={() => navigatePhoto(-1)} aria-label="Previous photo">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
    {/if}
    {#if expandedIndex < photos.length - 1}
      <button class="nav-button nav-next" on:click|stopPropagation={() => navigatePhoto(1)} aria-label="Next photo">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    {/if}
    <img
      src={photos[expandedIndex].mid}
      alt={altFromSrc(photos[expandedIndex].src)}
      class="overlay-image"
      style={overlayImageStyle}
    />
    <p class="lightbox-counter" aria-live="polite">{expandedIndex + 1} / {photos.length}</p>
  </div>
{/if}

<style>
  .photo-grid {
    columns: 10;
    column-gap: 4px;
    padding: 0 0.5rem;
    line-height: 0;
  }

  .photo-item {
    break-inside: avoid;
    margin-bottom: 4px;
    overflow: hidden;
    line-height: 0;
  }

  .photo-button {
    display: block;
    width: 100%;
    padding: 0;
    margin: 0;
    border: none;
    background: none;
    cursor: pointer;
    line-height: 0;
  }

  .photo-button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }

  .photo-button img {
    width: 100%;
    display: block;
    opacity: 0.85;
    transition: opacity 0.3s ease;
  }

  .photo-button:hover img,
  .photo-button:focus-visible img {
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
    background: var(--bg-overlay);
  }

  .overlay:focus {
    outline: none;
  }

  .close-button {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 3;
    background: none;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    padding: 8px;
    opacity: 0.7;
    transition: opacity 0.2s ease;
  }

  .close-button:hover,
  .close-button:focus-visible {
    opacity: 1;
  }

  .close-button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .lightbox-counter {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 3;
    color: var(--text-muted);
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    pointer-events: none;
  }

  .overlay-image {
    position: fixed;
    z-index: 1;
    object-fit: contain;
    pointer-events: auto;
  }

  .nav-button {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    z-index: 3;
    background: none;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    color: var(--text-primary);
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.5;
    transition: opacity 0.2s ease, border-color 0.2s ease;
  }

  .nav-button:hover,
  .nav-button:focus-visible {
    opacity: 1;
    border-color: rgba(255, 255, 255, 0.35);
  }

  .nav-button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .nav-prev {
    left: 1.25rem;
  }

  .nav-next {
    right: 1.25rem;
  }

  /* Responsive */
  @media (max-width: 1023px) {
    .photo-grid {
      columns: 6;
      column-gap: 4px;
    }

    .photo-item {
      margin-bottom: 4px;
    }
  }

  @media (max-width: 768px) {
    .photo-grid {
      columns: 4;
      column-gap: 3px;
    }

    .photo-item {
      margin-bottom: 3px;
    }

    .nav-button {
      width: 36px;
      height: 36px;
    }

    .nav-prev {
      left: 0.75rem;
    }

    .nav-next {
      right: 0.75rem;
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
