import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Stock, Asset, Expense, CardType, OwnedItem, OwnedStock, OwnedAsset } from "@/types/game";
import StatsCards from "@/components/game/StatsCards";
import CurrentCard from "@/components/game/CurrentCard";
import BalanceChart from "@/components/game/BalanceChart";
import Portfolio from "@/components/game/Portfolio";

const Index = () => {
  const [balance, setBalance] = useState(10000);
  const [monthlyIncome, setMonthlyIncome] = useState(3000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(2000);
  const [level, setLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  const [balanceHistory, setBalanceHistory] = useState<number[]>([10000]);
  const [currentCardType, setCurrentCardType] = useState<CardType>('stock');
  const [currentCard, setCurrentCard] = useState<Stock | Asset | Expense | null>(null);
  const [ownedItems, setOwnedItems] = useState<OwnedItem[]>([]);
  const [stockQuantity, setStockQuantity] = useState(1);
  const [ownedStocks, setOwnedStocks] = useState<{[key: string]: OwnedStock}>({});
  const [ownedAssets, setOwnedAssets] = useState<{[key: string]: OwnedAsset}>({});

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
    { id: "1", name: "Ребёнок", icon: "Baby", baseCost: 0, baseExpense: 500 },
    { id: "2", name: "Увеличение аренды", icon: "Home", baseCost: 0, baseExpense: 300 },
    { id: "3", name: "Кредитная карта", icon: "CreditCard", baseCost: 0, baseExpense: 400 },
    { id: "4", name: "Страховка здоровья", icon: "Heart", baseCost: 0, baseExpense: 250 },
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
      const totalCost = price * stockQuantity;
      const totalLoanPayment = useLoan ? totalCost * 0.1 : 0;
      
      if (useLoan) {
        if (!canAffordWithLoan(totalCost, totalLoanPayment)) {
          toast.error("Денежный поток станет отрицательным! Нельзя взять кредит.");
          return;
        }
      } else {
        if (balance < totalCost) {
          toast.error("Недостаточно средств!");
          return;
        }
        setBalance((prev) => prev - totalCost);
      }
      
      const totalDividends = stock.dividend * stockQuantity;
      setMonthlyIncome((prev) => prev + totalDividends);
      
      setOwnedStocks((prev) => {
        const existing = prev[stock.id] || {quantity: 0, avgPrice: 0, totalDividends: 0};
        const newQuantity = existing.quantity + stockQuantity;
        const newAvgPrice = ((existing.avgPrice * existing.quantity) + (stock.price * stockQuantity)) / newQuantity;
        return {
          ...prev,
          [stock.id]: {
            quantity: newQuantity,
            avgPrice: newAvgPrice,
            totalDividends: existing.totalDividends + totalDividends
          }
        };
      });
      
      setOwnedItems((prev) => [
        ...prev,
        {
          type: 'stock',
          name: `${stock.name} (${stock.symbol})`,
          monthlyIncome: totalDividends,
          purchasePrice: totalCost,
          loanPayment: useLoan ? totalLoanPayment : undefined,
          stockId: stock.id,
          quantity: stockQuantity,
        },
      ]);
      
      if (useLoan) {
        setMonthlyExpenses((prev) => prev + totalLoanPayment);
      }
      addExperience(20 * stockQuantity);
      toast.success(`Куплено ${stockQuantity} акций ${stock.symbol}${useLoan ? ' в кредит' : ''}!`);
      setStockQuantity(1);
    } else if (currentCardType === 'asset') {
      const asset = currentCard as Asset;
      setMonthlyIncome((prev) => prev + asset.income);
      
      setOwnedAssets((prev) => {
        const existing = prev[asset.id] || {quantity: 0, avgPrice: 0, totalIncome: 0};
        const newQuantity = existing.quantity + 1;
        const newAvgPrice = ((existing.avgPrice * existing.quantity) + asset.cost) / newQuantity;
        return {
          ...prev,
          [asset.id]: {
            quantity: newQuantity,
            avgPrice: newAvgPrice,
            totalIncome: existing.totalIncome + asset.income
          }
        };
      });
      
      setOwnedItems((prev) => [
        ...prev,
        {
          type: 'asset',
          name: asset.name,
          monthlyIncome: asset.income,
          purchasePrice: asset.cost,
          loanPayment: useLoan ? loanPayment : undefined,
          assetId: asset.id,
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
    setStockQuantity(1);
    toast.info("Карточка пропущена");
  };
  
  const sellStock = (quantity: number) => {
    if (!currentCard || currentCardType !== 'stock') return;
    const stock = currentCard as Stock;
    const owned = ownedStocks[stock.id];
    
    if (!owned || owned.quantity < quantity) {
      toast.error(`У вас недостаточно акций ${stock.symbol}!`);
      return;
    }
    
    const revenue = stock.price * quantity;
    const dividendsLost = stock.dividend * quantity;
    
    setBalance((prev) => prev + revenue);
    setMonthlyIncome((prev) => prev - dividendsLost);
    
    setOwnedStocks((prev) => {
      const newQuantity = owned.quantity - quantity;
      if (newQuantity === 0) {
        const { [stock.id]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [stock.id]: {
          ...owned,
          quantity: newQuantity,
          totalDividends: owned.totalDividends - dividendsLost
        }
      };
    });
    
    addExperience(10 * quantity);
    toast.success(`Продано ${quantity} акций ${stock.symbol} за $${revenue.toFixed(0)}`);
    setStockQuantity(1);
  };
  
  const sellAsset = () => {
    if (!currentCard || currentCardType !== 'asset') return;
    const asset = currentCard as Asset;
    const owned = ownedAssets[asset.id];
    
    if (!owned || owned.quantity < 1) {
      toast.error(`У вас нет актива ${asset.name}!`);
      return;
    }
    
    const salePrice = asset.cost * 0.7;
    
    setBalance((prev) => prev + salePrice);
    setMonthlyIncome((prev) => prev - asset.income);
    
    setOwnedAssets((prev) => {
      const newQuantity = owned.quantity - 1;
      if (newQuantity === 0) {
        const { [asset.id]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [asset.id]: {
          ...owned,
          quantity: newQuantity,
          totalIncome: owned.totalIncome - asset.income
        }
      };
    });
    
    addExperience(25);
    toast.success(`Продан актив ${asset.name} за $${salePrice.toFixed(0)} (70% от стоимости)`);
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

  const cashFlow = monthlyIncome - monthlyExpenses;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <StatsCards
          balance={balance}
          monthlyIncome={monthlyIncome}
          monthlyExpenses={monthlyExpenses}
          cashFlow={cashFlow}
          level={level}
          experience={experience}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <CurrentCard
              currentCardType={currentCardType}
              currentCard={currentCard}
              stockQuantity={stockQuantity}
              setStockQuantity={setStockQuantity}
              ownedStocks={ownedStocks}
              ownedAssets={ownedAssets}
              balance={balance}
              canAffordWithLoan={canAffordWithLoan}
              buyCard={buyCard}
              sellStock={sellStock}
              sellAsset={sellAsset}
              skipCard={skipCard}
            />
          </div>

          <div className="space-y-6">
            <BalanceChart balanceHistory={balanceHistory} balance={balance} />
            <Portfolio ownedItems={ownedItems} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;