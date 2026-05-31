// Hook para escuchar eventos y mostrar notificaciones Toast
// Hook to listen to events and show Toast notifications

import { useState, useEffect } from 'react';
import { eventBus } from '../core/eventBus';
import { MESSAGES } from '../core/messages';

export function useToast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Escucha eventos específicos del negocio para mostrar Toasts automáticos
    // Listens to specific business events to show automatic Toasts
    const unsubs = [
      eventBus.on('payment:approved', () => {
        setToast({ message: MESSAGES.success.paymentApproved, type: 'success' });
      }),
      eventBus.on('payment:rejected', (data) => {
        setToast({ message: data?.error || MESSAGES.error.payment.rejected, type: 'error' });
      }),
      eventBus.on('toast:show', ({ message, type = 'info' }) => {
        setToast({ message, type });
      })
    ];

    // Limpieza de todos los listeners al desmontar — Clean up all listeners on unmount
    return () => {
      unsubs.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  return { toast, setToast };
}
