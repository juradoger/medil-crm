// Landing Page Promocional y Visual — MedIL
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicLayout } from './PublicLayout';
import { publicApi } from '../../services/backendService';
import { Button } from '../../atoms/Button';
import { StatusBadge } from '../../molecules/StatusBadge';
import { Logo } from '../../atoms/Logo';

export default function LandingPage() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    publicApi.getBranches()
      .then(res => setBranches(res.branches ?? []))
      .catch(() => setError('No se pudo cargar la lista de clínicas'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      {/* SECCIÓN 1 — Hero animado */}
      <section className="min-h-[calc(100vh-64px)] py-12 md:py-20 flex items-center bg-gradient-to-br from-[#00B4D8]/5 via-white to-[#0E4A8A]/5">
        <div className="grid md:grid-cols-12 gap-12 items-center w-full">
          {/* Columna Izquierda: Texto */}
          <div className="md:col-span-7 space-y-6 text-left">
            <span className="bg-[#00B4D8]/10 text-[#00B4D8] rounded-full px-4 py-1.5 text-sm font-medium inline-flex items-center gap-2 animate-pulse">
              ✦ Sistema de gestión clínica
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-[#0E4A8A] leading-tight">
              La plataforma médica que <span className="text-[#00B4D8]">Bolivia</span> necesitaba
            </h1>
            <p className="text-lg md:text-xl text-gray-500 max-w-lg leading-relaxed">
              Gestión integral de clínicas, médicos, pacientes y citas en una sola plataforma. Multiclínica, escalable y diseñada para el sector salud boliviano.
            </p>

            {/* Stats rápidos */}
            <div className="flex items-center gap-6 pt-4 border-t border-gray-100 mt-6 max-w-md">
              <div className="flex-1 text-center md:text-left">
                <p className="text-3xl font-bold text-[#0E4A8A]">3+</p>
                <p className="text-xs text-gray-500">Sucursales</p>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div className="flex-1 text-center md:text-left">
                <p className="text-3xl font-bold text-[#0E4A8A]">6</p>
                <p className="text-xs text-gray-500">Especialistas</p>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div className="flex-1 text-center md:text-left">
                <p className="text-3xl font-bold text-[#0E4A8A]">90+</p>
                <p className="text-xs text-gray-500">Pacientes</p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-4 pt-4 flex-wrap">
              <Button
                label="Comenzar gratis →"
                size="lg"
                onClick={() => navigate('/registro')}
              />
              <a
                href="#clinicas"
                className="px-6 py-3 text-base font-medium text-[#00B4D8] border border-[#00B4D8] rounded-lg hover:bg-[#00B4D8]/10 transition-colors inline-flex items-center justify-center"
              >
                Ver clínicas
              </a>
            </div>
          </div>

          {/* Columna Derecha: Visual */}
          <div className="md:col-span-5 flex justify-center">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 max-w-sm w-full space-y-6 hover:shadow-primary/5 transition-shadow hover:border-[#00B4D8]/20 duration-300">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Dashboard Demo</p>
                <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
              </div>

              {/* Mini cards en grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F9FAFB] rounded-xl p-3 border border-gray-100">
                  <p className="text-2xl font-bold text-[#0E4A8A]">90</p>
                  <p className="text-[10px] text-gray-500">Pacientes activos</p>
                </div>
                <div className="bg-[#F9FAFB] rounded-xl p-3 border border-gray-100">
                  <p className="text-2xl font-bold text-[#00B4D8]">12</p>
                  <p className="text-[10px] text-gray-500">Citas programadas hoy</p>
                </div>
              </div>

              {/* Lista ficticia de citas */}
              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-gray-600">Próximas consultas</p>
                
                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="text-xs font-medium text-gray-800">08:30 · Carlos Mercado</p>
                    <p className="text-[10px] text-gray-400">Cardiología · Control</p>
                  </div>
                  <StatusBadge status="scheduled" />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="text-xs font-medium text-gray-800">10:00 · Elena Rojas</p>
                    <p className="text-[10px] text-gray-400">Pediatría · Primera cita</p>
                  </div>
                  <StatusBadge status="scheduled" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2 — Características del sistema */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-3xl font-bold text-[#0E4A8A]">Todo lo que tu clínica necesita</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Desde la gestión de pacientes hasta el control de insumos, MedIL centraliza toda la operación de tu clínica.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {/* Feature 1 */}
          <div className="flex flex-col items-start text-left p-6 bg-[#F9FAFB] rounded-2xl border border-gray-50 hover:border-[#00B4D8]/20 transition-all duration-300">
            <div className="bg-[#00B4D8]/10 text-[#00B4D8] p-3 rounded-full h-12 w-12 flex items-center justify-center">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mt-4 text-base">Gestión de Pacientes</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Registros completos con historial clínico, fotos de perfil y seguimiento continuo de cada paciente.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-start text-left p-6 bg-[#F9FAFB] rounded-2xl border border-gray-50 hover:border-[#00B4D8]/20 transition-all duration-300">
            <div className="bg-[#00B4D8]/10 text-[#00B4D8] p-3 rounded-full h-12 w-12 flex items-center justify-center">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mt-4 text-base">Agenda Inteligente</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Control total de citas médicas con validación inteligente de conflictos de horario en tiempo real.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-start text-left p-6 bg-[#F9FAFB] rounded-2xl border border-gray-50 hover:border-[#00B4D8]/20 transition-all duration-300">
            <div className="bg-[#00B4D8]/10 text-[#00B4D8] p-3 rounded-full h-12 w-12 flex items-center justify-center">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mt-4 text-base">Multiclínica</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Administrá múltiples sucursales desde un solo panel. Cada clínica cuenta con su propio aislamiento de datos.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="flex flex-col items-start text-left p-6 bg-[#F9FAFB] rounded-2xl border border-gray-50 hover:border-[#00B4D8]/20 transition-all duration-300">
            <div className="bg-[#00B4D8]/10 text-[#00B4D8] p-3 rounded-full h-12 w-12 flex items-center justify-center">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mt-4 text-base">Historial Clínico</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Registro cronológico inmutable de diagnósticos, tratamientos y evolución clínica del paciente.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="flex flex-col items-start text-left p-6 bg-[#F9FAFB] rounded-2xl border border-gray-50 hover:border-[#00B4D8]/20 transition-all duration-300">
            <div className="bg-[#00B4D8]/10 text-[#00B4D8] p-3 rounded-full h-12 w-12 flex items-center justify-center">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mt-4 text-base">Control de Insumos</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Alertas automáticas de stock bajo o crítico. Planificá compras antes de quedarte sin suministros médicos.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="flex flex-col items-start text-left p-6 bg-[#F9FAFB] rounded-2xl border border-gray-50 hover:border-[#00B4D8]/20 transition-all duration-300">
            <div className="bg-[#00B4D8]/10 text-[#00B4D8] p-3 rounded-full h-12 w-12 flex items-center justify-center">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mt-4 text-base">Pagos por QR</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Generación de códigos QR automáticos con comisiones bajas. Integrado con pasarelas bancarias locales.
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3 — Cómo funciona */}
      <section className="py-20 bg-[#F9FAFB]">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-[#0E4A8A]">Tres pasos para empezar</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Paso 1 */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-[#00B4D8] text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-md shadow-[#00B4D8]/20">
              1
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">Registrá tu clínica</h3>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              Afiliá tu sucursal a MedIL y configurá tu equipo de especialistas médicos en minutos.
            </p>
          </div>

          {/* Paso 2 */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-[#00B4D8] text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-md shadow-[#00B4D8]/20">
              2
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">Gestioná pacientes y citas</h3>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              Registrá fichas de pacientes, agendá citas médicas y llevá el historial clínico digital de forma integrada.
            </p>
          </div>

          {/* Paso 3 */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-[#00B4D8] text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-md shadow-[#00B4D8]/20">
              3
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">Crecé con datos</h3>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              Analizá reportes de desempeño, cobrá con pasarelas de pago QR y controlá stock crítco de insumos.
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN 4 — Clínicas afiliadas */}
      <section id="clinicas" className="py-20 bg-white space-y-6">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <h2 className="text-3xl font-bold text-[#0E4A8A]">Clínicas afiliadas a MedIL</h2>
          <p className="text-lg text-gray-500">Encontrá atención médica de calidad en Bolivia</p>
        </div>

        {loading && (
          <div className="flex justify-center py-12" aria-label="loading-spinner">
            <div className="h-10 w-10 border-4 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && <p className="text-center text-red-500 font-medium py-6">{error}</p>}

        {!loading && !error && branches.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200 max-w-md mx-auto">
            <p className="text-base font-semibold">No hay clínicas registradas</p>
            <p className="text-xs mt-1">Volvé a intentar más tarde.</p>
          </div>
        )}

        {!loading && branches.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {branches.map(b => (
              <div
                key={b.id}
                onClick={() => navigate(`/clinica/${b.id}`)}
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
              >
                {/* Portada */}
                <div className="h-52 bg-gradient-to-br from-[#00B4D8]/20 to-[#0E4A8A]/10 relative flex items-center justify-center">
                  {b.coverPhoto ? (
                    <img src={b.coverPhoto} alt={b.name} className="w-full h-full object-cover" />
                  ) : (
                    <Logo className="text-3xl opacity-50" />
                  )}
                </div>

                {/* Contenido */}
                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div className="space-y-2 text-left">
                    <h3 className="text-lg font-bold text-[#0E4A8A] truncate">{b.name}</h3>
                    
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {b.city}
                    </p>
                    
                    {b.description && (
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                        {b.description}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-gray-100 mt-5 pt-4 flex items-center justify-between">
                    <span className="text-[#00B4D8] text-sm font-semibold hover:underline">
                      Ver clínica →
                    </span>
                    <span className="bg-[#00B4D8]/10 text-[#00B4D8] text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5">
                      Medicina
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECCIÓN 5 — Testimonios / Stats */}
      <section className="py-20 -mx-4 px-4 bg-gradient-to-r from-[#0E4A8A] to-[#00B4D8] text-white text-center">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-2">
            <p className="text-5xl font-bold">3</p>
            <p className="text-sm opacity-80 font-medium">Sucursales activas</p>
          </div>
          <div className="space-y-2">
            <p className="text-5xl font-bold">6</p>
            <p className="text-sm opacity-80 font-medium">Especialistas médicos</p>
          </div>
          <div className="space-y-2">
            <p className="text-5xl font-bold">90+</p>
            <p className="text-sm opacity-80 font-medium">Pacientes registrados</p>
          </div>
          <div className="space-y-2">
            <p className="text-5xl font-bold">66</p>
            <p className="text-sm opacity-80 font-medium">Citas gestionadas</p>
          </div>
        </div>
      </section>

      {/* SECCIÓN 6 — CTA final */}
      <section className="py-20 bg-white text-center space-y-6">
        <h2 className="text-3xl font-bold text-[#0E4A8A]">¿Sos profesional de la salud?</h2>
        <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
          Afiliá tu clínica a MedIL y comenzá a gestionar pacientes, citas y más desde el primer día.
        </p>

        <div className="flex gap-4 pt-4 justify-center flex-wrap">
          <Button
            label="Registrarse gratis"
            size="lg"
            onClick={() => navigate('/registro')}
          />
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
            className="px-6 py-3 text-base font-medium text-[#00B4D8] border border-[#00B4D8] rounded-lg hover:bg-[#00B4D8]/10 transition-colors inline-flex items-center justify-center"
          >
            Iniciar sesión
          </a>
        </div>
      </section>
    </PublicLayout>
  );
}
