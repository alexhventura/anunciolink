import { describe, expect, it } from "vitest";
import {
  adTypeRequiresPrice,
  adTypeShowsPayment,
  buildWhatsAppPrefill,
  formatAdPriceDisplay,
} from "../adTypeUtils";
import { validateAdForm, validateAdFormField } from "../formValidation";
import { encodeAdData, decodeAdData } from "../adCodec";
import type { AdData } from "../../types/ad";

describe("tipos sem valor (aviso e contato)", () => {
  it("não exige preço nem pagamento", () => {
    expect(adTypeRequiresPrice("aviso")).toBe(false);
    expect(adTypeRequiresPrice("contato")).toBe(false);
    expect(adTypeShowsPayment("aviso")).toBe(false);
    expect(adTypeShowsPayment("contato")).toBe(false);
    expect(adTypeRequiresPrice("venda")).toBe(true);
    expect(adTypeShowsPayment("venda")).toBe(true);
  });

  it("valida formulário de aviso sem preço", () => {
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

  it("valida página de contato (pet) sem preço nem pix", () => {
    const errors = validateAdForm({
      adType: "contato",
      title: "Thor — se achar, avise",
      price: "",
      description: "Cachorro labrador. Dono: Ana. Bairro Centro. Favor ligar no WhatsApp.",
      phone: "(11) 98888-7777",
      pix: "",
      cardLink: "",
      password: "",
    });
    expect(Object.keys(errors)).toEqual([]);
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

  it("textos de exibição e WhatsApp por tipo", () => {
    expect(formatAdPriceDisplay("aviso", "", "unico")).toBe("Sem valor");
    expect(formatAdPriceDisplay("contato", "", "unico")).toBe("Contato");
    expect(formatAdPriceDisplay("venda", "R$ 10,00", "recorrente")).toBe("R$ 10,00 /mês");
    expect(buildWhatsAppPrefill("contato", "Thor")).toContain("Escaneei o QR");
    expect(buildWhatsAppPrefill("venda", "Bike")).toContain("anúncio");
  });

  it("codifica e decodifica contato com preço vazio", () => {
    const ad: AdData = {
      t: "contato",
      title: "Thor",
      price: "",
      desc: "Se encontrar, fale com o dono pelo WhatsApp da página.",
      phone: "5511988887777",
      timestamp: 1_700_000_000_000,
    };
    const encoded = encodeAdData(ad);
    const decoded = decodeAdData(encoded);
    expect(decoded?.t).toBe("contato");
    expect(decoded?.title).toBe("Thor");
    expect(decoded?.price ?? "").toBe("");
    expect(decoded?.phone).toContain("98888");
  });
});
