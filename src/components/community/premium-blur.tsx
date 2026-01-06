
import { Button } from "@/components/ui/button";
import { Sparkles, Gem } from "lucide-react";
import Link from 'next/link';

interface PremiumBlurProps {
  children: React.ReactNode;
  isLocked: boolean;
}

export function PremiumBlur({ children, isLocked }: PremiumBlurProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-card z-10 rounded-lg"></div>
      <div className="blur-md pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center p-4">
        <Gem className="w-12 h-12 text-amber-400 mb-4" />
        <h3 className="text-xl font-bold font-headline text-amber-300">Estrategia de Nivel Premium</h3>
        <p className="text-muted-foreground mb-6 max-w-xs text-sm">
          Desbloquea el plan Libertad Total para ver esta solución experta y detallada.
        </p>
        <Button asChild size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:brightness-110">
          <Link href="/dashboard/subscription">
            <Sparkles className="mr-2 h-4 w-4" />
            Ver Planes
          </Link>
        </Button>
      </div>
    </div>
  );
}
