import { beforeEach, describe, expect, it } from "vitest";
import { DELETE, PUT } from "../app/api/banking-products/[id]/route";
import { GET, POST } from "../app/api/banking-products/route";
import { clear } from "../lib/store";
import type { BankingProduct } from "../lib/types";

const BASE_URL = "http://localhost/api/banking-products";

const validBody = {
  name: "Cartão Platinum",
  type: "CARTAO_CREDITO",
  description: "Cartão com cashback.",
  interestRate: 12.5,
  monthlyFee: 29.9,
  isActive: true,
};

function postRequest(body: unknown): Request {
  return new Request(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function putRequest(id: string, body: unknown): Request {
  return new Request(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function createProduct(overrides: Record<string, unknown> = {}): Promise<BankingProduct> {
  const response = await POST(postRequest({ ...validBody, ...overrides }));

  return (await response.json()) as BankingProduct;
}

describe("GET /api/banking-products", () => {
  beforeEach(() => {
    clear();
  });

  it("returns an empty array when nothing is stored (AC-02)", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
  });

  it("returns every product, most recent first (AC-01)", async () => {
    const first = await createProduct({ name: "Poupança Plus" });
    const second = await createProduct({ name: "Conta Corrente Digital" });

    const products = (await (await GET()).json()) as BankingProduct[];

    expect(products.map((product) => product.id)).toEqual([second.id, first.id]);
  });
});

describe("POST /api/banking-products", () => {
  beforeEach(() => {
    clear();
  });

  it("creates a product and answers 201 (AC-03)", async () => {
    const response = await POST(postRequest(validBody));
    const product = (await response.json()) as BankingProduct;

    expect(response.status).toBe(201);
    expect(product).toMatchObject(validBody);
    expect(product.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(Number.isNaN(Date.parse(product.createdAt))).toBe(false);

    const products = (await (await GET()).json()) as BankingProduct[];
    expect(products[0].id).toBe(product.id);
  });

  it("answers 400 listing the invalid field when name is empty (AC-04)", async () => {
    const response = await POST(postRequest({ ...validBody, name: "" }));
    const body = (await response.json()) as { errors: Record<string, string> };

    expect(response.status).toBe(400);
    expect(body.errors.name).toBeDefined();
    expect((await (await GET()).json()) as BankingProduct[]).toEqual([]);
  });

  it("answers 400 for a malformed JSON body", async () => {
    const response = await POST(
      new Request(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{not json",
      }),
    );

    expect(response.status).toBe(400);
  });
});

describe("PUT /api/banking-products/:id", () => {
  beforeEach(() => {
    clear();
  });

  it("updates the given fields and answers 200 (AC-05)", async () => {
    const product = await createProduct();

    const response = await PUT(putRequest(product.id, { name: "Conta Gold" }), {
      params: { id: product.id },
    });
    const updated = (await response.json()) as BankingProduct;

    expect(response.status).toBe(200);
    expect(updated).toEqual({ ...product, name: "Conta Gold" });
  });

  it("answers 404 for an unknown id (AC-06)", async () => {
    const response = await PUT(putRequest("nonexistent", { name: "Conta Gold" }), {
      params: { id: "nonexistent" },
    });

    expect(response.status).toBe(404);
  });

  it("answers 400 for an invalid field", async () => {
    const product = await createProduct();

    const response = await PUT(putRequest(product.id, { interestRate: -1 }), {
      params: { id: product.id },
    });
    const body = (await response.json()) as { errors: Record<string, string> };

    expect(response.status).toBe(400);
    expect(body.errors.interestRate).toBeDefined();
  });

  it("answers 400 for a malformed JSON body", async () => {
    const response = await PUT(
      new Request(`${BASE_URL}/any-id`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: "{not json",
      }),
      { params: { id: "any-id" } },
    );

    expect(response.status).toBe(400);
  });
});

describe("DELETE /api/banking-products/:id", () => {
  beforeEach(() => {
    clear();
  });

  it("removes the product and answers 204 (AC-07)", async () => {
    const product = await createProduct();

    const response = await DELETE(new Request(`${BASE_URL}/${product.id}`, { method: "DELETE" }), {
      params: { id: product.id },
    });

    expect(response.status).toBe(204);

    const products = (await (await GET()).json()) as BankingProduct[];
    expect(products.map((item) => item.id)).not.toContain(product.id);
  });

  it("answers 404 for an unknown id (AC-08)", async () => {
    const response = await DELETE(
      new Request(`${BASE_URL}/nonexistent`, { method: "DELETE" }),
      { params: { id: "nonexistent" } },
    );

    expect(response.status).toBe(404);
  });
});
