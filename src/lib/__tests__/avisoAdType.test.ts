import { describe, expect, it } from "vitest";
import { adTypeRequiresPrice, formatAdPriceDisplay } from "../adTypeUtils";
import { validateAdForm, validateAdFormField } from "../formValidation";
import { encodeAdData, decodeAdData } from "../adCodec";
import type { AdData } from "../../types/ad";

describe("tipo aviso (informativo sem valor)", () => {
  it("não exige preço", () => {
    expect(adTypeRequiresPrice("aviso")).toBe(false);
    expect(adTypeRequiresPrice("venda")).toBe(true);
  });

  it("valida formulário sem preço", () => {
    const errors = validateAdForm({
      adType: "aviso",
      title: "Mudança de horário",
      price: "",
      description: "A partir de segunda o atendimento será das 9h às 17h.",
      phone: "",
      pix: "",
      cardLink: "",
      password: "",
    });
    expect(errors.price).toBeUndefined();
    expect(errors.title).toBeUndefined();
    expect(errors.description).toBeUndefined();
  });

  it("rejeita preço vazio em venda", () => {
    const msg = validateAdFormField("price", {
      adType: "venda",
      title: "Produto",
      price: "",
      description: "Descrição válida aqui.",
      phone: "",
      pix: "",
      cardLink: "",
      password: "",
    });
    expect(msg).toBeTruthy();
  });

  it("exibe Sem valor no lugar do preço", () => {
    expect(formatAdPriceDisplay("aviso", "", "unico")).toBe("Sem valor");
    expect(formatAdPriceDisplay("venda", "R$ 10,00", "recorrente")).toBe("R$ 10,00 /mês");
  });

  it("codifica e decodifica aviso com preço vazio", () => {
    const ad: AdData = {
      t: "aviso",
      title: "Aviso importante",
      price: "",
      desc: "Informativo sem cobrança para a comunidade local.",
      phone: "",
      timestamp: 1_700_000_000_000,
    };
    const encoded = encodeAdData(ad);
    const decoded = decodeAdData(encoded);
    expect(decoded?.t).toBe("aviso");
    expect(decoded?.title).toBe("Aviso importante");
    expect(decoded?.price ?? "").toBe("");
  });
});
