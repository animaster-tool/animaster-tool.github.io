/*
 * Demo bootstrap for the AniMaster project page iframe.
 *
 * Runs BEFORE the main Vue bundle. Responsibilities:
 *   1. Seed localStorage from demo-workspace.animaster so the app boots into
 *      a preloaded workspace (matches the onImportWorkspace flow in
 *      StoryLineView.vue — which writes each WORKSPACE_KEY into localStorage
 *      and reloads).
 *   2. Intercept any network call to the local backend (127.0.0.1:8000) so
 *      "Generate / Regenerate / model" buttons don't hang or throw — they
 *      simply return a synthetic error and are swallowed as no-ops.
 *
 * Everything is best-effort and failure-safe: if the workspace file is
 *  missing or unparseable we let the app boot blank instead of blocking it.
 */

(function initDemoBoot() {
  var WORKSPACE_KEYS = [
    'story_json',
    'story',
    'accordion_items',
    'beat_first_frame_history',
    'theme',
  ];
  var BOOT_FLAG = '__animaster_demo_boot_v1__';
  var WORKSPACE_URL = './demo-workspace.animaster';

  // ─── 1. Mock local backend ────────────────────────────────────────────
  var BACKEND_HOSTS = ['127.0.0.1:8000', 'localhost:8000'];
  function isBackend(url) {
    if (!url) return false;
    var s = String(url);
    for (var i = 0; i < BACKEND_HOSTS.length; i++) {
      if (s.indexOf(BACKEND_HOSTS[i]) !== -1) return true;
    }
    return false;
  }

  var origFetch = window.fetch && window.fetch.bind(window);
  if (origFetch) {
    window.fetch = function (input, init) {
      var url = typeof input === 'string' ? input : input && input.url;
      if (isBackend(url)) {
        return Promise.resolve(
          new Response(
            JSON.stringify({ demo: true, error: 'Backend disabled in demo' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } },
          ),
        );
      }
      return origFetch(input, init);
    };
  }

  var OrigXHR = window.XMLHttpRequest;
  if (OrigXHR) {
    var origOpen = OrigXHR.prototype.open;
    var origSend = OrigXHR.prototype.send;
    OrigXHR.prototype.open = function (method, url) {
      this.__demo_blocked__ = isBackend(url);
      return origOpen.apply(this, arguments);
    };
    OrigXHR.prototype.send = function () {
      if (this.__demo_blocked__) {
        var xhr = this;
        setTimeout(function () {
          try {
            Object.defineProperty(xhr, 'readyState', { value: 4, configurable: true });
            Object.defineProperty(xhr, 'status', { value: 503, configurable: true });
            Object.defineProperty(xhr, 'responseText', {
              value: '{"demo":true,"error":"Backend disabled in demo"}',
              configurable: true,
            });
            xhr.dispatchEvent(new Event('readystatechange'));
            xhr.dispatchEvent(new Event('load'));
            xhr.dispatchEvent(new Event('loadend'));
          } catch (e) {
            /* swallow */
          }
        }, 0);
        return;
      }
      return origSend.apply(this, arguments);
    };
  }

  // ─── 2. Seed workspace into localStorage (once per tab) ───────────────
  //   We use sessionStorage as a guard so the seed happens at most once
  //   per iframe load, avoiding an infinite reload loop after the app
  //   itself persists things back.
  if (sessionStorage.getItem(BOOT_FLAG) === 'done') return;

  // Use a sync XHR to guarantee localStorage is seeded BEFORE the Vue
  // bundle starts executing. A 750KB local file is fine for sync XHR.
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', WORKSPACE_URL, /* async */ false);
    xhr.send(null);
    if (xhr.status >= 200 && xhr.status < 300) {
      var data = JSON.parse(xhr.responseText);
      var seeded = 0;
      for (var i = 0; i < WORKSPACE_KEYS.length; i++) {
        var k = WORKSPACE_KEYS[i];
        if (data[k] !== undefined && data[k] !== null) {
          localStorage.setItem(k, data[k]);
          seeded++;
        }
      }
      sessionStorage.setItem(BOOT_FLAG, 'done');
      console.log('[demo-boot] seeded', seeded, 'workspace keys into localStorage');
    } else {
      console.warn('[demo-boot] workspace file fetch returned', xhr.status);
    }
  } catch (e) {
    console.warn('[demo-boot] seed failed:', e);
  }
})();
