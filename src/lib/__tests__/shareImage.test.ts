import { describe, expect, it } from "vitest";
import { MINIMAL_AD } from "./fixtures";
import { exportPdfFilename, shareCardFilename } from "../shareImage";

describe("export filenames", () => {
  it("JPG e PDF compartilham o mesmo basename", () => {
    const jpg = shareCardFilename(MINIMAL_AD);
    const pdf = exportPdfFilename(MINIMAL_AD);
    expect(jpg).toMatch(/\.jpg$/i);
    expect(pdf).toMatch(/\.pdf$/i);
    expect(jpg.replace(/\.jpe?g$/i, "")).toBe(pdf.replace(/\.pdf$/i, ""));
  });
});
