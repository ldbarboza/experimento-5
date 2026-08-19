import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import RootLayout, { metadata } from "../app/layout";
import Page from "../app/page";

describe("root page", () => {
  it("server-renders the product list heading and the create action", () => {
    const html = renderToStaticMarkup(<Page />);

    expect(html).toContain("<h1>Produtos Bancários</h1>");
    expect(html).toContain("Novo Produto");
  });

  it("shows the loading state before the product list is fetched", () => {
    const html = renderToStaticMarkup(<Page />);

    expect(html).toContain("Carregando…");
  });

  it("renders the delete confirmation dialog (AC-09)", () => {
    const html = renderToStaticMarkup(<Page />);

    expect(html).toContain("<dialog");
    expect(html).toContain("Tem certeza que deseja excluir este produto?");
  });
});

describe("root layout", () => {
  it("exposes the banking products page title", () => {
    expect(metadata.title).toBe("Produtos Bancários | experimento-5");
  });

  it("renders the html document shell around its children", () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <Page />
      </RootLayout>,
    );

    expect(html).toContain('<html lang="pt-BR">');
    expect(html).toContain("<h1>Produtos Bancários</h1>");
  });
});
