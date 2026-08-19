import { PRODUCT_TYPES } from "./types";
import type {
  CreateProductInput,
  FieldErrors,
  ProductType,
  UpdateProductInput,
} from "./types";

export const NAME_MIN_LENGTH = 3;
export const NAME_MAX_LENGTH = 120;
export const DESCRIPTION_MAX_LENGTH = 500;

export type ValidationResult<T> =
  | { valid: true; value: T; errors?: undefined }
  | { valid: false; value?: undefined; errors: FieldErrors };

/**
 * Accepts both JSON numbers and the strings an HTML form sends, including the
 * pt-BR decimal comma (R-05). Returns `null` when the value is not a number.
 */
function parseNumber(raw: unknown): number | null {
  if (typeof raw === "number") {
    return Number.isFinite(raw) ? raw : null;
  }

  if (typeof raw === "string" && raw.trim() !== "") {
    const parsed = Number(raw.trim().replace(",", "."));

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function parseBoolean(raw: unknown): boolean | null {
  if (typeof raw === "boolean") {
    return raw;
  }

  if (raw === "true" || raw === "on") {
    return true;
  }

  if (raw === "false" || raw === "off") {
    return false;
  }

  return null;
}

/** Money and rates carry at most two decimal places (FR-01). */
function round2(value: number): number {
  // `value * 100` drifts in IEEE-754 (`1.005 * 100` is `100.49999999999999`),
  // so the shift is applied to the decimal string the user actually typed.
  const rounded = Number(`${Math.round(Number(`${value}e2`))}e-2`);

  // Exponential-notation inputs (`1e-7`) break the string shift, and they are
  // already far below the second decimal place.
  return Number.isFinite(rounded) ? rounded : Math.round(value * 100) / 100;
}

function isProductType(raw: unknown): raw is ProductType {
  return typeof raw === "string" && (PRODUCT_TYPES as readonly string[]).includes(raw);
}

function asRecord(body: unknown): Record<string, unknown> {
  return typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
}

function validateName(raw: unknown, errors: FieldErrors): string | undefined {
  const name = typeof raw === "string" ? raw.trim() : "";

  if (name === "") {
    errors.name = "O nome é obrigatório.";
    return undefined;
  }

  if (name.length < NAME_MIN_LENGTH || name.length > NAME_MAX_LENGTH) {
    errors.name = `O nome deve ter entre ${NAME_MIN_LENGTH} e ${NAME_MAX_LENGTH} caracteres.`;
    return undefined;
  }

  return name;
}

function validateType(raw: unknown, errors: FieldErrors): ProductType | undefined {
  if (!isProductType(raw)) {
    errors.type = "Selecione um tipo de produto válido.";
    return undefined;
  }

  return raw;
}

function validateDescription(raw: unknown, errors: FieldErrors): string | undefined {
  const description = typeof raw === "string" ? raw.trim() : "";

  if (description.length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `A descrição deve ter no máximo ${DESCRIPTION_MAX_LENGTH} caracteres.`;
    return undefined;
  }

  return description;
}

function validateAmount(
  raw: unknown,
  field: "interestRate" | "monthlyFee",
  errors: FieldErrors,
): number | undefined {
  const parsed = parseNumber(raw);

  if (parsed === null) {
    errors[field] =
      field === "interestRate" ? "Informe uma taxa de juros numérica." : "Informe uma tarifa numérica.";
    return undefined;
  }

  if (parsed < 0) {
    errors[field] = "O valor não pode ser negativo.";
    return undefined;
  }

  return round2(parsed);
}

/** Validates a full product payload; every field except `description` is required. */
export function validateCreateInput(body: unknown): ValidationResult<CreateProductInput> {
  const input = asRecord(body);
  const errors: FieldErrors = {};

  const name = validateName(input.name, errors);
  const type = validateType(input.type, errors);
  const description = validateDescription(input.description, errors);
  const interestRate = validateAmount(input.interestRate, "interestRate", errors);
  const monthlyFee = validateAmount(input.monthlyFee, "monthlyFee", errors);

  // `isActive` defaults to `true` when omitted (FR-01).
  const isActive = input.isActive === undefined ? true : parseBoolean(input.isActive);

  if (isActive === null) {
    errors.isActive = "Informe se o produto está ativo.";
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    value: {
      name: name as string,
      type: type as ProductType,
      description: description as string,
      interestRate: interestRate as number,
      monthlyFee: monthlyFee as number,
      isActive: isActive as boolean,
    },
  };
}

/** Validates a partial payload: only the fields present are checked (FR-04). */
export function validateUpdateInput(body: unknown): ValidationResult<UpdateProductInput> {
  const input = asRecord(body);
  const errors: FieldErrors = {};
  const value: UpdateProductInput = {};

  if (input.name !== undefined) {
    const name = validateName(input.name, errors);
    if (name !== undefined) value.name = name;
  }

  if (input.type !== undefined) {
    const type = validateType(input.type, errors);
    if (type !== undefined) value.type = type;
  }

  if (input.description !== undefined) {
    const description = validateDescription(input.description, errors);
    if (description !== undefined) value.description = description;
  }

  if (input.interestRate !== undefined) {
    const interestRate = validateAmount(input.interestRate, "interestRate", errors);
    if (interestRate !== undefined) value.interestRate = interestRate;
  }

  if (input.monthlyFee !== undefined) {
    const monthlyFee = validateAmount(input.monthlyFee, "monthlyFee", errors);
    if (monthlyFee !== undefined) value.monthlyFee = monthlyFee;
  }

  if (input.isActive !== undefined) {
    const isActive = parseBoolean(input.isActive);

    if (isActive === null) {
      errors.isActive = "Informe se o produto está ativo.";
    } else {
      value.isActive = isActive;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, value };
}
