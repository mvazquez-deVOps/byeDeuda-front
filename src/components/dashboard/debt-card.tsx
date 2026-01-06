import type { Debt } from "@/lib/types";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { RiskIndicator } from "./risk-indicator";
import Link from 'next/link';
import { Button } from "../ui/button";
import { ArrowRight, Shield } from "lucide-react";

type DebtCardProps = {
  debt: Debt;
};

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    overdue: "destructive",
    in_negotiation: "default",
    resolved: "secondary",
    pending_analysis: "outline"
};

export function DebtCard({ debt }: DebtCardProps) {
  const logo = PlaceHolderImages.find(img => img.id === debt.creditorLogoId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
      <Card className="h-full transition-all hover:shadow-md hover:-translate-y-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
           <Link href={`/dashboard/debt/${debt.id}`} className="block font-semibold text-primary hover:underline">
            {debt.creditorName}
           </Link>
          {logo && (
             <Image
                src={logo.imageUrl}
                alt={logo.description}
                data-ai-hint={logo.imageHint}
                width={40}
                height={40}
                className="rounded-full"
            />
          )}
        </CardHeader>
        <CardContent className="flex-grow">
           <Link href={`/dashboard/debt/${debt.id}`} className="block">
              <div className="text-4xl font-bold text-primary font-headline">
                {formatCurrency(debt.amount)}
              </div>
              <p className="text-sm text-muted-foreground">{debt.daysOverdue} days overdue</p>
              <div className="mt-4 flex items-center justify-between">
                <Badge variant={statusVariantMap[debt.status] || 'default'} className="capitalize">
                  {debt.status.replace('_', ' ')}
                </Badge>
                {debt.analysis && (
                  <RiskIndicator riskLevel={debt.analysis.riskAssessment.riskLevel} />
                )}
              </div>
           </Link>
        </CardContent>
         <CardFooter>
            {debt.negotiationKit && (
                <Button variant="secondary" className="w-full" asChild>
                    <Link href={`/dashboard/debt/${debt.id}/kit`}>
                        <Shield className="mr-2 h-4 w-4" />
                        Ver mi Kit de Defensa
                        <ArrowRight className="ml-auto h-4 w-4" />
                    </Link>
                </Button>
            )}
        </CardFooter>
      </Card>
  );
}
