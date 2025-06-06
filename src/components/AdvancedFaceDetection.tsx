'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Camera, Eye, EyeOff, Users } from 'lucide-react';

interface Face {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

interface AdvancedFaceDetectionProps {
  onFaceDetected?: (faceCount: number, faces: Face[]) => void;
  onError?: () => void;
  isVisible?: boolean;
}

export default function AdvancedFaceDetection({ onFaceDetected, onError, isVisible = true }: AdvancedFaceDetectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [faces, setFaces] = useState<Face[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const animationFrameRef = useRef<number>();
  const faceDetectionRef = useRef<any>(null);

  // Initialiser MediaPipe Face Detection
  const initializeFaceDetection = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Vérifier si MediaPipe est disponible
      if (typeof window === 'undefined') {
        throw new Error('MediaPipe nécessite un environnement navigateur');
      }

      console.log('Tentative d\'initialisation MediaPipe...');
      
      // Import dynamique avec gestion d'erreur
      let FaceDetection, Camera;
      try {
        const mediapipeModule = await import('@mediapipe/face_detection');
        const cameraModule = await import('@mediapipe/camera_utils');
        FaceDetection = mediapipeModule.FaceDetection;
        Camera = cameraModule.Camera;
      } catch (importError) {
        console.error('Erreur d\'import MediaPipe:', importError);
        throw new Error('MediaPipe non disponible. Utilisez le mode simple.');
      }

      if (!FaceDetection) {
        throw new Error('FaceDetection non disponible');
      }

      const faceDetection = new FaceDetection({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
        }
      });

      faceDetection.setOptions({
        model: 'short',
        minDetectionConfidence: 0.5,
      });

      faceDetection.onResults((results) => {
        if (canvasRef.current && videoRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          const video = videoRef.current;

          if (ctx) {
            // Effacer le canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Dessiner les détections
            const detectedFaces: Face[] = [];
            
            if (results.detections) {
              results.detections.forEach((detection) => {
                const bbox = detection.boundingBox;
                if (bbox) {
                  const face: Face = {
                    x: bbox.xCenter * canvas.width - (bbox.width * canvas.width) / 2,
                    y: bbox.yCenter * canvas.height - (bbox.height * canvas.height) / 2,
                    width: bbox.width * canvas.width,
                    height: bbox.height * canvas.height,
                    confidence: (detection as any).score?.[0] || 0.8
                  };

                  detectedFaces.push(face);

                  // Dessiner le rectangle de détection
                  ctx.strokeStyle = '#00ff00';
                  ctx.lineWidth = 2;
                  ctx.strokeRect(face.x, face.y, face.width, face.height);

                  // Afficher la confiance
                  ctx.fillStyle = '#00ff00';
                  ctx.font = '12px Arial';
                  ctx.fillText(
                    `${Math.round(face.confidence * 100)}%`,
                    face.x,
                    face.y - 5
                  );
                }
              });
            }

            // Mettre à jour l'état
            setFaces(detectedFaces);
            onFaceDetected?.(detectedFaces.length, detectedFaces);
          }
        }
      });

      faceDetectionRef.current = faceDetection;
      console.log('MediaPipe initialisé avec succès');
      setIsLoading(false);
    } catch (err) {
      console.error('Erreur d\'initialisation MediaPipe:', err);
      setError(`Erreur MediaPipe: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      setIsLoading(false);
      onError?.();
    }
  };

  // Fonction pour démarrer la caméra
  const startCamera = async () => {
    try {
      setError(null);
      setIsLoading(true);
      console.log('🎥 Démarrage de la caméra avec MediaPipe...');
      
      // Vérifier si getUserMedia est disponible
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia n\'est pas supporté par ce navigateur');
      }
      
      if (!faceDetectionRef.current) {
        await initializeFaceDetection();
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      console.log('✅ Caméra accessible, stream obtenu:', mediaStream);
      console.log('📹 Tracks vidéo:', mediaStream.getVideoTracks());

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        
        // Forcer le démarrage de la vidéo
        try {
          await videoRef.current.play();
          console.log('▶️ Vidéo démarrée avec succès');
          setIsActive(true);
        } catch (playError) {
          console.error('❌ Erreur lors du démarrage de la vidéo:', playError);
          throw new Error('Impossible de démarrer la vidéo');
        }
      }
    } catch (err) {
      console.error('❌ Erreur d\'accès à la caméra:', err);
      setError(`Erreur caméra: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      onError?.();
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour arrêter la caméra
  const stopCamera = () => {
    console.log('🛑 Arrêt de la caméra MediaPipe');
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('🔴 Track arrêté:', track.kind);
      });
      setStream(null);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsActive(false);
    setFaces([]);
  };

  // Boucle de détection
  const detectFaces = async () => {
    if (!videoRef.current || !canvasRef.current || !isActive || !faceDetectionRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectFaces);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.videoWidth === 0) {
      animationFrameRef.current = requestAnimationFrame(detectFaces);
      return;
    }

    // Ajuster la taille du canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Envoyer la frame à MediaPipe
    await faceDetectionRef.current.send({ image: video });

    animationFrameRef.current = requestAnimationFrame(detectFaces);
  };

  // Démarrage automatique de la caméra au montage
  useEffect(() => {
    if (isVisible) {
      console.log('🚀 Démarrage automatique de la détection IA...');
      startCamera();
    }
    
    return () => {
      stopCamera();
      if (faceDetectionRef.current) {
        faceDetectionRef.current.close();
      }
    };
  }, [isVisible]);

  // Démarrer la détection quand la vidéo est prête
  useEffect(() => {
    if (isActive && videoRef.current) {
      const video = videoRef.current;
      const handleLoadedData = () => {
        detectFaces();
      };
      
      video.addEventListener('loadeddata', handleLoadedData);
      return () => video.removeEventListener('loadeddata', handleLoadedData);
    }
  }, [isActive]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 backdrop-blur-md rounded-xl border border-white/20 p-3 shadow-2xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-white" />
          <span className="text-white text-xs font-medium">Détection IA</span>
          {faces.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-green-400" />
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                {faces.length}
              </span>
            </div>
          )}
        </div>
        
        <button
          onClick={isActive ? stopCamera : startCamera}
          disabled={isLoading}
          title={isLoading ? "Chargement..." : isActive ? "Arrêter la caméra" : "Démarrer la caméra"}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isActive ? (
            <EyeOff className="w-4 h-4 text-white" />
          ) : (
            <Eye className="w-4 h-4 text-white" />
          )}
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-xs mb-2 p-2 bg-red-500/10 rounded-lg">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="text-blue-400 text-xs mb-2 p-2 bg-blue-500/10 rounded-lg">
          Chargement de l'IA de détection...
        </div>
      )}

      {isActive && (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-48 h-36 bg-gray-900 rounded-lg object-cover"
            onLoadedMetadata={() => {
              console.log('Vidéo IA chargée, dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
            }}
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-48 h-36 rounded-lg pointer-events-none"
          />
          
          {/* Indicateur d'activité */}
          <div className="absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          
          {/* Statistiques */}
          {faces.length > 0 && (
            <div className="absolute bottom-2 left-2 right-2 bg-black/60 rounded-lg p-1">
              <div className="text-white text-xs">
                {faces.map((face, index) => (
                  <div key={index} className="flex justify-between">
                    <span>Visage {index + 1}</span>
                    <span>{Math.round(face.confidence * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!isActive && !isLoading && (
        <div className="w-48 h-36 bg-gray-900 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Camera className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 text-xs">Détection IA désactivée</p>
            <p className="text-gray-500 text-xs">Cliquez sur l'œil pour activer</p>
          </div>
        </div>
      )}
    </div>
  );
} 