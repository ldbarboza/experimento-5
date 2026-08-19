"use client";

import type { FormEvent } from "react";
import {
  DESCRIPTION_MAX_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
} from "../lib/validation";
import { PRODUCT_TYPES, PRODUCT_TYPE_LABELS } from "../lib/types";
import type { BankingProduct, FieldErrors } from "../lib/types";
import styles from "./page.module.css";

interface ProductFormProps {
  /** `null` when creating; the product being edited otherwise (FR-04). */
  product: BankingProduct | null;
  errors: FieldErrors;
  submitting: boolean;
  onSubmit: (values: Record<string, unknown>) => void;
  onCancel: () => void;
}

/**
 * Uncontrolled form: `defaultValue` pre-populates the edit case and the values
 * are read back from `FormData` on submit. Numbers travel as strings — the
 * server-side validation parses them (ADR-07, R-05).
 */
export default function ProductForm({
  product,
  errors,
  submitting,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    onSubmit({
      name: String(data.get("name") ?? ""),
      type: String(data.get("type") ?? ""),
      description: String(data.get("description") ?? ""),
      interestRate: String(data.get("interestRate") ?? ""),
      monthlyFee: String(data.get("monthlyFee") ?? ""),
      isActive: data.get("isActive") !== null,
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2>{product ? "Editar produto" : "Novo produto"}</h2>

      <label className={styles.field}>
        <span>Nome</span>
        <input
          name="name"
          type="text"
          defaultValue={product?.name ?? ""}
          minLength={NAME_MIN_LENGTH}
          maxLength={NAME_MAX_LENGTH}
          aria-invalid={errors.name ? true : undefined}
        />
        {errors.name ? <small className={styles.error}>{errors.name}</small> : null}
      </label>

      <label className={styles.field}>
        <span>Tipo</span>
        <select
          name="type"
          defaultValue={product?.type ?? PRODUCT_TYPES[0]}
          aria-invalid={errors.type ? true : undefined}
        >
          {PRODUCT_TYPES.map((type) => (
            <option key={type} value={type}>
              {PRODUCT_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
        {errors.type ? <small className={styles.error}>{errors.type}</small> : null}
      </label>

      <label className={styles.field}>
        <span>Descrição</span>
        <textarea
          name="description"
          rows={3}
          defaultValue={product?.description ?? ""}
          maxLength={DESCRIPTION_MAX_LENGTH}
          aria-invalid={errors.description ? true : undefined}
        />
        {errors.description ? (
          <small className={styles.error}>{errors.description}</small>
        ) : null}
      </label>

      <label className={styles.field}>
        <span>Taxa de juros (% a.a.)</span>
        <input
          name="interestRate"
          type="number"
          step="0.01"
          min="0"
          defaultValue={product ? String(product.interestRate) : ""}
          aria-invalid={errors.interestRate ? true : undefined}
        />
        {errors.interestRate ? (
          <small className={styles.error}>{errors.interestRate}</small>
        ) : null}
      </label>

      <label className={styles.field}>
        <span>Tarifa mensal (R$)</span>
        <input
          name="monthlyFee"
          type="number"
          step="0.01"
          min="0"
          defaultValue={product ? String(product.monthlyFee) : ""}
          aria-invalid={errors.monthlyFee ? true : undefined}
        />
        {errors.monthlyFee ? (
          <small className={styles.error}>{errors.monthlyFee}</small>
        ) : null}
      </label>

      <label className={styles.checkbox}>
        <input name="isActive" type="checkbox" defaultChecked={product?.isActive ?? true} />
        <span>Produto ativo</span>
      </label>

      <footer className={styles.dialogActions}>
        <button type="button" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
        <button type="submit" className={styles.primary} disabled={submitting}>
          {submitting ? "Salvando…" : "Salvar"}
        </button>
      </footer>
    </form>
  );
}
