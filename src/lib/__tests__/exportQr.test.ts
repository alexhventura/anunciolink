import { describe, expect, it } from "vitest";
import { FULL_AD, MINIMAL_AD } from "./fixtures";
import { resolveExportQr } from "../exportQr";

describe("resolveExportQr", () => {
  it("usa Pix quando o anúncio tem código copia e cola", () => {
    const ad = { ...FULL_AD, pix: "00020126580014br.gov.bcb.pix" };
    const result = resolveExportQr(ad, "https://www.anunciolink.com.br/a/v2.test");
    expect(result.mode).toBe("pix");
    expect(result.value).toBe(ad.pix);
  });

  it("usa link do anúncio quando não há Pix", () => {
    const ad = { ...MINIMAL_AD, pix: undefined };
    const url = "https://www.anunciolink.com.br/a/v2.test";
    const result = resolveExportQr(ad, url);
    expect(result.mode).toBe("ad");
    expect(result.value).toBe(url);
  });
});
