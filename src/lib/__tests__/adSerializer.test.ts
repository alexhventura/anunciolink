import { describe, expect, it } from "vitest";
import { AdSerializer, QR_MAX_URL_CHARS } from "../adSerializer";
import { FULL_AD, MINIMAL_AD } from "./fixtures";
import { MAX_SHARE_URL_SAFE } from "../constants";

describe("AdSerializer", () => {
  it("normalize remove img legado", () => {
    const ad = AdSerializer.normalize({
      ...MINIMAL_AD,
      img: "j:abc",
    });
    expect(ad.img).toBeUndefined();
  });

  it("encode/decode round-trip", () => {
    const payload = AdSerializer.encode(FULL_AD);
    const decoded = AdSerializer.decode(payload);
    expect(decoded?.title).toBe(FULL_AD.title);
  });

  it("fitForShareUrl retorna hash dentro do limite", async () => {
    const result = await AdSerializer.fitForShareUrl(FULL_AD);
    expect(result.hash.startsWith("v2.")).toBe(true);
    expect(AdSerializer.estimateShareUrlLength(result.hash)).toBeLessThanOrEqual(
      MAX_SHARE_URL_SAFE
    );
  });

  it("buildQrUrl respeita limite de 900 chars", () => {
    const url = AdSerializer.buildQrUrl(FULL_AD);
    expect(url.length).toBeLessThanOrEqual(QR_MAX_URL_CHARS);
    expect(AdSerializer.isQrUrlSafe(url)).toBe(true);
  });

  it("buildQrUrl omite pix se necessário para URLs longas", () => {
    const heavy = {
      ...FULL_AD,
      desc: "x".repeat(800),
      pix: "0".repeat(400),
    };
    const url = AdSerializer.buildQrUrl(heavy);
    expect(url.length).toBeLessThanOrEqual(QR_MAX_URL_CHARS);
  });

  it("getPayloadScore retorna nível e dica", () => {
    const score = AdSerializer.getPayloadScore(MINIMAL_AD);
    expect(score.level).toBe("excellent");
    expect(score.percent).toBeLessThan(50);
    expect(score.tip).toContain("leve");
  });

  it("validate rejeita anúncio incompleto", () => {
    expect(AdSerializer.validate({ ...MINIMAL_AD, title: "" })).toBe(false);
  });
});

describe("checksum (futuro)", () => {
  it.todo("deve validar checksum quando implementado no wire v3");
});
