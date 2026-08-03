import { DocumentItem, Sale, Expense } from '../types';

export function formatUGX(amount: number): string {
  const rounded = Math.round(amount || 0);
  return 'UGX ' + rounded.toLocaleString('en-US');
}

export function calculateDocumentTotals(
  items: DocumentItem[],
  discountUGX: number = 0,
  includeVAT: boolean = false
) {
  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPriceUGX), 0);
  const afterDiscount = Math.max(0, subtotal - discountUGX);
  // Uganda standard VAT is 18%
  const vatAmount = includeVAT ? Math.round(afterDiscount * 0.18) : 0;
  const total = afterDiscount + vatAmount;

  return {
    subtotalUGX: subtotal,
    discountUGX,
    includeVAT,
    vatAmountUGX: vatAmount,
    totalUGX: total,
  };
}

export function calculateFinancialSummary(sales: Sale[], expenses: Expense[]) {
  const totalSales = sales.reduce((acc, s) => acc + s.totalAmountUGX, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amountUGX, 0);
  const estimatedProfit = totalSales - totalExpenses;

  const cashSales = sales
    .filter((s) => s.paymentMethod === 'Cash')
    .reduce((acc, s) => acc + s.totalAmountUGX, 0);

  const mobileMoneySales = sales
    .filter((s) => s.paymentMethod === 'MTN Mobile Money' || s.paymentMethod === 'Airtel Money')
    .reduce((acc, s) => acc + s.totalAmountUGX, 0);

  const bankSales = sales
    .filter((s) => s.paymentMethod === 'Bank')
    .reduce((acc, s) => acc + s.totalAmountUGX, 0);

  return {
    totalSalesUGX: totalSales,
    totalExpensesUGX: totalExpenses,
    estimatedProfitUGX: estimatedProfit,
    cashSalesUGX: cashSales,
    mobileMoneySalesUGX: mobileMoneySales,
    bankSalesUGX: bankSales,
  };
}
