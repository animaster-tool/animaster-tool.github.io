<script setup lang="ts">
import { ref } from 'vue'

const tabs = ['Abstract', 'Framework', 'Features']
const activeTab = ref(0)
</script>

<template>
  <section id="demos" class="paper-summary-section">
    <p class="section-label"><b>Paper Summary</b></p>

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
      <h2>Abstract</h2>
      <p class="content-description">
        AniMaster is an LLM-powered authoring tool that helps everyday creators progressively
        transform free-form story texts into polished cinematic animated videos. Rather than
        jumping directly from text to video, it makes narrative and cinematic knowledge explicit
        through editable intermediate representations, so creators can inspect, revise, and steer
        the generation process with much finer control.
      </p>

      <div class="summary-grid">
        <div class="summary-card summary-card-wide">
          <h3>Problem</h3>
          <p>
            Story-to-video generation is difficult for non-experts because cinematic decisions
            such as beat design, shot sequencing, and visual continuity are usually hidden inside
            professional workflows.
          </p>
        </div>
        <div class="summary-card">
          <h3>Approach</h3>
          <p>
            AniMaster externalizes those decisions as structured layers that are both machine-usable
            and human-editable, keeping creators in the loop throughout authoring.
          </p>
        </div>
        <div class="summary-card">
          <h3>Result</h3>
          <p>
            Creators can move from story text to cinematic output through a progressive pipeline,
            while still making high-level and low-level creative adjustments along the way.
          </p>
        </div>
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

      <div class="feature-grid">
        <div class="feature-card">
          <h3>Story-to-Script Translation</h3>
          <p>
            Automatically expands free-form story events into editable beat sequences that follow
            cinematic narrative conventions.
          </p>
        </div>

        <div class="feature-card">
          <h3>Script-to-Video Translation</h3>
          <p>
            Turns each beat into shot structures with explicit visual parameters that can be reviewed
            and refined before video generation.
          </p>
        </div>

        <div class="feature-card">
          <h3>Interactive Authoring Canvas</h3>
          <p>
            Supports semantic zooming, cross-layer alignment, and direct manipulation so creators can
            navigate from global story structure down to shot-level decisions.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.paper-summary-section {
  padding: var(--section-padding-y) var(--page-gutter);
  max-width: var(--content-max-width);
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
  font-size: var(--section-title-size);
  font-weight: 700;
  color: #fff;
  margin-bottom: var(--size-14);
}

.content-description {
  color: rgba(255, 255, 255, 0.65);
  font-size: var(--body-size-sm);
  line-height: 1.7;
  margin-bottom: var(--size-28);
  max-width: 920px;
}

.summary-grid,
.framework-grid,
.feature-grid {
  display: grid;
  gap: var(--section-gap-md);
}

.summary-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.summary-card,
.framework-card,
.feature-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--card-radius);
  padding: var(--size-24);
}

.summary-card-wide {
  grid-column: 1 / -1;
}

.summary-card h3,
.framework-card h3,
.feature-card h3 {
  font-size: calc(18px * var(--page-scale));
  color: #fff;
  margin-bottom: var(--size-10);
}

.summary-card p,
.framework-card p,
.feature-card p {
  color: rgba(255, 255, 255, 0.62);
  font-size: var(--body-size-sm);
  line-height: 1.7;
}

.framework-grid,
.feature-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

  .summary-grid,
  .framework-grid,
  .feature-grid {
    grid-template-columns: 1fr;
  }

  .tab-btn {
    padding: 8px 14px;
  }
}
</style>
