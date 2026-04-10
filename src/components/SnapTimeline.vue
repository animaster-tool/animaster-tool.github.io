<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const steps = [
  { id: 'hero', label: 'Home' },
  { id: 'overview', label: 'Overview' },
  { id: 'demos', label: 'Paper Summary' },
  { id: 'method', label: 'Gallery' },
]

const activeId = ref('hero')
let scroller: HTMLElement | null = null
let trackedSections: HTMLElement[] = []
let frameId = 0

const jump = (id: string) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

const updateActiveSection = () => {
  if (!scroller || trackedSections.length === 0) return

  const scrollCenter = scroller.scrollTop + scroller.clientHeight / 2
  let bestId = activeId.value
  let bestCenterDistance = Number.POSITIVE_INFINITY

  trackedSections.forEach((section) => {
    const sectionCenter = section.offsetTop + section.offsetHeight / 2
    const centerDistance = Math.abs(sectionCenter - scrollCenter)

    if (centerDistance < bestCenterDistance) {
      bestId = section.id
      bestCenterDistance = centerDistance
    }
  })

  activeId.value = bestId
}

const scheduleUpdate = () => {
  if (frameId) cancelAnimationFrame(frameId)
  frameId = window.requestAnimationFrame(() => {
    updateActiveSection()
    frameId = 0
  })
}

onMounted(() => {
  scroller = document.querySelector('.snap-scroller') as HTMLElement | null
  trackedSections = steps
    .map((step) => document.getElementById(step.id))
    .filter((el): el is HTMLElement => Boolean(el))

  scheduleUpdate()
  scroller?.addEventListener('scroll', scheduleUpdate, { passive: true })
  window.addEventListener('resize', scheduleUpdate)
})

onUnmounted(() => {
  if (frameId) cancelAnimationFrame(frameId)
  scroller?.removeEventListener('scroll', scheduleUpdate)
  window.removeEventListener('resize', scheduleUpdate)
})
</script>

<template>
  <nav class="snap-timeline" aria-label="Section navigation">
    <ul>
      <li v-for="s in steps" :key="s.id">
        <button
          :class="['dot-btn', { active: activeId === s.id }]"
          @click="jump(s.id)"
          :aria-label="s.label"
          :aria-current="activeId === s.id ? 'true' : 'false'"
        >
          <span class="dot"></span>
          <span class="label">{{ s.label }}</span>
        </button>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.snap-timeline {
  position: fixed;
  left: var(--timeline-left);
  top: 50%;
  transform: translateY(-50%);
  z-index: 900;
  pointer-events: none;
}

.snap-timeline ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--timeline-gap);
  position: relative;
}

/* vertical connector line */
.snap-timeline ul::before {
  content: '';
  position: absolute;
  left: calc(var(--timeline-dot-size) / 2 - 1px);
  top: calc(var(--timeline-dot-size) * 0.55);
  bottom: calc(var(--timeline-dot-size) * 0.55);
  width: 1px;
  background: rgba(255, 255, 255, 0.18);
}

.dot-btn {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: var(--size-10);
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.55);
  transition: color 0.25s ease;
}

.dot {
  width: var(--timeline-dot-size);
  height: var(--timeline-dot-size);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.45);
  transition: all 0.25s ease;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.label {
  font-size: var(--timeline-label-size);
  letter-spacing: 0.4px;
  opacity: 0;
  transform: translateX(-6px);
  transition: opacity 0.25s ease, transform 0.25s ease;
  white-space: nowrap;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

.snap-timeline:hover .label,
.dot-btn.active .label {
  opacity: 1;
  transform: translateX(0);
}

.dot-btn:hover {
  color: #fff;
}

.dot-btn:hover .dot {
  background: rgba(255, 255, 255, 0.6);
  border-color: #fff;
}

.dot-btn.active {
  color: #fff;
}

.dot-btn.active .dot {
  background: #fff;
  border-color: #fff;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.15);
}

@media (max-width: 768px) {
  .snap-timeline {
    left: 12px;
  }
  .label {
    display: none;
  }
}
</style>
