
'use client';

import { stopImpersonation } from '@/app/actions';
import { Button } from '../ui/button';
import { AlertTriangle, LogOut } from 'lucide-react';

interface ImpersonationBannerProps {
  userName?: string;
}

export default function ImpersonationBanner({ userName }: ImpersonationBannerProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-amber-500 text-white p-3 flex items-center justify-center gap-4 shadow-2xl">
      <AlertTriangle className="h-6 w-6" />
      <div className="text-center">
        <p className="font-bold">MODO SUPLANTACIÓN ACTIVO</p>
        <p className="text-sm">Estás navegando como: {userName || 'Usuario Desconocido'}</p>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => stopImpersonation()}
        className="bg-white/90 text-amber-600 hover:bg-white"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Salir del Modo Espejo
      </Button>
    </div>
  );
}
