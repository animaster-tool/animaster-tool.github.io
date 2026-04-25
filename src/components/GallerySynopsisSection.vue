<script setup lang="ts">
import { computed, ref } from 'vue'
import FooterSection from './FooterSection.vue'

type CaseStudy = {
  quote: string
  attribution: string
}

type GalleryItem = {
  id: string
  tab: string
  title: string
  description: string[]
  videoSrc: string
  caseStudy?: CaseStudy
}

const items: GalleryItem[] = [
  {
    id: 'little-red-riding-hood',
    tab: 'Little Red Riding Hood',
    title: 'Little Red Riding Hood',
    description: [
      'Little Red Riding Hood tells the story of a young girl who travels through the forest to visit her grandmother, carrying food and trusting too easily in the stranger she meets along the way.',
      'On her journey she encounters a wolf, who deceives her, reaches the grandmother\'s house first, and disguises himself in order to trap her. The story unfolds through suspense, disguise, and the eventual discovery of the danger hidden beneath a familiar face.',
    ],
    videoSrc: '/videos/LittleRedRidingHood.mp4',
  },
  {
    id: 'cinderella',
    tab: 'Cinderella',
    title: 'Cinderella',
    description: [
      'Cinderella follows a mistreated young woman who lives under the control of her stepfamily but continues to hope for a different future despite hardship and humiliation.',
      'With the help of magic she is transformed for one evening, attends the royal ball, and leaves behind a single glass slipper. The story combines emotional contrast, transformation, and a final recognition that restores her place and dignity.',
    ],
    videoSrc: '/videos/Cinderella.mp4',
    caseStudy: {
      quote: 'I never imagined this shot could be done this way.',
      attribution: 'P17 · college student, no filmmaking experience',
    },
  },
  {
    id: 'the-little-mermaid',
    tab: 'The Little Mermaid',
    title: 'The Little Mermaid',
    description: [
      'The Little Mermaid centers on a mermaid princess who longs for the human world and becomes deeply attached to a prince she rescues from the sea.',
      'In pursuit of love and another life, she gives up her voice for the chance to walk on land. The story moves through wonder, sacrifice, and longing, balancing dreamlike atmosphere with the emotional cost of transformation.',
    ],
    videoSrc: '/videos/SeaDaughter.mp4',
    caseStudy: {
      quote:
        'The generated templates are great suggestions, but when it comes to the actual creation, I still rely on my own style.',
      attribution: 'P18 · hobbyist, 2 years of animation experience',
    },
  },
]

const activeTab = ref(0)
const currentItem = computed<GalleryItem>(() => items[activeTab.value] ?? items[0]!)
</script>

<template>
  <section id="method" class="gallery-section">
    <div class="gallery-body">
      <div class="gallery-main">
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
            <div class="copy-header">
              <p class="panel-kicker">Story Synopsis</p>
              <span
                v-if="currentItem.caseStudy"
                class="panel-kicker case-study-kicker"
              >Case Study</span>
            </div>
            <h2>{{ currentItem.title }}</h2>

            <div class="description-block">
              <p v-for="paragraph in currentItem.description" :key="paragraph">
                {{ paragraph }}
              </p>
            </div>

            <div v-if="currentItem.caseStudy" class="case-study-block">
              <blockquote class="case-study-insight">
                <span class="case-study-quote">&ldquo;{{ currentItem.caseStudy.quote }}&rdquo;</span>
                <cite class="case-study-attribution">— {{ currentItem.caseStudy.attribution }}</cite>
              </blockquote>
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
      </div>
    </div>

    <FooterSection />
  </section>
</template>

<style scoped>
.gallery-section {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.gallery-body {
  flex: 1 1 auto;
  padding: 0 var(--page-gutter);
  max-width: var(--section-max-width);
  margin: 0 auto;
  width: 100%;
  min-height: 0;
  display: flex;
  align-items: center;
}

.gallery-main {
  width: 100%;
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
  padding: var(--size-14) var(--size-32);
  font-size: var(--body-size);
  font-weight: 500;
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
  grid-template-columns: minmax(0, 0.78fr) minmax(0, 1.22fr);
  gap: var(--section-gap-lg);
  align-items: center;
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
  padding: var(--size-24);
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

/* Top row of the copy block: "Story Synopsis" on the left, optional
   "Case Study" tag pinned to the right edge of the story-text column. */
.copy-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--size-12);
}

.copy-header .panel-kicker {
  margin-bottom: 0;
}

.gallery-copy h2 {
  font-size: var(--section-title-size);
  font-weight: 700;
  color: #fff;
  margin-bottom: var(--size-12);
}

.description-block {
  display: grid;
  gap: var(--size-14);
}

.description-block p {
  color: rgba(255, 255, 255, 0.58);
  font-size: var(--body-size);
  line-height: 1.8;
}

.case-study-block {
  margin-top: var(--size-20);
  padding-top: var(--size-20);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: grid;
  gap: var(--size-12);
}

.case-study-kicker {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.8);
  justify-self: start;
}

.case-study-insight {
  margin: 0;
  padding-left: var(--size-14);
  border-left: 2px solid rgba(255, 255, 255, 0.18);
  display: grid;
  gap: var(--size-8);
}

.case-study-quote {
  color: rgba(255, 255, 255, 0.78);
  font-size: var(--body-size-sm);
  line-height: 1.65;
  font-style: italic;
}

.case-study-attribution {
  color: rgba(255, 255, 255, 0.42);
  font-size: var(--meta-size);
  font-style: normal;
  text-align: right;
  align-self: end;
}

.gallery-media {
  display: flex;
  align-items: center;
}

.video-shell {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--card-radius);
  overflow: hidden;
  background: rgba(9, 9, 9, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.38);
}

.gallery-video {
  width: 100%;
  height: 100%;
  display: block;
  background: #000;
  object-fit: contain;
}

@media (max-width: 768px) {
  .gallery-body {
    padding: calc(32px * var(--page-scale)) 24px 0;
    align-items: flex-start;
  }

  .gallery-panel {
    grid-template-columns: 1fr;
  }

  .tab-btn {
    padding: 8px 14px;
  }
}
</style>
