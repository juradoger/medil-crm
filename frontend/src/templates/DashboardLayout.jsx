// Layout principal del dashboard con TopBar y Sidebar
import React, { useState } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { Sidebar } from '../components/layout/Sidebar';

export function DashboardLayout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TopBar onMenuClick={() => setOpen(o => !o)} />
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
    </>
  );
}
