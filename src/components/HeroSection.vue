<script setup lang="ts">
import { ref, onMounted } from 'vue'
import uistLogo from '../assets/uist_26_logo.png'
import animasterLogo from '../assets/AniMasterLogo.svg'

const isVisible = ref(false)

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 200)
})
</script>

<template>
  <section id="hero" class="hero-section">
    <!-- Background: replace with your teaser video -->
    <div class="hero-bg">
      <div class="hero-bg-overlay"></div>
    </div>

    <div :class="['hero-content', { visible: isVisible }]">
      <img :src="uistLogo" alt="UIST 2026" class="uist-badge" />
      <img :src="animasterLogo" alt="AniMaster" class="animaster-logo" />
      <div class="hero-text-content">
        <h2>From Story Texts to Animated Videos via Cinematic Script Generation and Interactive Authoring</h2>

      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Hero keeps no opaque background of its own — the global fixed video +
   overlay in App.vue show through. The inner wrapper is kept but left
   transparent so we don't need to touch the template markup. */
.hero-bg {
  position: absolute;
  inset: 0;
  background: transparent;
}

.hero-bg-overlay {
  position: absolute;
  inset: 0;
  background: transparent;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 0 var(--page-gutter);
  max-width: var(--hero-content-max-width);
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.hero-content.visible {
  opacity: 1;
  transform: translateY(0);
}

.uist-badge {
  display: block;
  height: calc(56px * var(--page-scale));
  width: auto;
  margin: 0 auto var(--size-20);
  filter: drop-shadow(0 2px 10px rgba(0, 0, 0, 0.5));
}

.animaster-logo {
  display: block;
  height: calc(140px * var(--page-scale));
  width: auto;
  max-width: 90vw;
  margin: 0 auto var(--size-20);
  filter: drop-shadow(0 4px 24px rgba(0, 0, 0, 0.65))
          drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
}

.hero-text-content h2 {
  font-size: var(--hero-title-size);
  font-weight: 600;
  line-height: 1.35;
  max-width: 1300px;
  color: rgba(255, 255, 255, 0.92);
  margin-bottom: var(--size-32);
  line-height: 1.6;
  max-width: min(var(--hero-title-max-width), 78vw);
  margin-left: auto;
  margin-right: auto;
}

.link-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.btn-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 24px;
  color: #fff;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.btn-link:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.learn-more-btn {
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 10px 32px;
  border-radius: 30px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
}

.learn-more-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #fff;
}

@media (max-width: 768px) {
  .hero-content {
    padding: 0 24px;
  }
}
</style>
