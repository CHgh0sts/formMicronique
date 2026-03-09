import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest) {
  try {
    const appareils = await prisma.apareil.findMany({
      include: {
        zone: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return NextResponse.json(appareils);
  } catch (error) {
    console.error('Erreur lors du chargement des appareils:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des appareils' },
      { status: 500 }
    );
  }
}

