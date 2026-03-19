'use client'

import { useEffect, useRef } from 'react'
import { serializeClap } from '@aitube/clap'
import { useTimeline } from '@aitube/timeline'

import { saveAutoSaveBlob } from '@/lib/utils/autoSaveDb'

/** Auto-save interval: every 3 minutes */
const AUTO_SAVE_INTERVAL_MS = 3 * 60 * 1000

/**
 * Silently saves the current project to IndexedDB at a fixed interval.
 *
 * - Does nothing if the project is empty (no segments).
 * - Will not start a new save if one is already in progress.
 * - Uses IndexedDB so no browser download dialog appears.
 * - Call `loadAutoSaveRecord()` from autoSaveDb.ts to restore the last save.
 *
 * Note: `serializeClap` gzips the payload on the main thread, which may
 * cause a brief UI pause for very large projects. This is a known limitation
 * of the current serialization design.
 */
export function useAutoSave(): void {
  const isSavingRef = useRef(false)

  useEffect(() => {
    const runAutoSave = async () => {
      if (isSavingRef.current) return

      const { getClap, segments, title } = useTimeline.getState()

      // Nothing loaded yet — skip
      if (!segments || segments.length === 0) return

      isSavingRef.current = true
      try {
        const clap = await getClap()
        if (!clap) return

        const blob = await serializeClap(clap)
        const projectTitle = title || clap.meta.title || 'untitled'
        await saveAutoSaveBlob(blob, projectTitle, segments.length)

        console.log(
          `[AutoSave] Saved ${(blob.size / 1024 / 1024).toFixed(1)} MB` +
          ` (${segments.length} segments) at ${new Date().toLocaleTimeString()}`
        )
      } catch (err) {
        console.error('[AutoSave] Failed:', err)
      } finally {
        isSavingRef.current = false
      }
    }

    const interval = setInterval(runAutoSave, AUTO_SAVE_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [])
}
