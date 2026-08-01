import { prisma } from '@/lib/prisma'

export async function getOrCreateSiteConfig() {
  let config = await prisma.siteConfig.findUnique({ where: { id: 1 } })
  if (!config) {
    config = await prisma.siteConfig.create({
      data: { id: 1, isActive: true },
    })
  }
  return config
}

export async function isSiteActive(): Promise<boolean> {
  try {
    const config = await getOrCreateSiteConfig()
    return config.isActive
  } catch {
    // En cas d'erreur DB, on laisse le site accessible
    return true
  }
}

export async function toggleSiteActive() {
  const current = await getOrCreateSiteConfig()
  return prisma.siteConfig.update({
    where: { id: 1 },
    data: { isActive: !current.isActive },
  })
}
