'use client'

import { useEffect, useState } from 'react'

function FakeAppError() {
  return (
    <div className="min-h-[100dvh] bg-[#1a1a1a] text-[#ededed] flex items-center justify-center px-6">
      <div className="max-w-lg w-full font-sans">
        <h1 className="text-2xl font-semibold tracking-tight mb-3">
          Application error
        </h1>
        <p className="text-[#a1a1a1] text-sm leading-relaxed mb-4">
          A client-side exception has occurred while loading this application.
          The service is temporarily unavailable.
        </p>
        <p className="text-[#666] text-xs font-mono mb-6">
          ERR_INTERNAL · Digest: 2f8a91c7b04e
        </p>
        <button
          type="button"
          onClick={() => {
            /* volontairement inerte */
          }}
          className="px-4 py-2 text-sm rounded-md border border-[#333] bg-[#111] text-[#ccc] hover:bg-[#1f1f1f] transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

export default function SiteGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'active' | 'inactive'>('loading')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/site-status', { cache: 'no-store' })
        const data = await res.json()
        if (!cancelled) {
          setStatus(data.isActive === false ? 'inactive' : 'active')
        }
      } catch {
        if (!cancelled) setStatus('active')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (status === 'loading') {
    return <div className="min-h-[100dvh] bg-black" />
  }

  if (status === 'inactive') {
    return <FakeAppError />
  }

  return <>{children}</>
}
