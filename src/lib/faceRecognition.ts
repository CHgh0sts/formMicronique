'use client';

import * as faceapi from 'face-api.js';

export interface FaceDescriptor {
  embedding: Float32Array;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface RecognitionResult {
  userId?: string;
  confidence: number;
  distance: number;
  isMatch: boolean;
}

class FaceRecognitionService {
  private isInitialized = false;
  private readonly SIMILARITY_THRESHOLD = 0.6; // Seuil de similarité pour la reconnaissance

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('Initialisation de Face-API.js...');
      
      // Charger les modèles depuis un CDN
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model';
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);

      this.isInitialized = true;
      console.log('Face-API.js initialisé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de Face-API.js:', error);
      throw new Error('Impossible d\'initialiser la reconnaissance faciale');
    }
  }

  async extractFaceDescriptor(
    input: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement
  ): Promise<FaceDescriptor | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Détecter le visage avec landmarks et descripteur
      const detection = await faceapi
        .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        console.log('Aucun visage détecté');
        return null;
      }

      return {
        embedding: detection.descriptor,
        confidence: detection.detection.score,
        boundingBox: {
          x: detection.detection.box.x,
          y: detection.detection.box.y,
          width: detection.detection.box.width,
          height: detection.detection.box.height,
        },
      };
    } catch (error) {
      console.error('Erreur lors de l\'extraction du descripteur:', error);
      return null;
    }
  }

  calculateDistance(embedding1: Float32Array, embedding2: number[]): number {
    // Calculer la distance euclidienne entre deux embeddings
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

  async recognizeFace(
    faceDescriptor: FaceDescriptor,
    knownEmbeddings: Array<{ userId: string; embedding: number[] }>
  ): Promise<RecognitionResult | null> {
    if (knownEmbeddings.length === 0) {
      return null;
    }

    let bestMatch: RecognitionResult | null = null;
    let minDistance = Infinity;

    // Comparer avec tous les embeddings connus
    for (const known of knownEmbeddings) {
      const distance = this.calculateDistance(faceDescriptor.embedding, known.embedding);
      
      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = {
          userId: known.userId,
          confidence: 1 - distance, // Convertir la distance en score de confiance
          distance,
          isMatch: distance < this.SIMILARITY_THRESHOLD,
        };
      }
    }

    return bestMatch;
  }

  async captureAndAnalyzeFace(
    video: HTMLVideoElement
  ): Promise<{
    descriptor: FaceDescriptor | null;
    imageData: string | null;
  }> {
    // Créer un canvas pour capturer l'image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Impossible de créer le contexte canvas');
    }

    // Ajuster la taille du canvas à la vidéo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dessiner la frame actuelle
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Extraire le descripteur facial
    const descriptor = await this.extractFaceDescriptor(canvas);

    // Convertir l'image en base64 (optionnel, pour debug)
    const imageData = descriptor ? canvas.toDataURL('image/jpeg', 0.8) : null;

    return { descriptor, imageData };
  }

  // Utilitaire pour convertir Float32Array en array normal pour la DB
  embeddingToArray(embedding: Float32Array): number[] {
    return Array.from(embedding);
  }

  // Utilitaire pour convertir array de la DB en Float32Array
  arrayToEmbedding(array: number[]): Float32Array {
    return new Float32Array(array);
  }
}

// Instance singleton
export const faceRecognitionService = new FaceRecognitionService(); 