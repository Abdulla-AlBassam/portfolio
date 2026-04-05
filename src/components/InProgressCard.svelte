<script>
  import { onMount, onDestroy } from "svelte";

  let cardEl;
  let isHovering = false;
  let canInteract = false;

  // Lerped mouse position (-1 to 1)
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let animFrame = null;

  // Dot expand state
  let dotExpanded = false;
  let dotTimeout = null;

  const MAX_TILT = 4; // degrees
  const LERP = 0.08;

  onMount(() => {
    const hasHover = window.matchMedia("(hover: hover)").matches;
    const isWide = window.innerWidth > 768;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    canInteract = hasHover && isWide && !prefersReducedMotion;
  });

  onDestroy(() => {
    if (animFrame) cancelAnimationFrame(animFrame);
    if (dotTimeout) clearTimeout(dotTimeout);
  });

  function handleMouseEnter() {
    if (!canInteract) return;
    isHovering = true;
    dotTimeout = setTimeout(() => {
      dotExpanded = true;
    }, 150);
    tick();
  }

  function handleMouseLeave() {
    if (!canInteract) return;
    isHovering = false;
    dotExpanded = false;
    if (dotTimeout) clearTimeout(dotTimeout);
    targetX = 0;
    targetY = 0;
    // Keep ticking until values settle back to 0
  }

  function handleMouseMove(e) {
    if (!canInteract || !cardEl) return;
    const rect = cardEl.getBoundingClientRect();
    targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  }

  function tick() {
    currentX += (targetX - currentX) * LERP;
    currentY += (targetY - currentY) * LERP;

    // Stop animating when settled and not hovering
    const settled = Math.abs(currentX - targetX) < 0.001 && Math.abs(currentY - targetY) < 0.001;
    if (settled && !isHovering) {
      currentX = 0;
      currentY = 0;
      animFrame = null;
      return;
    }

    animFrame = requestAnimationFrame(tick);
  }

  $: tiltStyle = canInteract
    ? `transform: perspective(800px) rotateY(${currentX * MAX_TILT}deg) rotateX(${-currentY * MAX_TILT}deg);`
    : "";

  $: parallaxStyle = canInteract
    ? `transform: translate(${-currentX * 5}px, ${-currentY * 5}px) scale(1.05);`
    : "";
</script>

<div
  class="ip-wrap"
  bind:this={cardEl}
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  on:mousemove={handleMouseMove}
  role="presentation"
>
  <!-- Blinking dot / expanding badge -->
  <div class="ip-dot" class:expanded={dotExpanded}>
    <span class="ip-dot-circle"></span>
    {#if dotExpanded}
      <span class="ip-text">In Progress</span>
    {/if}
  </div>

  <!-- Thumbnail with 3D tilt -->
  <div class="ip-tilt" style={tiltStyle}>
    <div class="ip-parallax" style={parallaxStyle}>
      <slot />
    </div>

    <!-- Blueprint overlay -->
    <div class="ip-blueprint" class:visible={isHovering}>
      <div class="ip-grid"></div>
      <div class="ip-corner tl"></div>
      <div class="ip-corner tr"></div>
      <div class="ip-corner bl"></div>
      <div class="ip-corner br"></div>
    </div>
  </div>
</div>

<style>
  .ip-wrap {
    position: relative;
  }

  /* --- Dot / Badge --- */
  .ip-dot {
    position: absolute;
    top: 0.6rem;
    left: 0.6rem;
    z-index: 3;
    display: flex;
    align-items: center;
    gap: 0;
    height: 24px;
    padding: 0 4px;
    border-radius: 999px;
    background: transparent;
    overflow: hidden;
    transition:
      background 0.35s cubic-bezier(0.16, 1, 0.3, 1),
      padding 0.35s cubic-bezier(0.16, 1, 0.3, 1),
      gap 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .ip-dot.expanded {
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    padding: 0 10px 0 8px;
    gap: 6px;
    border: 1px solid var(--border-active);
  }

  .ip-dot-circle {
    width: 8px;
    height: 8px;
    min-width: 8px;
    border-radius: 50%;
    background: var(--text-heading);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
    animation: ip-blink 1.5s ease-in-out infinite;
  }

  .ip-dot.expanded .ip-dot-circle {
    width: 6px;
    height: 6px;
    min-width: 6px;
    box-shadow: 0 0 4px rgba(255, 255, 255, 0.4);
  }

  .ip-text {
    font-family: "Space Grotesk", sans-serif;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-heading);
    white-space: nowrap;
    clip-path: inset(0 100% 0 0);
    animation: ip-text-reveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.05s forwards;
  }

  @keyframes ip-text-reveal {
    to {
      clip-path: inset(0 0 0 0);
    }
  }

  @keyframes ip-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.25; }
  }

  /* --- 3D Tilt Container (replaces .project-thumbnail) --- */
  .ip-tilt {
    position: relative;
    transform-style: preserve-3d;
    will-change: transform;
    aspect-ratio: 16 / 10;
    background: var(--bg-raised);
    border-radius: 0.5rem;
    overflow: hidden;
    margin-bottom: 1rem;
    transition: transform 0.1s linear;
  }

  .ip-parallax {
    transition: transform 0.1s linear;
  }

  .ip-parallax :global(img) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* --- Blueprint Overlay --- */
  .ip-blueprint {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .ip-blueprint.visible {
    opacity: 1;
  }

  .ip-grid {
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 39px,
        rgba(255, 255, 255, 0.05) 39px,
        rgba(255, 255, 255, 0.05) 40px
      ),
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 39px,
        rgba(255, 255, 255, 0.05) 39px,
        rgba(255, 255, 255, 0.05) 40px
      );
  }

  /* Corner brackets */
  .ip-corner {
    position: absolute;
    width: 16px;
    height: 16px;
    opacity: 0;
    transition:
      opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1),
      transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .ip-blueprint.visible .ip-corner {
    opacity: 1;
    transform: scale(1) !important;
  }

  .ip-corner.tl {
    top: 8px;
    left: 8px;
    border-top: 2px solid rgba(255, 255, 255, 0.3);
    border-left: 2px solid rgba(255, 255, 255, 0.3);
    transform: scale(0);
    transition-delay: 0.1s;
  }

  .ip-corner.tr {
    top: 8px;
    right: 8px;
    border-top: 2px solid rgba(255, 255, 255, 0.3);
    border-right: 2px solid rgba(255, 255, 255, 0.3);
    transform: scale(0);
    transition-delay: 0.15s;
  }

  .ip-corner.bl {
    bottom: 8px;
    left: 8px;
    border-bottom: 2px solid rgba(255, 255, 255, 0.3);
    border-left: 2px solid rgba(255, 255, 255, 0.3);
    transform: scale(0);
    transition-delay: 0.2s;
  }

  .ip-corner.br {
    bottom: 8px;
    right: 8px;
    border-bottom: 2px solid rgba(255, 255, 255, 0.3);
    border-right: 2px solid rgba(255, 255, 255, 0.3);
    transform: scale(0);
    transition-delay: 0.25s;
  }

  /* --- Reduced Motion --- */
  @media (prefers-reduced-motion: reduce) {
    .ip-dot-circle {
      animation: none;
    }

    .ip-tilt {
      transition: none;
    }

    .ip-text {
      clip-path: none;
      animation: none;
    }

    .ip-corner {
      transition: none;
    }

    .ip-blueprint {
      transition: none;
    }
  }
</style>
