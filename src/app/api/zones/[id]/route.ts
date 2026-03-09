import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { nom } = body as { nom?: string };

    if (!nom || nom.trim() === '') {
      return NextResponse.json(
        { error: 'Le nom de la zone est requis' },
        { status: 400 }
      );
    }

    const updated = await prisma.zone.update({
      where: { id: Number(id) },
      data: { nom: nom.trim() },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la zone:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la zone" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.zone.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: 'Zone supprimée avec succès' });
  } catch (error) {
    console.error("Erreur lors de la suppression de la zone:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la zone" },
      { status: 500 }
    );
  }
}

