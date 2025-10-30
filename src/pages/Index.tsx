import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

interface Stock {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  priceHistory: number[];
  owned: number;
}

interface Asset {
  id: string;
  name: string;
  icon: string;
  cost: number;
  income: number;
  owned: number;
}

interface Loan {
  id: string;
  amount: number;
  interest: number;
  monthly: number;
}

const Index = () => {
  const [balance, setBalance] = useState(10000);
  const [passiveIncome, setPassiveIncome] = useState(0);
  const [level, setLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  const [loans, setLoans] = useState<Loan[]>([]);

  const [stocks, setStocks] = useState<Stock[]>([
    {
      id: "1",
      name: "TechCorp",
      symbol: "TECH",
      price: 150,
      change: 0,
      priceHistory: [150],
      owned: 0,
    },
    {
      id: "2",
      name: "MegaBank",
      symbol: "BANK",
      price: 80,
      change: 0,
      priceHistory: [80],
      owned: 0,
    },
    {
      id: "3",
      name: "EnergyPlus",
      symbol: "ENRG",
      price: 120,
      change: 0,
      priceHistory: [120],
      owned: 0,
    },
  ]);

  const [assets, setAssets] = useState<Asset[]>([
    { id: "1", name: "Квартира", icon: "Home", cost: 50000, income: 500, owned: 0 },
    { id: "2", name: "Бизнес", icon: "Store", cost: 100000, income: 1500, owned: 0 },
    { id: "3", name: "Автомойка", icon: "Car", cost: 30000, income: 300, owned: 0 },
    { id: "4", name: "Ресторан", icon: "UtensilsCrossed", cost: 150000, income: 2500, owned: 0 },
  ]);

  useEffect(() => {
    const stockInterval = setInterval(() => {
      setStocks((prevStocks) =>
        prevStocks.map((stock) => {
          const changePercent = (Math.random() - 0.5) * 10;
          const newPrice = Math.max(10, stock.price * (1 + changePercent / 100));
          const newHistory = [...stock.priceHistory.slice(-20), newPrice];
          return {
            ...stock,
            price: parseFloat(newPrice.toFixed(2)),
            change: changePercent,
            priceHistory: newHistory,
          };
        })
      );
    }, 3000);

    const incomeInterval = setInterval(() => {
      if (passiveIncome > 0) {
        setBalance((prev) => prev + passiveIncome / 60);
        toast.success(`+$${(passiveIncome / 60).toFixed(2)} пассивный доход`, {
          duration: 1000,
        });
      }
    }, 1000);

    return () => {
      clearInterval(stockInterval);
      clearInterval(incomeInterval);
    };
  }, [passiveIncome]);

  const buyStock = (stockId: string) => {
    const stock = stocks.find((s) => s.id === stockId);
    if (!stock) return;

    if (balance >= stock.price) {
      setBalance((prev) => prev - stock.price);
      setStocks((prevStocks) =>
        prevStocks.map((s) =>
          s.id === stockId ? { ...s, owned: s.owned + 1 } : s
        )
      );
      addExperience(10);
      toast.success(`Куплена акция ${stock.symbol} за $${stock.price}`);
    } else {
      toast.error("Недостаточно средств!");
    }
  };

  const sellStock = (stockId: string) => {
    const stock = stocks.find((s) => s.id === stockId);
    if (!stock || stock.owned === 0) return;

    setBalance((prev) => prev + stock.price);
    setStocks((prevStocks) =>
      prevStocks.map((s) =>
        s.id === stockId ? { ...s, owned: s.owned - 1 } : s
      )
    );
    addExperience(5);
    toast.success(`Продана акция ${stock.symbol} за $${stock.price}`);
  };

  const buyAsset = (assetId: string) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return;

    if (balance >= asset.cost) {
      setBalance((prev) => prev - asset.cost);
      setAssets((prevAssets) =>
        prevAssets.map((a) =>
          a.id === assetId ? { ...a, owned: a.owned + 1 } : a
        )
      );
      setPassiveIncome((prev) => prev + asset.income);
      addExperience(50);
      toast.success(`Куплен актив: ${asset.name}! +$${asset.income}/мин`);
    } else {
      toast.error("Недостаточно средств!");
    }
  };

  const takeLoan = (amount: number) => {
    const interest = 0.1;
    const monthly = amount * (1 + interest) / 12;
    const newLoan: Loan = {
      id: Date.now().toString(),
      amount: amount * (1 + interest),
      interest,
      monthly,
    };
    setLoans([...loans, newLoan]);
    setBalance((prev) => prev + amount);
    toast.success(`Получен кредит $${amount} под ${interest * 100}%`);
  };

  const payLoan = (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    if (balance >= loan.monthly) {
      setBalance((prev) => prev - loan.monthly);
      const remaining = loan.amount - loan.monthly;
      if (remaining <= 0) {
        setLoans(loans.filter((l) => l.id !== loanId));
        toast.success("Кредит полностью погашен!");
      } else {
        setLoans(
          loans.map((l) =>
            l.id === loanId ? { ...l, amount: remaining } : l
          )
        );
        toast.success(`Оплачено $${loan.monthly.toFixed(2)}`);
      }
    } else {
      toast.error("Недостаточно средств!");
    }
  };

  const addExperience = (amount: number) => {
    const newExp = experience + amount;
    const expNeeded = level * 100;
    if (newExp >= expNeeded) {
      setLevel((prev) => prev + 1);
      setExperience(newExp - expNeeded);
      toast.success(`🎉 Уровень повышен до ${level + 1}!`, { duration: 3000 });
    } else {
      setExperience(newExp);
    }
  };

  const renderMiniChart = (priceHistory: number[]) => {
    if (priceHistory.length < 2) return null;
    const max = Math.max(...priceHistory);
    const min = Math.min(...priceHistory);
    const range = max - min || 1;

    return (
      <svg width="100" height="30" className="ml-auto">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          points={priceHistory
            .map((price, i) => {
              const x = (i / (priceHistory.length - 1)) * 100;
              const y = 30 - ((price - min) / range) * 30;
              return `${x},${y}`;
            })
            .join(" ")}
        />
      </svg>
    );
  };

  const experiencePercent = (experience / (level * 100)) * 100;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="Wallet" size={20} />
                Баланс
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                ${balance.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/20 to-success/5 border-success/30 animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="TrendingUp" size={20} />
                Пассивный доход
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                ${passiveIncome.toFixed(2)}
                <span className="text-sm text-muted-foreground">/мин</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/30 animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="Award" size={20} />
                Уровень {level}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={experiencePercent} className="h-2 mb-2" />
              <div className="text-sm text-muted-foreground">
                {experience} / {level * 100} XP
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="stocks" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stocks">
              <Icon name="LineChart" size={16} className="mr-2" />
              Акции
            </TabsTrigger>
            <TabsTrigger value="assets">
              <Icon name="Building2" size={16} className="mr-2" />
              Активы
            </TabsTrigger>
            <TabsTrigger value="loans">
              <Icon name="CreditCard" size={16} className="mr-2" />
              Кредиты
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stocks" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stocks.map((stock) => (
                <Card
                  key={stock.id}
                  className="hover:shadow-lg transition-all animate-scale-in hover-scale"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{stock.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {stock.symbol}
                        </Badge>
                      </div>
                      <div
                        className={`text-right ${
                          stock.change >= 0 ? "text-success" : "text-destructive"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <Icon
                            name={stock.change >= 0 ? "TrendingUp" : "TrendingDown"}
                            size={16}
                          />
                          {stock.change.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary">
                        ${stock.price.toFixed(2)}
                      </div>
                      {renderMiniChart(stock.priceHistory)}
                    </div>
                    {stock.owned > 0 && (
                      <div className="text-sm text-muted-foreground">
                        В портфеле: {stock.owned} шт (${(stock.owned * stock.price).toFixed(2)})
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => buyStock(stock.id)}
                        className="flex-1"
                        size="sm"
                      >
                        <Icon name="Plus" size={16} className="mr-1" />
                        Купить
                      </Button>
                      <Button
                        onClick={() => sellStock(stock.id)}
                        variant="outline"
                        className="flex-1"
                        size="sm"
                        disabled={stock.owned === 0}
                      >
                        <Icon name="Minus" size={16} className="mr-1" />
                        Продать
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assets" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assets.map((asset) => (
                <Card
                  key={asset.id}
                  className="hover:shadow-lg transition-all animate-scale-in"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Icon name={asset.icon as any} size={24} className="text-primary" />
                        </div>
                        <div>
                          <CardTitle>{asset.name}</CardTitle>
                          <div className="text-sm text-muted-foreground mt-1">
                            +${asset.income}/мин
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold">${asset.cost.toLocaleString()}</div>
                      {asset.owned > 0 && (
                        <Badge variant="secondary">
                          Куплено: {asset.owned}
                        </Badge>
                      )}
                    </div>
                    <Button
                      onClick={() => buyAsset(asset.id)}
                      className="w-full"
                      disabled={balance < asset.cost}
                    >
                      <Icon name="ShoppingCart" size={16} className="mr-2" />
                      Купить актив
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="loans" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[10000, 25000, 50000, 100000].map((amount) => (
                <Card
                  key={amount}
                  className="hover:shadow-lg transition-all cursor-pointer animate-scale-in"
                  onClick={() => takeLoan(amount)}
                >
                  <CardHeader>
                    <CardTitle className="text-center">
                      ${amount.toLocaleString()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Ставка: 10%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      К возврату: ${(amount * 1.1).toLocaleString()}
                    </div>
                    <Button className="w-full mt-2" size="sm">
                      <Icon name="DollarSign" size={16} className="mr-1" />
                      Взять
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {loans.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Активные кредиты</h3>
                {loans.map((loan) => (
                  <Card key={loan.id} className="animate-slide-up">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-bold">
                            Остаток: ${loan.amount.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Ежемесячный платёж: ${loan.monthly.toFixed(2)}
                          </div>
                        </div>
                        <Button onClick={() => payLoan(loan.id)}>
                          <Icon name="Check" size={16} className="mr-2" />
                          Оплатить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
