<script setup lang="ts">
import { ref } from 'vue'

const tabs = ['Framework', 'Translation', 'Interface']
const activeTab = ref(0)
</script>

<template>
  <section id="method" class="method-section">
    <p class="section-label"><b>Method</b></p>

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

    <!-- Framework Tab -->
    <div v-if="activeTab === 0" class="tab-content">
      <h2>Three-Layer Design Framework</h2>
      <p class="content-description">
        Drawing on narratology and film studies, we propose a three-layer framework that
        organizes the key design dimensions for cinematic video creation. Each layer captures
        a different stage of the creative process, and the translation rules between them
        encode professional conventions that are usually implicit.
      </p>

      <!-- Replace with Figure 2 from the paper -->
      <div class="figure-placeholder">
        <span>Figure 2: Three-Layer Design Framework — Story Space → Script Space → Video Space</span>
      </div>

      <div class="layer-cards">
        <div class="layer-card story">
          <h3>Story Space</h3>
          <p class="layer-question">"What happens in the story?"</p>
          <p>
            Represents the raw content of events. Basic unit: <strong>Event</strong>,
            with dimensions: Actor, Location, and Time.
          </p>
        </div>
        <div class="layer-card script">
          <h3>Script Space</h3>
          <p class="layer-question">"How is the story told?"</p>
          <p>
            Represents audience-oriented narrative orchestration. Basic unit: <strong>Beat</strong>,
            with 7 types and 4 dimensions: Character, Temporality, Space, and Focalization.
          </p>
        </div>
        <div class="layer-card video">
          <h3>Video Space</h3>
          <p class="layer-question">"How to present the story visually?"</p>
          <p>
            Represents executable visual parameters. Basic unit: <strong>Shot</strong>,
            with 9 parameters across Cinematography, Mise-en-scène, Editing, and Sound.
          </p>
        </div>
      </div>
    </div>

    <!-- Translation Tab -->
    <div v-if="activeTab === 1" class="tab-content">
      <h2>Two-Stage Translation Pipeline</h2>
      <p class="content-description">
        AniMaster operationalizes the framework as a two-stage authoring pipeline,
        making the implicit professional conventions between layers explicit and computable.
      </p>

      <div class="translation-stages">
        <div class="stage-card">
          <div class="stage-label">S2S Translation</div>
          <h3>Story → Script</h3>
          <p>
            Expands each Event into an ordered Beat sequence following three Narrative Unfolding
            Conditions: <strong>Contextual Grounding</strong> (establish space before characters),
            <strong>Causal Progression</strong> (each step links causally to the next), and
            <strong>Narrative Pacing</strong> (alternate between forward movement and pauses).
          </p>
          <div class="beat-types">
            <span class="beat env">Environment</span>
            <span class="beat pres">Presentation</span>
            <span class="beat act">Action</span>
            <span class="beat dia">Dialogue</span>
            <span class="beat rev">Reveal</span>
            <span class="beat rea">Reaction</span>
            <span class="beat pau">Pause</span>
          </div>
        </div>

        <div class="stage-arrow">➜</div>

        <div class="stage-card">
          <div class="stage-label">S2V Translation</div>
          <h3>Script → Video</h3>
          <p>
            Turns each Beat into executable Shot structures via two Visual Translation Principles:
            <strong>Shot Continuity</strong> (shot-to-shot constraints for spatial/temporal coherence)
            and <strong>Narrative Function Mapping</strong> (Beat Type determines default shot
            patterns and visual parameters).
          </p>
          <div class="params-grid">
            <span>Shot Size</span>
            <span>Camera Angle</span>
            <span>Camera Movement</span>
            <span>Composition</span>
            <span>Lighting</span>
            <span>Color Tone</span>
            <span>Transition</span>
            <span>Duration</span>
            <span>Audio</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Interface Tab -->
    <div v-if="activeTab === 2" class="tab-content">
      <h2>Interface Overview</h2>
      <p class="content-description">
        The AniMaster interface consists of the Script Reader on the left and the Main Canvas on the right,
        connected through a cross-layer alignment view.
      </p>

      <!-- Replace with Figure 3 from the paper -->
      <div class="figure-placeholder large">
        <span>Figure 3: AniMaster Interface — Script Reader + Main Canvas</span>
      </div>

      <div class="interface-features">
        <div class="if-card">
          <div class="if-label">a</div>
          <h4>Script Reader</h4>
          <p>Aligns story, script, and video text across the three layers in a synchronized view.</p>
        </div>
        <div class="if-card">
          <div class="if-label">b</div>
          <h4>Canvas Map</h4>
          <p>Global thumbnail overview for quick shot-level navigation across the entire story.</p>
        </div>
        <div class="if-card">
          <div class="if-label">c</div>
          <h4>Breakdown</h4>
          <p>Reveals the Beat sequence within each Event through semantic zooming.</p>
        </div>
        <div class="if-card">
          <div class="if-label">d</div>
          <h4>Video Preview</h4>
          <p>Lets creators review the assembled animation at any point during authoring.</p>
        </div>
        <div class="if-card">
          <div class="if-label">e</div>
          <h4>Asset Library</h4>
          <p>Manages reusable character and location variants that can be dragged onto the canvas.</p>
        </div>
        <div class="if-card">
          <div class="if-label">f</div>
          <h4>Beat Canvas</h4>
          <p>A dedicated free-form workspace for composing individual shots within a Beat.</p>
        </div>
      </div>
    </div>

    <!-- Evaluation Tab -->
    <div v-if="activeTab === 3" class="tab-content">
      <h2>Evaluation</h2>
      <p class="content-description">
        We conducted three complementary studies to evaluate AniMaster from different perspectives.
      </p>

      <div class="eval-cards">
        <div class="eval-card">
          <h3>User Study (N=16)</h3>
          <p>
            A within-subjects study comparing AniMaster with a Baseline condition.
            All 16 participants preferred AniMaster, with significantly higher creativity
            support scores (CSI: 7.16 vs 5.70). All 9 bipolar preference items favored AniMaster.
          </p>
          <div class="eval-highlight">
            "It felt more like an experienced partner — I just needed to describe what happens
            in the story, and it could break it down into shots from a professional perspective."
          </div>
        </div>

        <div class="eval-card">
          <h3>Case Studies (N=2)</h3>
          <p>
            Two creators with different backgrounds — a college student and a hobbyist with animation
            experience — used AniMaster to produce complete animated videos from fairy tales
            (Cinderella and The Little Mermaid).
          </p>
          <div class="eval-highlight">
            "It was like thinking as a director — splitting the story into storyboard segments,
            then deciding how to shoot each one."
          </div>
        </div>

        <div class="eval-card">
          <h3>Expert Interviews (N=2)</h3>
          <p>
            An animation director (8 years exp.) and a university educator/practitioner (15 years exp.)
            confirmed that the system's generated shots serve distinct narrative functions, and that
            the authoring logic corresponds to professional workflows.
          </p>
          <div class="eval-highlight">
            "When I get a literary script, I first do narrative segmentation, then create a storyboard,
            and finally move into production. You have made this process explicit."
          </div>
        </div>
      </div>

      <!-- Replace with Figure 7 -->
      <div class="figure-placeholder">
        <span>Figure 7: Quantitative Results — NASA-TLX, CSI, Bipolar Preference</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.method-section {
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
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
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
  max-width: 850px;
}

.figure-placeholder {
  width: 100%;
  min-height: calc(300px * var(--page-scale));
  background: rgba(255, 255, 255, 0.03);
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: var(--card-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--size-32);
  text-align: center;
  padding: var(--size-24);
}

.figure-placeholder.large {
  min-height: calc(400px * var(--page-scale));
}

.figure-placeholder span {
  color: rgba(255, 255, 255, 0.2);
  font-size: var(--body-size-sm);
}

/* Layer Cards (Framework) */
.layer-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.layer-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--card-radius);
  padding: var(--size-22);
  border-top: 3px solid rgba(255, 255, 255, 0.15);
}

.layer-card.story { border-top-color: rgba(100, 181, 246, 0.6); }
.layer-card.script { border-top-color: rgba(255, 167, 38, 0.6); }
.layer-card.video { border-top-color: rgba(129, 199, 132, 0.6); }

.layer-card h3 {
  font-size: calc(17px * var(--page-scale));
  color: #fff;
  margin-bottom: 4px;
}

.layer-question {
  color: rgba(255, 255, 255, 0.4);
  font-size: var(--meta-size);
  font-style: italic;
  margin-bottom: 10px;
}

.layer-card p:last-child {
  color: rgba(255, 255, 255, 0.6);
  font-size: var(--body-size-sm);
  line-height: 1.6;
}

/* Translation Stages */
.translation-stages {
  display: flex;
  align-items: stretch;
  gap: 16px;
}

.stage-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--card-radius);
  padding: var(--size-24);
}

.stage-label {
  display: inline-block;
  font-size: var(--meta-size);
  font-weight: 700;
  color: rgba(100, 181, 246, 0.9);
  background: rgba(100, 181, 246, 0.1);
  padding: 2px 10px;
  border-radius: 10px;
  margin-bottom: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.stage-card h3 {
  font-size: calc(18px * var(--page-scale));
  color: #fff;
  margin-bottom: 10px;
}

.stage-card > p {
  color: rgba(255, 255, 255, 0.6);
  font-size: var(--body-size-sm);
  line-height: 1.65;
  margin-bottom: 16px;
}

.stage-arrow {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.2);
  font-size: 1.5rem;
  flex-shrink: 0;
}

.beat-types {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.beat {
  font-size: var(--meta-size);
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.beat.env { background: rgba(129, 199, 132, 0.15); color: #81c784; }
.beat.pres { background: rgba(100, 181, 246, 0.15); color: #64b5f6; }
.beat.act { background: rgba(255, 138, 101, 0.15); color: #ff8a65; }
.beat.dia { background: rgba(255, 213, 79, 0.15); color: #ffd54f; }
.beat.rev { background: rgba(186, 104, 200, 0.15); color: #ba68c8; }
.beat.rea { background: rgba(240, 98, 146, 0.15); color: #f06292; }
.beat.pau { background: rgba(255, 255, 255, 0.08); color: rgba(255,255,255,0.5); }

.params-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.params-grid span {
  font-size: var(--meta-size);
  padding: 3px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

/* Interface Features */
.interface-features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.if-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: calc(var(--card-radius) - 4px);
  padding: var(--size-20);
}

.if-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: calc(22px * var(--page-scale));
  height: calc(22px * var(--page-scale));
  border-radius: 50%;
  background: rgba(100, 181, 246, 0.15);
  color: #64b5f6;
  font-size: var(--meta-size);
  font-weight: 700;
  margin-bottom: 8px;
}

.if-card h4 {
  font-size: calc(15.5px * var(--page-scale));
  color: #fff;
  margin-bottom: 4px;
}

.if-card p {
  color: rgba(255, 255, 255, 0.55);
  font-size: var(--body-size-sm);
  line-height: 1.55;
}

@media (max-width: 768px) {
  .method-section {
    padding: calc(56px * var(--page-scale)) 24px;
  }
  .layer-cards,
  .interface-features {
    grid-template-columns: 1fr;
  }
  .translation-stages {
    flex-direction: column;
  }
  .stage-arrow {
    justify-content: center;
    transform: rotate(90deg);
  }
  .tab-btn {
    padding: 8px 14px;
  }
}
</style>
