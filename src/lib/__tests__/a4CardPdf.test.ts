/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import { MINIMAL_AD } from "./fixtures";

const JPEG_1X1 =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDAREAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGoAP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEABj8Cf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8hf//Z";

vi.mock("../a4PosterCanvas", () => ({
  renderA4PosterBlob: vi.fn(async () => {
    const res = await fetch(JPEG_1X1);
    return res.blob();
  }),
}));

vi.mock("../shareImage", () => ({
  shareCardFilename: () => "anunciolink-teste.jpg",
}));

describe("a4CardPdf", () => {
  it("baixa PDF A4 com cartaz embutido", async () => {
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
