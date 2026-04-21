<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

const isVisible = ref(false)
const overviewSectionRef = ref<HTMLElement | null>(null)

const LIVE_DEMO_BASE_WIDTH = 1920
const LIVE_DEMO_BASE_HEIGHT = 1080
const LIVE_DEMO_VISUAL_SCALE = 0.88

// ─── Style overrides injected into the iframe (same-origin) ─────────────
// Because the iframe's Vue component sets --arc-* CSS custom properties as
// inline style on .story-arc-bar, a stylesheet rule with !important is the
// only way to beat them without touching the AniMaster source. Tune the
// pixel values below to adjust the top StoryArcBar height in the demo.
const IFRAME_STYLE_OVERRIDES = `
.story-arc-bar {
  --arc-shot-height: 48px !important;
  /* Derive width from height to preserve the 16:9 thumbnail aspect ratio.
     Change --arc-shot-height above and width follows automatically. */
  --arc-shot-width: calc(var(--arc-shot-height) * 16 / 9) !important;
  --arc-bar-max-height: 72px !important;
  --arc-canvas-min-height: 56px !important;
  --arc-bar-padding-y: 6px !important;
}
`

const liveDemoStyle = ref({
  width: `${Math.round(LIVE_DEMO_BASE_WIDTH * LIVE_DEMO_VISUAL_SCALE)}px`,
  height: `${Math.round(LIVE_DEMO_BASE_HEIGHT * LIVE_DEMO_VISUAL_SCALE)}px`,
})
const liveDemoFrameStyle = ref({
  width: `${LIVE_DEMO_BASE_WIDTH}px`,
  height: `${LIVE_DEMO_BASE_HEIGHT}px`,
  transform: `scale(${LIVE_DEMO_VISUAL_SCALE})`,
})

let resizeObserver: ResizeObserver | null = null
let intersectionObserver: IntersectionObserver | null = null

const updateLiveDemoSize = () => {
  const section = overviewSectionRef.value
  if (!section) return

  const styles = getComputedStyle(section)
  const paddingX =
    (Number.parseFloat(styles.paddingLeft || '0') || 0) +
    (Number.parseFloat(styles.paddingRight || '0') || 0)
  const paddingY =
    (Number.parseFloat(styles.paddingTop || '0') || 0) +
    (Number.parseFloat(styles.paddingBottom || '0') || 0)

  const availableWidth = Math.max(section.clientWidth - paddingX, 0)
  const availableHeight = Math.max(section.clientHeight - paddingY, 0)

  if (availableWidth <= 0 || availableHeight <= 0) return

  let width = availableWidth
  let height = (width * LIVE_DEMO_BASE_HEIGHT) / LIVE_DEMO_BASE_WIDTH

  if (height > availableHeight) {
    height = availableHeight
    width = (height * LIVE_DEMO_BASE_WIDTH) / LIVE_DEMO_BASE_HEIGHT
  }

  width *= LIVE_DEMO_VISUAL_SCALE
  height *= LIVE_DEMO_VISUAL_SCALE

  const scale = Math.min(width / LIVE_DEMO_BASE_WIDTH, height / LIVE_DEMO_BASE_HEIGHT)

  liveDemoStyle.value = {
    width: `${Math.round(width)}px`,
    height: `${Math.round(height)}px`,
  }
  liveDemoFrameStyle.value = {
    width: `${LIVE_DEMO_BASE_WIDTH}px`,
    height: `${LIVE_DEMO_BASE_HEIGHT}px`,
    transform: `scale(${scale})`,
  }
}

const onIframeLoad = (ev: Event) => {
  const iframe = ev.target as HTMLIFrameElement
  const doc = iframe.contentDocument
  if (!doc) return // should not happen: same-origin iframe
  // Remove any previous injection in case of reload/HMR
  doc.getElementById('animaster-demo-style-overrides')?.remove()
  const style = doc.createElement('style')
  style.id = 'animaster-demo-style-overrides'
  style.textContent = IFRAME_STYLE_OVERRIDES
  doc.head.appendChild(style)
}

onMounted(() => {
  const section = overviewSectionRef.value
  if (!section) return

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true
          intersectionObserver?.disconnect()
        }
      })
    },
    { threshold: 0.2 }
  )
  intersectionObserver.observe(section)

  nextTick(() => {
    updateLiveDemoSize()
    resizeObserver = new ResizeObserver(() => updateLiveDemoSize())
    resizeObserver.observe(section)
  })
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
})
</script>

<template>
  <section
    id="overview"
    ref="overviewSectionRef"
    :class="['overview-section', { visible: isVisible }]"
  >
    <div class="overview-block">
      <div class="live-demo-wrap" :style="liveDemoStyle">
        <iframe
          class="live-demo-frame"
          :style="liveDemoFrameStyle"
          src="./anime-system/index.html"
          title="AniMaster interactive demo"
          loading="lazy"
          allow="clipboard-read; clipboard-write"
          @load="onIframeLoad"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.overview-section {
  height: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: calc(var(--header-height) + var(--size-10)) var(--page-gutter)
    calc(24px * var(--page-scale));
  max-width: var(--section-max-width);
  margin: 0 auto;
  overflow: hidden;
}

.overview-block {
  flex: 0 0 auto;
  width: fit-content;
  height: fit-content;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.overview-section.visible .overview-block {
  opacity: 1;
  transform: translateY(0);
}

.live-demo-wrap {
  position: relative;
  aspect-ratio: 16 / 9;
  background: rgba(13, 13, 13, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--card-radius);
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
}

.live-demo-frame {
  position: absolute;
  inset: 0 auto auto 0;
  width: 1920px;
  height: 1080px;
  border: none;
  display: block;
  background: #0a0a0a;
  transform-origin: top left;
}

@media (max-width: 768px) {
  .overview-section {
    padding: calc(var(--header-height) + var(--size-8)) 24px calc(20px * var(--page-scale));
  }
}
</style>
