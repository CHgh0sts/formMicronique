'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Zap, Brain, AlertTriangle, Scan } from 'lucide-react';
import FaceDetection from './FaceDetection';
import AdvancedFaceDetection from './AdvancedFaceDetection';
import FaceRecognitionDetection from './FaceRecognitionDetection';

interface FaceDetectionControllerProps {
  onFaceDetected?: (faceCount: number) => void;
  onFaceRecognized?: (result: any) => void;
}

export default function FaceDetectionController({ onFaceDetected, onFaceRecognized }: FaceDetectionControllerProps) {
  const [detectionMode, setDetectionMode] = useState<'simple' | 'advanced' | 'recognition'>('recognition');
  const [showSettings, setShowSettings] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [hasMediaPipeError, setHasMediaPipeError] = useState(false);

  // Debug logs
  useEffect(() => {
    console.log('🎛️ FaceDetectionController rendu avec:', {
      detectionMode,
      isVisible,
      hasMediaPipeError,
      showSettings
    });
  }, [detectionMode, isVisible, hasMediaPipeError, showSettings]);

  // Log du composant rendu
  useEffect(() => {
    if (detectionMode === 'simple') {
      console.log('🎯 Rendu FaceDetection simple');
    } else if (detectionMode === 'advanced') {
      console.log('🎯 Rendu AdvancedFaceDetection');
    } else {
      console.log('🎯 Rendu FaceRecognitionDetection');
    }
  }, [detectionMode]);

  const handleFaceDetected = (faceCount: number, faces?: any[]) => {
    onFaceDetected?.(faceCount);
    
    // Log pour debug
    if (faces && faces.length > 0) {
      console.log(`Détection avancée: ${faceCount} visage(s)`, faces);
    } else {
      console.log(`Détection simple: ${faceCount} visage(s)`);
    }
  };

  const handleFaceRecognized = (result: any) => {
    onFaceRecognized?.(result);
    console.log('Reconnaissance faciale:', result);
  };

  const handleModeChange = (mode: 'simple' | 'advanced' | 'recognition') => {
    if ((mode === 'advanced' || mode === 'recognition') && hasMediaPipeError) {
      console.warn('Mode IA non disponible, reste en mode simple');
      return;
    }
    console.log('🔄 Changement de mode:', mode);
    setDetectionMode(mode);
  };

  console.log('🎛️ Rendu du contrôleur, mode actuel:', detectionMode, 'visible:', isVisible);

  return (
    <>
      {/* Panneau de contrôle - déplacé en bas à gauche */}
      <div className="fixed bottom-4 left-4 z-50 bg-black/80 backdrop-blur-md rounded-xl border border-white/20 p-3 shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => {
              console.log('🔧 Toggle settings:', !showSettings);
              setShowSettings(!showSettings);
            }}
            title="Paramètres de détection"
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4 text-white" />
          </button>
          <span className="text-white text-xs font-medium">Contrôles</span>
          <span className="text-white/60 text-xs">({detectionMode})</span>
        </div>

        {showSettings && (
          <div className="space-y-2 min-w-[220px]">
            {/* Mode de détection */}
            <div className="space-y-1">
              <label className="text-white/80 text-xs">Mode de détection</label>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => handleModeChange('simple')}
                  className={`px-2 py-1 rounded-lg text-xs transition-colors ${
                    detectionMode === 'simple'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <Zap className="w-3 h-3 inline mr-1" />
                  Simple
                </button>
                <button
                  onClick={() => handleModeChange('advanced')}
                  disabled={hasMediaPipeError}
                  className={`px-2 py-1 rounded-lg text-xs transition-colors ${
                    detectionMode === 'advanced'
                      ? 'bg-purple-500 text-white'
                      : hasMediaPipeError
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <Brain className="w-3 h-3 inline mr-1" />
                  IA
                  {hasMediaPipeError && <AlertTriangle className="w-2 h-2 inline ml-1" />}
                </button>
                <button
                  onClick={() => handleModeChange('recognition')}
                  disabled={hasMediaPipeError}
                  className={`px-2 py-1 rounded-lg text-xs transition-colors ${
                    detectionMode === 'recognition'
                      ? 'bg-green-500 text-white'
                      : hasMediaPipeError
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <Scan className="w-3 h-3 inline mr-1" />
                  Recon
                  {hasMediaPipeError && <AlertTriangle className="w-2 h-2 inline ml-1" />}
                </button>
              </div>
            </div>

            {/* Visibilité */}
            <div className="space-y-1">
              <label className="text-white/80 text-xs">Affichage</label>
              <button
                onClick={() => setIsVisible(!isVisible)}
                className={`w-full px-2 py-1 rounded-lg text-xs transition-colors ${
                  isVisible
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {isVisible ? 'Visible' : 'Masqué'}
              </button>
            </div>

            {/* Informations */}
            <div className="text-white/60 text-xs p-2 bg-white/5 rounded-lg">
              <p className="mb-1">
                <strong>Simple:</strong> Détection basique rapide
              </p>
              <p className={hasMediaPipeError ? 'text-red-400' : 'mb-1'}>
                <strong>IA:</strong> {hasMediaPipeError ? 'Non disponible' : 'MediaPipe avec confiance'}
              </p>
              <p className={hasMediaPipeError ? 'text-red-400' : ''}>
                <strong>Recon:</strong> {hasMediaPipeError ? 'Non disponible' : 'Reconnaissance faciale'}
              </p>
            </div>

            {hasMediaPipeError && (
              <div className="text-red-400 text-xs p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                Modes IA désactivés (erreur MediaPipe)
              </div>
            )}
          </div>
        )}
      </div>

      {/* Composant de détection - position modifiée */}
      {detectionMode === 'simple' ? (
        <FaceDetection
          onFaceDetected={handleFaceDetected}
          isVisible={isVisible}
        />
      ) : detectionMode === 'advanced' ? (
        <AdvancedFaceDetection
          onFaceDetected={handleFaceDetected}
          isVisible={isVisible}
          onError={() => {
            setHasMediaPipeError(true);
            setDetectionMode('simple');
          }}
        />
      ) : (
        <FaceRecognitionDetection
          onFaceDetected={handleFaceDetected}
          onFaceRecognized={handleFaceRecognized}
          isVisible={isVisible}
        />
      )}
    </>
  );
} 