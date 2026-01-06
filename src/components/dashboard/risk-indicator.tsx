import { cn } from "@/lib/utils";

type RiskIndicatorProps = {
  riskLevel: 'high' | 'medium' | 'low';
  showText?: boolean;
  className?: string;
};

const riskConfig = {
  high: {
    color: "bg-red-500",
    text: "High Risk",
  },
  medium: {
    color: "bg-yellow-500",
    text: "Medium Risk",
  },
  low: {
    color: "bg-green-500",
    text: "Low Risk",
  },
};

export function RiskIndicator({ riskLevel, showText = true, className }: RiskIndicatorProps) {
  const config = riskConfig[riskLevel] || riskConfig.low;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("w-3 h-3 rounded-full", config.color)}>
        <div className={cn("w-3 h-3 rounded-full animate-ping", config.color)} />
      </div>
      {showText && <span className="text-sm font-medium text-muted-foreground">{config.text}</span>}
    </div>
  );
}
