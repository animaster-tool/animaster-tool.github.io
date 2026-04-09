#!/usr/bin/env node
/*
 * sync-anime-system.mjs
 *
 * Run this AFTER rebuilding UIST26_AniMaster/Anime_System with:
 *
 *   cd ../../UIST26_AniMaster/Anime_System
 *   BUILD_FOR_PROJECT_PAGE=1 npm run build
 *
 * It copies the freshly built dist/ into public/anime-system/ (preserving
 * demo-boot.js and demo-workspace.animaster that live there), and injects a
 * <script src="./demo-boot.js"> tag into index.html so the boot shim runs
 * before the main Vue bundle.
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const distSrc = path.resolve(projectRoot, '../../UIST26_AniMaster/Anime_System/dist')
const target = path.resolve(projectRoot, 'public/anime-system')

const PRESERVED = new Set(['demo-boot.js', 'demo-workspace.animaster'])

async function exists(p) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

async function copyRecursive(src, dest) {
  const stat = await fs.stat(src)
  if (stat.isDirectory()) {
    await fs.mkdir(dest, { recursive: true })
    for (const entry of await fs.readdir(src)) {
      await copyRecursive(path.join(src, entry), path.join(dest, entry))
    }
  } else {
    await fs.mkdir(path.dirname(dest), { recursive: true })
    await fs.copyFile(src, dest)
  }
}

async function wipeTargetPreserving() {
  if (!(await exists(target))) {
    await fs.mkdir(target, { recursive: true })
    return
  }
  for (const entry of await fs.readdir(target)) {
    if (PRESERVED.has(entry)) continue
    await fs.rm(path.join(target, entry), { recursive: true, force: true })
  }
}

async function injectBootScript() {
  const indexPath = path.join(target, 'index.html')
  let html = await fs.readFile(indexPath, 'utf8')
  // Remove any previous injection so we stay idempotent.
  html = html.replace(
    /\s*<script src="\.\/demo-boot\.js"><\/script>/g,
    '',
  )
  // Inject BEFORE the main module script so our fetch/XHR patches and
  // localStorage seed run first.
  const needle = /<script type="module" crossorigin src="[^"]+"><\/script>/
  if (!needle.test(html)) {
    throw new Error('Could not find main module script tag in index.html')
  }
  html = html.replace(
    needle,
    (match) => `<script src="./demo-boot.js"></script>\n    ${match}`,
  )
  await fs.writeFile(indexPath, html)
}

async function main() {
  if (!(await exists(distSrc))) {
    console.error('[sync] dist not found at', distSrc)
    console.error(
      '       Did you run `BUILD_FOR_PROJECT_PAGE=1 npm run build` in Anime_System?',
    )
    process.exit(1)
  }
  console.log('[sync] copying', distSrc, '→', target)
  await wipeTargetPreserving()
  for (const entry of await fs.readdir(distSrc)) {
    await copyRecursive(path.join(distSrc, entry), path.join(target, entry))
  }
  console.log('[sync] injecting demo-boot.js into index.html')
  await injectBootScript()
  console.log('[sync] done')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
