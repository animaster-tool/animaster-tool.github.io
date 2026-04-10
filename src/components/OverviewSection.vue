<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

const isVisible = ref(false)
const overviewSectionRef = ref<HTMLElement | null>(null)
const LIVE_DEMO_BASE_WIDTH = 1600
const LIVE_DEMO_BASE_HEIGHT = 900
const LIVE_DEMO_VISUAL_SCALE = 0.93

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
      <!-- Live interactive demo: the real AniMaster frontend, prebaked with
           the 小红帽 workspace, running purely in the browser (no backend). -->
      <div class="live-demo-wrap" :style="liveDemoStyle">
        <div class="live-demo-header">
          <span class="dot" /><span class="dot" /><span class="dot" />
          <span class="live-demo-title">AniMaster · Live Demo</span>
          <span class="live-demo-badge">Read-only · No backend</span>
        </div>
        <iframe
          class="live-demo-frame"
          :style="liveDemoFrameStyle"
          src="./anime-system/index.html"
          title="AniMaster interactive demo"
          loading="lazy"
          allow="clipboard-read; clipboard-write"
        />
        <!-- <div class="live-demo-hint">
          Drag the canvas, zoom with the wheel, click any Beat node to open the
          Inspector. All generation actions are disabled in this demo.
        </div> -->
      </div>
    </div>

    <template v-if="false"><div :class="['overview-block delay', { visible: isVisible }]">
      <h2>The Challenge</h2>
      <p class="description">
        Video Generation Models have shown impressive capabilities, yet everyday creators
        still struggle with two fundamental challenges:
      </p>

      <div class="challenge-cards">
        <div class="challenge-card">
          <div class="card-number">DC1</div>
          <h3>The Expertise Gap</h3>
          <p>
            Translating free-form story texts into professional cinematic scripts requires
            specialized knowledge about narrative structure, beat types, and shot design —
            expertise that most non-professional creators lack.
          </p>
        </div>

        <div class="challenge-card">
          <div class="card-number">DC2</div>
          <h3>The Expression Gap</h3>
          <p>
            Even when creators have clear creative intents, they have no effective way
            to map those intents to concrete visual parameters like shot composition,
            camera controls, and shot sequencing.
          </p>
        </div>
      </div>
    </div></template>

    <template v-if="false"><div :class="['overview-block delay-2', { visible: isVisible }]">
      <h2>Our Approach</h2>

      <div class="feature-cards">
        <div class="feature-card"><!--
          <div class="feature-icon">📐</div>
          <h3>Three-Layer Design Framework</h3>
          <p>
            Grounded in narratology and film studies, we distill the key design dimensions across
            three layers — <strong>Story Space</strong>, <strong>Script Space</strong>, and
            <strong>Video Space</strong> — as well as the translation rules between them.
          </p>
        </div> -->

        <div class="feature-card">
          <div class="feature-icon">🎬</div>
          <h3>Rule-Guided Multi-Stage Translation</h3>
          <p>
            AniMaster operationalizes the framework through two translation stages:
            <strong>S2S</strong> (Story → Script) expands events into Beat sequences, and
            <strong>S2V</strong> (Script → Video) translates Beats into executable Shots
            with nine visual parameters.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🖌️</div>
          -->
          <h3>Canvas-Based Interactive Authoring</h3>
          <p>
            A semantic-zooming canvas lets creators navigate from global narrative overview
            to shot-level production. At every level, users can review, modify, and override
            the system's outputs through intuitive interactions.
          </p>
        </div>
      </div>

      <!-- <div class="about-actions">
        <button class="action-btn" @click="$emit('scrollTo', 'demos')">WALKTHROUGH ➜</button>
        <button class="action-btn secondary" @click="$emit('scrollTo', 'method')">METHOD ➜</button>
      </div> -->
    </div></template>
  </section>
</template>

<style scoped>
.overview-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: calc(var(--header-height) + var(--size-28)) var(--page-gutter) calc(56px * var(--page-scale));
  max-width: var(--section-max-width);
  margin: 0 auto;
}

.spacer {
  display: none;
}

.overview-block {
  margin-bottom: 0;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.overview-section > .overview-block:first-of-type {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  gap: var(--overview-gap);
}

.overview-block.visible {
  opacity: 1;
  transform: translateY(0);
}

.overview-block.delay {
  transition-delay: 0.15s;
}

.overview-block.delay-2 {
  transition-delay: 0.3s;
}

h2 {
  font-size: calc(var(--section-title-size) * 0.92);
  font-weight: 700;
  color: #fff;
  margin-bottom: var(--size-16);
}

.tldr {
  color: rgba(255, 255, 255, 0.75);
  font-size: calc(var(--body-size) * 0.92);
  line-height: 1.75;
  margin-bottom: 0;
  width: 100%;
  max-width: none;
}

.description {
  color: rgba(255, 255, 255, 0.65);
  font-size: 1rem;
  line-height: 1.7;
  margin-bottom: 24px;
}

/* ===== Live Interactive Demo (iframed real frontend) ===== */
.live-demo-wrap {
  position: relative;
  width: 100%;
  max-width: 100%;
  flex: 0 0 auto;
  aspect-ratio: 16 / 9;
  align-self: center;
  background: rgba(13, 13, 13, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--card-radius);
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
}

.live-demo-header,
.live-demo-hint,
.overview-block.delay,
.overview-block.delay-2 {
  display: none !important;
}

.live-demo-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.live-demo-header .dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
}

.live-demo-title {
  margin-left: 10px;
  font-size: 12.5px;
  letter-spacing: 0.4px;
  color: rgba(255, 255, 255, 0.6);
}

.live-demo-badge {
  margin-left: auto;
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(100, 181, 246, 0.12);
  color: #64b5f6;
  border: 1px solid rgba(100, 181, 246, 0.4);
  letter-spacing: 0.3px;
}

.live-demo-frame {
  position: absolute;
  inset: 0 auto auto 0;
  width: 1600px;
  height: 900px;
  border: none;
  display: block;
  background: #0a0a0a;
  transform-origin: top left;
}

.live-demo-hint {
  padding: 10px 18px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  text-align: center;
}


/* Challenge Cards */
.challenge-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.challenge-card {
  background: rgba(255, 80, 80, 0.06);
  border: 1px solid rgba(255, 100, 100, 0.15);
  border-radius: 12px;
  padding: 24px 28px;
  transition: border-color 0.3s;
}

.challenge-card:hover {
  border-color: rgba(255, 100, 100, 0.3);
}

.card-number {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(255, 120, 120, 0.8);
  background: rgba(255, 100, 100, 0.1);
  padding: 2px 10px;
  border-radius: 10px;
  margin-bottom: 10px;
  letter-spacing: 1px;
}

.challenge-card h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
}

.challenge-card p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  line-height: 1.65;
}

/* Feature Cards */
.feature-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 28px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 24px;
  transition: border-color 0.3s;
}

.feature-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

.feature-icon {
  font-size: 1.6rem;
  margin-bottom: 12px;
}

.feature-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
}

.feature-card p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.88rem;
  line-height: 1.65;
}

.about-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 1px;
  transition: all 0.3s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.action-btn.secondary {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.15);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.08);
}

@media (max-width: 768px) {
  .overview-section {
    padding: calc(var(--header-height) + var(--size-12)) 24px 32px;
  }
  .overview-section > .overview-block:first-of-type {
    gap: 18px;
  }
}
</style>
