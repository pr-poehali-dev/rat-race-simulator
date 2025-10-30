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
  const [currentStock, setCurrentStock] = useState<Stock | null>(null);
  const [ownedStocks, setOwnedStocks] = useState<{ [key: string]: number }>({});

  const [assets, setAssets] = useState<Asset[]>([
    { id: "1", name: "Квартира", icon: "Home", cost: 50000, income: 500, owned: 0 },
    { id: "2", name: "Бизнес", icon: "Store", cost: 100000, income: 1500, owned: 0 },
    { id: "3", name: "Автомойка", icon: "Car", cost: 30000, income: 300, owned: 0 },
    { id: "4", name: "Ресторан", icon: "UtensilsCrossed", cost: 150000, income: 2500, owned: 0 },
  ]);

  const stockTemplates = [
    { id: "1", name: "TechCorp", symbol: "TECH", basePrice: 150 },
    { id: "2", name: "MegaBank", symbol: "BANK", basePrice: 80 },
    { id: "3", name: "EnergyPlus", symbol: "ENRG", basePrice: 120 },
    { id: "4", name: "FoodChain", symbol: "FOOD", basePrice: 95 },
    { id: "5", name: "AutoMotive", symbol: "AUTO", basePrice: 110 },
  ];

  const generateNewStock = () => {
    const template = stockTemplates[Math.floor(Math.random() * stockTemplates.length)];
    const changePercent = (Math.random() - 0.5) * 15;
    const price = Math.max(10, template.basePrice * (1 + changePercent / 100));
    
    setCurrentStock({
      id: template.id,
      name: template.name,
      symbol: template.symbol,
      price: parseFloat(price.toFixed(2)),
      change: changePercent,
    });
  };

  useEffect(() => {
    generateNewStock();

    const incomeInterval = setInterval(() => {
      if (passiveIncome > 0) {
        setBalance((prev) => prev + passiveIncome / 60);
      }
    }, 1000);

    return () => {
      clearInterval(incomeInterval);
    };
  }, [passiveIncome]);

  const buyStock = () => {
    if (!currentStock) return;

    if (balance >= currentStock.price) {
      setBalance((prev) => prev - currentStock.price);
      setOwnedStocks((prev) => ({
        ...prev,
        [currentStock.id]: (prev[currentStock.id] || 0) + 1,
      }));
      addExperience(10);
      toast.success(`Куплена акция ${currentStock.symbol} за $${currentStock.price}`);
      generateNewStock();
    } else {
      toast.error("Недостаточно средств!");
    }
  };

  const sellStock = () => {
    if (!currentStock) return;
    const owned = ownedStocks[currentStock.id] || 0;

    if (owned > 0) {
      setBalance((prev) => prev + currentStock.price);
      setOwnedStocks((prev) => ({
        ...prev,
        [currentStock.id]: owned - 1,
      }));
      addExperience(5);
      toast.success(`Продана акция ${currentStock.symbol} за $${currentStock.price}`);
      generateNewStock();
    } else {
      toast.error("У вас нет этих акций!");
    }
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

  const experiencePercent = (experience / (level * 100)) * 100;

  const totalStocksValue = Object.entries(ownedStocks).reduce((sum, [id, count]) => {
    const template = stockTemplates.find(s => s.id === id);
    return sum + (template?.basePrice || 0) * count;
  }, 0);

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="border-accent/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="LineChart" size={20} />
                  Торговля акциями
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentStock ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">{currentStock.name}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {currentStock.symbol}
                        </Badge>
                      </div>
                      <div
                        className={`text-right ${
                          currentStock.change >= 0 ? "text-success" : "text-destructive"
                        }`}
                      >
                        <div className="flex items-center gap-1 text-lg">
                          <Icon
                            name={currentStock.change >= 0 ? "TrendingUp" : "TrendingDown"}
                            size={20}
                          />
                          {currentStock.change.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div className="text-4xl font-bold text-primary">
                      ${currentStock.price.toFixed(2)}
                    </div>

                    {ownedStocks[currentStock.id] > 0 && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">
                          В портфеле: {ownedStocks[currentStock.id]} шт
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        onClick={buyStock}
                        className="flex-1"
                        disabled={balance < currentStock.price}
                      >
                        <Icon name="ShoppingCart" size={18} className="mr-2" />
                        Купить
                      </Button>
                      <Button
                        onClick={sellStock}
                        variant="outline"
                        className="flex-1"
                        disabled={!ownedStocks[currentStock.id] || ownedStocks[currentStock.id] === 0}
                      >
                        <Icon name="DollarSign" size={18} className="mr-2" />
                        Продать
                      </Button>
                    </div>

                    <Button
                      onClick={generateNewStock}
                      variant="secondary"
                      className="w-full"
                    >
                      <Icon name="RefreshCw" size={18} className="mr-2" />
                      Следующая акция
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Загрузка акций...
                  </div>
                )}

                {totalStocksValue > 0 && (
                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Общая стоимость портфеля
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      ${totalStocksValue.toFixed(2)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="CreditCard" size={20} />
                  Кредиты
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[10000, 25000, 50000, 100000].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      className="flex flex-col h-auto p-4"
                      onClick={() => takeLoan(amount)}
                    >
                      <div className="text-lg font-bold">
                        ${amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Ставка: 10%
                      </div>
                    </Button>
                  ))}
                </div>

                {loans.length > 0 && (
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-semibold">Активные кредиты</h4>
                    {loans.map((loan) => (
                      <Card key={loan.id} className="bg-muted/50">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold">
                                ${loan.amount.toFixed(2)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Платёж: ${loan.monthly.toFixed(2)}
                              </div>
                            </div>
                            <Button 
                              onClick={() => payLoan(loan.id)}
                              size="sm"
                            >
                              Оплатить
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Building2" size={20} />
                Активы
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {assets.map((asset) => (
                <Card
                  key={asset.id}
                  className="hover:shadow-lg transition-all"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-primary/10 rounded-xl">
                        <Icon name={asset.icon as any} size={28} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{asset.name}</h4>
                        <div className="text-sm text-success">
                          +${asset.income}/мин
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Цена: ${asset.cost.toLocaleString()}
                        </div>
                        {asset.owned > 0 && (
                          <Badge variant="secondary" className="mt-1">
                            Куплено: {asset.owned}
                          </Badge>
                        )}
                      </div>
                      <Button
                        onClick={() => buyAsset(asset.id)}
                        disabled={balance < asset.cost}
                      >
                        <Icon name="Plus" size={18} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
