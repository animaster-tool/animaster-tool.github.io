<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const tabs = ['Abstract', 'Framework', 'Features']
const activeTab = ref(0)
const abstractParagraphs = ref<string[]>([])
const abstractLoadError = ref(false)

type FeatureStep = {
  label: string
  tag: string
  title: string
  description: string[]
  highlights: string[]
}

const featureSteps: FeatureStep[] = [
  {
    label: 'Importing a Story',
    tag: 'Story Input',
    title: 'Importing a Story',
    description: [
      'The authoring process begins with a free-form story text. AniMaster parses the text into structured story elements so creators can immediately see the narrative material they are working with.',
      'Characters, locations, and events become explicit building blocks, giving creators a readable overview before any cinematic decisions are made.',
    ],
    highlights: [
      'Transforms unstructured text into editable story elements',
      'Builds a global overview of actors, locations, and events',
      'Creates a stable starting point for later cinematic translation',
    ],
  },
  {
    label: 'From Event to Beat Canvas',
    tag: 'Narrative Expansion',
    title: 'From Event to Beat Canvas',
    description: [
      'AniMaster expands each event into a beat sequence that exposes how the story should unfold cinematically, rather than keeping this logic hidden inside an opaque generation step.',
      'The creator can then move into the Beat Canvas, where those beats become a navigable and editable structure for planning narrative rhythm, focus, and progression.',
    ],
    highlights: [
      'Converts events into editable beat sequences',
      'Makes pacing and focalization explicit',
      'Bridges high-level story logic to canvas-based authoring',
    ],
  },
  {
    label: 'Crafting the Shots',
    tag: 'Shot Authoring',
    title: 'Crafting the Shots',
    description: [
      'Inside the Beat Canvas, each beat is translated into shots with explicit visual parameters such as framing, angle, movement, composition, and duration.',
      'This gives creators direct control over how a moment should be staged and filmed, while still benefiting from structured system support.',
    ],
    highlights: [
      'Turns beats into executable shot structures',
      'Exposes visual parameters for direct refinement',
      'Supports deliberate cinematic composition instead of black-box output',
    ],
  },
  {
    label: 'Editing and Refining',
    tag: 'Interactive Control',
    title: 'Editing and Refining',
    description: [
      'AniMaster supports multi-level revision, allowing creators to adjust story-level intent, beat-level structure, or shot-level details without losing the coherence of the larger authoring pipeline.',
      'This makes iteration practical: creators can express high-level intent, inspect the resulting changes, and continue refining until the animation aligns with their vision.',
    ],
    highlights: [
      'Supports revision across multiple levels of abstraction',
      'Lets creators steer the system with directorial intent',
      'Keeps generated structure editable throughout the workflow',
    ],
  },
]

const activeFeatureTab = ref(0)
const currentFeature = computed<FeatureStep>(() => featureSteps[activeFeatureTab.value] ?? featureSteps[0]!)

const normalizeAbstractParagraph = (text: string) =>
  text
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/demon strated/g, 'demonstrated')
    .replace(/VGMpowered/g, 'VGM-powered')
    .replace(/freeform/g, 'free-form')
    .replace(/indepth/g, 'in-depth')
    .trim()

const parseAbstractText = (text: string) => {
  const paragraphs = text
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => normalizeAbstractParagraph(paragraph))
    .filter(Boolean)

  if (paragraphs.length > 0) return paragraphs

  const normalized = normalizeAbstractParagraph(text)
  return normalized ? [normalized] : []
}

onMounted(async () => {
  try {
    const response = await fetch('/texts/Abstract.txt')
    if (!response.ok) throw new Error('Failed to load abstract')

    const rawText = await response.text()
    abstractParagraphs.value = parseAbstractText(rawText)
  } catch {
    abstractLoadError.value = true
  }
})
</script>

<template>
  <section id="demos" class="paper-summary-section">
    <nav class="tabs-nav">
      <button
        v-for="(tab, index) in tabs"
        :key="tab"
        :class="['tab-btn', { active: activeTab === index }]"
        @click="activeTab = index"
      >
        {{ tab }}
      </button>
    </nav>

    <div v-if="activeTab === 0" class="tab-content">
      <div class="abstract-card">
        <p v-if="abstractLoadError" class="abstract-text">
          The abstract could not be loaded from <code>/public/texts/Abstract.txt</code>.
        </p>

        <template v-else>
          <p v-for="paragraph in abstractParagraphs" :key="paragraph" class="abstract-text">
            {{ paragraph }}
          </p>
        </template>
      </div>
    </div>

    <div v-else-if="activeTab === 1" class="tab-content">
      <h2>Three-Layer Framework</h2>
      <p class="content-description">
        The paper frames authoring as translation across three connected spaces, each capturing a
        different level of creative intent and production detail.
      </p>

      <div class="framework-grid">
        <div class="framework-card story">
          <div class="card-kicker">Layer 1</div>
          <h3>Story Space</h3>
          <p class="card-question">What happens in the story?</p>
          <p>
            Represents raw narrative events with core dimensions such as actor, location, and time.
          </p>
        </div>

        <div class="framework-card script">
          <div class="card-kicker">Layer 2</div>
          <h3>Script Space</h3>
          <p class="card-question">How is the story told?</p>
          <p>
            Expands events into beat sequences that encode narrative pacing, focalization, and
            audience-facing structure.
          </p>
        </div>

        <div class="framework-card video">
          <div class="card-kicker">Layer 3</div>
          <h3>Video Space</h3>
          <p class="card-question">How is it shown on screen?</p>
          <p>
            Converts beats into executable shots with concrete visual parameters such as framing,
            movement, composition, lighting, and duration.
          </p>
        </div>
      </div>
    </div>

    <div v-else class="tab-content">
      <h2>Core Features</h2>
      <p class="content-description">
        AniMaster combines structured translation and interactive editing so creators can work at
        multiple levels of abstraction without losing control of the final cinematic result.
      </p>

      <nav class="feature-subtabs">
        <button
          v-for="(step, index) in featureSteps"
          :key="step.label"
          :class="['feature-subtab-btn', { active: activeFeatureTab === index }]"
          @click="activeFeatureTab = index"
        >
          {{ step.label }}
        </button>
      </nav>

      <div class="feature-panel" :key="currentFeature.title">
        <div class="feature-copy">
          <div class="feature-tag">{{ currentFeature.tag }}</div>
          <h3>{{ currentFeature.title }}</h3>

          <div class="feature-description">
            <p v-for="paragraph in currentFeature.description" :key="paragraph">
              {{ paragraph }}
            </p>
          </div>
        </div>

        <div class="feature-side">
          <div class="feature-side-card">
            <h4>Key Capabilities</h4>
            <ul class="feature-highlight-list">
              <li v-for="highlight in currentFeature.highlights" :key="highlight">
                {{ highlight }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.paper-summary-section {
  padding: var(--section-padding-y) var(--page-gutter);
  max-width: var(--section-max-width);
  margin: 0 auto;
}

.tabs-nav {
  display: flex;
  gap: 0;
  margin-bottom: var(--size-40);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
}

.tab-btn:hover {
  color: rgba(255, 255, 255, 0.8);
}

.tab-btn.active {
  color: #fff;
  border-bottom-color: #fff;
}

.tab-content {
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

h2 {
  font-size: calc(var(--section-title-size) * 1.08);
  font-weight: 700;
  color: #fff;
  margin-bottom: var(--size-16);
}

.content-description {
  color: rgba(255, 255, 255, 0.65);
  font-size: var(--body-size);
  line-height: 1.7;
  margin-bottom: var(--size-32);
  max-width: 1120px;
}

.framework-grid {
  display: grid;
  gap: var(--section-gap-md);
}

.framework-card,
.feature-copy,
.feature-side-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--card-radius);
  padding: var(--size-28);
}

.framework-card h3,
.feature-copy h3 {
  font-size: calc(19px * var(--page-scale));
  color: #fff;
  margin-bottom: var(--size-10);
}

.framework-card p,
.feature-copy p {
  color: rgba(255, 255, 255, 0.62);
  font-size: var(--body-size);
  line-height: 1.7;
}

.framework-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.abstract-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--card-radius);
  padding: var(--size-32);
}

.abstract-text {
  color: rgba(255, 255, 255, 0.74);
  font-size: var(--body-size);
  line-height: 1.9;
  text-align: justify;
}

.abstract-text + .abstract-text {
  margin-top: var(--size-16);
}

.card-kicker {
  display: inline-block;
  margin-bottom: var(--size-12);
  padding: 2px 10px;
  border-radius: 999px;
  font-size: var(--meta-size);
  letter-spacing: 0.4px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
}

.card-question {
  margin-bottom: var(--size-12);
  color: rgba(255, 255, 255, 0.42) !important;
  font-style: italic;
}

.feature-tag {
  display: inline-block;
  margin-bottom: var(--size-12);
  padding: 2px 10px;
  border-radius: 999px;
  font-size: var(--meta-size);
  letter-spacing: 0.4px;
  background: rgba(100, 181, 246, 0.12);
  color: rgba(160, 214, 255, 0.88);
  border: 1px solid rgba(100, 181, 246, 0.18);
}

.feature-subtabs {
  display: flex;
  gap: var(--size-10);
  flex-wrap: wrap;
  margin-bottom: var(--size-24);
}

.feature-subtab-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.62);
  border-radius: 999px;
  padding: var(--size-10) var(--size-18);
  font-size: var(--meta-size);
  cursor: pointer;
  transition: all 0.3s;
}

.feature-subtab-btn:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.18);
}

.feature-subtab-btn.active {
  color: #fff;
  background: rgba(100, 181, 246, 0.14);
  border-color: rgba(100, 181, 246, 0.28);
}

.feature-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(0, 0.88fr);
  gap: var(--section-gap-md);
  animation: fadeIn 0.35s ease;
}

.feature-copy,
.feature-side {
  min-width: 0;
}

.feature-description {
  display: grid;
  gap: var(--size-14);
}

.feature-side-card {
  height: 100%;
}

.feature-side-card h4 {
  font-size: calc(17px * var(--page-scale));
  color: #fff;
  margin-bottom: var(--size-14);
}

.feature-highlight-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--size-12);
}

.feature-highlight-list li {
  color: rgba(255, 255, 255, 0.68);
  font-size: var(--body-size-sm);
  line-height: 1.65;
  padding: var(--size-14) var(--size-16);
  border-radius: calc(var(--card-radius) - 6px);
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.framework-card.story {
  border-top: 3px solid rgba(100, 181, 246, 0.6);
}

.framework-card.script {
  border-top: 3px solid rgba(255, 167, 38, 0.6);
}

.framework-card.video {
  border-top: 3px solid rgba(129, 199, 132, 0.6);
}

@media (max-width: 768px) {
  .paper-summary-section {
    padding: calc(56px * var(--page-scale)) 24px;
  }

  .framework-grid,
  .feature-panel {
    grid-template-columns: 1fr;
  }

  .tab-btn {
    padding: 10px 16px;
  }
}
</style>
