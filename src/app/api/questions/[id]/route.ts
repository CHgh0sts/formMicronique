import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT - Modifier une question
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json()
    const { titre, type, options, placeholder, required, active, ordre } = body

    const question = await prisma.question.update({
      where: { id },
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

    return NextResponse.json(question)
  } catch (error) {
    console.error('Erreur lors de la modification de la question:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification de la question' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une question
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.question.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Question supprimée avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression de la question:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la question' },
      { status: 500 }
    )
  }
} 