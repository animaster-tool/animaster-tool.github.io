<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import HeaderNav from './components/HeaderNav.vue'
import HeroSection from './components/HeroSection.vue'
import OverviewSection from './components/OverviewFrameSection.vue'
import PaperSummarySection from './components/PaperSummaryTabsSection.vue'
import GallerySection from './components/GallerySynopsisSection.vue'
import SnapTimeline from './components/SnapTimeline.vue'

const DESIGN_WIDTH = 1600
const DESIGN_HEIGHT = 900

const pageScale = ref(1)

const updatePageScale = () => {
  pageScale.value = Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT)
}

const appScaleStyle = computed<Record<string, string>>(() => {
  const s = pageScale.value

  return {
    '--page-scale': `${s}`,
    '--header-height': `${64 * s}px`,
    '--page-gutter': `${40 * s}px`,
    '--section-padding-y': `${80 * s}px`,
    '--overview-top-space': `${120 * s}px`,
    '--section-max-width': `min(${1480 * s}px, calc(100vw - (var(--page-gutter) * 2)))`,
    '--content-max-width': `min(${1100 * s}px, calc(100vw - (var(--page-gutter) * 2)))`,
    '--hero-title-size': `${40 * s}px`,
    '--section-title-size': `${30 * s}px`,
    '--section-label-size': `${26 * s}px`,
    '--body-size': `${17 * s}px`,
    '--body-size-sm': `${15 * s}px`,
    '--meta-size': `${13 * s}px`,
    '--nav-size': `${14 * s}px`,
    '--card-radius': `${18 * s}px`,
    '--size-8': `${8 * s}px`,
    '--size-10': `${10 * s}px`,
    '--size-12': `${12 * s}px`,
    '--size-14': `${14 * s}px`,
    '--size-16': `${16 * s}px`,
    '--size-18': `${18 * s}px`,
    '--size-20': `${20 * s}px`,
    '--size-22': `${22 * s}px`,
    '--size-24': `${24 * s}px`,
    '--size-28': `${28 * s}px`,
    '--size-32': `${32 * s}px`,
    '--size-34': `${34 * s}px`,
    '--size-36': `${36 * s}px`,
    '--size-40': `${40 * s}px`,
    '--size-42': `${42 * s}px`,
    '--size-56': `${56 * s}px`,
    '--hero-content-max-width': `${1400 * s}px`,
    '--hero-title-max-width': `${1080 * s}px`,
    '--overview-gap': `${28 * s}px`,
    '--section-gap-lg': `${32 * s}px`,
    '--section-gap-md': `${24 * s}px`,
    '--section-gap-sm': `${16 * s}px`,
    '--timeline-left': `${24 * s}px`,
    '--timeline-gap': `${18 * s}px`,
    '--timeline-dot-size': `${11 * s}px`,
    '--timeline-label-size': `${12.5 * s}px`,
  }
})

const scrollTo = (id: string) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(() => {
  updatePageScale()
  window.addEventListener('resize', updatePageScale)
})

onUnmounted(() => {
  window.removeEventListener('resize', updatePageScale)
})
</script>

<template>
  <div class="app-container" :style="appScaleStyle">
    <!-- Global video background: fixed-position, non-interactive, covers every
         section. Blur + dark overlay live in CSS. -->
    <video
      class="bg-video"
      src="/videos/demo-bg.mp4"
      autoplay
      muted
      loop
      playsinline
      preload="auto"
      aria-hidden="true"
      tabindex="-1"
    ></video>
    <div class="bg-video-overlay" aria-hidden="true"></div>

    <HeaderNav @scroll-to="scrollTo" />
    <SnapTimeline />
    <main class="snap-scroller">
      <HeroSection @scroll-to="scrollTo" />
      <OverviewSection @scroll-to="scrollTo" />
      <PaperSummarySection />
      <GallerySection />
    </main>
  </div>
</template>

<style>
/* ===== Global Styles (Dark Theme) ===== */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  /* The document itself does NOT scroll — scrolling is delegated to the
     dedicated <main class="snap-scroller"> container below, per MDN's
     recommended scroll-snap pattern. This keeps snap behaviour deterministic
     and prevents the page from double-scrolling. */
  overflow: hidden;
}

html {
  /* Dark fallback shown while the video is still loading (and if it fails). */
  background-color: #0a0a0a;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  /* Transparent so the fixed <video> behind can paint through. */
  background-color: transparent;
  color: #fff;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ===== Global video background =====
   The video is fixed behind every scrolling section. A medium blur is
   applied directly to the <video> (cheap and universally supported, unlike
   backdrop-filter which has quirks with video). scale(1.08) hides the
   blurred edge halo. The dark overlay on top pins contrast for text. */
.bg-video {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  object-fit: cover;
  z-index: -2;
  filter: blur(14px) brightness(0.75);
  transform: scale(1.08);
  pointer-events: none;
  user-select: none;
}

.bg-video-overlay {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  /* Layered darken + subtle vignette from the edges */
  background:
    radial-gradient(
      ellipse at center,
      rgba(10, 10, 10, 0.35) 0%,
      rgba(10, 10, 10, 0.6) 60%,
      rgba(10, 10, 10, 0.78) 100%
    );
}

/* ===== Scroll Snap Container =====
   Reference: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll_snap/Basic_concepts
   - main is the only scrolling element, exactly one viewport tall.
   - Each direct child is exactly one viewport tall, so every snap stop
     aligns flush with the browser window — no off-by-a-few-pixels.
   - dvh (dynamic viewport height) tracks mobile browser chrome resizing;
     we set 100vh first as a fallback for older engines, then 100dvh for
     modern ones (last declaration wins). */
.snap-scroller {
  height: 100vh;
  height: 100dvh;
  overflow-y: scroll;
  overflow-x: hidden;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  /* Hide scrollbar across browsers */
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.snap-scroller::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

/* Hide inner scrollbars on every snap child too */
.snap-scroller > section,
.snap-scroller > .site-footer {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.snap-scroller > section::-webkit-scrollbar,
.snap-scroller > .site-footer::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.snap-scroller > section,
.snap-scroller > .site-footer {
  height: 100vh;
  height: 100dvh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  /* Each snapped page owns its own overflow so long content scrolls inside
     the slot instead of bleeding into the next section. */
  overflow-y: auto;
  box-sizing: border-box;
}

.snap-scroller > .overview-section {
  overflow: hidden;
}

a {
  color: inherit;
  text-decoration: none;
}

img,
video {
  max-width: 100%;
  display: block;
}

button {
  font-family: inherit;
}

/* Globally hide scrollbars (page-wide) */
* {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
*::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

/* Selection */
::selection {
  background: rgba(100, 181, 246, 0.3);
  color: #fff;
}
</style>

<style scoped>
.app-container {
  min-height: 100vh;
}
</style>
