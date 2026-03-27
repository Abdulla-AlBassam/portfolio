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

  // Split photos into columns for the vertical carousel
  let columnCount = 10;
  let columns = [];

  function getColumnCount() {
    if (typeof window === "undefined") return 10;
    const w = window.innerWidth;
    if (w <= 480) return 3;
    if (w <= 768) return 4;
    if (w <= 1023) return 6;
    return 10;
  }

  function buildColumns() {
    columnCount = getColumnCount();
    columns = Array.from({ length: columnCount }, () => []);
    photos.forEach((photo, i) => {
      columns[i % columnCount].push({ photo, originalIndex: i });
    });
  }

  buildColumns();

  // Varying scroll durations per column for parallax feel
  function getScrollDuration(colIndex) {
    const base = 30;
    const offsets = [0, 4, -2, 6, -3, 2, 5, -1, 3, -4];
    return base + (offsets[colIndex % offsets.length] || 0);
  }

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
  {#each columns as column, colIndex}
    <div class="photo-column" style="--scroll-duration: {getScrollDuration(colIndex)}s">
      <div class="column-inner">
        {#each column as { photo, originalIndex }}
          <div class="photo-item" role="listitem">
            <button
              class="photo-button"
              on:click={() => handleClick(originalIndex)}
              on:keydown={(e) => handleItemKeydown(e, originalIndex)}
              aria-label="View {altFromSrc(photo.src)} in lightbox"
            >
              <img
                src={photo.thumb}
                alt={altFromSrc(photo.src)}
                decoding="async"
                bind:this={imageEls[originalIndex]}
              />
            </button>
          </div>
        {/each}
        <!-- Duplicate for seamless loop -->
        {#each column as { photo, originalIndex }}
          <div class="photo-item" aria-hidden="true">
            <button
              class="photo-button"
              on:click={() => handleClick(originalIndex)}
              tabindex="-1"
            >
              <img
                src={photo.thumb}
                alt=""
                decoding="async"
              />
            </button>
          </div>
        {/each}
      </div>
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
    display: flex;
    gap: 4px;
    padding: 0 0.5rem;
    height: 70vh;
    overflow: hidden;
  }

  .photo-column {
    flex: 1;
    overflow: hidden;
  }

  .column-inner {
    animation: scroll-up var(--scroll-duration, 30s) linear infinite;
  }

  .column-inner {
    transition: animation-duration 0.5s ease;
  }

  .photo-grid:hover .column-inner {
    animation-duration: 120s;
  }

  @keyframes scroll-up {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(-50%);
    }
  }

  .photo-item {
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
    opacity: 0.8;
    transition:
      opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1),
      transform 0.4s cubic-bezier(0.25, 1, 0.5, 1),
      filter 0.4s;
    filter: brightness(0.92);
  }

  .photo-button:hover img,
  .photo-button:focus-visible img {
    opacity: 1;
    transform: scale(1.04);
    filter: brightness(1);
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
    backdrop-filter: blur(0px);
    -webkit-backdrop-filter: blur(0px);
    transition:
      background 0.5s cubic-bezier(0.25, 1, 0.5, 1),
      backdrop-filter 0.5s cubic-bezier(0.25, 1, 0.5, 1),
      -webkit-backdrop-filter 0.5s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .overlay.visible .overlay-backdrop {
    background: rgba(0, 0, 0, 0.88);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
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
    opacity: 0;
    transform: rotate(-90deg);
    transition:
      opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0.3s,
      transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0.3s;
  }

  .overlay.visible .close-button {
    opacity: 0.7;
    transform: rotate(0deg);
  }

  .close-button:hover,
  .close-button:focus-visible {
    opacity: 1;
    transform: rotate(90deg);
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
    font-family: "Space Grotesk", sans-serif;
    font-size: 0.8rem;
    letter-spacing: 0.15em;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.4s 0.5s;
  }

  .overlay.visible .lightbox-counter {
    opacity: 1;
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
    transform: translateY(-50%) scale(0.8);
    z-index: 3;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 50%;
    color: var(--text-primary);
    cursor: pointer;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition:
      opacity 0.35s cubic-bezier(0.25, 1, 0.5, 1) 0.35s,
      transform 0.35s cubic-bezier(0.25, 1, 0.5, 1) 0.35s,
      border-color 0.2s,
      background 0.2s;
  }

  .overlay.visible .nav-button {
    opacity: 0.6;
    transform: translateY(-50%) scale(1);
  }

  .nav-button:hover,
  .nav-button:focus-visible {
    opacity: 1;
    border-color: rgba(255, 255, 255, 0.35);
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-50%) scale(1.1);
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
      gap: 4px;
    }
  }

  @media (max-width: 768px) {
    .photo-grid {
      gap: 3px;
      height: 60vh;
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
      gap: 2px;
    }

    .photo-item {
      margin-bottom: 2px;
    }
  }

  /* --- Reduced motion --- */
  @media (prefers-reduced-motion: reduce) {
    .column-inner {
      animation: none;
    }

    .photo-button img {
      transition: opacity 0.2s;
    }

    .photo-button:hover img,
    .photo-button:focus-visible img {
      transform: none;
    }

    .overlay-backdrop {
      transition: background 0.2s;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }

    .overlay.visible .overlay-backdrop {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }

    .close-button {
      opacity: 0.7;
      transform: none;
      transition: opacity 0.2s;
    }

    .overlay.visible .close-button {
      transform: none;
    }

    .close-button:hover {
      transform: none;
    }

    .nav-button {
      opacity: 0.5;
      transform: translateY(-50%);
      transition: opacity 0.2s, border-color 0.2s;
    }

    .overlay.visible .nav-button {
      transform: translateY(-50%);
    }

    .nav-button:hover {
      transform: translateY(-50%);
    }

    .lightbox-counter {
      opacity: 1;
      transition: none;
    }
  }
</style>
