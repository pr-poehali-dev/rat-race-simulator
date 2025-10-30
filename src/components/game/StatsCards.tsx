import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";

interface StatsCardsProps {
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  cashFlow: number;
  level: number;
  experience: number;
}

const StatsCards = ({
  balance,
  monthlyIncome,
  monthlyExpenses,
  cashFlow,
  level,
  experience,
}: StatsCardsProps) => {
  const experiencePercent = (experience / (level * 100)) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Icon name="Wallet" size={18} />
            Баланс
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            ${balance.toFixed(0)}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-success/20 to-success/5 border-success/30 animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Icon name="TrendingUp" size={18} />
            Доход
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">
            ${monthlyIncome.toFixed(0)}
            <span className="text-xs text-muted-foreground">/мес</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-destructive/20 to-destructive/5 border-destructive/30 animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Icon name="TrendingDown" size={18} />
            Расходы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            ${monthlyExpenses.toFixed(0)}
            <span className="text-xs text-muted-foreground">/мес</span>
          </div>
        </CardContent>
      </Card>

      <Card className={`bg-gradient-to-br border-secondary/30 animate-fade-in ${
        cashFlow >= 0 ? 'from-secondary/20 to-secondary/5' : 'from-destructive/20 to-destructive/5'
      }`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Icon name="Activity" size={18} />
            Денежный поток
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${cashFlow >= 0 ? 'text-success' : 'text-destructive'}`}>
            {cashFlow >= 0 ? '+' : ''}${cashFlow.toFixed(0)}
            <span className="text-xs text-muted-foreground">/мес</span>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Award" size={20} />
            Прогресс - Уровень {level}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={experiencePercent} className="h-3 mb-2" />
          <div className="text-sm text-muted-foreground">
            {experience} / {level * 100} XP
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
