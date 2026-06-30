import { describe, expect, it } from "vitest";
import { encodeAdData } from "../adCodec";
import { MINIMAL_AD } from "./fixtures";
import { resolveSavedAdData, isSavedAdExportable } from "../savedAdExport";
import type { SavedAdEntry } from "../adHistory";

describe("savedAdExport", () => {
  const payload = encodeAdData(MINIMAL_AD);

  const entry: SavedAdEntry = {
    id: "test-id",
    title: MINIMAL_AD.title,
    price: MINIMAL_AD.price,
    url: `https://www.anunciolink.com.br/a/${encodeURIComponent(payload)}`,
    type: MINIMAL_AD.t,
    createdAt: Date.now(),
    payload,
  };

  it("resolve AdData a partir do payload salvo", () => {
    const ad = resolveSavedAdData(entry);
    expect(ad?.title).toBe(MINIMAL_AD.title);
    expect(isSavedAdExportable(entry)).toBe(true);
  });

  it("não exporta anúncio com senha (locked)", () => {
    const locked: SavedAdEntry = {
      ...entry,
      payload: "locked.U2FsdGVkX1-fake",
      url: "https://www.anunciolink.com.br/#locked_fake",
    };
    expect(resolveSavedAdData(locked)).toBeNull();
    expect(isSavedAdExportable(locked)).toBe(false);
  });
});
