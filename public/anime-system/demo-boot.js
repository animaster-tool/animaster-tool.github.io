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
  // NOTE: 'beat_first_frame_history' is intentionally NOT seeded. Its entries
  // point to first-frame thumbnails from past generations that we deliberately
  // did not bundle (see ../demo-assets/ — we only keep the "current" first
  // frame per beat, ~45MB). Skipping the key means VueFlow's BeatCanvas node
  // treats every beat as having no history and makes no network requests for
  // those missing thumbnails.
  var WORKSPACE_KEYS = [
    'story_json',
    'story',
    'accordion_items',
    'theme',
  ];
  var BOOT_FLAG = '__animaster_demo_boot_v4__';
  var WORKSPACE_URL = './demo-workspace.animaster';

  // ─── URL rewrite ──────────────────────────────────────────────────────
  //   The demo workspace was exported when assets still lived on the
  //   project's backend (hdvis.tianeo.com). That host's TLS cert is for
  //   aliyuncs.com and does not cover the tianeo name, so browsers refuse
  //   every image/video fetch. We download the "current" assets once and
  //   serve them statically from ./demo-assets/, then rewrite every hdvis
  //   URL at seed-time so the app sees the local paths instead.
  //
  //   This must happen BEFORE the value is written to localStorage so the
  //   app never sees the broken hostname — no race, no transient flashes.
  //
  //   Two kinds of asset references need to be rewritten:
  //     (a) Full hdvis URLs embedded inside beat frames / video fields:
  //         "https://hdvis.tianeo.com/CompImage/S1-E1-B1.png"
  //     (b) Bare, site-relative paths in character-card / location-card
  //         nodes written by the AniMaster backend:
  //         "characterImageURL":"/RefImage/Mother_ae1872.png"
  //         "locationImageURL":"/RefImage/...garden_dc1354.png"
  //         These would otherwise resolve against the iframe host
  //         (animaster-tool.github.io/RefImage/...) and 404.
  //   We match the quoted form "/RefImage/ so that we only rewrite JSON
  //   string values and never accidentally rewrite e.g. a markdown path or
  //   URL fragment.
  function rewriteAssetUrls(value) {
    if (typeof value !== 'string') return value;
    var out = value;
    if (out.indexOf('hdvis.tianeo.com') !== -1) {
      // Match both http:// and https:// just in case; trailing "/" so the
      // capture point is the bucket path (e.g. CompImage/...).
      out = out.replace(/https?:\/\/hdvis\.tianeo\.com\//g, './demo-assets/');
    }
    if (out.indexOf('"/RefImage/') !== -1) {
      out = out.replace(/"\/RefImage\//g, '"./demo-assets/RefImage/');
    }
    return out;
  }

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
  // bundle starts executing. The workspace file is ~150KB (compacted JSON),
  // which is well within the safe range for a blocking fetch.
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', WORKSPACE_URL, /* async */ false);
    xhr.send(null);
    if (xhr.status >= 200 && xhr.status < 300) {
      var data = JSON.parse(xhr.responseText);
      var seeded = 0;
      var rewritten = 0;
      for (var i = 0; i < WORKSPACE_KEYS.length; i++) {
        var k = WORKSPACE_KEYS[i];
        if (data[k] !== undefined && data[k] !== null) {
          var before = data[k];
          var after = rewriteAssetUrls(before);
          if (after !== before) rewritten++;
          localStorage.setItem(k, after);
          seeded++;
        }
      }
      // Proactively clear the un-seeded history key in case it was seeded by
      // a previous boot-flag version and is lingering in localStorage — its
      // entries would point at 404s on the source server.
      try { localStorage.removeItem('beat_first_frame_history'); } catch (e) {}
      sessionStorage.setItem(BOOT_FLAG, 'done');
      console.log('[demo-boot] seeded', seeded, 'workspace keys,', rewritten, 'rewritten to ./demo-assets/');
    } else {
      console.warn('[demo-boot] workspace file fetch returned', xhr.status);
    }
  } catch (e) {
    console.warn('[demo-boot] seed failed:', e);
  }

  // ─── 3. Demo-only UI patches ──────────────────────────────────────────
  //   The project-page iframe should present AniMaster as a read-only demo.
  //   We strip workspace-management controls the user cannot meaningfully
  //   use (Save / Load / Reset / Settings / Output) and collapse the
  //   Script Reader side panel so the canvas gets full width on first view.
  //
  //   None of this touches the AniMaster source — everything here is a
  //   pure runtime patch that reaches into the bundled app's DOM.
  try {
    // 3a. Hide right-side header buttons via CSS.
    //     We target by the buttons' title attribute, which is a stable
    //     contract in the source template. Help button and theme switch
    //     are deliberately preserved.
    var style = document.createElement('style');
    style.setAttribute('data-demo-ui-patch', '1');
    style.textContent = [
      '.header .header-action-btn[title="Save Workspace"],',
      '.header .header-action-btn[title="Load Workspace"],',
      '.header .header-action-btn[title="Reset Workspace"],',
      '.header .header-action-btn[title="Settings"],',
      '.header .header-action-btn[title="Output Video"],',
      '.header .header-separator { display: none !important; }',
    ].join('\n');
    (document.head || document.documentElement).appendChild(style);

    // 3b. Collapse the Script Reader on first appearance.
    //     StoryLineView.vue (line ~4420) unconditionally flips
    //     `showScriptView` to true in a nextTick after storyPhases load.
    //     We observe the DOM for the resulting <.script-view-panel>,
    //     click its close button (same handler the user would hit), and
    //     then disconnect the observer so the user can still open the
    //     Script Reader manually afterwards.
    //
    //     Clicking the real close button — rather than CSS-hiding the
    //     panel — matters because the parent's `onCloseScriptReader`
    //     also zeroes `scriptPanelWidth`, which is what the StoryArcBar
    //     reads to recompute its `left` offset. Without this, the arc
    //     bar stays shifted right of the (invisible) reader column.
    var collapsed = false;
    var observer = new MutationObserver(function () {
      if (collapsed) return;
      var panel = document.querySelector('.script-view-panel');
      if (!panel) return;
      var closeBtn = panel.querySelector('.script-view-header .controls .el-button');
      if (!closeBtn) return;
      collapsed = true;
      // Small delay gives Vue's Transition a chance to attach so the
      // emitted close event is handled cleanly. 0ms is usually enough
      // but 30ms keeps it robust on slower machines.
      setTimeout(function () {
        try { closeBtn.click(); } catch (err) { /* noop */ }
        observer.disconnect();
      }, 30);
    });
    // documentElement is always available even before <body> parses.
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // Safety net: stop watching after 30 seconds to avoid leaking
    // a long-lived observer if the panel never appears (e.g. empty
    // workspace, upload flow).
    setTimeout(function () {
      if (!collapsed) observer.disconnect();
    }, 30000);
  } catch (e) {
    console.warn('[demo-boot] UI patch failed:', e);
  }
})();
