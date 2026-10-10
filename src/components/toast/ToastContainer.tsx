import React, { useState, useEffect } from 'react';
import type { ToastItemData } from './toast';
import { toast } from './toast';
import ToastItem from './ToastItem';
import './toast.css';

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItemData[]>([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe((items) => {
      setToasts(items);
    });
    return unsubscribe;
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="im-global-toast-container" aria-live="polite">
      {toasts.map((item) => (
        <ToastItem key={item.id} toast={item} />
      ))}
    </div>
  );
};

export default ToastContainer;
