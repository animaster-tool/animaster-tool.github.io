<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const steps = [
  { id: 'hero', label: 'Home' },
  { id: 'overview', label: 'Overview' },
  { id: 'demos', label: 'Demos' },
  { id: 'method', label: 'Method' },
  { id: 'footer', label: 'Footer' },
]

const activeId = ref('hero')
let observer: IntersectionObserver | null = null

const jump = (id: string) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  // The footer <footer class="site-footer"> has no id; tag it on mount.
  const footer = document.querySelector('.site-footer')
  if (footer && !footer.id) footer.id = 'footer'

  const scroller = document.querySelector('.snap-scroller') as HTMLElement | null
  observer = new IntersectionObserver(
    (entries) => {
      // Pick the entry most intersecting.
      let best: IntersectionObserverEntry | null = null
      for (const e of entries) {
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e
      }
      if (best && best.isIntersecting && best.target.id) {
        activeId.value = best.target.id
      }
    },
    { root: scroller, threshold: [0.3, 0.55, 0.8] }
  )
  steps.forEach((s) => {
    const el = document.getElementById(s.id)
    if (el) observer!.observe(el)
  })
})

onUnmounted(() => {
  if (observer) observer.disconnect()
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
