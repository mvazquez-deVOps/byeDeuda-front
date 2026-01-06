
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Trash2, Plus, Coffee, Tv, Cigarette, Car } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formatCurrency = (value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

const defaultExpenses = [
  { id: 1, name: 'Café de la mañana', cost: 45, frequency: 'daily', icon: Coffee },
  { id: 2, name: 'Suscripción Streaming', cost: 199, frequency: 'monthly', icon: Tv },
];

export function AntExpensesAuditor() {
  const [expenses, setExpenses] = useState(defaultExpenses);

  const handleAddExpense = () => {
    setExpenses([...expenses, { id: Date.now(), name: '', cost: 0, frequency: 'daily', icon: Plus }]);
  };

  const handleRemoveExpense = (id: number) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const handleUpdateExpense = (id: number, field: string, value: any) => {
    setExpenses(expenses.map(expense => expense.id === id ? { ...expense, [field]: value } : expense));
  };

  const annualTotals = useMemo(() => {
    return expenses.map(expense => {
      let multiplier = 1;
      if (expense.frequency === 'daily') multiplier = 365;
      else if (expense.frequency === 'weekly') multiplier = 52;
      else if (expense.frequency === 'monthly') multiplier = 12;
      const total = expense.cost * multiplier;
      return { name: expense.name, total: total };
    });
  }, [expenses]);

  const totalAnnualCost = useMemo(() => {
    return annualTotals.reduce((sum, item) => sum + item.total, 0);
  }, [annualTotals]);

  const chartData = useMemo(() => {
    return annualTotals.map(item => ({ name: item.name, 'Gasto Anual': item.total }));
  }, [annualTotals]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Auditor de Gastos Hormiga</CardTitle>
          <CardDescription>Añade tus pequeños gastos para ver su impacto anual.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {expenses.map((expense, index) => (
            <div key={expense.id} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-4">
                <Input
                  placeholder="Ej. Café"
                  value={expense.name}
                  onChange={(e) => handleUpdateExpense(expense.id, 'name', e.target.value)}
                />
              </div>
              <div className="col-span-3">
                 <Input
                  type="number"
                  placeholder="Costo"
                  value={expense.cost}
                  onChange={(e) => handleUpdateExpense(expense.id, 'cost', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-4">
                <Select
                  value={expense.frequency}
                  onValueChange={(value) => handleUpdateExpense(expense.id, 'frequency', value)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Button variant="ghost" size="icon" onClick={() => handleRemoveExpense(expense.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={handleAddExpense}>
            <Plus className="mr-2" /> Añadir Gasto
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Impacto Anual</CardTitle>
          <CardDescription>Esto es lo que tus gastos hormiga te cuestan al año.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-center p-6 bg-destructive/10 rounded-lg border border-destructive/20 mb-6">
                <p className="text-sm text-destructive">Total Anual Desperdiciado</p>
                <p className="text-5xl font-bold text-destructive">{formatCurrency(totalAnnualCost)}</p>
                <p className="text-muted-foreground mt-2">Podrías haber pagado el { (totalAnnualCost / 10000 * 100).toFixed(0) }% de una deuda de $10,000.</p>
            </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => formatCurrency(value as number)} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" width={80} tick={{ fontSize: 12 }} />
                <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="Gasto Anual" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
