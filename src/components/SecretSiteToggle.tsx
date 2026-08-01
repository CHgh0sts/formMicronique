'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

const TAP_COUNT = 5
const TAP_WINDOW_MS = 2500
const CONFIRM_COUNT = 3
const CONFIRM_WINDOW_MS = 3000

/**
 * Kill-switch invisible (tablette-safe, sans long-press) :
 * 5 taps rapides, puis 3 taps de confirmation sur la zone
 * (logo [data-secret-toggle] ou zone fixe en haut).
 */
export default function SecretSiteToggle() {
  const tapsRef = useRef<number[]>([])
  const confirmTapsRef = useRef<number[]>([])
  const armUntilRef = useRef(0)
  const busyRef = useRef(false)

  useEffect(() => {
    const isTarget = (el: EventTarget | null) => {
      if (!(el instanceof Element)) return false
      return Boolean(el.closest('[data-secret-toggle]'))
    }

    const runToggle = async () => {
      if (busyRef.current) return
      busyRef.current = true
      tapsRef.current = []
      confirmTapsRef.current = []
      armUntilRef.current = 0

      try {
        const res = await fetch('/api/site-status', { method: 'POST' })
        if (res.ok) {
          try {
            navigator.vibrate?.(30)
          } catch {
            /* ignore */
          }
          toast('OK', { duration: 800 })
          window.location.reload()
        }
      } catch {
        /* silencieux */
      } finally {
        busyRef.current = false
      }
    }

    const onPointerDown = (e: PointerEvent) => {
      if (!isTarget(e.target)) return
      // Bloque la sélection / callout natif
      e.preventDefault()

      const now = Date.now()

      // Phase confirmation (après armement)
      if (now < armUntilRef.current) {
        confirmTapsRef.current = confirmTapsRef.current.filter(
          (t) => now - t < CONFIRM_WINDOW_MS
        )
        confirmTapsRef.current.push(now)

        if (confirmTapsRef.current.length >= CONFIRM_COUNT) {
          void runToggle()
        }
        return
      }

      // Phase armement : 5 taps rapides
      confirmTapsRef.current = []
      tapsRef.current = tapsRef.current.filter((t) => now - t < TAP_WINDOW_MS)
      tapsRef.current.push(now)

      if (tapsRef.current.length >= TAP_COUNT) {
        tapsRef.current = []
        armUntilRef.current = now + CONFIRM_WINDOW_MS
        try {
          navigator.vibrate?.(10)
        } catch {
          /* ignore */
        }
      }
    }

    const onContextMenu = (e: Event) => {
      if (isTarget(e.target)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    const onSelectStart = (e: Event) => {
      if (isTarget(e.target)) e.preventDefault()
    }

    document.addEventListener('pointerdown', onPointerDown, { passive: false })
    document.addEventListener('contextmenu', onContextMenu, true)
    document.addEventListener('selectstart', onSelectStart, true)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('contextmenu', onContextMenu, true)
      document.removeEventListener('selectstart', onSelectStart, true)
    }
  }, [])

  return (
    <div
      data-secret-toggle
      aria-hidden="true"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[99999] w-10 h-10 opacity-0"
      style={{
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        touchAction: 'manipulation',
      }}
    />
  )
}
