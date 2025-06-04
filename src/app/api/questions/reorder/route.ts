import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT - Mettre à jour l'ordre des questions
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { questions } = body

    if (!Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'Le format des questions est invalide' },
        { status: 400 }
      )
    }

    // Mettre à jour l'ordre de chaque question
    const updatePromises = questions.map((question: any) =>
      prisma.question.update({
        where: { id: question.id },
        data: { ordre: question.ordre }
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({ message: 'Ordre des questions mis à jour avec succès' })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'ordre des questions:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'ordre des questions' },
      { status: 500 }
    )
  }
} 