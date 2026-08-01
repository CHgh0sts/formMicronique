import { prisma } from '@/lib/prisma'

let tableReady: Promise<void> | null = null

async function ensureSiteConfigTable() {
  if (!tableReady) {
    tableReady = (async () => {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "site_config" (
          "id" INTEGER NOT NULL DEFAULT 1,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "site_config_pkey" PRIMARY KEY ("id")
        );
      `)
      await prisma.$executeRawUnsafe(`
        INSERT INTO "site_config" ("id", "isActive", "updatedAt")
        VALUES (1, true, CURRENT_TIMESTAMP)
        ON CONFLICT ("id") DO NOTHING;
      `)
    })().catch((err) => {
      tableReady = null
      throw err
    })
  }
  await tableReady
}

export async function getOrCreateSiteConfig() {
  await ensureSiteConfigTable()
  return prisma.siteConfig.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, isActive: true },
  })
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
  await ensureSiteConfigTable()
  const current = await getOrCreateSiteConfig()
  return prisma.siteConfig.update({
    where: { id: 1 },
    data: { isActive: !current.isActive },
  })
}
