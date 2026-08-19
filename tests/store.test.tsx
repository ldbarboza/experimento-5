import { beforeEach, describe, expect, it } from "vitest";
import { clear, findAll, findById, insert, remove, update } from "../lib/store";
import type { CreateProductInput, UpdateProductInput } from "../lib/types";

function input(overrides: Partial<CreateProductInput> = {}): CreateProductInput {
  return {
    name: "Conta Corrente Digital",
    type: "CONTA_CORRENTE",
    description: "Sem tarifa de manutenção.",
    interestRate: 0,
    monthlyFee: 0,
    isActive: true,
    ...overrides,
  };
}

describe("banking product store", () => {
  beforeEach(() => {
    clear();
  });

  it("generates an id and a creation timestamp on insert", () => {
    const product = insert(input());

    expect(product.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(Number.isNaN(Date.parse(product.createdAt))).toBe(false);
    expect(findById(product.id)).toEqual(product);
  });

  it("lists products most recently created first", () => {
    const first = insert(input({ name: "Poupança" }));
    const second = insert(input({ name: "Cartão" }));

    expect(findAll().map((product) => product.id)).toEqual([second.id, first.id]);
  });

  it("returns an empty list when nothing is stored", () => {
    expect(findAll()).toEqual([]);
  });

  it("applies a partial patch and keeps the other fields untouched", () => {
    const product = insert(input());

    const updated = update(product.id, { name: "Conta Gold" });

    expect(updated?.name).toBe("Conta Gold");
    expect(updated?.type).toBe(product.type);
    expect(updated?.monthlyFee).toBe(product.monthlyFee);
  });

  it("keeps id and createdAt immutable on update", () => {
    const product = insert(input());

    // The immutable fields are not part of `UpdateProductInput`, so the patch
    // has to be smuggled past the compiler to prove the store ignores them.
    const patch = { id: "hacked", createdAt: "1999-01-01T00:00:00.000Z" } as UpdateProductInput;

    const updated = update(product.id, patch);

    expect(updated?.id).toBe(product.id);
    expect(updated?.createdAt).toBe(product.createdAt);
  });

  it("returns undefined when updating an unknown id", () => {
    expect(update("nonexistent", { name: "Conta Gold" })).toBeUndefined();
  });

  it("removes a stored product and reports unknown ids", () => {
    const product = insert(input());

    expect(remove(product.id)).toBe(true);
    expect(findById(product.id)).toBeUndefined();
    expect(remove("nonexistent")).toBe(false);
  });
});
