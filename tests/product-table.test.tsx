import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ProductTable from "../app/ProductTable";
import { formatCurrency, formatInterestRate } from "../lib/format";
import type { BankingProduct } from "../lib/types";

const products: BankingProduct[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Cartão Platinum",
    type: "CARTAO_CREDITO",
    description: "Cartão com cashback.",
    interestRate: 12.5,
    monthlyFee: 29.9,
    isActive: true,
    createdAt: "2026-08-19T12:00:00.000Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Poupança Plus",
    type: "CONTA_POUPANCA",
    description: "",
    interestRate: 6,
    monthlyFee: 0,
    isActive: false,
    createdAt: "2026-08-18T12:00:00.000Z",
  },
];

const noop = () => {};

describe("ProductTable", () => {
  it("renders every product with its columns (AC-01)", () => {
    const html = renderToStaticMarkup(
      <ProductTable products={products} onEdit={noop} onDelete={noop} />,
    );

    expect(html).toContain("Cartão Platinum");
    expect(html).toContain("Poupança Plus");
    expect(html).toContain(formatInterestRate(12.5));
    expect(html).toContain(formatCurrency(29.9));
    expect(html).toContain("Sim");
    expect(html).toContain("Não");
  });

  it("renders a human-readable label for the product type (FR-02)", () => {
    const html = renderToStaticMarkup(
      <ProductTable products={products} onEdit={noop} onDelete={noop} />,
    );

    expect(html).toContain("Cartão de Crédito");
    expect(html).toContain("Conta Poupança");
    expect(html).not.toContain("CARTAO_CREDITO");
  });

  it("renders the edit and delete actions for each row", () => {
    const html = renderToStaticMarkup(
      <ProductTable products={products} onEdit={noop} onDelete={noop} />,
    );

    expect(html.match(/Editar/g)).toHaveLength(2);
    expect(html.match(/Excluir/g)).toHaveLength(2);
  });

  it("renders the empty state instead of the table when there is no product (AC-02)", () => {
    const html = renderToStaticMarkup(<ProductTable products={[]} onEdit={noop} onDelete={noop} />);

    expect(html).toContain("Nenhum produto cadastrado.");
    expect(html).not.toContain("<table");
  });
});

describe("formatters", () => {
  it("formats interest rates as pt-BR percentages per annum", () => {
    expect(formatInterestRate(12.5)).toBe("12,50% a.a.");
  });

  it("formats fees as BRL currency", () => {
    expect(formatCurrency(1234.5).replace(/ /g, " ")).toBe("R$ 1.234,50");
  });
});
