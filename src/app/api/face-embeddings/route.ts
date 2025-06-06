import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Récupérer tous les embeddings pour la reconnaissance
export async function GET() {
  try {
    const embeddings = await prisma.faceEmbedding.findMany({
      select: {
        id: true,
        userId: true,
        embedding: true,
        confidence: true,
        user: {
          select: {
            nom: true,
            prenom: true,
            societe: true,
          },
        },
      },
    });

    return NextResponse.json(embeddings);
  } catch (error) {
    console.error('Erreur lors de la récupération des embeddings:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des embeddings' },
      { status: 500 }
    );
  }
}

// POST - Sauvegarder un nouvel embedding facial
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, embedding, confidence, imageData } = body;

    if (!userId || !embedding || !confidence) {
      return NextResponse.json(
        { error: 'userId, embedding et confidence sont requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Créer l'embedding facial
    const faceEmbedding = await prisma.faceEmbedding.create({
      data: {
        userId,
        embedding,
        confidence,
        imageData,
      },
      include: {
        user: {
          select: {
            nom: true,
            prenom: true,
            societe: true,
          },
        },
      },
    });

    return NextResponse.json(faceEmbedding, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'embedding:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde de l\'embedding' },
      { status: 500 }
    );
  }
} 