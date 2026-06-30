import { describe, expect, it } from "vitest";
import {
  AD_VEICULATION_DAYS,
  computeExpiresAt,
  isAdExpired,
  resolveAdExpiresAt,
} from "../adExpiry";
import { FIXTURE_EXPIRES, FIXTURE_TIMESTAMP, MINIMAL_AD } from "./fixtures";

const MS_PER_DAY = 86_400_000;

describe("adExpiry", () => {
  it("define expiração de 30 dias apenas para vendas", () => {
    const now = FIXTURE_TIMESTAMP;
    expect(computeExpiresAt(now, "venda")).toBe(now + AD_VEICULATION_DAYS * MS_PER_DAY);
    expect(computeExpiresAt(now, "servico")).toBeUndefined();
    expect(computeExpiresAt(now, "vaquinha")).toBeUndefined();
  });

  it("marca venda como expirada após o prazo", () => {
    const ad = { ...MINIMAL_AD, expiresAt: FIXTURE_EXPIRES };
    expect(isAdExpired(ad, FIXTURE_EXPIRES + 1)).toBe(true);
    expect(isAdExpired(ad, FIXTURE_EXPIRES)).toBe(false);
  });

  it("mantém serviço e vaquinha permanentes mesmo com expiresAt legado", () => {
    const past = FIXTURE_TIMESTAMP - MS_PER_DAY;
    const servico = {
      ...MINIMAL_AD,
      t: "servico" as const,
      expiresAt: past,
    };
    const vaquinha = {
      ...MINIMAL_AD,
      t: "vaquinha" as const,
      expiresAt: past,
    };

    expect(resolveAdExpiresAt(servico)).toBeUndefined();
    expect(resolveAdExpiresAt(vaquinha)).toBeUndefined();
    expect(isAdExpired(servico, Date.now())).toBe(false);
    expect(isAdExpired(vaquinha, Date.now())).toBe(false);
  });
});
