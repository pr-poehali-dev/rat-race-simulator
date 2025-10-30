import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { OwnedItem } from "@/types/game";

interface PortfolioProps {
  ownedItems: OwnedItem[];
}

const Portfolio = ({ ownedItems }: PortfolioProps) => {
  return (
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
                  {item.purchasePrice > 0 && `$${item.purchasePrice.toFixed(0)}`}
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
  );
};

export default Portfolio;