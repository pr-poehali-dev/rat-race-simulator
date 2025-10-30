import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface BalanceChartProps {
  balanceHistory: number[];
  balance: number;
}

const BalanceChart = ({ balanceHistory, balance }: BalanceChartProps) => {
  const renderBalanceChart = () => {
    if (balanceHistory.length < 2) return null;
    
    const max = Math.max(...balanceHistory);
    const min = Math.min(...balanceHistory);
    const range = max - min || 1;

    return (
      <svg width="100%" height="100" className="mt-4">
        <polyline
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          points={balanceHistory
            .map((value, i) => {
              const x = (i / (balanceHistory.length - 1)) * 100;
              const y = 100 - ((value - min) / range) * 80;
              return `${x}%,${y}`;
            })
            .join(" ")}
        />
      </svg>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="TrendingUp" size={20} />
          График баланса
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderBalanceChart()}
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>История</span>
          <span>Текущий: ${balance.toFixed(0)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceChart;
