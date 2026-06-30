/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import { MINIMAL_AD } from "./fixtures";

const PNG_1X1 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

vi.mock("../shareImage", () => ({
  generateShareCardBlob: vi.fn(async () => {
    const res = await fetch(PNG_1X1);
    return res.blob();
  }),
  shareCardFilename: () => "anunciolink-teste.png",
}));

describe("a4CardPdf", () => {
  it("baixa PDF com bytes do card embutidos", async () => {
    const anchorClick = vi.fn();
    const createElementSpy = vi
      .spyOn(document, "createElement")
      .mockImplementation((tagName: string) => {
        const el = document.createElementNS(
          "http://www.w3.org/1999/xhtml",
          tagName
        ) as HTMLAnchorElement;
        if (tagName.toLowerCase() === "a") {
          el.click = anchorClick;
        }
        return el;
      });

    window.open = vi.fn(() => null) as typeof window.open;

    const { printA4CardPdf } = await import("../a4CardPdf");
    await printA4CardPdf(MINIMAL_AD, "https://example.com/a/v2.test");

    expect(anchorClick).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenCalledTimes(1);

    createElementSpy.mockRestore();
  });
});
