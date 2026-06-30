import { describe, expect, it } from "vitest";
import { buildNativeShareText } from "../shareLinks";

describe("buildNativeShareText", () => {
  it("não inclui URL no texto (evita duplicar no compartilhamento nativo)", () => {
    const url = "https://www.anunciolink.com.br/a/v2.abc123";
    const text = buildNativeShareText({
      title: "Bicicleta",
      price: "R$ 500,00",
      description: "Pouco uso, entrega combinada.",
    });

    expect(text).not.toContain(url);
    expect(text).toContain("Bicicleta");
    expect(text).toContain("R$ 500,00");
    expect(text).toContain("Pouco uso");
  });
});
