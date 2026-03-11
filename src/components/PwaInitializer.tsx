"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export default function PwaInitializer() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // Optionnel : notifier quand un nouveau SW est prêt
        if (registration.waiting) {
          toast.info(
            "Une nouvelle version de l'application est disponible. Recharge la page pour l'appliquer."
          );
        }

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;
          installingWorker.onstatechange = () => {
            if (
              installingWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              toast.info(
                "Une nouvelle version de l'application est disponible. Recharge la page pour l'appliquer."
              );
            }
          };
        };
      } catch (error) {
        // On log simplement en console pour ne rien casser
        console.error(
          "Erreur lors de l'enregistrement du Service Worker PWA:",
          error
        );
      }
    };

    // Enregistrement après le chargement complet de la page
    if (document.readyState === "complete") {
      registerServiceWorker();
    } else {
      window.addEventListener("load", registerServiceWorker, { once: true });
      return () => {
        window.removeEventListener("load", registerServiceWorker);
      };
    }
  }, []);

  return null;
}

