import { describe, expect, it } from "vitest";
import { toCompactWire, fromCompactWire, normalizeLegacyAd } from "../adWire";
import { COMPACT_WIRE, FULL_AD, LEGACY_EXPANDED, LEGACY_WITH_IMAGE, MINIMAL_AD } from "./fixtures";

describe("adWire", () => {
  it("serializa campos mínimos com chaves compactas", () => {
    const wire = toCompactWire(MINIMAL_AD);
    expect(wire.t).toBe("venda");
    expect(wire.ti).toBe(MINIMAL_AD.title);
    expect(wire.p).toBe(MINIMAL_AD.price);
    expect(wire.d).toBe(MINIMAL_AD.desc);
    expect(wire.i).toBeUndefined();
  });

  it("inclui ícone e tema quando definidos", () => {
    const wire = toCompactWire(FULL_AD);
    expect(wire.e).toBe(42);
    expect(wire.th).toBe("sunset");
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

  it("round-trip wire compacto", () => {
    const ad = fromCompactWire(toCompactWire(FULL_AD));
    expect(ad.title).toBe(FULL_AD.title);
    expect(ad.icon).toBe(FULL_AD.icon);
    expect(ad.theme).toBe(FULL_AD.theme);
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
});
