import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(_req: NextRequest) {
  // Depuis Next 15, `cookies()` est asynchrone en dev ⇒ il faut l'await
  const cookieStore = await cookies();
  const existing = await cookieStore.get('device_id');

  if (existing?.value) {
    return NextResponse.json({ deviceId: existing.value });
  }

  // S'assurer qu'il existe au moins une zone "par défaut"
  let defaultZone = await prisma.zone.findFirst({
    where: { nom: 'Zone par défaut' },
  });

  if (!defaultZone) {
    defaultZone = await prisma.zone.create({
      data: { nom: 'Zone par défaut' },
    });
  }

  const appareil = await prisma.apareil.create({
    data: {
      nom: 'Appareil ' + new Date().toISOString(),
      zone: {
        connect: { id: defaultZone.id },
      },
    },
  });

  // Cookie persistant pour identifier l'appareil
  await cookieStore.set({
    name: 'device_id',
    value: appareil.id.toString(),
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    // ~20 ans
    maxAge: 60 * 60 * 24 * 365 * 20,
  });

  return NextResponse.json({ deviceId: appareil.id });
}


