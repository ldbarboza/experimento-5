const percentFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** `12.5` → `"12,50% a.a."` */
export function formatInterestRate(value: number): string {
  return `${percentFormatter.format(value)}% a.a.`;
}

/** `29.9` → `"R$ 29,90"` */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}
