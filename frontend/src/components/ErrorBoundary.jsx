// Componente ErrorBoundary para capturar errores de renderizado
// ErrorBoundary component to catch rendering errors

import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el estado para que el siguiente renderizado muestre la UI de fallback
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Podríamos reportar el error a un servicio de telemetría aquí
    // We could report the error to a telemetry service here
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-app flex flex-col items-center justify-center p-6 font-sans">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-8 max-w-md w-full text-center space-y-6">
            
            {/* Ícono de error premium */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold text-gray-800">Algo salió mal</h1>
              <p className="text-sm text-gray-500">
                La aplicación experimentó un error inesperado en este módulo.
              </p>
            </div>

            {/* Caja de debug (solo para desarrollo/administradores) */}
            <div className="text-left bg-gray-50 p-4 rounded-xl border border-gray-100 overflow-x-auto max-h-40">
              <code className="text-xs text-red-600 font-mono break-all">
                {this.state.error?.toString() || 'Error desconocido'}
              </code>
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-3 px-6 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all duration-200 shadow-lg shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
