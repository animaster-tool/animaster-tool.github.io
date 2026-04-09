<script setup lang="ts">
// Minimal footer: only the bottom bar with GitHub link + copyright is kept.
// The previous Resources / Navigation / Cite-This-Work blocks were removed.
</script>

<template>
  <footer class="site-footer">
    <div class="footer-container">
      <div class="footer-bottom">
        <div class="social-icons">
          <a href="https://github.com/animaster-tool" target="_blank" title="GitHub">GitHub</a>
        </div>
        <p>&copy; 2026 AniMaster. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 60px 60px 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-container {
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-bottom p {
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.8rem;
}

.social-icons {
  display: flex;
  gap: 16px;
}

.social-icons a {
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.3s;
}

.social-icons a:hover {
  color: #fff;
}

@media (max-width: 768px) {
  .site-footer {
    padding: 40px 24px 20px;
  }
  .footer-bottom {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
</style>
