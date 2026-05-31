// Detalle de una clínica pública
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublicLayout } from './PublicLayout';
import { publicApi } from '../../services/backendService';
import { useAuth } from '../../context/AuthContext';

function ProfessionalCard({ professional }) {
  const initials = professional.fullName
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
      {professional.photoUrl
        ? <img src={professional.photoUrl} alt={professional.fullName}
            className="h-14 w-14 rounded-full object-cover flex-shrink-0" />
        : <div className="h-14 w-14 rounded-full bg-[#CAF0F8] flex items-center justify-center flex-shrink-0">
            <span className="text-[#0096B4] font-bold text-lg">{initials}</span>
          </div>
      }
      <div>
        <p className="font-semibold text-gray-800">{professional.fullName}</p>
        <p className="text-sm text-[#00B4D8]">{professional.specialty}</p>
        {professional.bio && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{professional.bio}</p>}
      </div>
    </div>
  );
}

export default function ClinicDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  const [branch,        setBranch]        = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');

  useEffect(() => {
    publicApi.getBranchById(id)
      .then(res => {
        setBranch(res.branch);
        setProfessionals(res.professionals ?? []);
      })
      .catch(() => setError('No se pudo cargar la información de la clínica'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <PublicLayout>
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 border-4 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
      </div>
    </PublicLayout>
  );

  if (error || !branch) return (
    <PublicLayout>
      <div className="text-center py-24 space-y-3">
        <p className="text-lg text-gray-500">{error || 'Clínica no encontrada'}</p>
        <Link to="/portal" className="text-[#00B4D8] hover:underline text-sm">← Volver al portal</Link>
      </div>
    </PublicLayout>
  );

  const photos = [branch.photo1, branch.photo2, branch.photo3].filter(Boolean);

  return (
    <PublicLayout>
      <Link to="/portal" className="text-sm text-[#00B4D8] hover:underline mb-6 inline-block">
        ← Volver al portal
      </Link>

      {/* Header de la clínica */}
      <div className="rounded-2xl overflow-hidden mb-8">
        <div className="h-56 bg-gradient-to-br from-[#00B4D8] to-[#0E4A8A] relative flex items-end">
          {branch.coverPhoto && (
            <img src={branch.coverPhoto} alt={branch.name}
              className="absolute inset-0 w-full h-full object-cover opacity-80" />
          )}
          <div className="relative p-6 text-white">
            <h1 className="text-2xl font-bold drop-shadow">{branch.name}</h1>
            <p className="text-sm mt-1 opacity-90">{branch.city} · {branch.phone}</p>
          </div>
        </div>
      </div>

      {/* Galería de fotos */}
      {photos.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Galería</h2>
          <div className="grid grid-cols-3 gap-3">
            {photos.map((p, i) => (
              <img key={i} src={p} alt={`Foto ${i + 1}`}
                className="rounded-xl h-40 w-full object-cover" />
            ))}
          </div>
        </section>
      )}

      {/* Descripción */}
      {branch.description && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Sobre la clínica</h2>
          <p className="text-gray-600 leading-relaxed">{branch.description}</p>
        </section>
      )}

      {/* Equipo médico */}
      {professionals.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Nuestro equipo médico</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {professionals.map(p => <ProfessionalCard key={p.id} professional={p} />)}
          </div>
        </section>
      )}

      {/* CTA */}
      <div className="text-center py-6 bg-[#CAF0F8] rounded-2xl">
        <p className="text-gray-700 font-medium mb-4">¿Querés agendar una cita?</p>
        {isAuthenticated
          ? <Link to="/patient/portal"
              className="px-6 py-3 text-sm font-medium text-white bg-[#00B4D8] rounded-lg hover:bg-[#0096B4] transition-colors">
              Ir a mi portal
            </Link>
          : <Link to="/registro"
              className="px-6 py-3 text-sm font-medium text-white bg-[#00B4D8] rounded-lg hover:bg-[#0096B4] transition-colors">
              Registrarse para agendar
            </Link>
        }
      </div>
    </PublicLayout>
  );
}
