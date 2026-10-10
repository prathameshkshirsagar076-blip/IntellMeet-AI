export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItemData {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  timestamp: number;
}

type ToastListener = (toasts: ToastItemData[]) => void;

class ToastManager {
  private toasts: ToastItemData[] = [];
  private listeners: Set<ToastListener> = new Set();
  private recentMessages: Map<string, number> = new Map();

  private emit() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    listener([...this.toasts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private add(type: ToastType, message: string, duration = 4000): string | null {
    if (!message || !message.trim()) return null;

    const trimmedMsg = message.trim();
    const now = Date.now();

    // Prevent duplicate toasts within 2 seconds
    const key = `${type}:${trimmedMsg}`;
    const lastSeen = this.recentMessages.get(key);
    if (lastSeen && now - lastSeen < 2000) {
      return null;
    }
    this.recentMessages.set(key, now);

    // Clean up recent messages map periodically
    if (this.recentMessages.size > 20) {
      for (const [k, time] of this.recentMessages.entries()) {
        if (now - time > 5000) {
          this.recentMessages.delete(k);
        }
      }
    }

    const id = `toast-${now}-${Math.random().toString(36).substring(2, 7)}`;
    const toastItem: ToastItemData = {
      id,
      type,
      message: trimmedMsg,
      duration,
      timestamp: now,
    };

    // Keep up to 5 simultaneous toasts, newest on top
    this.toasts = [toastItem, ...this.toasts.slice(0, 4)];
    this.emit();

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    return id;
  }

  dismiss(id: string): void {
    const prevLen = this.toasts.length;
    this.toasts = this.toasts.filter((t) => t.id !== id);
    if (this.toasts.length !== prevLen) {
      this.emit();
    }
  }

  clear(): void {
    this.toasts = [];
    this.emit();
  }

  success(message: string, duration?: number): string | null {
    return this.add('success', message, duration);
  }

  error(message: string, duration?: number): string | null {
    return this.add('error', message, duration || 5000);
  }

  warning(message: string, duration?: number): string | null {
    return this.add('warning', message, duration);
  }

  info(message: string, duration?: number): string | null {
    return this.add('info', message, duration);
  }
}

export const toast = new ToastManager();
export default toast;
