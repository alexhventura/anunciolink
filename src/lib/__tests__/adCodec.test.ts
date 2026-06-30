import { describe, expect, it } from "vitest";
import { encodeAdData, decodeAdData } from "../adCodec";
import { FULL_AD, INVALID_PAYLOADS, LEGACY_EXPANDED, MINIMAL_AD } from "./fixtures";

describe("adCodec", () => {
  it("encode produz prefixo v2.", () => {
    const payload = encodeAdData(MINIMAL_AD);
    expect(payload.startsWith("v2.")).toBe(true);
    expect(payload.length).toBeGreaterThan(10);
  });

  it("round-trip v2 preserva dados essenciais", () => {
    const payload = encodeAdData(FULL_AD);
    const decoded = decodeAdData(payload);
    expect(decoded?.title).toBe(FULL_AD.title);
    expect(decoded?.price).toBe(FULL_AD.price);
    expect(decoded?.icon).toBe(FULL_AD.icon);
    expect(decoded?.theme).toBeUndefined();
    expect(decoded?.pix).toBe(FULL_AD.pix);
  });

  it("decodifica legado base64 JSON expandido", () => {
    const json = JSON.stringify(LEGACY_EXPANDED);
    const legacyPayload = btoa(json);
    const decoded = decodeAdData(legacyPayload);
    expect(decoded?.title).toBe("Servico Legado");
    expect(decoded?.t).toBe("servico");
  });

  it("retorna null para payloads inválidos", () => {
    for (const bad of INVALID_PAYLOADS) {
      expect(decodeAdData(bad)).toBeNull();
    }
  });

  it("golden snapshot — payload mínimo estável", () => {
    const payload = encodeAdData(MINIMAL_AD);
    expect(payload).toMatch(/^v2\.[A-Za-z0-9_-]+$/);
    const again = encodeAdData(MINIMAL_AD);
    expect(again).toBe(payload);
  });
});
