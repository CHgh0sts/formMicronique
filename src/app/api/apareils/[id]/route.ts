import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { nom, zoneId } = body as { nom?: string; zoneId?: number | null };

    const data: any = {};
    if (typeof nom === 'string' && nom.trim() !== '') {
      data.nom = nom.trim();
    }
    if (typeof zoneId !== 'undefined') {
      data.zoneId = zoneId === null ? null : Number(zoneId);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'Aucun champ à mettre à jour' },
        { status: 400 }
      );
    }

    const updated = await prisma.apareil.update({
      where: { id: Number(id) },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'appareil:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'appareil' },
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

    await prisma.apareil.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: 'Appareil supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'appareil:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'appareil' },
      { status: 500 }
    );
  }
}


