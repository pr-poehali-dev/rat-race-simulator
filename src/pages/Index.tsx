import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

interface Stock {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  dividend: number;
}

interface Asset {
  id: string;
  name: string;
  icon: string;
  cost: number;
  income: number;
}

interface Expense {
  id: string;
  name: string;
  icon: string;
  cost: number;
  monthlyExpense: number;
}

interface OwnedItem {
  type: 'stock' | 'asset' | 'expense';
  name: string;
  monthlyIncome: number;
  purchasePrice: number;
  loanPayment?: number;
}

type CardType = 'stock' | 'asset' | 'expense';

const Index = () => {
  const [balance, setBalance] = useState(10000);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [level, setLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  const [balanceHistory, setBalanceHistory] = useState<number[]>([10000]);
  const [currentCardType, setCurrentCardType] = useState<CardType>('stock');
  const [currentCard, setCurrentCard] = useState<Stock | Asset | Expense | null>(null);
  const [ownedItems, setOwnedItems] = useState<OwnedItem[]>([]);

  const stockTemplates = [
    { id: "1", name: "TechCorp", symbol: "TECH", basePrice: 150, baseDividend: 15 },
    { id: "2", name: "MegaBank", symbol: "BANK", basePrice: 80, baseDividend: 8 },
    { id: "3", name: "EnergyPlus", symbol: "ENRG", basePrice: 120, baseDividend: 12 },
    { id: "4", name: "FoodChain", symbol: "FOOD", basePrice: 95, baseDividend: 10 },
  ];

  const assetTemplates = [
    { id: "1", name: "Квартира", icon: "Home", baseCost: 50000, baseIncome: 500 },
    { id: "2", name: "Бизнес", icon: "Store", baseCost: 100000, baseIncome: 1500 },
    { id: "3", name: "Автомойка", icon: "Car", baseCost: 30000, baseIncome: 300 },
    { id: "4", name: "Ресторан", icon: "UtensilsCrossed", baseCost: 150000, baseIncome: 2500 },
  ];

  const expenseTemplates = [
    { id: "1", name: "Новая машина", icon: "Car", baseCost: 25000, baseExpense: 250 },
    { id: "2", name: "Яхта", icon: "Ship", baseCost: 200000, baseExpense: 2000 },
    { id: "3", name: "Второй дом", icon: "Home", baseCost: 80000, baseExpense: 800 },
    { id: "4", name: "Самолёт", icon: "Plane", baseCost: 500000, baseExpense: 5000 },
  ];

  const generateCard = (type: CardType) => {
    if (type === 'stock') {
      const template = stockTemplates[Math.floor(Math.random() * stockTemplates.length)];
      const changePercent = (Math.random() - 0.5) * 20;
      const price = Math.max(10, template.basePrice * (1 + changePercent / 100));
      const dividend = Math.max(1, template.baseDividend * (1 + changePercent / 100));
      
      setCurrentCard({
        id: template.id,
        name: template.name,
        symbol: template.symbol,
        price: parseFloat(price.toFixed(2)),
        change: changePercent,
        dividend: parseFloat(dividend.toFixed(2)),
      } as Stock);
    } else if (type === 'asset') {
      const template = assetTemplates[Math.floor(Math.random() * assetTemplates.length)];
      const variance = (Math.random() - 0.5) * 0.3;
      const cost = Math.max(1000, template.baseCost * (1 + variance));
      const income = Math.max(10, template.baseIncome * (1 + variance));
      
      setCurrentCard({
        id: template.id,
        name: template.name,
        icon: template.icon,
        cost: parseFloat(cost.toFixed(2)),
        income: parseFloat(income.toFixed(2)),
      } as Asset);
    } else {
      const template = expenseTemplates[Math.floor(Math.random() * expenseTemplates.length)];
      const variance = (Math.random() - 0.5) * 0.3;
      const cost = Math.max(1000, template.baseCost * (1 + variance));
      const expense = Math.max(10, template.baseExpense * (1 + variance));
      
      setCurrentCard({
        id: template.id,
        name: template.name,
        icon: template.icon,
        cost: parseFloat(cost.toFixed(2)),
        monthlyExpense: parseFloat(expense.toFixed(2)),
      } as Expense);
    }
  };

  useEffect(() => {
    generateCard('stock');

    const incomeInterval = setInterval(() => {
      const netIncome = (monthlyIncome - monthlyExpenses) / 30 / 24 / 60;
      setBalance((prev) => {
        const newBalance = prev + netIncome;
        setBalanceHistory((history) => {
          const newHistory = [...history, newBalance];
          return newHistory.slice(-50);
        });
        return newBalance;
      });
    }, 1000);

    return () => {
      clearInterval(incomeInterval);
    };
  }, [monthlyIncome, monthlyExpenses]);

  const getNextCardType = (): CardType => {
    if (currentCardType === 'stock') return 'asset';
    if (currentCardType === 'asset') return 'expense';
    return 'stock';
  };

  const canAffordWithLoan = (price: number, monthlyPayment: number): boolean => {
    const newMonthlyExpenses = monthlyExpenses + monthlyPayment;
    return monthlyIncome >= newMonthlyExpenses;
  };

  const buyCard = (useLoan: boolean) => {
    if (!currentCard) return;

    const price = 'price' in currentCard ? currentCard.price : currentCard.cost;
    const loanPayment = useLoan ? price * 0.1 : 0;

    if (useLoan) {
      if (!canAffordWithLoan(price, loanPayment)) {
        toast.error("Денежный поток станет отрицательным! Нельзя взять кредит.");
        return;
      }
    } else {
      if (balance < price) {
        toast.error("Недостаточно средств!");
        return;
      }
      setBalance((prev) => prev - price);
    }

    if (currentCardType === 'stock') {
      const stock = currentCard as Stock;
      setMonthlyIncome((prev) => prev + stock.dividend);
      setOwnedItems((prev) => [
        ...prev,
        {
          type: 'stock',
          name: `${stock.name} (${stock.symbol})`,
          monthlyIncome: stock.dividend,
          purchasePrice: stock.price,
          loanPayment: useLoan ? loanPayment : undefined,
        },
      ]);
      if (useLoan) {
        setMonthlyExpenses((prev) => prev + loanPayment);
      }
      addExperience(20);
      toast.success(`Куплена акция ${stock.symbol}${useLoan ? ' в кредит' : ''}!`);
    } else if (currentCardType === 'asset') {
      const asset = currentCard as Asset;
      setMonthlyIncome((prev) => prev + asset.income);
      setOwnedItems((prev) => [
        ...prev,
        {
          type: 'asset',
          name: asset.name,
          monthlyIncome: asset.income,
          purchasePrice: asset.cost,
          loanPayment: useLoan ? loanPayment : undefined,
        },
      ]);
      if (useLoan) {
        setMonthlyExpenses((prev) => prev + loanPayment);
      }
      addExperience(50);
      toast.success(`Куплен актив: ${asset.name}${useLoan ? ' в кредит' : ''}!`);
    } else {
      const expense = currentCard as Expense;
      setMonthlyExpenses((prev) => prev + expense.monthlyExpense);
      setOwnedItems((prev) => [
        ...prev,
        {
          type: 'expense',
          name: expense.name,
          monthlyIncome: -expense.monthlyExpense,
          purchasePrice: expense.cost,
          loanPayment: useLoan ? loanPayment : undefined,
        },
      ]);
      if (useLoan) {
        setMonthlyExpenses((prev) => prev + loanPayment);
      }
      addExperience(10);
      toast.error(`Новый расход: ${expense.name}${useLoan ? ' в кредит' : ''}!`);
    }

    const nextType = getNextCardType();
    setCurrentCardType(nextType);
    generateCard(nextType);
  };

  const skipCard = () => {
    if (currentCardType === 'expense') {
      toast.error("От расходов нельзя отказаться!");
      return;
    }

    const nextType = getNextCardType();
    setCurrentCardType(nextType);
    generateCard(nextType);
    toast.info("Карточка пропущена");
  };

  const addExperience = (amount: number) => {
    const newExp = experience + amount;
    const expNeeded = level * 100;
    if (newExp >= expNeeded) {
      setLevel((prev) => prev + 1);
      setExperience(newExp - expNeeded);
      toast.success(`🎉 Уровень ${level + 1}!`, { duration: 2000 });
    } else {
      setExperience(newExp);
    }
  };

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

  const experiencePercent = (experience / (level * 100)) * 100;
  const cashFlow = monthlyIncome - monthlyExpenses;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="border-accent/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Icon name={currentCardType === 'stock' ? 'LineChart' : currentCardType === 'asset' ? 'Building2' : 'AlertCircle'} size={20} />
                    {currentCardType === 'stock' ? 'Акция' : currentCardType === 'asset' ? 'Актив' : 'Расход'}
                  </CardTitle>
                  <Badge variant={currentCardType === 'stock' ? 'default' : currentCardType === 'asset' ? 'secondary' : 'destructive'}>
                    {currentCardType === 'stock' ? 'Дивиденды' : currentCardType === 'asset' ? 'Доход' : 'Обязательно'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentCard ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {'icon' in currentCard && (
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <Icon name={currentCard.icon as any} size={28} className="text-primary" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-2xl font-bold">{currentCard.name}</h3>
                          {'symbol' in currentCard && (
                            <Badge variant="secondary" className="mt-1">
                              {currentCard.symbol}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {'change' in currentCard && (
                        <div className={`text-right ${currentCard.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                          <div className="flex items-center gap-1">
                            <Icon name={currentCard.change >= 0 ? 'TrendingUp' : 'TrendingDown'} size={18} />
                            {currentCard.change.toFixed(1)}%
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Цена:</span>
                        <span className="font-bold text-xl">
                          ${'price' in currentCard ? currentCard.price.toFixed(0) : currentCard.cost.toFixed(0)}
                        </span>
                      </div>
                      {currentCardType === 'stock' && 'dividend' in currentCard && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Дивиденды:</span>
                          <span className="font-bold text-success">
                            +${currentCard.dividend.toFixed(0)}/мес
                          </span>
                        </div>
                      )}
                      {currentCardType === 'asset' && 'income' in currentCard && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Доход:</span>
                          <span className="font-bold text-success">
                            +${currentCard.income.toFixed(0)}/мес
                          </span>
                        </div>
                      )}
                      {currentCardType === 'expense' && 'monthlyExpense' in currentCard && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Расход:</span>
                          <span className="font-bold text-destructive">
                            -${currentCard.monthlyExpense.toFixed(0)}/мес
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Button
                        onClick={() => buyCard(false)}
                        className="w-full"
                        disabled={balance < ('price' in currentCard ? currentCard.price : currentCard.cost)}
                      >
                        <Icon name="ShoppingCart" size={18} className="mr-2" />
                        Купить за наличные
                      </Button>
                      
                      <Button
                        onClick={() => buyCard(true)}
                        variant="outline"
                        className="w-full"
                        disabled={!canAffordWithLoan(
                          'price' in currentCard ? currentCard.price : currentCard.cost,
                          ('price' in currentCard ? currentCard.price : currentCard.cost) * 0.1
                        )}
                      >
                        <Icon name="CreditCard" size={18} className="mr-2" />
                        Купить в кредит (10%/мес)
                      </Button>

                      {currentCardType !== 'expense' && (
                        <Button
                          onClick={skipCard}
                          variant="ghost"
                          className="w-full"
                        >
                          <Icon name="SkipForward" size={18} className="mr-2" />
                          Пропустить
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Загрузка карточки...
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
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

          <div className="space-y-6">
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Briefcase" size={20} />
                  Портфель ({ownedItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {ownedItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Портфель пуст
                  </div>
                ) : (
                  ownedItems.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 bg-muted rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          ${item.purchasePrice.toFixed(0)}
                          {item.loanPayment && ' (кредит)'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${item.monthlyIncome >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {item.monthlyIncome >= 0 ? '+' : ''}${item.monthlyIncome.toFixed(0)}/мес
                        </div>
                        {item.loanPayment && (
                          <div className="text-xs text-destructive">
                            -{item.loanPayment.toFixed(0)}/мес
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
