import type { BankingProduct, CreateProductInput, UpdateProductInput } from "./types";

// Module-level singleton: every Route Handler in the same Node.js process shares
// this Map (ADR-01). Data is lost when the server restarts, which is acceptable
// for this iteration — swapping this module out is the only change a real
// database would require.
const products = new Map<string, BankingProduct>();

/** All products, most recently created first (FR-02). */
export function findAll(): BankingProduct[] {
  // `Array.prototype.sort` is stable and the Map iterates in insertion order,
  // so reversing first keeps the newest record on top when two products share
  // the same `createdAt` millisecond.
  return Array.from(products.values())
    .reverse()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
}

export function findById(id: string): BankingProduct | undefined {
  return products.get(id);
}

export function insert(input: CreateProductInput): BankingProduct {
  const product: BankingProduct = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  products.set(product.id, product);

  return product;
}

/** Applies a partial patch; returns `undefined` when `id` is unknown. */
export function update(id: string, patch: UpdateProductInput): BankingProduct | undefined {
  const current = products.get(id);

  if (!current) {
    return undefined;
  }

  // `id` and `createdAt` are immutable (FR-04), so they are re-applied last.
  const updated: BankingProduct = {
    ...current,
    ...patch,
    id: current.id,
    createdAt: current.createdAt,
  };

  products.set(id, updated);

  return updated;
}

/** Returns `false` when `id` is unknown, so callers can answer 404 (FR-05). */
export function remove(id: string): boolean {
  return products.delete(id);
}

/** Drops every record. Used by tests to start from a known state. */
export function clear(): void {
  products.clear();
}
