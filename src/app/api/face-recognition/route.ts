import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Reconnaître un visage à partir d'un embedding
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { embedding, threshold = 0.6 } = body;

    if (!embedding || !Array.isArray(embedding)) {
      return NextResponse.json(
        { error: 'Embedding requis et doit être un tableau' },
        { status: 400 }
      );
    }

    // Récupérer tous les embeddings de la base de données
    const knownEmbeddings = await prisma.faceEmbedding.findMany({
      include: {
        user: true,
      },
    });

    if (knownEmbeddings.length === 0) {
      return NextResponse.json({
        recognized: false,
        message: 'Aucun visage enregistré en base de données',
      });
    }

    // Calculer la distance euclidienne avec chaque embedding connu
    let bestMatch = null;
    let minDistance = Infinity;

    for (const known of knownEmbeddings) {
      const distance = calculateEuclideanDistance(embedding, known.embedding);
      
      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = {
          user: {
            id: known.user.id,
            nom: known.user.nom,
            prenom: known.user.prenom,
            societe: known.user.societe,
            estPresent: known.user.estPresent,
          },
          distance,
          confidence: Math.max(0, 1 - distance), // Convertir en score de confiance
          embeddingId: known.id,
        };
      }
    }

    // Vérifier si la distance est en dessous du seuil
    const isRecognized = bestMatch && minDistance < threshold;

    if (isRecognized && bestMatch) {
      return NextResponse.json({
        recognized: true,
        user: bestMatch.user,
        confidence: bestMatch.confidence,
        distance: bestMatch.distance,
        message: `Utilisateur reconnu: ${bestMatch.user.prenom} ${bestMatch.user.nom}`,
      });
    } else {
      return NextResponse.json({
        recognized: false,
        bestMatch: bestMatch ? {
          user: bestMatch.user,
          confidence: bestMatch.confidence,
          distance: bestMatch.distance,
        } : null,
        message: 'Aucun utilisateur reconnu avec suffisamment de confiance',
      });
    }
  } catch (error) {
    console.error('Erreur lors de la reconnaissance faciale:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la reconnaissance faciale' },
      { status: 500 }
    );
  }
}

// Fonction utilitaire pour calculer la distance euclidienne
function calculateEuclideanDistance(embedding1: number[], embedding2: number[]): number {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Les embeddings doivent avoir la même dimension');
  }

  let sum = 0;
  for (let i = 0; i < embedding1.length; i++) {
    const diff = embedding1[i] - embedding2[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
} 