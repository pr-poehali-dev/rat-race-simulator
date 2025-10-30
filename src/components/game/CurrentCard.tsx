import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { Stock, Asset, Expense, CardType, OwnedStock, OwnedAsset } from "@/types/game";

interface CurrentCardProps {
  currentCardType: CardType;
  currentCard: Stock | Asset | Expense | null;
  stockQuantity: number;
  setStockQuantity: (quantity: number) => void;
  ownedStocks: { [key: string]: OwnedStock };
  ownedAssets: { [key: string]: OwnedAsset };
  balance: number;
  canAffordWithLoan: (price: number, monthlyPayment: number) => boolean;
  buyCard: (useLoan: boolean) => void;
  sellStock: (quantity: number) => void;
  sellAsset: () => void;
  skipCard: () => void;
}

const CurrentCard = ({
  currentCardType,
  currentCard,
  stockQuantity,
  setStockQuantity,
  ownedStocks,
  ownedAssets,
  balance,
  canAffordWithLoan,
  buyCard,
  sellStock,
  sellAsset,
  skipCard,
}: CurrentCardProps) => {
  if (!currentCard) {
    return (
      <Card className="border-accent/30">
        <CardContent className="py-8 text-center text-muted-foreground">
          Загрузка карточки...
        </CardContent>
      </Card>
    );
  }

  const price = 'price' in currentCard ? currentCard.price : currentCard.cost;
  const totalCost = price * (currentCardType === 'stock' ? stockQuantity : 1);

  return (
    <Card className="border-accent/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon 
              name={currentCardType === 'stock' ? 'LineChart' : currentCardType === 'asset' ? 'Building2' : 'AlertCircle'} 
              size={20} 
            />
            {currentCardType === 'stock' ? 'Акция' : currentCardType === 'asset' ? 'Актив' : 'Расход'}
          </CardTitle>
          <div className="flex items-center gap-2">
            {currentCardType === 'stock' && ownedStocks[(currentCard as Stock)?.id] && (
              <Badge variant="secondary">
                В портфеле: {ownedStocks[(currentCard as Stock).id].quantity}шт
              </Badge>
            )}
            {currentCardType === 'asset' && ownedAssets[(currentCard as Asset)?.id] && (
              <Badge variant="secondary">
                В портфеле: {ownedAssets[(currentCard as Asset).id].quantity}шт
              </Badge>
            )}
            <Badge variant={currentCardType === 'stock' ? 'default' : currentCardType === 'asset' ? 'secondary' : 'destructive'}>
              {currentCardType === 'stock' ? 'Дивиденды' : currentCardType === 'asset' ? 'Доход' : 'Обязательно'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
            {currentCardType === 'stock' && (
              <div className="flex items-center gap-2 mb-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setStockQuantity(Math.max(1, stockQuantity - 1))}
                >
                  <Icon name="Minus" size={16} />
                </Button>
                <Input
                  type="number"
                  min="1"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setStockQuantity(stockQuantity + 1)}
                >
                  <Icon name="Plus" size={16} />
                </Button>
              </div>
            )}
            
            <Button
              onClick={() => buyCard(false)}
              className="w-full"
              disabled={balance < totalCost}
            >
              <Icon name="ShoppingCart" size={18} className="mr-2" />
              Купить {currentCardType === 'stock' ? `(${stockQuantity}шт) ` : ''}за наличные
            </Button>
            
            <Button
              onClick={() => buyCard(true)}
              variant="outline"
              className="w-full"
              disabled={!canAffordWithLoan(totalCost, totalCost * 0.1)}
            >
              <Icon name="CreditCard" size={18} className="mr-2" />
              Купить {currentCardType === 'stock' ? `(${stockQuantity}шт) ` : ''}в кредит (10%/мес)
            </Button>

            {currentCardType === 'stock' && ownedStocks[(currentCard as Stock).id] && (
              <Button
                onClick={() => sellStock(stockQuantity)}
                variant="destructive"
                className="w-full"
                disabled={!ownedStocks[(currentCard as Stock).id] || ownedStocks[(currentCard as Stock).id].quantity < stockQuantity}
              >
                <Icon name="TrendingDown" size={18} className="mr-2" />
                Продать ({stockQuantity}шт)
              </Button>
            )}
            
            {currentCardType === 'asset' && ownedAssets[(currentCard as Asset).id] && (
              <Button
                onClick={sellAsset}
                variant="destructive"
                className="w-full"
                disabled={!ownedAssets[(currentCard as Asset).id] || ownedAssets[(currentCard as Asset).id].quantity < 1}
              >
                <Icon name="TrendingDown" size={18} className="mr-2" />
                Продать (70% от стоимости)
              </Button>
            )}

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
      </CardContent>
    </Card>
  );
};

export default CurrentCard;