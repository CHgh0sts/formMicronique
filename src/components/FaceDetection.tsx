'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Camera, Play, Square } from 'lucide-react';

interface FaceDetectionProps {
  onFaceDetected?: (faceCount: number) => void;
  isVisible?: boolean;
}

export default function FaceDetection({ onFaceDetected, isVisible = true }: FaceDetectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoInfo, setVideoInfo] = useState<any>({});

  const startCamera = async () => {
    try {
      setError(null);
      console.log('🎥 Démarrage caméra...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      console.log('✅ Stream obtenu:', mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        
        // Attendre et forcer le play
        setTimeout(async () => {
          try {
            await videoRef.current!.play();
            console.log('▶️ Play réussi');
            setIsActive(true);
          } catch (e) {
            console.error('❌ Erreur play:', e);
            setIsActive(true); // Marquer comme actif quand même
          }
        }, 100);
      }
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsActive(false);
    setVideoInfo({});
  };

  // Démarrage automatique de la caméra au montage
  useEffect(() => {
    console.log('🚀 Démarrage automatique...');
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

  console.log('📹 Rendu FaceDetection, isActive:', isActive, 'error:', error);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 backdrop-blur-md rounded-xl border border-white/20 p-3 shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-white" />
          <span className="text-white text-xs font-medium">Caméra</span>
        </div>
        
        <button
          onClick={isActive ? stopCamera : startCamera}
          className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs"
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

      {/* Toujours afficher la zone vidéo */}
      <div className="space-y-3">
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-48 h-36 bg-gray-900 rounded-lg object-cover border border-white/20"
            style={{ display: 'block' }}
            onLoadedMetadata={() => console.log('📊 Métadonnées chargées')}
            onCanPlay={() => console.log('🎬 Can play')}
            onPlay={() => console.log('▶️ Play event')}
            onTimeUpdate={() => {
              if (videoRef.current && !videoRef.current.dataset.logged) {
                console.log('⏰ Time update - vidéo fonctionne!');
                videoRef.current.dataset.logged = 'true';
              }
            }}
          />
          
          {!isActive && (
            <div className="absolute inset-0 bg-gray-900 rounded-lg flex items-center justify-center">
              <div className="text-center text-white/60">
                <Camera className="w-8 h-8 mx-auto mb-2" />
                <p className="text-xs">Caméra arrêtée</p>
              </div>
            </div>
          )}
        </div>
        
        {isActive && (
          <div className="text-white/60 text-xs space-y-1">
            <div>Dimensions: {videoInfo.width}x{videoInfo.height}</div>
            <div>État: {videoInfo.readyState} ({videoInfo.paused ? 'Pause' : 'Lecture'})</div>
            <div>Temps: {videoInfo.currentTime}s</div>
          </div>
        )}
      </div>
    </div>
  );
} 