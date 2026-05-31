// Bus de eventos centralizado (Observer Pattern)
// Centralized event bus (Observer Pattern)

const listeners = {};

export const eventBus = {
  /**
   * Suscribe un manejador a un evento específico — Subscribes a handler to a specific event
   * @param {string} event - Nombre del evento — Event name
   * @param {Function} handler - Función manejadora — Handler function
   * @returns {Function} Función para desuscribir — Unsubscribe function
   */
  on(event, handler) {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(handler);

    // Retorna función para cancelar la suscripción — Returns function to unsubscribe
    return () => {
      listeners[event] = listeners[event].filter(h => h !== handler);
    };
  },

  /**
   * Emite un evento notificando a todos sus suscriptores — Emits an event notifying all subscribers
   * @param {string} event - Nombre del evento — Event name
   * @param {any} data - Datos asociados al evento — Event associated data
   */
  emit(event, data) {
    if (listeners[event]) {
      listeners[event].forEach(handler => {
        try {
          handler(data);
        } catch (e) {
          // Evita que un manejador roto rompa la ejecución de los demás
          // Prevents a broken handler from breaking others' execution
          console.error('Error in event listener:', e);
        }
      });
    }
  },

  /**
   * Elimina un manejador de un evento — Removes a handler from an event
   * @param {string} event - Nombre del evento — Event name
   * @param {Function} handler - Función manejadora a eliminar — Handler function to remove
   */
  off(event, handler) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(h => h !== handler);
  },
};
