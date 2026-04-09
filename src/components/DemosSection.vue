<script setup lang="ts">
import { ref } from 'vue'

const steps = [
  {
    id: 'import',
    label: '1. Import Story',
    title: 'Importing a Story',
    description:
      'The creator uploads a free-form story text. AniMaster automatically identifies characters, locations, and events, presenting them on the canvas arranged spatially by location — giving a global overview of the story arc.',
    placeholder: 'Story Import & Event Extraction Visualization',
  },
  {
    id: 'expand',
    label: '2. Expand to Beats',
    title: 'Expanding Events into Beat Sequences',
    description:
      'The S2S Translation expands each Event into an editable Beat sequence. Seven Beat Types — Environment, Presentation, Action, Dialogue, Reveal, Reaction, and Pause — organize the narrative following professional cinematic conventions like Contextual Grounding, Causal Progression, and Narrative Pacing.',
    placeholder: 'Beat Sequence Expansion (S2S Translation)',
  },
  {
    id: 'shots',
    label: '3. Compose Shots',
    title: 'Crafting Shots in the Beat Canvas',
    description:
      'Inside the Beat Canvas, each Beat becomes a set of Shot nodes with nine visual parameters across Cinematography, Mise-en-scène, Editing, and Sound. Creators bind character and location assets, adjust composition and camera angles, and use Cinematic Cues to annotate shot-to-shot relationships.',
    placeholder: 'Beat Canvas — Shot Composition & Parameter Editing',
  },
  {
    id: 'edit',
    label: '4. Edit & Refine',
    title: 'Editing and Refining',
    description:
      'AniMaster supports multi-level editing: Beat Suggestion inserts new Beats based on context; intent-based editing lets creators express high-level directorial intent (e.g. "switch to character\'s perspective") and the system updates corresponding parameters; changes at any level propagate through the hierarchy.',
    placeholder: 'Multi-level Editing — Beat Suggestion & Intent-based Editing',
  },
  {
    id: 'preview',
    label: '5. Preview Video',
    title: 'Previewing the Animated Video',
    description:
      'The Video Preview panel assembles all generated frames and video clips into a continuous animated video. Creators can review the result at any time, make further adjustments, and iterate until satisfied with the final output.',
    placeholder: 'Final Animated Video Preview',
  },
]

const activeStep = ref(0)
</script>

<template>
  <section id="demos" class="demos-section">
    <p class="section-label"><b>Feature Walkthrough</b></p>
    <p class="section-subtitle">
      Follow a creator's journey as they turn "Little Red Riding Hood" into a cinematic animated video.
    </p>

    <!-- Step navigation -->
    <div class="step-nav">
      <button
        v-for="(step, index) in steps"
        :key="step.id"
        :class="['step-btn', { active: activeStep === index }]"
        @click="activeStep = index"
      >
        <span class="step-dot" :class="{ filled: activeStep >= index }"></span>
        <span class="step-label">{{ step.label }}</span>
      </button>
    </div>

    <!-- Step content -->
    <div class="step-content" :key="activeStep">
      <div class="step-text">
        <h3>{{ steps[activeStep].title }}</h3>
        <p>{{ steps[activeStep].description }}</p>

        <div class="step-actions">
          <button
            v-if="activeStep > 0"
            class="nav-btn"
            @click="activeStep--"
          >
            ← Previous
          </button>
          <button
            v-if="activeStep < steps.length - 1"
            class="nav-btn primary"
            @click="activeStep++"
          >
            Next →
          </button>
        </div>
      </div>

      <div class="step-visual">
        <div class="visual-placeholder">
          <span>{{ steps[activeStep].placeholder }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.demos-section {
  padding: 80px 60px;
  max-width: 1100px;
  margin: 0 auto;
}

.section-label {
  font-size: 1.6rem;
  color: #fff;
  margin-bottom: 8px;
}

.section-subtitle {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.95rem;
  margin-bottom: 32px;
}

/* Step Navigation */
.step-nav {
  display: flex;
  gap: 0;
  margin-bottom: 36px;
  position: relative;
  overflow-x: auto;
}

.step-nav::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
}

.step-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.45);
  padding: 12px 20px;
  font-size: 0.85rem;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
  white-space: nowrap;
  position: relative;
  z-index: 1;
}

.step-btn:hover {
  color: rgba(255, 255, 255, 0.75);
}

.step-btn.active {
  color: #fff;
  border-bottom-color: #64b5f6;
}

.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s;
  flex-shrink: 0;
}

.step-dot.filled {
  background: #64b5f6;
  border-color: #64b5f6;
}

/* Step Content */
.step-content {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 32px;
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

.step-text h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 16px;
}

.step-text p {
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.92rem;
  line-height: 1.75;
  margin-bottom: 24px;
}

.step-actions {
  display: flex;
  gap: 10px;
}

.nav-btn {
  padding: 8px 20px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.nav-btn.primary {
  background: rgba(100, 181, 246, 0.15);
  border-color: rgba(100, 181, 246, 0.3);
  color: #64b5f6;
}

.nav-btn.primary:hover {
  background: rgba(100, 181, 246, 0.25);
}

.visual-placeholder {
  width: 100%;
  height: 360px;
  background: rgba(255, 255, 255, 0.03);
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
}

.visual-placeholder span {
  color: rgba(255, 255, 255, 0.2);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .demos-section {
    padding: 60px 24px;
  }
  .step-content {
    grid-template-columns: 1fr;
  }
  .step-btn {
    padding: 10px 14px;
    font-size: 0.8rem;
  }
}
</style>
