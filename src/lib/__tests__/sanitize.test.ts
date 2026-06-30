import { describe, expect, it } from "vitest";
import { sanitizeHttpUrl, sanitizePlainText } from "../sanitize";

describe("sanitize", () => {
  it("remove javascript: de texto", () => {
    expect(sanitizePlainText('javascript:alert("x")')).not.toContain("javascript:");
  });

  it("remove data: e vbscript:", () => {
    expect(sanitizePlainText("data:text/html,<script>")).not.toMatch(/data:/i);
    expect(sanitizePlainText("vbscript:msgbox")).not.toMatch(/vbscript:/i);
  });

  it("bloqueia javascript: em URLs", () => {
    expect(sanitizeHttpUrl("javascript:alert(1)")).toBeUndefined();
  });

  it("bloqueia data: em URLs", () => {
    expect(sanitizeHttpUrl("data:text/html,hello")).toBeUndefined();
  });

  it("bloqueia vbscript: em URLs", () => {
    expect(sanitizeHttpUrl("vbscript:msgbox")).toBeUndefined();
  });

  it("aceita https válida", () => {
    expect(sanitizeHttpUrl("https://mpago.la/abc")).toBe("https://mpago.la/abc");
  });
});
