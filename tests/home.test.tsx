import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import RootLayout, { metadata } from "../app/layout";
import Page from "../app/page";

describe("root page", () => {
  it("server-renders the text Hello World", () => {
    const html = renderToStaticMarkup(<Page />);

    expect(html).toContain("Hello World");
    expect(html).toContain("<h1>Hello World</h1>");
  });
});

describe("root layout", () => {
  it("exposes a non-empty page title", () => {
    expect(metadata.title).toBe("Hello World | experimento-5");
  });

  it("renders the html document shell around its children", () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <Page />
      </RootLayout>,
    );

    expect(html).toContain('<html lang="en">');
    expect(html).toContain("<h1>Hello World</h1>");
  });
});
