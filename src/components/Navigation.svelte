<script>
  let menuOpen = false;
  let hoveredCell = -1;
  let hamburgerEl;
  let overlayEl;
  let closeEl;

  const sections = [
    { num: "02", name: "Projects", href: "/showcase/projects" },
    { num: "03", name: "Photography", href: "/showcase/photography" },
    { num: "04", name: "Skills", href: "/showcase/skills" },
    { num: "05", name: "Contact", href: "/showcase/contact" },
  ];

  function openMenu() {
    menuOpen = true;
    document.body.style.overflow = "hidden";
    // Focus the close button after the overlay becomes visible
    requestAnimationFrame(() => {
      if (closeEl) closeEl.focus();
    });
  }

  function closeMenu() {
    menuOpen = false;
    document.body.style.overflow = "";
    hoveredCell = -1;
    // Return focus to the hamburger
    if (hamburgerEl) hamburgerEl.focus();
  }

  function toggleMenu() {
    if (menuOpen) closeMenu();
    else openMenu();
  }

  function handleOverlayKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
      return;
    }

    // Focus trap: keep Tab cycling within the overlay
    if (e.key === "Tab" && overlayEl) {
      const focusable = overlayEl.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  $: colTemplate =
    hoveredCell === -1
      ? "1fr 1fr"
      : hoveredCell === 0 || hoveredCell === 2
        ? "1.8fr 0.7fr"
        : hoveredCell === 1 || hoveredCell === 3
          ? "0.7fr 1.8fr"
          : "1fr 1fr";

  $: rowTemplate =
    hoveredCell === -1
      ? "0.5fr 1fr 1fr"
      : hoveredCell === 0 || hoveredCell === 1
        ? "0.35fr 1.8fr 0.7fr"
        : hoveredCell === 2 || hoveredCell === 3
          ? "0.35fr 0.7fr 1.8fr"
          : "0.8fr 0.85fr 0.85fr";
</script>

<!-- Header bar -->
<header class="header">
  <a href="/" class="logo">A.</a>
  <button
    class="hamburger"
    on:click={toggleMenu}
    aria-label="Menu"
    aria-expanded={menuOpen}
    aria-controls="nav-overlay"
    bind:this={hamburgerEl}
  >
    <span class="hamburger-line"></span>
    <span class="hamburger-line"></span>
    <span class="hamburger-line"></span>
  </button>
</header>

<!-- Menu overlay -->
<div
  id="nav-overlay"
  class="menu-overlay"
  class:open={menuOpen}
  role="dialog"
  aria-modal="true"
  aria-label="Site navigation"
  on:keydown={handleOverlayKeydown}
  bind:this={overlayEl}
>
  <div class="menu-top">
    <a href="/" class="logo" on:click={closeMenu}>A.</a>
    <button
      class="close-btn"
      on:click={closeMenu}
      aria-label="Close menu"
      bind:this={closeEl}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>

  <nav
    class="menu-grid"
    aria-label="Main navigation"
    style="grid-template-columns: {colTemplate}; grid-template-rows: {rowTemplate};"
  >
    {#each sections as section, i}
      <a
        href={section.href}
        class="menu-cell"
        on:mouseenter={() => (hoveredCell = i)}
        on:mouseleave={() => (hoveredCell = -1)}
        on:click={closeMenu}
      >
        <span class="cell-number">{section.num}</span>
        <span class="cell-name">{section.name}.</span>
      </a>
    {/each}

    <a
      href="/showcase/me"
      class="menu-cell me-cell"
      on:mouseenter={() => (hoveredCell = 4)}
      on:mouseleave={() => (hoveredCell = -1)}
      on:click={closeMenu}
    >
      <span class="cell-number">01</span>
      <span class="cell-name me-name">Me.</span>
    </a>
  </nav>

  <div class="menu-footer">
    <p>&copy; 2026 Abdulla AlBassam</p>
    <p>Built with Astro + Three.js</p>
  </div>
</div>

<style>
  /* Header */
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2.5rem;
    pointer-events: none;
  }

  .header > * {
    pointer-events: auto;
  }

  .logo {
    font-family: "Space Grotesk", sans-serif;
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--text-heading);
    text-decoration: none;
    letter-spacing: -0.02em;
    transition: opacity 0.2s;
  }

  .logo:hover {
    opacity: 0.7;
  }

  .hamburger {
    display: flex;
    flex-direction: column;
    gap: 6px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
  }

  .hamburger:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .hamburger-line {
    display: block;
    width: 26px;
    height: 2px;
    background: var(--text-heading);
    border-radius: 1px;
    transition: transform 0.3s, opacity 0.3s;
  }

  /* Menu overlay */
  .menu-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: var(--bg-primary);
    display: flex;
    flex-direction: column;
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
      visibility 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .menu-overlay.open {
    opacity: 1;
    visibility: visible;
  }

  .menu-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2.5rem;
    flex-shrink: 0;
  }

  .close-btn {
    background: none;
    border: none;
    color: var(--text-heading);
    cursor: pointer;
    padding: 8px;
    transition: opacity 0.2s;
  }

  .close-btn:hover {
    opacity: 0.6;
  }

  .close-btn:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  /* Grid – 3 columns (left, center hub, right) × 2 rows */
  .menu-grid {
    flex: 1;
    display: grid;
    margin: 0 2.5rem;
    transition:
      grid-template-columns 0.6s cubic-bezier(0.4, 0, 0.2, 1),
      grid-template-rows 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Explicit grid placement – 2 cols × 3 rows (Me top, 2×2 below) */
  .menu-cell:nth-child(1) { grid-column: 1; grid-row: 2; }
  .menu-cell:nth-child(2) { grid-column: 2; grid-row: 2; }
  .menu-cell:nth-child(3) { grid-column: 1; grid-row: 3; }
  .menu-cell:nth-child(4) { grid-column: 2; grid-row: 3; }

  .me-cell {
    grid-column: 1 / -1;
    grid-row: 1;
  }

  .menu-cell {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 2.5rem;
    border: 1px solid var(--border);
    text-decoration: none;
    color: var(--text-heading);
    transition:
      background-color 0.4s ease,
      border-color 0.4s ease;
    overflow: hidden;
    position: relative;
  }

  .menu-cell:hover,
  .menu-cell:focus-visible {
    background-color: var(--bg-raised);
    border-color: var(--border-hover);
  }

  .menu-cell:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }

  .cell-number {
    font-family: "Space Grotesk", sans-serif;
    font-size: 0.75rem;
    color: var(--text-muted);
    letter-spacing: 0.12em;
    margin-bottom: 1rem;
  }

  .cell-name {
    font-family: "Space Grotesk", sans-serif;
    font-size: clamp(2rem, 5vw, 5rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .menu-cell:hover .cell-name {
    transform: translateX(10px);
  }

  /* Me cell – no overrides needed, inherits .menu-cell base styles */

  /* Footer */
  .menu-footer {
    display: flex;
    justify-content: space-between;
    padding: 1.5rem 2.5rem;
    color: var(--text-muted);
    font-size: 0.75rem;
    font-family: "Inter", sans-serif;
    flex-shrink: 0;
  }

  /* Mobile */
  @media (max-width: 768px) {
    .header {
      padding: 1.25rem 1.5rem;
    }

    .menu-top {
      padding: 1.25rem 1.5rem;
    }

    .menu-grid {
      margin: 0 1.5rem;
      grid-template-columns: 1fr !important;
      grid-template-rows: repeat(5, 1fr) !important;
    }

    .menu-cell:nth-child(1) { grid-column: 1; grid-row: 2; }
    .menu-cell:nth-child(2) { grid-column: 1; grid-row: 3; }
    .menu-cell:nth-child(3) { grid-column: 1; grid-row: 4; }
    .menu-cell:nth-child(4) { grid-column: 1; grid-row: 5; }

    .me-cell {
      grid-column: 1;
      grid-row: 1;
      padding: 1.5rem;
    }

    .menu-cell {
      padding: 1.5rem;
    }

    .cell-name {
      font-size: 2.5rem;
    }

    .menu-footer {
      padding: 1.25rem 1.5rem;
      flex-direction: column;
      gap: 0.25rem;
    }
  }
</style>
