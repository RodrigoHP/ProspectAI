import { describe, it, expect } from "vitest";
import { SearchParamsSchema } from "./validations";

const validInput = {
  icp: "Clínicas odontológicas com presença digital fraca",
  service: "Sistemas de IA para automação de atendimento via WhatsApp",
  state: "SP",
  city: "São Paulo",
};

describe("SearchParamsSchema", () => {
  it("accepts valid input", () => {
    const result = SearchParamsSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("trims whitespace from icp and service", () => {
    const result = SearchParamsSchema.safeParse({
      ...validInput,
      icp: "  Clínicas odontológicas com presença digital fraca  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.icp).toBe(
        "Clínicas odontológicas com presença digital fraca"
      );
    }
  });

  it("rejects icp shorter than 10 chars", () => {
    const result = SearchParamsSchema.safeParse({ ...validInput, icp: "curto" });
    expect(result.success).toBe(false);
  });

  it("rejects service shorter than 10 chars", () => {
    const result = SearchParamsSchema.safeParse({
      ...validInput,
      service: "curto",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid state", () => {
    const result = SearchParamsSchema.safeParse({
      ...validInput,
      state: "XX",
    });
    expect(result.success).toBe(false);
  });

  it("accepts 'Todo o Brasil' as state", () => {
    const result = SearchParamsSchema.safeParse({
      ...validInput,
      state: "Todo o Brasil",
    });
    expect(result.success).toBe(true);
  });

  it("city is optional — defaults to empty string", () => {
    const { city: _, ...withoutCity } = validInput;
    const result = SearchParamsSchema.safeParse(withoutCity);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.city).toBe("");
    }
  });

  it("rejects city longer than 100 chars", () => {
    const result = SearchParamsSchema.safeParse({
      ...validInput,
      city: "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });
});
