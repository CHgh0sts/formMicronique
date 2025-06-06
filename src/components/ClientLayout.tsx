'use client';

import React from 'react';
import FaceDetectionController from './FaceDetectionController';

export default function ClientLayout() {
  const handleFaceDetected = (faceCount: number) => {
    console.log(`${faceCount} visage(s) détecté(s)`);
  };

  const handleFaceRecognized = (result: any) => {
    console.log('Reconnaissance faciale globale:', result);
    // Ici on pourrait déclencher des actions globales
    // comme des notifications, logs, etc.
  };

  return (
    <FaceDetectionController 
      onFaceDetected={handleFaceDetected}
      onFaceRecognized={handleFaceRecognized}
    />
  );
} 