import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { heureArrivee, heureDepart, arriveType, departType } = body;

    // Validation des données
    if (!heureArrivee && !heureDepart) {
      return NextResponse.json(
        { error: 'Au moins une heure (arrivée ou départ) doit être fournie' },
        { status: 400 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    
    if (heureArrivee) {
      updateData.heureArrivee = new Date(heureArrivee);
      updateData.arriveType = arriveType || 'MANUAL';
    }
    
    if (heureDepart) {
      updateData.heureDepart = new Date(heureDepart);
      updateData.departType = departType || 'MANUAL';
      updateData.estPresent = false;
    } else if (heureDepart === null) {
      // Si on supprime l'heure de départ
      updateData.heureDepart = null;
      updateData.departType = 'VERIFY';
      updateData.estPresent = true;
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: 'Utilisateur mis à jour avec succès',
      user: updatedUser
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'utilisateur' },
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
    await prisma.user.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    );
  }
} 