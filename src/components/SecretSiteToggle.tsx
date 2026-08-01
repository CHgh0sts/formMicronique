'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

const TAP_COUNT = 5
const TAP_WINDOW_MS = 2500
const HOLD_START_WINDOW_MS = 3000
const HOLD_DURATION_MS = 2500

/**
 * Kill-switch invisible :
 * 5 taps rapides puis maintien ~2.5s sur la zone (logo [data-secret-toggle] ou zone fixe).
 */
export default function SecretSiteToggle() {
  const tapsRef = useRef<number[]>([])
  const armUntilRef = useRef(0)
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const holdingRef = useRef(false)
  const busyRef = useRef(false)

  useEffect(() => {
    const clearHold = () => {
      holdingRef.current = false
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current)
        holdTimerRef.current = null
      }
    }

    const isTarget = (el: EventTarget | null) => {
      if (!(el instanceof Element)) return false
      return Boolean(el.closest('[data-secret-toggle]'))
    }

    const runToggle = async () => {
      if (busyRef.current) return
      busyRef.current = true
      tapsRef.current = []
      armUntilRef.current = 0
      clearHold()

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
      const now = Date.now()

      // Phase hold après armement
      if (now < armUntilRef.current) {
        holdingRef.current = true
        holdTimerRef.current = setTimeout(() => {
          if (holdingRef.current) {
            void runToggle()
          }
        }, HOLD_DURATION_MS)
        return
      }

      // Phase taps
      tapsRef.current = tapsRef.current.filter((t) => now - t < TAP_WINDOW_MS)
      tapsRef.current.push(now)

      if (tapsRef.current.length >= TAP_COUNT) {
        tapsRef.current = []
        armUntilRef.current = now + HOLD_START_WINDOW_MS
        try {
          navigator.vibrate?.(10)
        } catch {
          /* ignore */
        }
      }
    }

    const onPointerUp = () => clearHold()
    const onPointerCancel = () => clearHold()
    const onPointerLeave = (e: PointerEvent) => {
      if (isTarget(e.target)) clearHold()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('pointerup', onPointerUp)
    document.addEventListener('pointercancel', onPointerCancel)
    document.addEventListener('pointerleave', onPointerLeave)

    return () => {
      clearHold()
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('pointerup', onPointerUp)
      document.removeEventListener('pointercancel', onPointerCancel)
      document.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return (
    <div
      data-secret-toggle
      aria-hidden="true"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[99999] w-10 h-10 opacity-0"
      style={{ touchAction: 'manipulation' }}
    />
  )
}
