import { describe, expect, it } from "vitest";
import { isAdExpired } from "../adExpiry";
import { toCompactWire, fromCompactWire, normalizeLegacyAd } from "../adWire";
import {
  COMPACT_WIRE,
  FIXTURE_EXPIRES,
  FULL_AD,
  LEGACY_EXPANDED,
  LEGACY_WITH_IMAGE,
  MINIMAL_AD,
} from "./fixtures";

describe("adWire", () => {
  it("serializa campos mínimos com chaves compactas", () => {
    const wire = toCompactWire(MINIMAL_AD);
    expect(wire.t).toBe("venda");
    expect(wire.ti).toBe(MINIMAL_AD.title);
    expect(wire.p).toBe(MINIMAL_AD.price);
    expect(wire.d).toBe(MINIMAL_AD.desc);
    expect(wire.i).toBeUndefined();
  });

  it("inclui ícone quando definido e não codifica tema", () => {
    const wire = toCompactWire(FULL_AD);
    expect(wire.e).toBe(42);
    expect(wire.th).toBeUndefined();
    expect(wire.b).toBe("recorrente");
  });

  it("não codifica imagem nem crop no encode (decode-only legado)", () => {
    const wire = toCompactWire({
      ...MINIMAL_AD,
      img: "j:abc123",
      crop: { zoom: 1.2, panX: 1, panY: 2 },
    });
    expect(wire.i).toBeUndefined();
    expect(wire.cz).toBeUndefined();
  });

  it("omite ícone no wire quando é logo padrão (marca do site)", () => {
    expect(toCompactWire({ ...MINIMAL_AD, icon: undefined }).e).toBeUndefined();
    expect(toCompactWire({ ...MINIMAL_AD, icon: -1 }).e).toBeUndefined();
  });

  it("decodifica e: -1 legado como marca do site", () => {
    const ad = fromCompactWire({ ...COMPACT_WIRE, e: -1 });
    expect(ad.icon).toBe(-1);
  });

  it("round-trip wire compacto preserva dados principais", () => {
    const ad = fromCompactWire(toCompactWire(FULL_AD));
    expect(ad.title).toBe(FULL_AD.title);
    expect(ad.icon).toBe(FULL_AD.icon);
    expect(ad.theme).toBeUndefined();
  });

  it("decodifica tema legado quando presente no wire", () => {
    const ad = fromCompactWire({ ...COMPACT_WIRE, th: "sunset" });
    expect(ad.theme).toBe("sunset");
  });

  it("decodifica wire legado expandido", () => {
    const ad = normalizeLegacyAd(LEGACY_EXPANDED);
    expect(ad?.t).toBe("servico");
    expect(ad?.title).toBe("Servico Legado");
  });

  it("decodifica wire legado com imagem e crop", () => {
    const ad = normalizeLegacyAd(LEGACY_WITH_IMAGE);
    expect(ad?.img).toBe(LEGACY_WITH_IMAGE.img);
    expect(ad?.crop?.zoom).toBe(1.2);
  });

  it("reconhece wire já compacto inline", () => {
    const ad = normalizeLegacyAd(COMPACT_WIRE as unknown as Record<string, unknown>);
    expect(ad?.title).toBe(COMPACT_WIRE.ti);
  });

  it("não codifica expiração para serviço ou vaquinha", () => {
    const servico = toCompactWire({ ...FULL_AD, t: "servico", expiresAt: FIXTURE_EXPIRES });
    expect(servico.ex).toBeUndefined();

    const vaquinha = toCompactWire({ ...FULL_AD, t: "vaquinha", expiresAt: FIXTURE_EXPIRES });
    expect(vaquinha.ex).toBeUndefined();
  });

  it("decodifica serviço sem expiração mesmo com ex legado no wire", () => {
    const ad = fromCompactWire({ ...COMPACT_WIRE, t: "servico", ex: FIXTURE_EXPIRES });
    expect(ad.expiresAt).toBeUndefined();
    expect(isAdExpired(ad, FIXTURE_EXPIRES + 1)).toBe(false);
  });
});
