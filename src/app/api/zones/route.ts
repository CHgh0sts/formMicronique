import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest) {
  try {
    const zones = await prisma.zone.findMany({
      orderBy: { nom: 'asc' },
    });

    return NextResponse.json(zones);
  } catch (error) {
    console.error('Erreur lors du chargement des zones:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des zones' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nom } = body as { nom?: string };

    if (!nom || nom.trim() === '') {
      return NextResponse.json(
        { error: 'Le nom de la zone est requis' },
        { status: 400 }
      );
    }

    const zone = await prisma.zone.create({
      data: { nom: nom.trim() },
    });

    return NextResponse.json(zone, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la zone:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la zone' },
      { status: 500 }
    );
  }
}

