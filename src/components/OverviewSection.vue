<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isVisible = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true
          observer.disconnect()
        }
      })
    },
    { threshold: 0.15 }
  )
  const el = document.getElementById('overview')
  if (el) observer.observe(el)
})
</script>

<template>
  <section id="overview" class="overview-section">
    <div class="spacer"></div>

    <div :class="['overview-block', { visible: isVisible }]">
      <h2>What is AniMaster?</h2>
      <p class="tldr">
        TL;DR: AniMaster is an LLM-powered authoring tool that helps everyday creators
        progressively transform free-form story texts into polished cinematic animated videos,
        by making professional narrative and cinematic knowledge explicit, editable, and
        computationally actionable.
      </p>

      <!-- Live interactive demo: the real AniMaster frontend, prebaked with
           the 小红帽 workspace, running purely in the browser (no backend). -->
      <div class="live-demo-wrap">
        <div class="live-demo-header">
          <span class="dot" /><span class="dot" /><span class="dot" />
          <span class="live-demo-title">AniMaster · Live Demo</span>
          <span class="live-demo-badge">Read-only · No backend</span>
        </div>
        <iframe
          class="live-demo-frame"
          src="./anime-system/index.html"
          title="AniMaster interactive demo"
          loading="lazy"
          allow="clipboard-read; clipboard-write"
        />
        <div class="live-demo-hint">
          Drag the canvas, zoom with the wheel, click any Beat node to open the
          Inspector. All generation actions are disabled in this demo.
        </div>
      </div>
    </div>

    <div :class="['overview-block delay', { visible: isVisible }]">
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
    </div>

    <div :class="['overview-block delay-2', { visible: isVisible }]">
      <h2>Our Approach</h2>

      <div class="feature-cards">
        <div class="feature-card">
          <div class="feature-icon">📐</div>
          <h3>Three-Layer Design Framework</h3>
          <p>
            Grounded in narratology and film studies, we distill the key design dimensions across
            three layers — <strong>Story Space</strong>, <strong>Script Space</strong>, and
            <strong>Video Space</strong> — as well as the translation rules between them.
          </p>
        </div>

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
          <h3>Canvas-Based Interactive Authoring</h3>
          <p>
            A semantic-zooming canvas lets creators navigate from global narrative overview
            to shot-level production. At every level, users can review, modify, and override
            the system's outputs through intuitive interactions.
          </p>
        </div>
      </div>

      <div class="about-actions">
        <button class="action-btn" @click="$emit('scrollTo', 'demos')">WALKTHROUGH ➜</button>
        <button class="action-btn secondary" @click="$emit('scrollTo', 'method')">METHOD ➜</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.overview-section {
  padding: 0 40px 80px;
  max-width: 1600px;
  margin: 0 auto;
}

.spacer {
  height: 120px;
}

.overview-block {
  margin-bottom: 64px;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
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
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
}

.tldr {
  color: rgba(255, 255, 255, 0.75);
  font-size: 1.05rem;
  line-height: 1.7;
  margin-bottom: 32px;
  max-width: 850px;
}

.description {
  color: rgba(255, 255, 255, 0.65);
  font-size: 1rem;
  line-height: 1.7;
  margin-bottom: 24px;
}

/* ===== Live Interactive Demo (iframed real frontend) ===== */
.live-demo-wrap {
  width: 100%;
  background: #0d0d0d;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
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
  width: 100%;
  aspect-ratio: 16 / 9;
  height: auto;
  border: none;
  display: block;
  background: #0a0a0a;
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
    padding: 0 24px 60px;
  }
  h2 {
    font-size: 1.5rem;
  }
  .challenge-cards,
  .feature-cards {
    grid-template-columns: 1fr;
  }
  .about-actions {
    flex-wrap: wrap;
  }
}
</style>
