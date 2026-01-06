'use client';

import { collection, query, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import type { Debt } from "@/lib/types";
import { db } from "@/lib/init-firebase";
import { DebtCard } from "./debt-card";
import { useAuth } from "../auth/auth-provider";
import { PageHeader } from "../shared/page-header";
import { Button } from "../ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import Link from 'next/link';

export function DebtOverview() {
  const { user } = useAuth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user?.uid) {
        if (!user) setLoading(false);
        return;
    };

    setLoading(true);
    const debtsCollectionRef = collection(db, 'users', user.uid, 'debts');
    const q = query(debtsCollectionRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userDebts: Debt[] = [];
      querySnapshot.forEach((doc) => {
        userDebts.push({ id: doc.id, ...doc.data() } as Debt);
      });
      setDebts(userDebts);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching debts: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return null;
  }
  
  const getFirstName = (name?: string) => {
    if (!name) return "Usuario";
    return name.split(' ')[0];
  }

  return (
    <>
      <PageHeader 
        title={`¡Bienvenido, ${getFirstName(user.name)}!`} 
        description="Aquí tienes un resumen de tus deudas actuales."
      >
        <Button asChild>
          <Link href="/dashboard/add-debt">
            <PlusCircle />
            Registrar Nueva Deuda
          </Link>
        </Button>
      </PageHeader>
        
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : debts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {debts.map(debt => (
            <DebtCard key={debt.id} debt={debt} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold text-primary">No hay Deudas Registradas</h3>
          <p className="text-muted-foreground mt-2">Comienza registrando tu primera deuda para obtener un análisis.</p>
        </div>
      )}
    </>
  );
}
