import { useEffect, useState } from 'react';

// Événement propre à Chrome/Android (absent des types DOM standard).
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

/** À appeler au démarrage : enregistre le service worker et capte l'invitation d'installation. */
export function setupPwa() {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });

  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error("Erreur lors de l'enregistrement du service worker:", error);
      });
    });
  }
}

/** Vrai quand le navigateur propose l'installation (Android, Chrome ou Edge sur ordinateur). */
export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(deferredPrompt !== null);

  useEffect(() => {
    const update = () => setCanInstall(deferredPrompt !== null);
    listeners.add(update);
    update();
    return () => {
      listeners.delete(update);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    notify();
  };

  return { canInstall, install };
}
