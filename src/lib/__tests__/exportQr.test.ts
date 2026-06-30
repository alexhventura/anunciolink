import { describe, expect, it } from "vitest";
import { FULL_AD, MINIMAL_AD } from "./fixtures";
import { hasPixQr, resolveExportQr } from "../exportQr";

describe("resolveExportQr", () => {
  const url = "https://www.anunciolink.com.br/a/v2.test";

  it("usa Pix quando o usuário escolhe pagamento", () => {
    const ad = { ...FULL_AD, pix: "00020126580014br.gov.bcb.pix" };
    const result = resolveExportQr(ad, url, "pix");
    expect(result.mode).toBe("pix");
    expect(result.value).toBe(ad.pix);
  });

  it("usa link do anúncio quando o usuário escolhe visitar página", () => {
    const ad = { ...FULL_AD, pix: "00020126580014br.gov.bcb.pix" };
    const result = resolveExportQr(ad, url, "ad");
    expect(result.mode).toBe("ad");
    expect(result.value).toBe(url);
  });

  it("usa link quando não há Pix mesmo com preferência pix", () => {
    const ad = { ...MINIMAL_AD, pix: undefined };
    const result = resolveExportQr(ad, url, "pix");
    expect(result.mode).toBe("ad");
    expect(result.value).toBe(url);
  });

  it("hasPixQr detecta código válido", () => {
    expect(hasPixQr(FULL_AD)).toBe(true);
    expect(hasPixQr(MINIMAL_AD)).toBe(false);
  });
});
