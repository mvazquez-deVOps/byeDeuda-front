
'use client';

import { AntExpensesAuditor } from './AntExpensesAuditor';
import { QuitRateSimulator } from './QuitRateSimulator';
import { UnseizablePayrollCalculator } from './UnseizablePayrollCalculator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { AlertTriangle } from 'lucide-react';

interface CalculatorEngineProps {
  slug: string;
}

export function CalculatorEngine({ slug }: CalculatorEngineProps) {
  switch (slug) {
    case 'simulador-quitas-reales':
      return <QuitRateSimulator />;
    case 'calculadora-nomina-inembargable':
      return <UnseizablePayrollCalculator />;
    case 'auditor-gastos-hormiga':
      return <AntExpensesAuditor />;
    // Add cases for 'calculadora-bola-nieve-avalancha' and 'presupuesto-de-guerra' when implemented
    default:
      return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertTriangle/> Herramienta no encontrada</CardTitle>
                <CardDescription>La herramienta solicitada no está disponible o no ha sido implementada aún.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>La calculadora para "{slug}" se encuentra en construcción.</p>
            </CardContent>
        </Card>
      );
  }
}
