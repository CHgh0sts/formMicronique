import { NextResponse } from 'next/server'
import { getOrCreateSiteConfig, toggleSiteActive } from '@/lib/siteConfig'

export async function GET() {
  try {
    const config = await getOrCreateSiteConfig()
    return NextResponse.json({ isActive: config.isActive })
  } catch (error) {
    console.error('Erreur site-status GET:', error)
    return NextResponse.json({ isActive: true })
  }
}

export async function POST() {
  try {
    const config = await toggleSiteActive()
    return NextResponse.json({ isActive: config.isActive })
  } catch (error) {
    console.error('Erreur site-status POST:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
