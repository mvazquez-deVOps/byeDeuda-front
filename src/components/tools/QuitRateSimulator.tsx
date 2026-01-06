
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const BANK_DISCOUNTS: Record<string, number> = {
  Santander: 0.70,
  'BBVA': 0.65,
  Citibanamex: 0.68,
  'Banco Azteca': 0.50,
  Coppel: 0.55,
  Liverpool: 0.60,
  Amex: 0.40,
  Otro: 0.50
};

const formatCurrency = (value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

export function QuitRateSimulator() {
  const [debtAmount, setDebtAmount] = useState(100000);
  const [bank, setBank] = useState('Santander');

  const discountRate = BANK_DISCOUNTS[bank];
  const negotiatedAmount = debtAmount * (1 - discountRate);
  const amountSaved = debtAmount - negotiatedAmount;

  const chartData = [
    { name: 'Monto a Pagar', value: negotiatedAmount },
    { name: 'Ahorro Estimado', value: amountSaved },
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted))'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle>Simulador de Quitas Reales</CardTitle>
          <CardDescription>Estima cuánto podrías ahorrar negociando tu deuda con diferentes instituciones.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <Label htmlFor="bank-select">Banco o Institución</Label>
            <Select value={bank} onValueChange={setBank}>
              <SelectTrigger id="bank-select"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.keys(BANK_DISCOUNTS).map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="debt-amount">Monto de tu Deuda: {formatCurrency(debtAmount)}</Label>
            <Slider
              id="debt-amount"
              min={10000}
              max={500000}
              step={1000}
              value={[debtAmount]}
              onValueChange={(value) => setDebtAmount(value[0])}
              className="mt-4"
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Resultado de la Simulación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                    return (
                      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Deuda Original</span>
                  <span className="font-bold text-lg line-through">{formatCurrency(debtAmount)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg text-primary">
                  <span className="font-semibold">Monto Estimado a Pagar</span>
                  <span className="font-bold text-xl">{formatCurrency(negotiatedAmount)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg text-green-400">
                  <span className="font-semibold">¡Ahorro Potencial!</span>
                  <span className="font-bold text-xl">{formatCurrency(amountSaved)}</span>
              </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
