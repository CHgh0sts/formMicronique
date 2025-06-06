'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Camera, Play, Square } from 'lucide-react';

export default function CameraTest() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoInfo, setVideoInfo] = useState<any>({});

  const startCamera = async () => {
    try {
      setError(null);
      console.log('🧪 TEST: Démarrage caméra...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      console.log('🧪 TEST: Stream obtenu:', mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        
        // Attendre et forcer le play
        setTimeout(async () => {
          try {
            await videoRef.current!.play();
            console.log('🧪 TEST: Play réussi');
            setIsActive(true);
          } catch (e) {
            console.error('🧪 TEST: Erreur play:', e);
            setIsActive(true); // Marquer comme actif quand même
          }
        }, 100);
      }
    } catch (err) {
      console.error('🧪 TEST: Erreur:', err);
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
    console.log('🧪 TEST: Démarrage automatique...');
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

  console.log('🧪 TEST: Rendu CameraTest, isActive:', isActive, 'error:', error);

  return (
    <div className="fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-md rounded-xl border border-gray-300 p-4 shadow-2xl max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-gray-700" />
          <span className="text-gray-700 text-sm font-medium">Test Caméra</span>
        </div>
        
        <button
          onClick={isActive ? stopCamera : startCamera}
          className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
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
        <div className="text-red-600 text-xs mb-3 p-2 bg-red-100 rounded-lg">
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
            className="w-full h-32 bg-gray-200 rounded-lg object-cover border"
            style={{ display: 'block' }}
            onLoadedMetadata={() => console.log('🧪 TEST: Métadonnées chargées')}
            onCanPlay={() => console.log('🧪 TEST: Can play')}
            onPlay={() => console.log('🧪 TEST: Play event')}
            onTimeUpdate={() => {
              if (videoRef.current && !videoRef.current.dataset.testLogged) {
                console.log('🧪 TEST: Time update - vidéo fonctionne!');
                videoRef.current.dataset.testLogged = 'true';
              }
            }}
          />
          
          {!isActive && (
            <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Camera className="w-8 h-8 mx-auto mb-2" />
                <p className="text-xs">Caméra arrêtée</p>
              </div>
            </div>
          )}
        </div>
        
        {isActive && (
          <div className="text-xs text-gray-600 space-y-1">
            <div>Dimensions: {videoInfo.width}x{videoInfo.height}</div>
            <div>État: {videoInfo.readyState} ({videoInfo.paused ? 'Pause' : 'Lecture'})</div>
            <div>Temps: {videoInfo.currentTime}s</div>
          </div>
        )}
      </div>
    </div>
  );
} 