/**
 * AniMaster 组件导出工具 v2
 *
 * 修复：不再使用 html-to-image 的 toSvg（它用 foreignObject，浏览器和 Figma 都不支持）
 * 方案：
 *   - 主要导出 高清 PNG（透明背景，可直接拖入 Figma）
 *   - SVG 模式使用 dom-to-svg 的纯手工实现，将 DOM 元素转为真正的 SVG 矩形/文字
 *
 * 使用方法：
 *   在控制台粘贴: fetch('/svg-exporter.js').then(r=>r.text()).then(t=>eval(t))
 */

(async function () {
  'use strict';

  // ============ 1. 加载 html-to-image（仅用于 PNG 导出） ============
  if (!window.__h2i) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js';
    document.head.appendChild(script);
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = () => reject(new Error('无法加载 html-to-image'));
    });
    window.__h2i = window.htmlToImage;
    console.log('✅ html-to-image 加载完成（用于 PNG）');
  }

  // ============ 2. 手工 DOM → 真实 SVG 转换器 ============
  // 不依赖 foreignObject，生成可被 Figma 直接编辑的 SVG
  function domToRealSvg(el) {
    const rect = el.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    const offsetX = rect.left;
    const offsetY = rect.top;

    const svgParts = [];
    svgParts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
    svgParts.push(`<defs><style>text { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }</style></defs>`);

    function walk(node, depth) {
      if (node.nodeType === Node.TEXT_NODE) return;
      if (node.id === 'svg-exporter-ui') return;
      if (node.classList && node.classList.contains('svg-exporter-highlight')) return;
      if (node.nodeType !== Node.ELEMENT_NODE) return;

      const cs = window.getComputedStyle(node);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return;

      const r = node.getBoundingClientRect();
      const x = r.left - offsetX;
      const y = r.top - offsetY;
      const w = r.width;
      const h = r.height;

      if (w <= 0 || h <= 0) return;

      // 绘制背景和边框
      const bg = cs.backgroundColor;
      const borderColor = cs.borderTopColor;
      const borderWidth = parseFloat(cs.borderTopWidth) || 0;
      const borderRadius = parseFloat(cs.borderRadius) || 0;
      const opacity = parseFloat(cs.opacity);
      const hasBg = bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent';
      const hasBorder = borderWidth > 0 && borderColor && borderColor !== 'rgba(0, 0, 0, 0)';

      // 处理背景图片（渐变）
      const bgImage = cs.backgroundImage;
      const hasGradient = bgImage && bgImage !== 'none' && bgImage.includes('gradient');
      let gradientId = null;

      if (hasGradient) {
        gradientId = `grad-${depth}-${Math.random().toString(36).substr(2, 6)}`;
        const gradSvg = parseGradientToSvg(bgImage, gradientId);
        if (gradSvg) svgParts.push(gradSvg);
      }

      if (hasBg || hasBorder || hasGradient) {
        const rx = Math.min(borderRadius, w / 2, h / 2);
        let fill = 'none';
        if (gradientId) fill = `url(#${gradientId})`;
        else if (hasBg) fill = bg;

        svgParts.push(
          `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ` +
          `fill="${fill}" ` +
          (hasBorder ? `stroke="${borderColor}" stroke-width="${borderWidth}" ` : '') +
          (opacity < 1 ? `opacity="${opacity}" ` : '') +
          `/>`
        );
      }

      // 处理 box-shadow（简化为矩形阴影）
      const shadow = cs.boxShadow;
      if (shadow && shadow !== 'none') {
        // 简化处理，跳过复杂阴影，Figma 中可手动添加
      }

      // 处理图片
      if (node.tagName === 'IMG' && node.src) {
        // 尝试将图片嵌入为 base64
        try {
          const canvas = document.createElement('canvas');
          canvas.width = w * 2;
          canvas.height = h * 2;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(node, 0, 0, w * 2, h * 2);
          const dataUrl = canvas.toDataURL('image/png');
          svgParts.push(
            `<image x="${x}" y="${y}" width="${w}" height="${h}" href="${dataUrl}" />`
          );
        } catch (e) {
          // CORS 阻止，画占位框
          svgParts.push(
            `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#333" rx="4"/>` +
            `<text x="${x + w / 2}" y="${y + h / 2}" text-anchor="middle" dominant-baseline="central" fill="#888" font-size="10">[img]</text>`
          );
        }
        return; // 图片节点不再遍历子节点
      }

      // 处理 SVG 元素（直接复制）
      if (node.tagName === 'svg' || node instanceof SVGElement) {
        try {
          const clone = node.cloneNode(true);
          clone.setAttribute('x', x);
          clone.setAttribute('y', y);
          clone.setAttribute('width', w);
          clone.setAttribute('height', h);
          svgParts.push(clone.outerHTML);
        } catch (e) { /* skip */ }
        return;
      }

      // 处理 Canvas 元素
      if (node.tagName === 'CANVAS') {
        try {
          const dataUrl = node.toDataURL('image/png');
          svgParts.push(
            `<image x="${x}" y="${y}" width="${w}" height="${h}" href="${dataUrl}" />`
          );
        } catch (e) {
          svgParts.push(
            `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#222" rx="4"/>`
          );
        }
        return;
      }

      // 处理文字节点
      for (const child of node.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent.trim();
          if (!text) continue;

          const range = document.createRange();
          range.selectNodeContents(child);
          const textRects = range.getClientRects();

          for (const tr of textRects) {
            const tx = tr.left - offsetX;
            const ty = tr.top - offsetY;
            const fontSize = parseFloat(cs.fontSize) || 14;
            const fontWeight = cs.fontWeight;
            const fontFamily = cs.fontFamily;
            const color = cs.color || '#ffffff';
            const textAlign = cs.textAlign;
            const letterSpacing = cs.letterSpacing !== 'normal' ? `letter-spacing="${cs.letterSpacing}"` : '';

            // 获取这个 rect 对应的文字片段
            const textContent = text.length > 100 ? text.substring(0, 100) + '...' : text;
            const escapedText = textContent
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;');

            svgParts.push(
              `<text x="${tx}" y="${ty + fontSize * 0.85}" ` +
              `font-size="${fontSize}" font-weight="${fontWeight}" ` +
              `font-family="${escapeAttr(fontFamily)}" ` +
              `fill="${color}" ${letterSpacing}>` +
              `${escapedText}</text>`
            );
            break; // 只取第一个 rect
          }
        }
      }

      // 递归子元素
      for (const child of node.children) {
        walk(child, depth + 1);
      }
    }

    function escapeAttr(str) {
      return str.replace(/"/g, '&quot;').replace(/&/g, '&amp;');
    }

    function parseGradientToSvg(gradient, id) {
      // 简化线性渐变解析
      const linearMatch = gradient.match(/linear-gradient\(([^)]+)\)/);
      if (!linearMatch) return null;
      try {
        const parts = linearMatch[1];
        // 非常简化的渐变解析，Figma 导入后可以微调
        return `<linearGradient id="${id}" x1="0%" y1="0%" x2="0%" y2="100%">` +
          `<stop offset="0%" stop-color="rgba(100,100,100,0.3)"/>` +
          `<stop offset="100%" stop-color="rgba(50,50,50,0.3)"/>` +
          `</linearGradient>`;
      } catch (e) {
        return null;
      }
    }

    walk(el, 0);
    svgParts.push('</svg>');
    return svgParts.join('\n');
  }

  // ============ 3. 创建浮动工具栏 UI ============
  const existingUI = document.getElementById('svg-exporter-ui');
  if (existingUI) existingUI.remove();

  const toolbar = document.createElement('div');
  toolbar.id = 'svg-exporter-ui';
  toolbar.innerHTML = `
    <style>
      #svg-exporter-ui {
        position: fixed;
        top: 12px;
        right: 12px;
        z-index: 999999;
        background: #1a1a2e;
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 12px;
        padding: 12px 16px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 13px;
        color: #e0e0e0;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        min-width: 280px;
        cursor: move;
        user-select: none;
      }
      #svg-exporter-ui h3 {
        margin: 0 0 10px 0;
        font-size: 14px;
        color: #fff;
      }
      #svg-exporter-ui .btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 8px;
        background: #2a2a3e;
        color: #d0d0e0;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.15s;
        margin: 2px;
      }
      #svg-exporter-ui .btn:hover { background: #3a3a52; }
      #svg-exporter-ui .btn.active {
        background: #4a6cf7;
        border-color: #4a6cf7;
        color: #fff;
      }
      #svg-exporter-ui .btn.danger { background: #c0392b; border-color: #c0392b; }
      #svg-exporter-ui .status {
        margin-top: 8px;
        padding: 6px 8px;
        background: rgba(255,255,255,0.05);
        border-radius: 6px;
        font-size: 11px;
        color: #aaa;
        max-height: 100px;
        overflow-y: auto;
      }
      #svg-exporter-ui .options {
        margin-top: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      #svg-exporter-ui label {
        font-size: 11px;
        display: flex;
        align-items: center;
        gap: 4px;
        color: #bbb;
      }
      #svg-exporter-ui input[type="number"] {
        width: 40px;
        background: #2a2a3e;
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 4px;
        color: #e0e0e0;
        padding: 2px 4px;
        font-size: 11px;
      }
      #svg-exporter-ui select {
        background: #2a2a3e;
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 4px;
        color: #e0e0e0;
        padding: 2px 4px;
        font-size: 11px;
      }
      .svg-exporter-highlight {
        outline: 3px dashed #4a6cf7 !important;
        outline-offset: 2px !important;
      }
    </style>
    <h3>Component Exporter v2</h3>
    <div>
      <button class="btn" id="svgex-select">Select Mode</button>
      <button class="btn" id="svgex-selector">CSS Selector</button>
      <button class="btn danger" id="svgex-close">X</button>
    </div>
    <div class="options">
      <label>
        Format:
        <select id="svgex-format">
          <option value="png" selected>PNG (recommended for Figma)</option>
          <option value="svg">SVG (vector, editable)</option>
          <option value="both">Both PNG + SVG</option>
        </select>
      </label>
    </div>
    <div class="options">
      <label>
        <input type="checkbox" id="svgex-transparent" checked> Transparent BG
      </label>
      <label>
        Scale: <input type="number" id="svgex-scale" value="3" min="1" max="6" step="1">x
      </label>
    </div>
    <div class="status" id="svgex-status">Ready — click "Select Mode" to start</div>
  `;
  document.body.appendChild(toolbar);

  // ============ 4. 拖拽工具栏 ============
  let isDragging = false, dragX, dragY;
  toolbar.addEventListener('mousedown', (e) => {
    if (['BUTTON', 'INPUT', 'LABEL', 'SELECT', 'OPTION'].includes(e.target.tagName)) return;
    isDragging = true;
    dragX = e.clientX - toolbar.offsetLeft;
    dragY = e.clientY - toolbar.offsetTop;
  });
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    toolbar.style.left = (e.clientX - dragX) + 'px';
    toolbar.style.right = 'auto';
    toolbar.style.top = (e.clientY - dragY) + 'px';
  });
  document.addEventListener('mouseup', () => { isDragging = false; });

  // ============ 5. 状态管理 ============
  const statusEl = document.getElementById('svgex-status');
  let selectMode = false;
  let highlightedEl = null;

  function log(msg) {
    statusEl.textContent = msg;
    console.log('[Exporter]', msg);
  }

  // ============ 6. 导出核心 ============
  async function exportElement(el, filename) {
    const transparent = document.getElementById('svgex-transparent').checked;
    const scale = parseFloat(document.getElementById('svgex-scale').value) || 3;
    const format = document.getElementById('svgex-format').value;

    const doPng = format === 'png' || format === 'both';
    const doSvg = format === 'svg' || format === 'both';

    // 临时移除高亮
    el.classList.remove('svg-exporter-highlight');

    try {
      // --- PNG 导出 ---
      if (doPng) {
        log('Exporting PNG...');
        const origBg = el.style.backgroundColor;
        if (transparent) el.style.backgroundColor = 'transparent';

        const pngDataUrl = await window.__h2i.toPng(el, {
          backgroundColor: transparent ? 'transparent' : undefined,
          pixelRatio: scale,
          filter: (node) => {
            if (node.id === 'svg-exporter-ui') return false;
            if (node.classList && node.classList.contains('svg-exporter-highlight')) return false;
            return true;
          }
        });

        if (transparent) el.style.backgroundColor = origBg;
        downloadDataUrl(pngDataUrl, `${filename}.png`);
        log(`PNG exported: ${filename}.png (${scale}x)`);
      }

      // --- SVG 导出（真实矢量） ---
      if (doSvg) {
        log('Generating real SVG (no foreignObject)...');
        const svgString = domToRealSvg(el);
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        downloadUrl(url, `${filename}.svg`);
        URL.revokeObjectURL(url);
        log(doPng ? `PNG + SVG exported: ${filename}` : `SVG exported: ${filename}.svg`);
      }

    } catch (err) {
      log(`Export failed: ${err.message}`);
      console.error(err);
    }
  }

  function downloadDataUrl(dataUrl, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }

  function downloadUrl(url, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
  }

  // ============ 7. 元素命名 ============
  function getElementName(el) {
    const vueComponent = el.__vue_app__?.config?.globalProperties?.$options?.name
      || el._vnode?.type?.name
      || el.__vueParentComponent?.type?.name
      || el.__vueParentComponent?.type?.__name;
    if (vueComponent) return vueComponent;
    if (el.id) return el.id;
    if (el.className && typeof el.className === 'string') {
      const mainClass = el.className.split(/\s+/)[0].replace(/[^a-zA-Z0-9_-]/g, '');
      if (mainClass) return mainClass;
    }
    return `component-${Date.now()}`;
  }

  // ============ 8. 选择模式 ============
  function onMouseMove(e) {
    if (!selectMode) return;
    const target = e.target;
    if (toolbar.contains(target)) return;

    if (highlightedEl && highlightedEl !== target) {
      highlightedEl.classList.remove('svg-exporter-highlight');
    }
    highlightedEl = target;
    highlightedEl.classList.add('svg-exporter-highlight');

    const tag = target.tagName.toLowerCase();
    const cls = target.className?.toString().split(' ')[0] || '';
    const name = getElementName(target);
    log(`Hover: <${tag}> .${cls} [${name}] | Shift+click = exact element | Alt+click = parent`);
  }

  function onMouseClick(e) {
    if (!selectMode) return;
    if (toolbar.contains(e.target)) return;

    e.preventDefault();
    e.stopPropagation();

    let exportTarget = e.target;

    // Alt：选父级
    if (e.altKey && exportTarget.parentElement) {
      exportTarget = exportTarget.parentElement;
    }

    // 非 Shift：向上查找 Vue 组件根
    if (!e.shiftKey) {
      let current = e.target;
      while (current && current !== document.body) {
        if (current.__vueParentComponent || current._vnode?.type?.name) {
          exportTarget = current;
          break;
        }
        const attrs = Array.from(current.attributes || []);
        const hasVueScope = attrs.some(a => a.name.startsWith('data-v-'));
        if (hasVueScope && current.parentElement) {
          const parentAttrs = Array.from(current.parentElement.attributes || []);
          const parentHasSameScope = parentAttrs.some(a =>
            attrs.some(ca => ca.name === a.name && a.name.startsWith('data-v-'))
          );
          if (!parentHasSameScope) {
            exportTarget = current;
            break;
          }
        }
        current = current.parentElement;
      }
    }

    const filename = getElementName(exportTarget);
    exportElement(exportTarget, filename);
  }

  // ============ 9. 按钮事件 ============
  document.getElementById('svgex-select').addEventListener('click', () => {
    selectMode = !selectMode;
    const btn = document.getElementById('svgex-select');
    btn.classList.toggle('active', selectMode);

    if (selectMode) {
      document.addEventListener('mousemove', onMouseMove, true);
      document.addEventListener('click', onMouseClick, true);
      log('Select mode ON — hover to highlight, click to export');
    } else {
      document.removeEventListener('mousemove', onMouseMove, true);
      document.removeEventListener('click', onMouseClick, true);
      if (highlightedEl) {
        highlightedEl.classList.remove('svg-exporter-highlight');
        highlightedEl = null;
      }
      log('Select mode OFF');
    }
  });

  document.getElementById('svgex-selector').addEventListener('click', () => {
    const selector = prompt('Enter CSS selector to export:\ne.g. .script-node, .vue-flow, .beat-card');
    if (!selector) return;

    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) {
      log(`Not found: ${selector}`);
      return;
    }

    log(`Found ${elements.length} elements, exporting...`);
    elements.forEach((el, i) => {
      const name = getElementName(el);
      const filename = elements.length > 1 ? `${name}-${i + 1}` : name;
      setTimeout(() => exportElement(el, filename), i * 800);
    });
  });

  document.getElementById('svgex-close').addEventListener('click', () => {
    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('click', onMouseClick, true);
    if (highlightedEl) highlightedEl.classList.remove('svg-exporter-highlight');
    toolbar.remove();
  });

  log('Ready — click "Select Mode" to begin');
  console.log('✅ Component Exporter v2 loaded! Toolbar is at the top-right corner.');
})();
