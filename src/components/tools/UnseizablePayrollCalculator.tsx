
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from 'recharts';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

const MINIMUM_WAGE = {
  general: 248.93,
  frontera: 374.89,
};
const UMA = 108.57;

const formatCurrency = (value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

export function UnseizablePayrollCalculator() {
  const [monthlySalary, setMonthlySalary] = useState(15000);
  const [zone, setZone] = useState<'general' | 'frontera'>('general');

  const calculation = useMemo(() => {
    const dailySalary = monthlySalary / 30;
    const dailyMinWage = MINIMUM_WAGE[zone];
    
    // According to LFT art. 112, the first minimum wage is unseizable.
    let unseizableDailyAmount = dailyMinWage;
    let atRiskDailyAmount = 0;

    if (dailySalary > dailyMinWage) {
      const exceedance = dailySalary - dailyMinWage;
      const seizablePortion = exceedance * 0.30; // Only 30% of the exceedance is seizable
      atRiskDailyAmount = seizablePortion;
      unseizableDailyAmount = dailySalary - seizablePortion;
    } else {
        // If salary is less than or equal to minimum wage, it's all unseizable
        unseizableDailyAmount = dailySalary;
    }

    return {
      unseizable: unseizableDailyAmount * 30,
      atRisk: atRiskDailyAmount * 30,
    };
  }, [monthlySalary, zone]);

  const chartData = [
    { name: 'Monto Intocable', value: calculation.unseizable },
    { name: 'Monto en Riesgo (Máx. 30% del excedente)', value: calculation.atRisk },
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle>Calculadora de Nómina Inembargable</CardTitle>
          <CardDescription>Descubre qué parte de tu sueldo está protegida por la Ley Federal del Trabajo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <Label htmlFor="salary-slider">Salario Mensual Neto: {formatCurrency(monthlySalary)}</Label>
            <Slider
              id="salary-slider"
              min={3000}
              max={100000}
              step={500}
              value={[monthlySalary]}
              onValueChange={(value) => setMonthlySalary(value[0])}
              className="mt-4"
            />
          </div>
          <div>
            <Label htmlFor="zone-select">Zona Geográfica</Label>
            <Select value={zone} onValueChange={(value: 'general' | 'frontera') => setZone(value)}>
              <SelectTrigger id="zone-select"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Zona General del País</SelectItem>
                <SelectItem value="frontera">Zona Libre de la Frontera Norte</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultado del Análisis Legal</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-center p-6 bg-primary/10 rounded-lg border border-primary/20 mb-6 flex items-center justify-center gap-4">
                <ShieldCheck className="w-10 h-10 text-primary flex-shrink-0" />
                <div>
                    <p className="text-sm text-primary">Tu Sueldo Intocable por Ley</p>
                    <p className="text-5xl font-bold text-primary">{formatCurrency(calculation.unseizable)}</p>
                </div>
            </div>
            
            <div className="text-center p-4 bg-destructive/10 rounded-lg border border-destructive/20 mb-6 flex items-center justify-center gap-4">
                <AlertTriangle className="w-8 h-8 text-destructive flex-shrink-0" />
                 <div>
                    <p className="text-xs text-destructive">Monto Máximo en Riesgo*</p>
                    <p className="text-3xl font-bold text-destructive">{formatCurrency(calculation.atRisk)}</p>
                </div>
            </div>
          <p className="text-xs text-muted-foreground text-center">
            *Solo un juez puede ordenar un embargo sobre el 30% del excedente del salario mínimo. Los despachos de cobranza no pueden hacerlo por su cuenta.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
