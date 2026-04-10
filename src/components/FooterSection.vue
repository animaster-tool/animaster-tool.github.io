<script setup lang="ts">
// Minimal footer: only the bottom bar with GitHub link + copyright is kept.
// The previous Resources / Navigation / Cite-This-Work blocks were removed.
const backToTop = () => {
  document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <footer class="site-footer">
    <div class="footer-container">
      <div class="footer-bottom">
        <div class="social-icons">
          <button type="button" class="footer-link" @click="backToTop">Back to Top</button>
        </div>
        <p>&copy; 2026 AniMaster. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  padding: calc(24px * var(--page-scale)) var(--page-gutter) calc(18px * var(--page-scale));
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-container {
  max-width: var(--section-max-width);
  width: 100%;
  margin: 0 auto;
  padding-top: calc(18px * var(--page-scale));
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-bottom p {
  color: rgba(255, 255, 255, 0.3);
  font-size: var(--meta-size);
}

.social-icons {
  display: flex;
  gap: 16px;
}

.footer-link {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  font-size: var(--body-size-sm);
  padding: 0;
  cursor: pointer;
  transition: color 0.3s;
}

.footer-link:hover {
  color: #fff;
}

@media (max-width: 768px) {
  .site-footer {
    padding: 18px 24px 14px;
  }
  .footer-bottom {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
}
</style>
