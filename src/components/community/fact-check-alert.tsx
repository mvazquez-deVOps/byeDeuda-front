
import { AlertTriangle } from 'lucide-react';

interface FactCheckAlertProps {
  message: string;
}

export function FactCheckAlert({ message }: FactCheckAlertProps) {
  return (
    <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-bold">Contexto del Sistema: Información Imprecisa</h4>
          <p className="text-sm text-destructive/80">{message}</p>
        </div>
      </div>
    </div>
  );
}
