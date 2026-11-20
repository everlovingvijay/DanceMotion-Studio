export interface PwaStatus {
  isRegistered: boolean;
  isOfflineReady: boolean;
  isOnline: boolean;
  hasUpdate: boolean;
}

type PwaListener = (status: PwaStatus) => void;

class PwaService {
  private registration: ServiceWorkerRegistration | null = null;

  public getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }
  private listeners: Set<PwaListener> = new Set();
  private status: PwaStatus = {
    isRegistered: false,
    isOfflineReady: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    hasUpdate: false,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.updateOnlineStatus(true));
      window.addEventListener('offline', () => this.updateOnlineStatus(false));
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener({ ...this.status }));
  }

  private updateOnlineStatus(online: boolean) {
    this.status.isOnline = online;
    this.notify();
  }

  public subscribe(listener: PwaListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.status });
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async register(base = './'): Promise<void> {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    try {
      // In development mode, service workers can sometimes interfere with hot module reload
      // But we still register gracefully
      const swUrl = `${base.replace(/\/$/, '')}/sw.js`;
      const reg = await navigator.serviceWorker.register(swUrl, { scope: base });
      this.registration = reg;
      this.status.isRegistered = true;
      this.status.isOfflineReady = !!reg.active;

      reg.onupdatefound = () => {
        const installingWorker = reg.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                this.status.hasUpdate = true;
              } else {
                this.status.isOfflineReady = true;
              }
              this.notify();
            }
          };
        }
      };

      this.notify();
    } catch (err) {
      console.warn('PWA ServiceWorker registration failed:', err);
    }
  }

  public async clearCacheAndData(): Promise<boolean> {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      if ('indexedDB' in window) {
        // Clear any indexedDB databases if present
        // (IndexedDB databases can be enumerated where supported)
      }

      return true;
    } catch (err) {
      console.error('Failed to clear cache:', err);
      return false;
    }
  }
}

export const pwaService = new PwaService();
