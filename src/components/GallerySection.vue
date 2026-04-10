<script setup lang="ts">
import { computed, ref } from 'vue'

type GalleryItem = {
  id: string
  tab: string
  title: string
  subtitle: string
  description: string[]
  highlights: string[]
  videoSrc: string
}

const items: GalleryItem[] = [
  {
    id: 'little-red-riding-hood',
    tab: 'Little Red Riding Hood',
    title: 'Little Red Riding Hood',
    subtitle: 'A suspense-driven retelling shaped through progressive cinematic authoring.',
    description: [
      'This example shows how AniMaster turns a familiar fairy tale into a controllable animated sequence, starting from free-form story text and gradually refining it into beats, shots, and video output.',
      'The authoring flow emphasizes scene progression, character staging, and visual continuity, allowing the creator to inspect and revise the cinematic logic at each level of abstraction.',
    ],
    highlights: [
      'Structured event-to-beat expansion',
      'Editable shot composition and camera intent',
      'Continuous preview across the authoring pipeline',
    ],
    videoSrc: '/videos/demo-bg.mp4',
  },
  {
    id: 'cinderella',
    tab: 'Cinderella',
    title: 'Cinderella',
    subtitle: 'A character-centered narrative with stronger emotional pacing and scene contrast.',
    description: [
      'This gallery entry focuses on how AniMaster can support stories that rely on emotional escalation, visual contrast, and transformation across multiple narrative phases.',
      'By exposing script-level beats and shot-level parameters, the system helps creators balance magical spectacle with readable storytelling and coherent scene transitions.',
    ],
    highlights: [
      'Narrative pacing across setup, transformation, and payoff',
      'Cross-layer editing from story intent to shot details',
      'Reusable cinematic structure for long-form scenes',
    ],
    videoSrc: '/videos/demo-bg.mp4',
  },
  {
    id: 'the-little-mermaid',
    tab: 'The Little Mermaid',
    title: 'The Little Mermaid',
    subtitle: 'A visually expressive example built around atmosphere, movement, and tonal shifts.',
    description: [
      'This example highlights stories with rich environmental mood and large tonal transitions, where visual language plays a central role in communicating emotion and narrative stakes.',
      'AniMaster supports this process by making cinematic choices explicit, so creators can deliberately shape rhythm, framing, and visual emphasis rather than relying on opaque end-to-end generation.',
    ],
    highlights: [
      'Environment-aware cinematic planning',
      'Shot sequencing with explicit visual parameters',
      'Interactive refinement before final video assembly',
    ],
    videoSrc: '/videos/demo-bg.mp4',
  },
]

const activeTab = ref(0)
const currentItem = computed<GalleryItem>(() => items[activeTab.value] ?? items[0]!)
</script>

<template>
  <section id="method" class="gallery-section">
    <p class="section-label"><b>Gallery</b></p>

    <nav class="tabs-nav" aria-label="Gallery tabs">
      <button
        v-for="(item, index) in items"
        :key="item.id"
        :class="['tab-btn', { active: activeTab === index }]"
        @click="activeTab = index"
      >
        {{ item.tab }}
      </button>
    </nav>

    <div class="gallery-panel" :key="currentItem.id">
      <div class="gallery-copy">
        <p class="panel-kicker">Story Example</p>
        <h2>{{ currentItem.title }}</h2>
        <p class="panel-subtitle">{{ currentItem.subtitle }}</p>

        <div class="description-block">
          <p v-for="paragraph in currentItem.description" :key="paragraph">
            {{ paragraph }}
          </p>
        </div>

        <div class="highlight-list">
          <div v-for="highlight in currentItem.highlights" :key="highlight" class="highlight-item">
            {{ highlight }}
          </div>
        </div>
      </div>

      <div class="gallery-media">
        <div class="video-shell">
          <video
            :key="currentItem.videoSrc"
            class="gallery-video"
            :src="currentItem.videoSrc"
            controls
            muted
            loop
            playsinline
            preload="metadata"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.gallery-section {
  padding: var(--section-padding-y) var(--page-gutter);
  max-width: var(--section-max-width);
  margin: 0 auto;
}

.section-label {
  font-size: var(--section-label-size);
  color: #fff;
  margin-bottom: var(--size-24);
}

.tabs-nav {
  display: flex;
  gap: 0;
  margin-bottom: var(--size-32);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  overflow-x: auto;
}

.tab-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  padding: var(--size-10) var(--size-24);
  font-size: var(--meta-size);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
  white-space: nowrap;
}

.tab-btn:hover {
  color: rgba(255, 255, 255, 0.82);
}

.tab-btn.active {
  color: #fff;
  border-bottom-color: #fff;
}

.gallery-panel {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.18fr);
  gap: var(--section-gap-lg);
  align-items: stretch;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.gallery-copy,
.gallery-media {
  min-width: 0;
}

.gallery-copy {
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--card-radius);
  padding: var(--size-28);
}

.panel-kicker {
  display: inline-block;
  margin-bottom: var(--size-12);
  padding: 2px 10px;
  border-radius: 999px;
  font-size: var(--meta-size);
  letter-spacing: 0.4px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.58);
}

.gallery-copy h2 {
  font-size: var(--section-title-size);
  font-weight: 700;
  color: #fff;
  margin-bottom: var(--size-12);
}

.panel-subtitle {
  color: rgba(255, 255, 255, 0.72);
  font-size: var(--body-size);
  line-height: 1.65;
  margin-bottom: var(--size-20);
}

.description-block {
  display: grid;
  gap: var(--size-14);
  margin-bottom: var(--size-24);
}

.description-block p {
  color: rgba(255, 255, 255, 0.58);
  font-size: var(--body-size-sm);
  line-height: 1.8;
}

.highlight-list {
  display: grid;
  gap: var(--size-12);
}

.highlight-item {
  padding: var(--size-14) var(--size-16);
  border-radius: calc(var(--card-radius) - 6px);
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.7);
  font-size: var(--body-size-sm);
  line-height: 1.55;
}

.gallery-media {
  display: flex;
}

.video-shell {
  width: 100%;
  border-radius: var(--card-radius);
  overflow: hidden;
  background: rgba(9, 9, 9, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.38);
}

.gallery-video {
  width: 100%;
  height: 100%;
  min-height: calc(380px * var(--page-scale));
  display: block;
  background: #000;
  object-fit: cover;
}

@media (max-width: 768px) {
  .gallery-section {
    padding: calc(56px * var(--page-scale)) 24px;
  }

  .gallery-panel {
    grid-template-columns: 1fr;
  }

  .tab-btn {
    padding: 8px 14px;
  }

  .gallery-video {
    min-height: calc(240px * var(--page-scale));
  }
}
</style>
