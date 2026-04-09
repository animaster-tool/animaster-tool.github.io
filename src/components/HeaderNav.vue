<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import logoUrl from '../assets/AniMasterLogo.svg'

const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<template>
  <header :class="['site-header', { scrolled: isScrolled }]">
    <div class="logo">
      <a href="#" @click.prevent="$emit('scrollTo', 'hero')" aria-label="AniMaster">
        <img :src="logoUrl" alt="AniMaster" class="logo-img" />
      </a>
    </div>
    <nav class="main-nav">
      <a href="#overview" @click.prevent="$emit('scrollTo', 'overview')">Overview</a>
      <a href="#demos" @click.prevent="$emit('scrollTo', 'demos')">Demos</a>
      <a href="#method" @click.prevent="$emit('scrollTo', 'method')">Method</a>
      <a href="#" class="nav-disabled">Code (Coming Soon)</a>
    </nav>
  </header>
</template>

<style scoped>
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  height: 64px;
  background: transparent;
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.site-header.scrolled {
  background: rgba(10, 10, 10, 0.95);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.logo a {
  display: flex;
  align-items: center;
  color: #fff;
  text-decoration: none;
}

.logo-img {
  height: 32px;
  width: auto;
  display: block;
}

.main-nav {
  display: flex;
  gap: 28px;
}

.main-nav a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.3s;
}

.main-nav a:hover {
  color: #fff;
}

.main-nav .nav-disabled {
  opacity: 0.4;
  cursor: default;
}

@media (max-width: 768px) {
  .site-header {
    padding: 0 20px;
  }
  .main-nav {
    gap: 16px;
  }
  .main-nav a {
    font-size: 0.8rem;
  }
}
</style>
