// Landing Page Promocional y Visual — MedIL
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicLayout } from './PublicLayout';
import { publicApi } from '../../services/backendService';
import { Button } from '../../atoms/Button';
import { Logo } from '../../atoms/Logo';
import { ArrowRight } from 'lucide-react';

const FEATURE_CARDS = [
  {
    title: 'Gestión de Pacientes',
    description: 'Registros completos con historial clínico, fotos de perfil y seguimiento continuo de cada paciente.',
    iconPath: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  },
  {
    title: 'Agenda Inteligente',
    description: 'Control total de citas médicas con validación inteligente de conflictos de horario en tiempo real.',
    iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    title: 'Multiclínica',
    description: 'Administrá múltiples sucursales desde un solo panel con aislamiento seguro de información.',
    iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
  {
    title: 'Historial Clínico',
    description: 'Registro cronológico de diagnósticos, tratamientos y evolución para continuidad médica.',
    iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    title: 'Control de Insumos',
    description: 'Alertas automáticas de stock bajo o crítico para planificar compras sin urgencias.',
    iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
  {
    title: 'Pagos por QR',
    description: 'Cobros más ágiles con códigos QR automáticos y seguimiento financiero en tiempo real.',
    iconPath: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z',
  },
];

const START_STEPS = [
  {
    title: 'Registrá tu clínica',
    description: 'Afiliá tu sucursal a MedIL y configurá tu equipo de especialistas en minutos.',
  },
  {
    title: 'Gestioná citas y pacientes',
    description: 'Centralizá agenda, fichas médicas y seguimiento clínico en un solo flujo de trabajo.',
  },
  {
    title: 'Crecé con datos',
    description: 'Medí resultados, optimizá tiempos y tomá decisiones con reportes accionables.',
  },
];

const HERO_STATS = [
  { value: 3, suffix: '+', label: 'Sucursales' },
  { value: 6, suffix: '', label: 'Especialistas' },
  { value: 90, suffix: '+', label: 'Pacientes' },
];

const KPI_STATS = [
  { value: 3, suffix: '', label: 'Sucursales activas' },
  { value: 6, suffix: '', label: 'Especialistas médicos' },
  { value: 90, suffix: '+', label: 'Pacientes registrados' },
  { value: 66, suffix: '', label: 'Citas gestionadas' },
];

function Counter({ value, suffix = '', duration = 1300, className = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let frameId = 0;

    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - ((1 - progress) ** 3);
      setCount(Math.round(value * eased));
      if (progress < 1) {
        frameId = requestAnimationFrame(update);
      }
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  return <span className={className}>{count}{suffix}</span>;
}

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
    <PublicLayout fullBleed>
      <style>{`
        .btn-float {
          animation: btn-float 3s ease-in-out infinite;
        }
        .feature-pop {
          opacity: 0;
          transform: translateY(22px) scale(0.98);
          animation: feature-pop 700ms ease-out forwards;
        }
        .neon-soft {
          text-shadow: 0 0 10px rgba(0, 180, 216, 0.45), 0 0 22px rgba(255, 255, 255, 0.35);
        }
        .neon-title {
          text-shadow: 0 0 14px rgba(0, 180, 216, 0.55), 0 0 30px rgba(255, 255, 255, 0.35);
        }
        .card-glow {
          box-shadow: 0 10px 25px rgba(14, 74, 138, 0.14), 0 0 0 1px rgba(0, 180, 216, 0.25), 0 0 20px rgba(0, 180, 216, 0.25);
        }
        .stat-zoom {
          animation: stat-zoom 1100ms ease-out both;
        }
        .step-dot {
          animation: step-cycle 3.2s ease-in-out infinite;
        }
        .step-dot-delay-1 {
          animation-delay: 0.7s;
        }
        .step-dot-delay-2 {
          animation-delay: 1.4s;
        }
        .flow-step::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 1.1rem;
          border: 1px solid rgba(0, 180, 216, 0.35);
          opacity: 0.45;
        }
        .flow-step::after {
          content: '';
          position: absolute;
          right: -52px;
          top: 50%;
          width: 40px;
          height: 2px;
          background: linear-gradient(90deg, rgba(0, 180, 216, 0.9), rgba(0, 180, 216, 0.1));
          transform: translateY(-50%);
        }
        .flow-step:last-child::after {
          display: none;
        }
        @media (max-width: 767px) {
          .flow-step::after {
            display: none;
          }
        }
        @keyframes btn-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes feature-pop {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes stat-zoom {
          0% {
            opacity: 0;
            transform: scale(0.78);
          }
          70% {
            opacity: 1;
            transform: scale(1.08);
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes step-cycle {
          0%, 65%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 rgba(0, 180, 216, 0.0);
          }
          30% {
            transform: scale(1.14);
            box-shadow: 0 0 18px rgba(0, 180, 216, 0.5), 0 0 10px rgba(255, 255, 255, 0.35);
          }
        }
      `}</style>

      <div className="w-full min-h-full bg-white">
        {/* SECCIÓN 1 — Hero animado */}
        <section
          className="min-h-[calc(100vh-64px)] py-14 md:py-24 flex items-center relative overflow-hidden"
          style={{ backgroundImage: "url('/fondo.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0E4A8A]/90 via-[#0E4A8A]/80 to-[#0096B4]/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E4A8A]/85 via-transparent to-[#0096B4]/45" />
          <div className="relative z-10 w-full max-w-6xl mx-auto px-4">
            <div className="space-y-7 text-left max-w-4xl">
              <span className="neon-soft text-[#90E0EF] px-0 py-1 text-sm md:text-base tracking-wide">
                Sistema de gestión clínica
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-[1.05]">
                La plataforma médica que
                {' '}
                <span className="neon-title text-[#90E0EF] text-5xl md:text-7xl block md:inline">Bolivia</span>
                {' '}
                necesitaba
              </h1>
              <p className="text-base md:text-xl text-slate-200 max-w-2xl leading-relaxed">
                Gestión integral de clínicas, médicos, pacientes y citas en una sola plataforma. Multiclínica, escalable y diseñada para el sector salud boliviano.
              </p>

              {/* Stats rápidos */}
              <div className="flex items-center gap-6 pt-4 border-t border-[#90E0EF]/30 mt-6 max-w-md">
                {HERO_STATS.map((stat, index) => (
                  <React.Fragment key={stat.label}>
                    <div className="flex-1 text-center md:text-left">
                      <p className="stat-zoom text-3xl font-bold text-[#90E0EF] neon-title">
                        <Counter value={stat.value} suffix={stat.suffix} duration={900 + (index * 180)} />
                      </p>
                      <p className="text-xs text-slate-300">{stat.label}</p>
                    </div>
                    {index < HERO_STATS.length - 1 && <div className="h-8 w-px bg-white/20" />}
                  </React.Fragment>
                ))}
              </div>

              {/* Botones de acción */}
              <div className="flex gap-4 pt-4 flex-wrap">
                <div className="btn-float">
                  <Button
                    label="Comenzar gratis"
                    iconRight={ArrowRight}
                    size="lg"
                    onClick={() => navigate('/registro')}
                  />
                </div>
                <a
                  href="#clinicas"
                  className="px-6 py-3 text-base font-semibold text-[#90E0EF] border border-[#90E0EF]/60 rounded-xl hover:bg-[#90E0EF]/15 hover:-translate-y-0.5 transition-all inline-flex items-center justify-center shadow-sm"
                >
                  Ver clínicas
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 2 — Características del sistema */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto text-center space-y-4 px-4">
            <h2 className="text-3xl md:text-5xl font-extrabold text-navy">
              Todo lo que tu clínica
              {' '}
              <span className="text-[#00B4D8] neon-title">necesita</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Desde la gestión de pacientes hasta el control de insumos, MedIL centraliza toda la operación de tu clínica.
            </p>
          </div>

          <div className="max-w-6xl mx-auto px-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {FEATURE_CARDS.map((feature, index) => (
              <div
                key={feature.title}
                className="card-glow feature-pop flex flex-col items-start text-left p-6 bg-white/95 rounded-2xl border border-primary/10 hover:border-primary/35 hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="bg-primary/10 text-primary p-3 rounded-full h-12 w-12 flex items-center justify-center shadow-[0_6px_20px_rgba(0,180,216,0.2)]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={feature.iconPath} />
                  </svg>
                </div>
                <h3 className="font-bold text-navy mt-4 text-xl">{feature.title}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECCIÓN 3 — Cómo funciona */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto text-center mb-16 px-4">
            <h2 className="text-4xl md:text-6xl font-extrabold text-navy">
              Tres pasos para
              {' '}
              <span className="text-[#00B4D8] neon-title">empezar</span>
            </h2>
            <p className="mt-4 text-gray-600">Visualizá el flujo completo como una demo guiada de adopción.</p>
          </div>

          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8 relative">
            {START_STEPS.map((step, index) => (
              <div
                key={step.title}
                className="flow-step feature-pop relative flex flex-col items-center text-center space-y-4 bg-white rounded-2xl px-6 py-8 border border-primary/20 shadow-[0_12px_28px_rgba(8,20,32,0.45)]"
                style={{ animationDelay: `${index * 180}ms` }}
              >
                <div className={`bg-[#00B4D8] text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-md shadow-primary/20 step-dot ${index === 1 ? 'step-dot-delay-1' : ''} ${index === 2 ? 'step-dot-delay-2' : ''}`}>
                  {index + 1}
                </div>
                <h3 className="font-bold text-navy text-xl">{step.title}</h3>
                <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECCIÓN 4 — Clínicas afiliadas */}
        <section id="clinicas" className="py-20 bg-white space-y-6">
          <div className="max-w-4xl mx-auto text-center space-y-3 px-4">
            <h2 className="text-3xl md:text-5xl font-extrabold text-navy">Clínicas afiliadas a MedIL</h2>
            <p className="text-lg text-gray-600">Encontrá atención médica de calidad en Bolivia</p>
          </div>

          {loading && (
            <div className="flex justify-center py-12" aria-label="loading-spinner">
              <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && <p className="text-center text-red-500 font-medium py-6">{error}</p>}

          {!loading && !error && branches.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-gray-200 max-w-md mx-auto">
              <p className="text-base font-semibold">No hay clínicas registradas</p>
              <p className="text-xs mt-1">Volvé a intentar más tarde.</p>
            </div>
          )}

          {!loading && branches.length > 0 && (
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
              {branches.map(b => (
                <div
                  key={b.id}
                  onClick={() => navigate(`/clinica/${b.id}`)}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
                >
                  {/* Portada */}
                  <div className="h-52 bg-gradient-to-br from-primary/20 to-navy/10 relative flex items-center justify-center">
                    {b.coverPhoto ? (
                      <img src={b.coverPhoto} alt={b.name} className="w-full h-full object-cover" />
                    ) : (
                      <Logo className="text-3xl opacity-50" />
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="p-6 flex flex-col flex-1 justify-between">
                    <div className="space-y-2 text-left">
                      <h3 className="text-lg font-bold text-navy truncate">{b.name}</h3>
                      
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
                      <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-primary text-sm font-semibold bg-primary/10 border border-primary/20 transition-all hover:bg-primary hover:text-white">
                        Ver clínica
                        <ArrowRight size={15} strokeWidth={2.25} aria-hidden />
                      </span>
                      <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5">
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
        <section className="py-20 px-4 bg-white text-center border-y border-primary/10">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {KPI_STATS.map((stat, index) => (
              <div key={stat.label} className="space-y-2">
                <p className="stat-zoom text-5xl font-bold text-[#00B4D8] neon-title">
                  <Counter value={stat.value} suffix={stat.suffix} duration={1000 + (index * 220)} />
                </p>
                <p className="text-sm text-gray-600 font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECCIÓN 6 — CTA final */}
        <section className="py-20 bg-white text-center space-y-6 px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold text-navy">¿Sos profesional de la salud?</h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
            Afiliá tu clínica a MedIL y comenzá a gestionar pacientes, citas y más desde el primer día.
          </p>

          <div className="flex gap-4 pt-4 justify-center flex-wrap">
            <div className="btn-float">
              <Button
                label="Registrarse gratis"
                size="lg"
                onClick={() => navigate('/registro')}
              />
            </div>
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}
              className="px-6 py-3 text-base font-semibold text-[#00B4D8] border border-[#00B4D8]/60 rounded-xl hover:bg-[#00B4D8]/10 hover:-translate-y-0.5 transition-all inline-flex items-center justify-center"
            >
              Iniciar sesión
            </a>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
