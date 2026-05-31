// Página de inicio pública — lista de clínicas afiliadas
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from './PublicLayout';
import { publicApi } from '../../services/backendService';

function ClinicCard({ branch }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-40 bg-gradient-to-br from-[#CAF0F8] to-[#90E0EF] flex items-center justify-center overflow-hidden">
        {branch.coverPhoto
          ? <img src={branch.coverPhoto} alt={branch.name} className="w-full h-full object-cover" />
          : <span className="text-4xl font-bold text-[#0096B4] opacity-30">{branch.name.charAt(0)}</span>
        }
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 truncate">{branch.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{branch.city}</p>
        <p className="text-xs text-gray-400 mt-1">{branch.address}</p>
        <Link
          to={`/clinica/${branch.id}`}
          className="mt-3 block text-center px-4 py-2 text-sm font-medium text-white bg-[#00B4D8] rounded-lg hover:bg-[#0096B4] transition-colors"
        >
          Ver clínica
        </Link>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [branches, setBranches] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    publicApi.getBranches()
      .then(res => setBranches(res.branches ?? []))
      .catch(() => setError('No se pudo cargar la lista de clínicas'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="text-center py-16 space-y-6">
        <div className="flex justify-center">
          <span className="text-6xl font-extrabold text-[#00B4D8]">MedIL</span>
        </div>
        <h1 className="text-3xl font-bold text-[#0E4A8A]">
          Gestión clínica moderna para Bolivia
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Encuentra tu clínica y agenda tu cita en minutos
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a
            href="#clinicas"
            className="px-6 py-3 text-sm font-medium text-white bg-[#00B4D8] rounded-lg hover:bg-[#0096B4] transition-colors"
          >
            Ver clínicas
          </a>
          <Link
            to="/registro"
            className="px-6 py-3 text-sm font-medium text-[#00B4D8] border border-[#00B4D8] rounded-lg hover:bg-[#CAF0F8] transition-colors"
          >
            Registrarse
          </Link>
        </div>
      </section>

      {/* Clínicas afiliadas */}
      <section id="clinicas" className="space-y-6 pb-12">
        <h2 className="text-2xl font-bold text-[#0E4A8A]">Clínicas afiliadas</h2>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 border-4 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && branches.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg font-medium">No hay clínicas registradas</p>
            <p className="text-sm mt-1">Volvé a intentar más tarde</p>
          </div>
        )}

        {!loading && branches.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map(b => <ClinicCard key={b.id} branch={b} />)}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
