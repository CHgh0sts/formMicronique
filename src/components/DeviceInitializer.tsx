'use client';

import { useEffect } from 'react';

export default function DeviceInitializer() {
  useEffect(() => {
    // Appeler l'API qui s'occupe de créer l'appareil et le cookie si nécessaire
    fetch('/api/device', { method: 'POST' }).catch(() => {
      // On ignore les erreurs ici pour ne pas bloquer l'affichage de l'app
    });
  }, []);

  return null;
}

