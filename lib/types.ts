/** The banking product types the application offers (FR-01). */
export const PRODUCT_TYPES = [
  "CONTA_CORRENTE",
  "CONTA_POUPANCA",
  "CARTAO_CREDITO",
  "EMPRESTIMO_PESSOAL",
  "INVESTIMENTO",
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];

/** Human-readable pt-BR labels used by the UI (FR-02). */
export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  CONTA_CORRENTE: "Conta Corrente",
  CONTA_POUPANCA: "Conta Poupança",
  CARTAO_CREDITO: "Cartão de Crédito",
  EMPRESTIMO_PESSOAL: "Empréstimo Pessoal",
  INVESTIMENTO: "Investimento",
};

export interface BankingProduct {
  /** UUID v4, generated on creation and immutable. */
  id: string;
  name: string;
  type: ProductType;
  description: string;
  /** Percent per annum. */
  interestRate: number;
  /** Monthly fee in BRL. */
  monthlyFee: number;
  isActive: boolean;
  /** ISO 8601 timestamp, set on creation and immutable. */
  createdAt: string;
}

/** Editable fields; `id` and `createdAt` are owned by the store. */
export type ProductFields = Omit<BankingProduct, "id" | "createdAt">;

export type CreateProductInput = ProductFields;
export type UpdateProductInput = Partial<ProductFields>;

/** One message per rejected field, keyed by field name (FR-06). */
export type FieldErrors = Partial<Record<keyof ProductFields, string>>;
