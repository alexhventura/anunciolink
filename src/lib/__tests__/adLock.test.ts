import { describe, expect, it } from "vitest";
import { encodeAdData, decodeAdData } from "../adCodec";
import { MINIMAL_AD } from "./fixtures";
import {
  decryptAdPayload,
  encryptAdPayload,
  isLockedPayload,
  isValidAdPassword,
  sanitizeAdPassword,
  tryUnlockAdData,
} from "../adLock";

describe("adLock", () => {
  it("sanitiza senha — só alfanumérico, máx. 4", () => {
    expect(sanitizeAdPassword("ab@12!xy")).toBe("ab12");
    expect(sanitizeAdPassword("abcd1234")).toBe("abcd");
  });

  it("valida senha de 1 a 4 caracteres alfanuméricos", () => {
    expect(isValidAdPassword("a1")).toBe(true);
    expect(isValidAdPassword("")).toBe(false);
    expect(isValidAdPassword("abcde")).toBe(false);
    expect(isValidAdPassword("a@1")).toBe(false);
  });

  it("criptografa e desbloqueia round-trip", () => {
    const plain = encodeAdData(MINIMAL_AD);
    const locked = encryptAdPayload(plain, "x9Z2");
    expect(isLockedPayload(locked)).toBe(true);
    expect(decodeAdData(locked)).toBeNull();

    const decrypted = decryptAdPayload(locked, "x9Z2");
    expect(decrypted).toBe(plain);

    const ad = tryUnlockAdData(locked, "x9Z2");
    expect(ad?.title).toBe(MINIMAL_AD.title);
    expect(ad?.price).toBe(MINIMAL_AD.price);
  });

  it("senha incorreta retorna null", () => {
    const locked = encryptAdPayload(encodeAdData(MINIMAL_AD), "1234");
    expect(decryptAdPayload(locked, "9999")).toBeNull();
    expect(tryUnlockAdData(locked, "9999")).toBeNull();
  });
});
