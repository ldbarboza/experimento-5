import { describe, expect, it } from "vitest";
import { validateCreateInput, validateUpdateInput } from "../lib/validation";

const validBody = {
  name: "Cartão Platinum",
  type: "CARTAO_CREDITO",
  description: "Cartão com cashback.",
  interestRate: 12.5,
  monthlyFee: 29.9,
  isActive: true,
};

describe("validateCreateInput", () => {
  it("accepts a valid payload", () => {
    const result = validateCreateInput(validBody);

    expect(result.valid).toBe(true);
    expect(result.value).toEqual(validBody);
  });

  it("parses the numeric strings an HTML form submits", () => {
    const result = validateCreateInput({
      ...validBody,
      interestRate: "12,5",
      monthlyFee: "29.90",
    });

    expect(result.value?.interestRate).toBe(12.5);
    expect(result.value?.monthlyFee).toBe(29.9);
  });

  it("rounds rates and fees to two decimal places", () => {
    const result = validateCreateInput({ ...validBody, interestRate: 12.567, monthlyFee: 1.005 });

    expect(result.value?.interestRate).toBe(12.57);
    expect(result.value?.monthlyFee).toBe(1.01);
  });

  it("defaults isActive to true when omitted", () => {
    const { isActive, ...withoutIsActive } = validBody;

    expect(validateCreateInput(withoutIsActive).value?.isActive).toBe(true);
  });

  it("rejects a missing name", () => {
    const result = validateCreateInput({ ...validBody, name: "" });

    expect(result.valid).toBe(false);
    expect(result.errors?.name).toBeDefined();
  });

  it("rejects a name shorter than 3 or longer than 120 characters", () => {
    expect(validateCreateInput({ ...validBody, name: "ab" }).errors?.name).toBeDefined();
    expect(
      validateCreateInput({ ...validBody, name: "a".repeat(121) }).errors?.name,
    ).toBeDefined();
  });

  it("rejects a description longer than 500 characters", () => {
    const result = validateCreateInput({ ...validBody, description: "a".repeat(501) });

    expect(result.errors?.description).toBeDefined();
  });

  it("rejects an unknown product type", () => {
    expect(validateCreateInput({ ...validBody, type: "CRIPTO" }).errors?.type).toBeDefined();
  });

  it("rejects negative and non-numeric amounts", () => {
    expect(
      validateCreateInput({ ...validBody, interestRate: -1 }).errors?.interestRate,
    ).toBeDefined();
    expect(
      validateCreateInput({ ...validBody, monthlyFee: "abc" }).errors?.monthlyFee,
    ).toBeDefined();
    expect(validateCreateInput({ ...validBody, monthlyFee: "" }).errors?.monthlyFee).toBeDefined();
  });

  it("reports every invalid field at once", () => {
    const result = validateCreateInput({ name: "", type: "X", interestRate: -1, monthlyFee: -2 });

    expect(Object.keys(result.errors ?? {}).sort()).toEqual([
      "interestRate",
      "monthlyFee",
      "name",
      "type",
    ]);
  });

  it("rejects a non-object body", () => {
    expect(validateCreateInput(null).valid).toBe(false);
  });

  it("rejects an invalid isActive value when present", () => {
    const result = validateCreateInput({ ...validBody, isActive: "maybe" });

    expect(result.valid).toBe(false);
    expect(result.errors?.isActive).toBeDefined();
  });
});

describe("validateUpdateInput", () => {
  it("accepts a partial payload and only returns the given fields", () => {
    const result = validateUpdateInput({ name: "Conta Gold" });

    expect(result.valid).toBe(true);
    expect(result.value).toEqual({ name: "Conta Gold" });
  });

  it("accepts an empty payload as a no-op", () => {
    const result = validateUpdateInput({});

    expect(result.valid).toBe(true);
    expect(result.value).toEqual({});
  });

  it("validates the fields that are present", () => {
    expect(validateUpdateInput({ name: "ab" }).errors?.name).toBeDefined();
    expect(validateUpdateInput({ interestRate: -3 }).errors?.interestRate).toBeDefined();
    expect(validateUpdateInput({ isActive: "maybe" }).errors?.isActive).toBeDefined();
  });

  it("reads the checkbox strings a form submits for isActive", () => {
    expect(validateUpdateInput({ isActive: "on" }).value?.isActive).toBe(true);
    expect(validateUpdateInput({ isActive: "false" }).value?.isActive).toBe(false);
  });

  it("treats a non-object body as an empty patch", () => {
    const result = validateUpdateInput(null);

    expect(result.valid).toBe(true);
    expect(result.value).toEqual({});
  });
});
