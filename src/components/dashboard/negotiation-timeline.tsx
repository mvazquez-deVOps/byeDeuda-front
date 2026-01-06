
'use client';

import { cn } from "@/lib/utils";
import type { NegotiationStage } from "@/lib/types";
import { Check, CircleDashed, Loader, PiggyBank, Scale, FileText, Phone, Trophy, Search } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type Status = "completed" | "in-progress" | "pending";

const STAGES = [
  {
    id: "analysis_validation",
    name: "Fase 1: Análisis y Validación",
    description: "Verificando acreedores, montos y contratos. Detectando cláusulas abusivas.",
    icon: Search,
  },
  {
    id: "strategic_saving",
    name: "Fase 2: Ahorro Estratégico",
    description: "Acumulando fondo para liquidación. Deteniendo fugas de intereses.",
    icon: PiggyBank,
  },
  {
    id: "negotiation_table",
    name: "Fase 3: Mesa de Negociación",
    description: "Contactando al banco. Rechazando primeras ofertas insuficientes.",
    icon: Phone,
  },
  {
    id: "formal_offer",
    name: "Fase 4: Oferta Formal",
    description: "Recibimos una propuesta válida por escrito (Carta Convenio).",
    icon: FileText,
  },
  {
    id: "legal_review",
    name: "Fase 5: Revisión Legal",
    description: "Nuestros abogados validan la veracidad del convenio para evitar fraudes.",
    icon: Scale,
  },
  {
    id: "settlement_freedom",
    name: "Fase 6: Liquidación y Libertad",
    description: "Pago realizado. Gestionando carta finiquito y actualización en Buró.",
    icon: Trophy,
  },
] as const;

const stageOrder = STAGES.map(stage => stage.id);

function TimelineIcon({ status }: { status: Status }) {
  if (status === "completed") {
    return <Check className="w-5 h-5" />;
  }
  if (status === "in-progress") {
    return <Loader className="w-5 h-5 animate-spin" />;
  }
  return <CircleDashed className="w-5 h-5" />;
}

export function NegotiationTimeline({
  currentStage,
  progress = 0,
}: {
  currentStage: NegotiationStage;
  progress?: number;
}) {
  const currentStageIndex = stageOrder.indexOf(currentStage);

  return (
    <ol className="relative border-s border-border ml-4">
      {STAGES.map(({ id, name, description, icon: Icon }, index) => {
        let status: Status = "pending";
        if (index < currentStageIndex) {
          status = "completed";
        } else if (index === currentStageIndex) {
          status = "in-progress";
        }

        return (
          <li key={id} className="mb-10 ms-8">
            <span
              className={cn(
                "absolute -start-[1.1rem] flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-background",
                status === "completed" && "bg-green-500/80 text-white",
                status === "in-progress" && "bg-primary text-primary-foreground",
                status === "pending" && "bg-muted text-muted-foreground"
              )}
            >
                <Icon className="w-5 h-5" />
            </span>
            <div className={cn("p-4 rounded-lg border", 
                status === 'in-progress' ? 'bg-card border-primary/50' : 'bg-muted/50 border-border'
            )}>
                <h3 className="flex items-center mb-1 text-lg font-semibold text-foreground">
                    {name}
                </h3>
                <time className="block mb-2 text-sm font-normal leading-none text-muted-foreground">
                    {status === 'in-progress' && `Última actualización: hace 2 horas`}
                    {status === 'completed' && `Completado`}
                    {status === 'pending' && `Pendiente`}
                </time>
                <p className="mb-4 text-base font-normal text-muted-foreground">{description}</p>
                
                {id === 'strategic_saving' && status !== 'pending' && (
                    <div className="mt-4">
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-primary">Progreso de Ahorro</span>
                            <span className="text-sm font-medium text-primary">{progress}%</span>
                        </div>
                        <Progress value={progress} aria-label={`${progress}% de ahorro estratégico`} />
                    </div>
                )}
                 {id === 'negotiation_table' && status === 'in-progress' && (
                    <div className="mt-4 p-3 bg-yellow-900/50 border border-yellow-700 rounded-md text-yellow-300 text-sm">
                        <p>Oferta actual rechazada: <span className="font-bold">-15%</span></p>
                        <p>Objetivo de negociación: <span className="font-bold">-70% o más</span></p>
                    </div>
                )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

