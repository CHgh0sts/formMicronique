import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// GET - Récupérer les questions pour la page d'arrivée
// - Questions globales (zoneId null)
// - + questions de la zone de l'appareil identifié par le cookie device_id
export async function GET(_req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const deviceCookie = await cookieStore.get('device_id');

    let zoneId: number | null = null;

    if (deviceCookie?.value) {
      const appareil = await prisma.apareil.findUnique({
        where: { id: Number(deviceCookie.value) },
      });

      if (appareil?.zoneId) {
        zoneId = appareil.zoneId;
      }
    }

    let questions;

    if (zoneId === null) {
      // Aucun appareil ou aucune zone associée -> seulement questions globales
      questions = await prisma.question.findMany({
        where: {
          active: true,
          zoneId: null,
        },
        orderBy: {
          ordre: 'asc',
        },
      });
    } else {
      // Questions globales + questions de la zone de l'appareil
      questions = await prisma.question.findMany({
        where: {
          active: true,
          OR: [
            { zoneId: null },
            { zoneId },
          ],
        },
        orderBy: {
          ordre: 'asc',
        },
      });
    }

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Erreur lors de la récupération des questions pour arrivée:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des questions' },
      { status: 500 }
    );
  }
}

