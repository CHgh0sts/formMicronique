import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Fonction pour vérifier et mettre à jour les départs automatiques
async function checkAndUpdateAutoDepartures() {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);

    // Trouver tous les utilisateurs qui sont encore présents mais dont l'arrivée date d'avant aujourd'hui
    // OU qui ont un departType AUTO mais pas d'heure de départ
    const usersWithMissedDepartures = await prisma.user.findMany({
      where: {
        OR: [
          {
            estPresent: true,
            heureArrivee: {
              lt: yesterday
            },
            heureDepart: null
          },
          {
            departType: 'AUTO',
            heureDepart: null
          }
        ]
      }
    });

    // Mettre à jour ces utilisateurs avec un départ automatique
    for (const user of usersWithMissedDepartures) {
      // Créer une date pour 17h00 heure française
      const arrivalDate = new Date(user.heureArrivee);
      
      // Créer une date pour 17h00 le même jour en heure française
      const departureTime = new Date(arrivalDate.getFullYear(), arrivalDate.getMonth(), arrivalDate.getDate(), 17, 0, 0, 0);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          heureDepart: departureTime,
          estPresent: false,
          departType: 'AUTO'
        }
      });
    }

    return usersWithMissedDepartures.length;
  } catch (error) {
    console.error('Erreur lors de la vérification des départs automatiques:', error);
    return 0;
  }
}

// GET - Récupérer les utilisateurs avec filtres optionnels
export async function GET(request: NextRequest) {
  try {
    // Vérifier et mettre à jour les départs automatiques à chaque requête GET
    await checkAndUpdateAutoDepartures();

    const { searchParams } = new URL(request.url)
    const today = searchParams.get('today')
    const presents = searchParams.get('presents')
    const date = searchParams.get('date')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    let whereClause: any = {}

    // Filtre pour une date spécifique
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.heureArrivee = {
        gte: startOfDay,
        lte: endOfDay
      }
    }
    // Filtre pour aujourd'hui
    else if (today === 'true') {
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date()
      endOfDay.setHours(23, 59, 59, 999)

      whereClause.heureArrivee = {
        gte: startOfDay,
        lte: endOfDay
      }
    }
    // Filtre pour un mois spécifique
    else if (month && year) {
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);

      whereClause.heureArrivee = {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }

    // Filtre pour les présents
    if (presents === 'true') {
      whereClause.estPresent = true
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: {
        heureArrivee: 'desc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    )
  }
}

// POST - Enregistrer l'arrivée d'un visiteur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nom, prenom, societe, reponses } = body

    // Validation des champs obligatoires
    if (!nom || !prenom || !societe) {
      return NextResponse.json(
        { error: 'Le nom, prénom et société sont obligatoires' },
        { status: 400 }
      )
    }

    const user = await prisma.user.create({
      data: {
        nom,
        prenom,
        societe,
        reponses: reponses ? JSON.stringify(reponses) : null,
        heureArrivee: new Date(),
        estPresent: true,
        arriveType: 'VERIFY',
        departType: 'VERIFY'
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'arrivée:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement de l\'arrivée' },
      { status: 500 }
    )
  }
} 