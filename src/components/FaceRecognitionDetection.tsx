'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Camera, Play, Square, Users, UserCheck, UserPlus, Scan } from 'lucide-react';

interface Face {
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
}

interface RecognizedUser {
  id: string;
  nom: string;
  prenom: string;
  societe: string;
  estPresent: boolean;
}

interface RecognitionResult {
  recognized: boolean;
  user?: RecognizedUser;
  confidence?: number;
  distance?: number;
  message: string;
}

interface FaceRecognitionDetectionProps {
  onFaceRecognized?: (result: RecognitionResult) => void;
  onFaceDetected?: (faceCount: number) => void;
  isVisible?: boolean;
}

export default function FaceRecognitionDetection({ 
  onFaceRecognized, 
  onFaceDetected, 
  isVisible = true 
}: FaceRecognitionDetectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoInfo, setVideoInfo] = useState<any>({});
  const [lastRecognition, setLastRecognition] = useState<RecognitionResult | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [detectedFaces, setDetectedFaces] = useState<number>(0);
  const animationFrameRef = useRef<number>();

  const startCamera = async () => {
    try {
      setError(null);
      console.log('🎥 Démarrage caméra reconnaissance...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      console.log('✅ Stream reconnaissance obtenu:', mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        
        // Attendre et forcer le play
        setTimeout(async () => {
          try {
            await videoRef.current!.play();
            console.log('▶️ Play reconnaissance réussi');
            setIsActive(true);
            
            // Démarrer la détection en temps réel
            startDetection();
            
            // Démarrer la reconnaissance toutes les 3 secondes
            startRecognitionLoop();
          } catch (e) {
            console.error('❌ Erreur play reconnaissance:', e);
            setIsActive(true);
            startDetection();
            startRecognitionLoop();
          }
        }, 100);
      }
    } catch (err) {
      console.error('❌ Erreur reconnaissance:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsActive(false);
    setVideoInfo({});
    setLastRecognition(null);
    setIsRecognizing(false);
    setDetectedFaces(0);
  };

  const startDetection = () => {
    const detectFaces = () => {
      if (!videoRef.current || !canvasRef.current || !isActive) {
        animationFrameRef.current = requestAnimationFrame(detectFaces);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx || video.videoWidth === 0 || video.readyState < 2) {
        animationFrameRef.current = requestAnimationFrame(detectFaces);
        return;
      }

      // Ajuster la taille du canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Effacer le canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Détection simple de visage basée sur la luminosité et les contours
      const faces = detectFacesInVideo(video, ctx);
      
      // Dessiner les rectangles de détection
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.font = '14px Arial';
      ctx.fillStyle = '#00ff00';

      faces.forEach((face, index) => {
        // Rectangle de détection
        ctx.strokeRect(face.x, face.y, face.width, face.height);
        
        // Label "VISAGE" au-dessus
        ctx.fillText(`VISAGE ${index + 1}`, face.x, face.y - 10);
        
        // Point central
        ctx.fillRect(face.x + face.width/2 - 2, face.y + face.height/2 - 2, 4, 4);
      });

      const faceCount = faces.length;
      if (faceCount !== detectedFaces) {
        setDetectedFaces(faceCount);
        onFaceDetected?.(faceCount);
        console.log(`👤 ${faceCount} visage(s) détecté(s) en temps réel`);
      }

      animationFrameRef.current = requestAnimationFrame(detectFaces);
    };

    detectFaces();
  };

  const detectFacesInVideo = (video: HTMLVideoElement, ctx: CanvasRenderingContext2D): Face[] => {
    const faces: Face[] = [];
    
    // Créer un canvas temporaire pour analyser l'image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return faces;

    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    tempCtx.drawImage(video, 0, 0);

    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;

    // Détection simple basée sur des zones de luminosité caractéristiques d'un visage
    const width = imageData.width;
    const height = imageData.height;
    
    // Diviser l'image en grille et chercher des patterns de visage
    const gridSize = 60; // Taille minimale d'un visage
    
    for (let y = 0; y < height - gridSize; y += 20) {
      for (let x = 0; x < width - gridSize; x += 20) {
        
        // Analyser cette zone pour détecter un pattern de visage
        const faceScore = analyzeFacePattern(data, x, y, gridSize, width);
        
        if (faceScore > 0.3) { // Seuil de détection
          // Éviter les doublons en vérifiant les faces déjà détectées
          let isDuplicate = false;
          for (const existingFace of faces) {
            const distance = Math.sqrt(
              Math.pow(x - existingFace.x, 2) + Math.pow(y - existingFace.y, 2)
            );
            if (distance < gridSize / 2) {
              isDuplicate = true;
              break;
            }
          }
          
          if (!isDuplicate) {
            faces.push({
              x: x,
              y: y,
              width: gridSize,
              height: gridSize * 1.2, // Visage plus haut que large
              score: faceScore
            });
          }
        }
      }
    }

    return faces.slice(0, 3); // Limiter à 3 visages max
  };

  const analyzeFacePattern = (data: Uint8ClampedArray, startX: number, startY: number, size: number, width: number) => {
    let score = 0;
    const samples = 10;
    
    // Analyser différentes zones caractéristiques d'un visage
    for (let i = 0; i < samples; i++) {
      const x = startX + Math.random() * size;
      const y = startY + Math.random() * size;
      
      const pixelIndex = (Math.floor(y) * width + Math.floor(x)) * 4;
      
      if (pixelIndex >= 0 && pixelIndex < data.length - 3) {
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        
        // Luminosité
        const brightness = (r + g + b) / 3;
        
        // Détection de tons chair (approximatif)
        const isSkinTone = r > 95 && g > 40 && b > 20 && 
                          r > b && r > g && 
                          Math.abs(r - g) > 15;
        
        if (isSkinTone && brightness > 60 && brightness < 220) {
          score += 0.1;
        }
      }
    }
    
    return score;
  };

  const startRecognitionLoop = () => {
    const recognizeInterval = setInterval(() => {
      if (isActive && videoRef.current && !isRecognizing && detectedFaces > 0) {
        performRecognition();
      }
    }, 4000); // Reconnaissance toutes les 4 secondes si visage détecté

    // Nettoyer l'interval quand le composant se démonte
    return () => clearInterval(recognizeInterval);
  };

  const performRecognition = async () => {
    if (!videoRef.current || isRecognizing || detectedFaces === 0) return;

    try {
      setIsRecognizing(true);
      console.log('🔍 Tentative de reconnaissance sur', detectedFaces, 'visage(s)...');

      // Simulation de reconnaissance (remplace par vraie reconnaissance plus tard)
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simule le traitement

      // Simulation de résultat aléatoire
      const random = Math.random();
      let result: RecognitionResult;

      if (random > 0.6) {
        // Utilisateur reconnu
        const users = [
          { nom: 'Dupont', prenom: 'Jean', societe: 'TechCorp' },
          { nom: 'Martin', prenom: 'Marie', societe: 'InnovateLab' },
          { nom: 'Bernard', prenom: 'Pierre', societe: 'StartupXYZ' }
        ];
        const randomUser = users[Math.floor(Math.random() * users.length)];
        
        result = {
          recognized: true,
          user: {
            id: String(Math.floor(Math.random() * 100)),
            ...randomUser,
            estPresent: false
          },
          confidence: 0.75 + Math.random() * 0.2, // Entre 75% et 95%
          distance: 0.2 + Math.random() * 0.3, // Entre 0.2 et 0.5
          message: 'Utilisateur reconnu avec succès'
        };
      } else {
        // Nouveau visiteur
        result = {
          recognized: false,
          message: 'Nouveau visiteur détecté'
        };
      }

      setLastRecognition(result);
      onFaceRecognized?.(result);
      console.log('🎯 Résultat reconnaissance:', result);

    } catch (error) {
      console.error('❌ Erreur lors de la reconnaissance:', error);
      setError('Erreur de reconnaissance');
    } finally {
      setIsRecognizing(false);
    }
  };

  // Démarrage automatique de la caméra au montage
  useEffect(() => {
    console.log('🚀 Démarrage automatique reconnaissance...');
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, []);

  // Mettre à jour les infos vidéo
  useEffect(() => {
    if (isActive && videoRef.current) {
      const interval = setInterval(() => {
        const video = videoRef.current;
        if (video) {
          setVideoInfo({
            width: video.videoWidth,
            height: video.videoHeight,
            readyState: video.readyState,
            paused: video.paused,
            currentTime: video.currentTime.toFixed(2),
            duration: video.duration || 0
          });
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isActive]);

  console.log('🔍 Rendu FaceRecognitionDetection, isActive:', isActive, 'détectés:', detectedFaces);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 backdrop-blur-md rounded-xl border border-white/20 p-3 shadow-2xl min-w-[300px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Scan className="w-4 h-4 text-purple-400" />
          <span className="text-white text-xs font-medium">Reconnaissance</span>
          {detectedFaces > 0 && (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-green-400" />
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                {detectedFaces}
              </span>
            </div>
          )}
          {lastRecognition?.recognized && (
            <div className="flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-blue-400" />
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                Reconnu
              </span>
            </div>
          )}
        </div>
        
        <button
          onClick={isActive ? stopCamera : startCamera}
          className="flex items-center gap-1 px-2 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-xs"
        >
          {isActive ? (
            <>
              <Square className="w-3 h-3" />
              Stop
            </>
          ) : (
            <>
              <Play className="w-3 h-3" />
              Start
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-xs mb-3 p-2 bg-red-500/10 rounded-lg">
          {error}
        </div>
      )}

      {/* Zone vidéo avec détection */}
      <div className="space-y-3">
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-48 h-36 bg-gray-900 rounded-lg object-cover border border-purple-500/30"
            style={{ display: 'block' }}
            onLoadedMetadata={() => console.log('📊 Métadonnées reconnaissance chargées')}
            onCanPlay={() => console.log('🎬 Can play reconnaissance')}
            onPlay={() => console.log('▶️ Play event reconnaissance')}
            onTimeUpdate={() => {
              if (videoRef.current && !videoRef.current.dataset.logged) {
                console.log('⏰ Time update reconnaissance - vidéo fonctionne!');
                videoRef.current.dataset.logged = 'true';
              }
            }}
          />
          
          {/* Canvas pour les rectangles de détection */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-48 h-36 rounded-lg pointer-events-none"
          />
          
          {/* Indicateur de reconnaissance en cours */}
          {isRecognizing && (
            <div className="absolute top-2 right-2 bg-purple-500/80 rounded-lg px-2 py-1">
              <span className="text-white text-xs flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                Analyse...
              </span>
            </div>
          )}
          
          {/* Indicateur de détection */}
          {detectedFaces > 0 && !isRecognizing && (
            <div className="absolute top-2 left-2 bg-green-500/80 rounded-lg px-2 py-1">
              <span className="text-white text-xs">
                {detectedFaces} visage{detectedFaces > 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          {!isActive && (
            <div className="absolute inset-0 bg-gray-900 rounded-lg flex items-center justify-center">
              <div className="text-center text-white/60">
                <Scan className="w-8 h-8 mx-auto mb-2" />
                <p className="text-xs">Reconnaissance arrêtée</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Informations vidéo */}
        {isActive && (
          <div className="text-white/60 text-xs space-y-1">
            <div>Dimensions: {videoInfo.width}x{videoInfo.height}</div>
            <div>Visages: {detectedFaces} | État: {videoInfo.paused ? 'Pause' : 'Lecture'}</div>
            <div>Temps: {videoInfo.currentTime}s</div>
          </div>
        )}
      </div>

      {/* Résultats de reconnaissance */}
      {lastRecognition && (
        <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="text-white text-xs space-y-2">
            {lastRecognition.recognized ? (
              <>
                <div className="flex items-center gap-2 text-green-400 font-medium">
                  <UserCheck className="w-4 h-4" />
                  <span>Utilisateur Reconnu!</span>
                </div>
                <div className="space-y-1">
                  <div className="text-white font-medium">
                    {lastRecognition.user?.prenom} {lastRecognition.user?.nom}
                  </div>
                  <div className="text-white/70">
                    {lastRecognition.user?.societe}
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Confiance:</span>
                    <span>{Math.round((lastRecognition.confidence || 0) * 100)}%</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Distance:</span>
                    <span>{lastRecognition.distance?.toFixed(3)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-orange-400">
                <UserPlus className="w-4 h-4" />
                <span>Nouveau visiteur détecté</span>
              </div>
            )}
            <div className="text-white/50 text-xs italic">
              {lastRecognition.message}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 