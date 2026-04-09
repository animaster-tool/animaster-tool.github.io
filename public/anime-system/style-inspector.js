/**
 * AniMaster 样式拾取器 v3
 * 点击任意元素，输出完整样式（颜色含 Alpha、字体、间距等），方便在 Figma 中手动还原。
 * 加载方式: fetch('/style-inspector.js').then(r=>r.text()).then(t=>eval(t))
 */
(function () {
  'use strict';

  // 彻底清理旧版本：移除 DOM + 移除旧事件监听器
  const OLD = document.getElementById('style-inspector-ui');
  if (OLD) OLD.remove();
  if (window.__si_cleanup) {
    window.__si_cleanup();
  }

  // ==================== 颜色解析 ====================
  function isVisible(val) {
    return val && val !== 'rgba(0, 0, 0, 0)' && val !== 'transparent' && val !== 'initial';
  }

  function parseColor(raw) {
    if (!isVisible(raw)) return null;
    const m = raw.match(/rgba?\(\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\s*\)/);
    if (!m) return { hex: raw, r: 0, g: 0, b: 0, a: 1, rgba: raw };
    const r = Math.round(+m[1]), g = Math.round(+m[2]), b = Math.round(+m[3]);
    const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
    const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
    return { hex, r, g, b, a, rgba: raw };
  }

  // ==================== 背景色深度搜索 ====================
  // 从目标元素出发，向下（子元素）、自身伪元素、向上（父元素）全面搜索背景色
  function findAllBackgrounds(el) {
    const results = [];
    const seen = new Set();
    function add(color, source) {
      const key = color.rgba;
      if (seen.has(key)) return;
      seen.add(key);
      results.push({ color, source });
    }

    // (A) 自身
    const selfBg = parseColor(window.getComputedStyle(el).backgroundColor);
    if (selfBg) add(selfBg, '当前元素');

    // (B) 自身 background-image (渐变等)
    const selfBgi = window.getComputedStyle(el).backgroundImage;
    if (selfBgi && selfBgi !== 'none') {
      results.push({ color: null, gradient: selfBgi, source: '当前元素渐变' });
    }

    // (C) 自身伪元素 ::before / ::after
    for (const pseudo of ['::before', '::after']) {
      const pcs = window.getComputedStyle(el, pseudo);
      if (pcs.content && pcs.content !== 'none') {
        const pbg = parseColor(pcs.backgroundColor);
        if (pbg) add(pbg, `当前元素 ${pseudo}`);
        const pbi = pcs.backgroundImage;
        if (pbi && pbi !== 'none') {
          results.push({ color: null, gradient: pbi, source: `当前元素 ${pseudo} 渐变` });
        }
      }
    }

    // (D) 向下搜索子元素（最多 5 层，最多 5 个结果）
    let childCount = 0;
    function walkDown(parent, depth) {
      if (depth > 5 || childCount >= 5) return;
      for (const child of parent.children) {
        if (child.id === 'style-inspector-ui') continue;
        if (childCount >= 5) return;
        const ccs = window.getComputedStyle(child);
        const cbg = parseColor(ccs.backgroundColor);
        if (cbg) {
          const tag = child.tagName.toLowerCase();
          const cls = child.className?.toString().split(/\s+/).filter(c => !c.startsWith('si-'))[0] || '';
          add(cbg, `子元素 <${tag}${cls ? '.' + cls : ''}>`);
          childCount++;
        }
        // 子元素伪元素
        for (const pseudo of ['::before', '::after']) {
          const cpcs = window.getComputedStyle(child, pseudo);
          if (cpcs.content && cpcs.content !== 'none') {
            const cpbg = parseColor(cpcs.backgroundColor);
            if (cpbg) {
              const tag = child.tagName.toLowerCase();
              const cls = child.className?.toString().split(/\s+/)[0] || '';
              add(cpbg, `子元素 <${tag}.${cls}> ${pseudo}`);
              childCount++;
            }
          }
        }
        walkDown(child, depth + 1);
      }
    }
    walkDown(el, 0);

    // (E) 向上搜索父元素（最多 10 层）
    let ancestor = el.parentElement;
    let depth = 0;
    while (ancestor && ancestor !== document.documentElement && depth < 10) {
      const acs = window.getComputedStyle(ancestor);
      const abg = parseColor(acs.backgroundColor);
      if (abg) {
        const tag = ancestor.tagName.toLowerCase();
        const cls = ancestor.className?.toString().split(/\s+/).filter(c => !c.startsWith('si-'))[0] || '';
        add(abg, `父元素 <${tag}${cls ? '.' + cls : ''}>`);
      }
      // 父元素伪元素
      for (const pseudo of ['::before', '::after']) {
        const apcs = window.getComputedStyle(ancestor, pseudo);
        if (apcs.content && apcs.content !== 'none') {
          const apbg = parseColor(apcs.backgroundColor);
          if (apbg) {
            const tag = ancestor.tagName.toLowerCase();
            const cls = ancestor.className?.toString().split(/\s+/)[0] || '';
            add(apbg, `父元素 <${tag}.${cls}> ${pseudo}`);
          }
        }
      }
      ancestor = ancestor.parentElement;
      depth++;
    }

    return results;
  }

  // ==================== 图片搜索 ====================
  function findImages(el) {
    const images = [];
    const seen = new Set();

    function addImg(url, source, width, height) {
      if (!url || seen.has(url)) return;
      seen.add(url);
      images.push({ url, source, width: Math.round(width), height: Math.round(height) });
    }

    // (A) 如果自身就是 <img>
    if (el.tagName === 'IMG' && el.src) {
      const r = el.getBoundingClientRect();
      addImg(el.src, '当前元素 <img>', r.width, r.height);
    }

    // (B) 自身 background-image 中的 url()
    const csBg = window.getComputedStyle(el).backgroundImage;
    if (csBg && csBg !== 'none') {
      const urlMatch = csBg.match(/url\(["']?(.*?)["']?\)/);
      if (urlMatch) {
        const r = el.getBoundingClientRect();
        addImg(urlMatch[1], '当前元素 background-image', r.width, r.height);
      }
    }

    // (C) 搜索子元素中所有的 <img>, <video poster>, <canvas>, background-image
    const allImgs = el.querySelectorAll('img');
    for (const img of allImgs) {
      if (img.src) {
        const r = img.getBoundingClientRect();
        const tag = img.closest('[class]');
        const cls = tag?.className?.toString().split(/\s+/).filter(c => !c.startsWith('si-'))[0] || '';
        addImg(img.src, `子元素 <img${cls ? ' .' + cls : ''}>`, r.width, r.height);
      }
    }

    // <video> 的 poster 和 src
    const allVideos = el.querySelectorAll('video');
    for (const v of allVideos) {
      if (v.poster) addImg(v.poster, '子元素 <video poster>', v.clientWidth, v.clientHeight);
      const src = v.src || v.querySelector('source')?.src;
      if (src) addImg(src, '子元素 <video src>', v.clientWidth, v.clientHeight);
    }

    // <canvas> — 导出为 dataURL
    const allCanvas = el.querySelectorAll('canvas');
    for (const c of allCanvas) {
      try {
        const dataUrl = c.toDataURL('image/png');
        if (dataUrl && dataUrl.length > 100) {
          addImg(dataUrl, '子元素 <canvas>', c.width, c.height);
        }
      } catch (e) { /* tainted canvas */ }
    }

    // 子元素的 background-image url()
    const allChildren = el.querySelectorAll('*');
    for (const child of allChildren) {
      if (child.id === 'style-inspector-ui') continue;
      const bg = window.getComputedStyle(child).backgroundImage;
      if (bg && bg !== 'none') {
        const m = bg.match(/url\(["']?(.*?)["']?\)/);
        if (m && !m[1].startsWith('data:image/svg')) {
          const r = child.getBoundingClientRect();
          const cls = child.className?.toString().split(/\s+/).filter(c => !c.startsWith('si-'))[0] || '';
          addImg(m[1], `子元素 background-image (.${cls})`, r.width, r.height);
        }
      }
    }

    return images;
  }

  // ==================== SVG 图标搜索 ====================
  function findSvgs(el) {
    const svgs = [];
    const seen = new Set();

    function addSvg(svgEl, source) {
      if (seen.has(svgEl)) return;
      seen.add(svgEl);

      // 克隆并清理 SVG
      const clone = svgEl.cloneNode(true);

      // 确保有 xmlns
      if (!clone.getAttribute('xmlns')) {
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      }

      // 获取尺寸
      const rect = svgEl.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);

      // 如果没有 viewBox，用实际尺寸补上
      if (!clone.getAttribute('viewBox')) {
        const vbW = svgEl.getAttribute('width') || w;
        const vbH = svgEl.getAttribute('height') || h;
        clone.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);
      }

      // 确保有宽高属性
      if (!clone.getAttribute('width')) clone.setAttribute('width', w);
      if (!clone.getAttribute('height')) clone.setAttribute('height', h);

      // 解析 currentColor — 取 SVG 父元素的实际颜色替换
      const parentColor = window.getComputedStyle(svgEl.parentElement || svgEl).color;
      const svgStr = clone.outerHTML.replace(/currentColor/g, parentColor);

      // 生成文件名
      let name = 'icon';
      const cls = svgEl.className?.baseVal?.split(/\s+/).filter(c => c && !c.startsWith('si-'))[0];
      const parentCls = svgEl.parentElement?.className?.toString().split(/\s+/).filter(c => c && !c.startsWith('si-'))[0];
      if (cls) name = cls;
      else if (parentCls) name = parentCls;
      else if (svgEl.getAttribute('aria-label')) name = svgEl.getAttribute('aria-label');

      svgs.push({
        html: `<?xml version="1.0" encoding="UTF-8"?>\n${svgStr}`,
        source,
        name: name.replace(/[^a-zA-Z0-9_\u4e00-\u9fff-]/g, '_'),
        width: w,
        height: h,
        previewHtml: svgStr,
      });
    }

    // (A) 自身是 SVG
    if (el.tagName === 'svg' || el instanceof SVGSVGElement) {
      addSvg(el, '当前元素');
    }

    // (B) 自身在 SVG 内部（如点击了 path），向上找到最近的 <svg>
    const closestSvg = el.closest?.('svg');
    if (closestSvg) {
      addSvg(closestSvg, '当前元素所在 SVG');
    }

    // (C) 自身是 <el-icon> 或类似包裹，里面有 SVG
    const childSvgs = el.querySelectorAll?.('svg') || [];
    for (const s of childSvgs) {
      const r = s.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue; // 跳过不可见的
      const parent = s.parentElement;
      const parentTag = parent?.tagName?.toLowerCase() || '';
      const parentCls = parent?.className?.toString().split(/\s+/)[0] || '';
      addSvg(s, `子元素 <svg> (${parentTag}${parentCls ? '.' + parentCls : ''})`);
    }

    // (D) <img src="...svg"> — 提供 URL 而非内联内容
    const imgSvgs = [];
    const checkImg = (img, src) => {
      if (src && src.endsWith('.svg')) {
        const r = img.getBoundingClientRect();
        imgSvgs.push({
          url: src,
          source: '图片引用 <img>',
          name: src.split('/').pop().replace('.svg', ''),
          width: Math.round(r.width),
          height: Math.round(r.height),
        });
      }
    };
    if (el.tagName === 'IMG') checkImg(el, el.src);
    const allImgEls = el.querySelectorAll?.('img') || [];
    for (const img of allImgEls) checkImg(img, img.src);

    return { inline: svgs, linked: imgSvgs };
  }

  // ==================== 提取完整样式 ====================
  function extractStyles(el) {
    const cs = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      el,
      // 尺寸
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      // 图片
      images: findImages(el),
      svgs: findSvgs(el),
      // 文字颜色
      textColor: parseColor(cs.color),
      // 背景色（深度搜索）
      backgrounds: findAllBackgrounds(el),
      // 边框
      borderWidth: cs.borderTopWidth,
      borderStyle: cs.borderTopStyle,
      borderColor: parseColor(cs.borderTopColor),
      borderRadius: cs.borderRadius,
      // 字体
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
      textAlign: cs.textAlign,
      // 间距
      padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
      margin: `${cs.marginTop} ${cs.marginRight} ${cs.marginBottom} ${cs.marginLeft}`,
      gap: cs.gap !== 'normal' ? cs.gap : null,
      // 效果
      opacity: cs.opacity !== '1' ? cs.opacity : null,
      boxShadow: cs.boxShadow !== 'none' ? cs.boxShadow : null,
      textShadow: cs.textShadow !== 'none' ? cs.textShadow : null,
      backdropFilter: (cs.backdropFilter && cs.backdropFilter !== 'none') ? cs.backdropFilter : null,
      filter: (cs.filter && cs.filter !== 'none') ? cs.filter : null,
      // 布局
      display: cs.display,
      position: cs.position !== 'static' ? cs.position : null,
      flexDirection: cs.display.includes('flex') ? cs.flexDirection : null,
      alignItems: cs.display.includes('flex') ? cs.alignItems : null,
      justifyContent: cs.display.includes('flex') ? cs.justifyContent : null,
    };
  }

  // ==================== 复制数据存储 ====================
  // 用 data-copy-id 索引，避免 inline onclick 的引号转义问题
  const copyStore = {};
  let copyId = 0;
  function storeCopy(text) {
    const id = 'c' + (copyId++);
    copyStore[id] = text;
    return id;
  }

  // SVG 图标
  const ICON_COPY = `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5" stroke="currentColor" stroke-width="1.5"/></svg>`;
  const ICON_CHECK = `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  function copyBtn(text) {
    const id = storeCopy(text);
    return `<button class="si-copy" data-copy-id="${id}">${ICON_COPY}</button>`;
  }

  // ==================== 渲染 HTML ====================
  function colorBlock(c, source) {
    if (!c) return '';
    const alphaPercent = Math.round(c.a * 100);
    const hasAlpha = c.a < 1;
    const copyVal = hasAlpha ? `${c.hex}, Alpha ${alphaPercent}%` : c.hex;
    return `
      <div class="si-color-block">
        <div class="si-color-preview" style="background:${c.rgba}"></div>
        <div class="si-color-info">
          <div class="si-color-main">
            <span class="si-hex">${c.hex}</span>
            ${hasAlpha ? `<span class="si-alpha">Alpha ${alphaPercent}%</span>` : '<span class="si-alpha-full">Alpha 100%</span>'}
            ${copyBtn(copyVal)}
          </div>
          <div class="si-color-meta">
            <span class="si-rgba">${c.rgba}</span>
            <span class="si-source">${source}</span>
          </div>
        </div>
      </div>`;
  }

  function gradientBlock(gradient, source) {
    return `
      <div class="si-color-block">
        <div class="si-color-preview" style="background:${gradient}"></div>
        <div class="si-color-info">
          <div class="si-color-main">
            <span class="si-hex" style="font-size:10px">${gradient.substring(0, 60)}...</span>
            ${copyBtn(gradient)}
          </div>
          <div class="si-color-meta"><span class="si-source">${source}</span></div>
        </div>
      </div>`;
  }

  function propRow(label, value) {
    if (value == null) return '';
    return `<div class="si-row">
      <span class="si-label">${label}</span>
      <span class="si-value"><span>${value}</span>${copyBtn(String(value))}</span>
    </div>`;
  }

  function renderPanel(data) {
    const result = document.getElementById('si-result');
    let h = '';

    // ---- SVG 图标（最显眼位置） ----
    const hasSvg = data.svgs && (data.svgs.inline.length > 0 || data.svgs.linked.length > 0);
    if (hasSvg) {
      h += `<div class="si-section-title si-svg-title">SVG 图标</div>`;

      // inline SVG
      for (const svg of data.svgs.inline) {
        const dlId = storeCopy(svg.html);
        h += `
          <div class="si-svg-block">
            <div class="si-svg-preview">${svg.previewHtml}</div>
            <div class="si-svg-info">
              <div class="si-svg-name">${svg.name}.svg</div>
              <div class="si-svg-size">${svg.width} × ${svg.height}px</div>
              <div class="si-svg-source">${svg.source}</div>
              <div class="si-svg-actions">
                <button class="si-svg-dl" data-dl-id="${dlId}" data-dl-name="${svg.name}.svg">下载 SVG</button>
                ${copyBtn(svg.html)}
              </div>
            </div>
          </div>`;
      }

      // linked SVG (img src)
      for (const svg of data.svgs.linked) {
        h += `
          <div class="si-svg-block">
            <div class="si-svg-preview">
              <img src="${svg.url}" style="width:100%;height:100%;object-fit:contain;" />
            </div>
            <div class="si-svg-info">
              <div class="si-svg-name">${svg.name}.svg</div>
              <div class="si-svg-size">${svg.width} × ${svg.height}px</div>
              <div class="si-svg-source">${svg.source}</div>
              <div class="si-svg-actions">
                <a class="si-svg-dl" href="${svg.url}" download="${svg.name}.svg">下载 SVG</a>
                ${copyBtn(svg.url)}
              </div>
            </div>
          </div>`;
      }
    }

    // ---- 图片 ----
    if (data.images && data.images.length > 0) {
      h += `<div class="si-section-title si-highlight-title">图片资源</div>`;
      for (const img of data.images) {
        const isDataUrl = img.url.startsWith('data:');
        const shortUrl = isDataUrl ? '[canvas 导出 dataURL]' : img.url;
        const displayUrl = shortUrl.length > 80 ? shortUrl.substring(0, 80) + '...' : shortUrl;
        h += `
          <div class="si-img-block">
            <div class="si-img-preview-wrap">
              <img class="si-img-preview" src="${img.url}" alt="preview" />
            </div>
            <div class="si-img-info">
              <div class="si-img-size">${img.width} × ${img.height}px</div>
              <div class="si-img-url" title="${shortUrl}">${displayUrl}</div>
              <div class="si-img-source">${img.source}</div>
              <div class="si-img-actions">
                ${copyBtn(img.url)}
                <a class="si-img-open" href="${img.url}" target="_blank" rel="noopener">新标签打开</a>
              </div>
            </div>
          </div>`;
      }
    }

    // ---- 尺寸 ----
    h += `<div class="si-section-title">尺寸</div>`;
    h += propRow('宽度', data.width + 'px');
    h += propRow('高度', data.height + 'px');

    // ---- 背景色 ----
    h += `<div class="si-section-title si-highlight-title">背景色（全部找到的）</div>`;
    if (data.backgrounds.length === 0) {
      h += `<div class="si-empty">未检测到背景色（当前元素及其子/父元素均为透明）</div>`;
    } else {
      for (const bg of data.backgrounds) {
        if (bg.color) h += colorBlock(bg.color, bg.source);
        else if (bg.gradient) h += gradientBlock(bg.gradient, bg.source);
      }
    }

    // ---- 文字颜色 ----
    h += `<div class="si-section-title">文字颜色</div>`;
    if (data.textColor) {
      h += colorBlock(data.textColor, '当前元素');
    } else {
      h += `<div class="si-empty">无</div>`;
    }

    // ---- 边框 ----
    if ((data.borderWidth && data.borderWidth !== '0px') || (data.borderRadius && data.borderRadius !== '0px')) {
      h += `<div class="si-section-title">边框</div>`;
      if (data.borderWidth && data.borderWidth !== '0px') {
        h += propRow('边框宽度', data.borderWidth);
        h += propRow('边框样式', data.borderStyle);
        if (data.borderColor) h += colorBlock(data.borderColor, '边框颜色');
      }
      if (data.borderRadius && data.borderRadius !== '0px') {
        h += propRow('圆角', data.borderRadius);
      }
    }

    // ---- 字体 ----
    h += `<div class="si-section-title">字体</div>`;
    h += propRow('字体族', data.fontFamily);
    h += propRow('字号', data.fontSize);
    h += propRow('字重', data.fontWeight);
    h += propRow('行高', data.lineHeight);
    h += propRow('字间距', data.letterSpacing);
    h += propRow('对齐', data.textAlign);

    // ---- 间距 ----
    h += `<div class="si-section-title">间距</div>`;
    h += propRow('内边距 (padding)', data.padding);
    h += propRow('外边距 (margin)', data.margin);
    if (data.gap) h += propRow('间隙 (gap)', data.gap);

    // ---- 效果 ----
    if (data.opacity || data.boxShadow || data.textShadow || data.backdropFilter || data.filter) {
      h += `<div class="si-section-title">效果</div>`;
      if (data.opacity) h += propRow('不透明度', data.opacity);
      if (data.boxShadow) h += propRow('盒阴影', data.boxShadow);
      if (data.textShadow) h += propRow('文字阴影', data.textShadow);
      if (data.backdropFilter) h += propRow('背景模糊', data.backdropFilter);
      if (data.filter) h += propRow('滤镜', data.filter);
    }

    // ---- 布局 ----
    h += `<div class="si-section-title">布局</div>`;
    h += propRow('显示模式', data.display);
    if (data.position) h += propRow('定位方式', data.position);
    if (data.flexDirection) h += propRow('Flex 方向', data.flexDirection);
    if (data.alignItems) h += propRow('对齐(纵)', data.alignItems);
    if (data.justifyContent) h += propRow('对齐(横)', data.justifyContent);

    result.innerHTML = h;
  }

  // ==================== 纯文本（用于复制全部） ====================
  function toText(data) {
    let t = `=== 样式拾取 ===\n`;
    t += `尺寸: ${data.width}px × ${data.height}px\n\n`;

    if (data.images && data.images.length > 0) {
      t += `-- 图片资源 --\n`;
      for (const img of data.images) {
        const isDataUrl = img.url.startsWith('data:');
        t += `${img.source}: ${img.width}×${img.height}px\n`;
        t += `  URL: ${isDataUrl ? '[dataURL]' : img.url}\n`;
      }
      t += '\n';
    }

    t += `-- 背景色 --\n`;
    if (data.backgrounds.length === 0) {
      t += `(未检测到)\n`;
    } else {
      for (const bg of data.backgrounds) {
        if (bg.color) {
          const c = bg.color;
          const alpha = c.a < 1 ? `  Alpha: ${Math.round(c.a * 100)}%` : '';
          t += `${bg.source}: ${c.hex}${alpha}  (${c.rgba})\n`;
        } else if (bg.gradient) {
          t += `${bg.source}: ${bg.gradient}\n`;
        }
      }
    }
    t += '\n';

    if (data.textColor) {
      const c = data.textColor;
      const alpha = c.a < 1 ? `  Alpha: ${Math.round(c.a * 100)}%` : '';
      t += `文字颜色: ${c.hex}${alpha}  (${c.rgba})\n\n`;
    }

    if (data.borderColor) {
      const c = data.borderColor;
      const alpha = c.a < 1 ? `  Alpha: ${Math.round(c.a * 100)}%` : '';
      t += `-- 边框 --\n`;
      t += `宽度: ${data.borderWidth}\n`;
      t += `颜色: ${c.hex}${alpha}  (${c.rgba})\n`;
      t += `圆角: ${data.borderRadius}\n\n`;
    } else if (data.borderRadius && data.borderRadius !== '0px') {
      t += `圆角: ${data.borderRadius}\n\n`;
    }

    t += `-- 字体 --\n`;
    t += `字体族: ${data.fontFamily}\n`;
    t += `字号: ${data.fontSize}\n`;
    t += `字重: ${data.fontWeight}\n`;
    t += `行高: ${data.lineHeight}\n`;
    t += `对齐: ${data.textAlign}\n\n`;

    t += `-- 间距 --\n`;
    t += `内边距: ${data.padding}\n`;
    t += `外边距: ${data.margin}\n`;
    if (data.gap) t += `间隙: ${data.gap}\n`;
    t += '\n';

    if (data.boxShadow) t += `盒阴影: ${data.boxShadow}\n`;
    if (data.opacity) t += `不透明度: ${data.opacity}\n`;
    if (data.backdropFilter) t += `背景模糊: ${data.backdropFilter}\n`;

    return t;
  }

  // ==================== UI ====================
  const panel = document.createElement('div');
  panel.id = 'style-inspector-ui';
  panel.innerHTML = `
    <style>
      #style-inspector-ui {
        position: fixed; top: 12px; right: 12px; z-index: 999999;
        background: #14141f; border: 1px solid rgba(255,255,255,0.1);
        border-radius: 14px; padding: 0; width: 390px; max-height: 88vh;
        display: flex; flex-direction: column;
        font-family: system-ui, -apple-system, "Microsoft YaHei", sans-serif;
        font-size: 12px; color: #d0d0e0;
        box-shadow: 0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04);
        user-select: none; cursor: default;
        backdrop-filter: blur(20px);
      }
      /* 头部 */
      #si-header {
        display: flex; justify-content: space-between; align-items: center;
        padding: 12px 16px; cursor: move;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        background: rgba(255,255,255,0.02); border-radius: 14px 14px 0 0;
      }
      #si-header h3 {
        margin: 0; font-size: 14px; color: #fff; font-weight: 600;
        letter-spacing: 0.5px;
      }
      #si-btns { display: flex; gap: 6px; }
      #si-btns button {
        padding: 5px 14px; border: none;
        border-radius: 8px; background: #2a2a40; color: #b0b0c8;
        cursor: pointer; font-size: 12px; font-family: inherit;
        font-weight: 500; transition: all 0.15s; letter-spacing: 0.3px;
      }
      #si-btns button:hover { background: #3a3a58; color: #e0e0f0; transform: translateY(-1px); }
      #si-btns button:active { transform: translateY(0); }
      #si-btns button.on {
        background: linear-gradient(135deg, #4a6cf7, #6366f1);
        color: #fff; box-shadow: 0 2px 10px rgba(74,108,247,0.35);
      }
      #si-btns .x {
        background: #2a2a40; color: #888;
        padding: 5px 10px; font-size: 14px; line-height: 1;
      }
      #si-btns .x:hover { background: #c0392b; color: #fff; }
      /* 元素路径 */
      #si-path {
        padding: 6px 16px; font-size: 10px; color: #6a6a90;
        font-family: "SF Mono", Consolas, monospace;
        word-break: break-all; border-bottom: 1px solid rgba(255,255,255,0.04);
        background: rgba(0,0,0,0.15);
      }
      /* 内容区 */
      #si-result {
        flex: 1; overflow-y: auto; padding: 10px 14px 16px;
        user-select: text; cursor: text;
      }
      #si-result::-webkit-scrollbar { width: 5px; }
      #si-result::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      /* 分区标题 */
      .si-section-title {
        color: #7aa2f7; font-weight: 600; font-size: 11px;
        margin: 14px 0 6px; padding: 4px 8px;
        border-radius: 4px; background: rgba(74,108,247,0.08);
        text-transform: uppercase; letter-spacing: 1px;
      }
      .si-section-title:first-child { margin-top: 2px; }
      .si-highlight-title {
        color: #ff9e64; font-size: 12px;
        background: rgba(255,158,100,0.1);
      }
      .si-empty { color: #555; font-size: 11px; padding: 6px 0; }
      /* 颜色块 —— 大色块 + 详细信息 */
      .si-color-block {
        display: flex; gap: 12px; align-items: center;
        padding: 8px; margin: 4px 0;
        border-radius: 8px; background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.04);
        transition: background 0.1s;
      }
      .si-color-block:hover { background: rgba(255,255,255,0.04); }
      .si-color-preview {
        width: 52px; height: 52px; border-radius: 10px; flex-shrink: 0;
        border: 1px solid rgba(255,255,255,0.12);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative; overflow: hidden;
        /* checkerboard */
        background-image:
          linear-gradient(45deg,#2a2a2a 25%,transparent 25%),
          linear-gradient(-45deg,#2a2a2a 25%,transparent 25%),
          linear-gradient(45deg,transparent 75%,#2a2a2a 75%),
          linear-gradient(-45deg,transparent 75%,#2a2a2a 75%);
        background-size: 8px 8px;
        background-position: 0 0, 0 4px, 4px -4px, -4px 0;
      }
      .si-color-info { flex: 1; min-width: 0; }
      .si-color-main { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
      .si-hex {
        color: #9ece6a; font-weight: 700; font-size: 14px;
        font-family: "SF Mono", Consolas, monospace;
      }
      .si-alpha {
        color: #ff9e64; font-weight: 600; font-size: 12px;
        background: rgba(255,158,100,0.12); padding: 1px 6px;
        border-radius: 4px;
      }
      .si-alpha-full { color: #555; font-size: 11px; }
      .si-color-meta { margin-top: 3px; }
      .si-rgba {
        color: #555; font-size: 10px;
        font-family: "SF Mono", Consolas, monospace; display: block;
      }
      .si-source {
        color: #4a6cf7; font-size: 10px; display: inline-block;
        margin-top: 2px; background: rgba(74,108,247,0.08);
        padding: 1px 5px; border-radius: 3px;
      }
      /* 属性行 */
      .si-row {
        display: flex; justify-content: space-between; align-items: center;
        padding: 5px 8px; margin: 1px 0;
        border-radius: 4px;
      }
      .si-row:hover { background: rgba(255,255,255,0.02); }
      .si-label { color: #888; font-size: 12px; }
      .si-value {
        color: #c0caf5; font-weight: 500;
        font-family: "SF Mono", Consolas, monospace;
        font-size: 11.5px;
        display: flex; align-items: center; gap: 4px;
      }
      /* 复制按钮 */
      .si-copy {
        display: inline-flex; align-items: center; justify-content: center;
        width: 24px; height: 24px;
        background: transparent; border: none; border-radius: 6px;
        color: #555; cursor: pointer; margin-left: 4px;
        transition: all 0.15s; flex-shrink: 0;
      }
      .si-copy:hover { background: rgba(74,108,247,0.15); color: #7aa2f7; }
      .si-copy:active { transform: scale(0.9); }
      .si-copy.copied { color: #9ece6a; }
      .si-copy svg { pointer-events: none; }
      /* 图片块 */
      .si-img-block {
        display: flex; gap: 10px; align-items: flex-start;
        padding: 8px; margin: 4px 0;
        border-radius: 8px; background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.04);
      }
      .si-img-block:hover { background: rgba(255,255,255,0.04); }
      .si-img-preview-wrap {
        width: 64px; height: 64px; border-radius: 8px; flex-shrink: 0;
        overflow: hidden; background: #111;
        border: 1px solid rgba(255,255,255,0.1);
      }
      .si-img-preview {
        width: 100%; height: 100%; object-fit: cover;
      }
      .si-img-info { flex: 1; min-width: 0; }
      .si-img-size {
        font-size: 11px; color: #9ece6a; font-weight: 600;
        font-family: "SF Mono", Consolas, monospace;
      }
      .si-img-url {
        font-size: 10px; color: #888;
        font-family: "SF Mono", Consolas, monospace;
        word-break: break-all; margin-top: 2px;
        line-height: 1.4;
      }
      .si-img-source {
        font-size: 10px; color: #4a6cf7; margin-top: 2px;
        background: rgba(74,108,247,0.08);
        display: inline-block; padding: 1px 5px; border-radius: 3px;
      }
      .si-img-actions {
        display: flex; align-items: center; gap: 6px; margin-top: 4px;
      }
      .si-img-open {
        font-size: 10px; color: #7aa2f7; text-decoration: none;
        border: 1px solid rgba(74,108,247,0.2);
        padding: 2px 8px; border-radius: 4px;
        transition: all 0.15s;
      }
      .si-img-open:hover {
        background: rgba(74,108,247,0.15); border-color: #4a6cf7;
      }
      /* SVG 图标块 */
      .si-svg-title {
        color: #bb9af7; background: rgba(187,154,247,0.1);
      }
      .si-svg-block {
        display: flex; gap: 12px; align-items: center;
        padding: 8px; margin: 4px 0; border-radius: 8px;
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.04);
      }
      .si-svg-block:hover { background: rgba(255,255,255,0.04); }
      .si-svg-preview {
        width: 52px; height: 52px; border-radius: 8px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        background: #1e1e2e; border: 1px solid rgba(255,255,255,0.08);
        overflow: hidden; padding: 6px;
      }
      .si-svg-preview svg {
        width: 100% !important; height: 100% !important;
        max-width: 40px; max-height: 40px;
      }
      .si-svg-preview img { max-width: 40px; max-height: 40px; }
      .si-svg-info { flex: 1; min-width: 0; }
      .si-svg-name {
        font-size: 12px; color: #bb9af7; font-weight: 600;
        font-family: "SF Mono", Consolas, monospace;
      }
      .si-svg-size {
        font-size: 10px; color: #9ece6a;
        font-family: "SF Mono", Consolas, monospace; margin-top: 1px;
      }
      .si-svg-source {
        font-size: 10px; color: #4a6cf7;
        display: inline-block; margin-top: 2px;
        background: rgba(74,108,247,0.08);
        padding: 1px 5px; border-radius: 3px;
      }
      .si-svg-actions {
        display: flex; align-items: center; gap: 6px; margin-top: 5px;
      }
      .si-svg-dl {
        font-size: 11px; color: #bb9af7; text-decoration: none;
        border: 1px solid rgba(187,154,247,0.25);
        padding: 3px 10px; border-radius: 5px; cursor: pointer;
        background: rgba(187,154,247,0.08); font-family: inherit;
        transition: all 0.15s;
      }
      .si-svg-dl:hover {
        background: rgba(187,154,247,0.2); border-color: #bb9af7;
      }
      /* 高亮 */
      .si-pick-highlight {
        outline: 2px solid #4a6cf7 !important;
        outline-offset: 1px !important;
      }
    </style>
    <div id="si-header">
      <h3>样式拾取器</h3>
      <div id="si-btns">
        <button id="si-pick">拾取</button>
        <button id="si-copy-all">全部复制</button>
        <button class="x" id="si-close">关闭</button>
      </div>
    </div>
    <div id="si-path"></div>
    <div id="si-result">
      <div style="color:#555;text-align:center;padding:40px 0;">
        点击「拾取」按钮，然后点击页面上任意元素查看样式
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  // ==================== 拖拽 ====================
  let dragging = false, dx, dy;
  document.getElementById('si-header').addEventListener('mousedown', (e) => {
    dragging = true;
    dx = e.clientX - panel.offsetLeft;
    dy = e.clientY - panel.offsetTop;
  });
  const onDragMove = (e) => {
    if (!dragging) return;
    panel.style.left = (e.clientX - dx) + 'px';
    panel.style.right = 'auto';
    panel.style.top = (e.clientY - dy) + 'px';
  };
  const onDragEnd = () => { dragging = false; };
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragEnd);

  // ==================== 拾取逻辑 ====================
  let picking = false, highlighted = null, lastData = null;

  const onMove = (e) => {
    if (!picking || panel.contains(e.target)) return;
    if (highlighted) highlighted.classList.remove('si-pick-highlight');
    highlighted = e.target;
    highlighted.classList.add('si-pick-highlight');
  };

  const onClick = (e) => {
    if (!picking || panel.contains(e.target)) return;
    e.preventDefault();
    e.stopPropagation();

    if (highlighted) highlighted.classList.remove('si-pick-highlight');
    const target = e.target;

    lastData = extractStyles(target);
    renderPanel(lastData);

    const pathEl = document.getElementById('si-path');
    if (pathEl) {
      const tag = target.tagName.toLowerCase();
      const cls = target.className?.toString().split(/\s+/).filter(c => !c.startsWith('si-')).slice(0, 3).join('.') || '';
      const id = target.id ? `#${target.id}` : '';
      pathEl.textContent = `<${tag}${id}${cls ? '.' + cls : ''}>`;
    }

    console.log('%c[样式拾取]', 'color:#ff9e64;font-weight:bold', target);
    console.log(toText(lastData));
  };

  // ==================== SVG 下载 + 复制按钮事件委托 ====================
  document.getElementById('si-result').addEventListener('click', (e) => {
    // SVG 下载按钮
    const dlBtn = e.target.closest('.si-svg-dl');
    if (dlBtn && dlBtn.dataset.dlId) {
      const svgContent = copyStore[dlBtn.dataset.dlId];
      const fileName = dlBtn.dataset.dlName || 'icon.svg';
      if (svgContent) {
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        dlBtn.textContent = '已下载!';
        setTimeout(() => { dlBtn.textContent = '下载 SVG'; }, 1500);
      }
      return;
    }

    // 复制按钮
    const btn = e.target.closest('.si-copy');
    if (!btn) return;
    const id = btn.dataset.copyId;
    const text = copyStore[id];
    if (!text) return;

    const showSuccess = () => {
      btn.innerHTML = ICON_CHECK;
      btn.classList.add('copied');
      setTimeout(() => { btn.innerHTML = ICON_COPY; btn.classList.remove('copied'); }, 1500);
    };

    navigator.clipboard.writeText(text).then(showSuccess).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      showSuccess();
    });
  });

  document.getElementById('si-pick').addEventListener('click', () => {
    picking = !picking;
    const btn = document.getElementById('si-pick');
    btn.classList.toggle('on', picking);
    btn.textContent = picking ? '拾取中...' : '拾取';
    if (picking) {
      document.addEventListener('mousemove', onMove, true);
      document.addEventListener('click', onClick, true);
    } else {
      document.removeEventListener('mousemove', onMove, true);
      document.removeEventListener('click', onClick, true);
      if (highlighted) { highlighted.classList.remove('si-pick-highlight'); highlighted = null; }
    }
  });

  document.getElementById('si-copy-all').addEventListener('click', () => {
    if (!lastData) return;
    navigator.clipboard.writeText(toText(lastData)).then(() => {
      const btn = document.getElementById('si-copy-all');
      btn.textContent = '已复制!';
      setTimeout(() => { btn.textContent = '全部复制'; }, 1200);
    });
  });

  document.getElementById('si-close').addEventListener('click', () => {
    cleanup();
  });

  // ==================== 全局清理函数（供下次加载时调用） ====================
  function cleanup() {
    document.removeEventListener('mousemove', onMove, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    if (highlighted) { highlighted.classList.remove('si-pick-highlight'); highlighted = null; }
    if (panel.parentNode) panel.remove();
    picking = false;
  }
  // 挂到 window 上，下次重新加载脚本时会先调用这个清理旧版本
  window.__si_cleanup = cleanup;

  console.log('✅ 样式拾取器已加载');
})();
