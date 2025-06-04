import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Récupérer toutes les questions actives triées par ordre
export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      where: {
        active: true
      },
      orderBy: {
        ordre: 'asc'
      }
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error('Erreur lors de la récupération des questions:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des questions' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle question
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { titre, type, options, placeholder, required, active, ordre } = body

    const question = await prisma.question.create({
      data: {
        titre,
        type,
        options: options ? JSON.stringify(options) : null,
        placeholder,
        required: required || false,
        active: active !== undefined ? active : true,
        ordre: ordre || 0
      }
    })

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de la question:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la question' },
      { status: 500 }
    )
  }
} 