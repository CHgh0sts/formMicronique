import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Enregistrer le départ d'un utilisateur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur existe et est présent
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        estPresent: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé ou déjà parti' },
        { status: 404 }
      )
    }

    // Mettre à jour l'utilisateur avec l'heure de départ
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        heureDepart: new Date(),
        estPresent: false
      }
    })

    return NextResponse.json({
      message: `Départ de ${user.nom} ${user.prenom} enregistré avec succès`,
      user: updatedUser
    })
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du départ:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement du départ' },
      { status: 500 }
    )
  }
}

// GET - Rechercher un utilisateur pour le départ
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nom = searchParams.get('nom')
    const prenom = searchParams.get('prenom')
    const societe = searchParams.get('societe')

    if (!nom || !prenom) {
      return NextResponse.json(
        { error: 'Nom et prénom requis' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findFirst({
      where: {
        nom: {
          contains: nom
        },
        prenom: {
          contains: prenom
        },
        societe: societe || undefined,
        estPresent: true
      },
      orderBy: {
        heureArrivee: 'desc'
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Aucun visiteur trouvé avec ces informations ou déjà parti' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Erreur lors de la recherche de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recherche de l\'utilisateur' },
      { status: 500 }
    )
  }
} 