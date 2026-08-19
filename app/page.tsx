"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ProductForm from "./ProductForm";
import ProductTable from "./ProductTable";
import type { BankingProduct, FieldErrors } from "../lib/types";
import styles from "./page.module.css";

const API_URL = "/api/banking-products";

export default function Page() {
  const [products, setProducts] = useState<BankingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  // `null` means the dialog is closed; `{ product: null }` means "create".
  const [formState, setFormState] = useState<{ product: BankingProduct | null } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<BankingProduct | null>(null);

  const formDialog = useRef<HTMLDialogElement>(null);
  const deleteDialog = useRef<HTMLDialogElement>(null);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(API_URL, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setProducts((await response.json()) as BankingProduct[]);
      setAlert(null);
    } catch {
      setAlert("Não foi possível carregar os produtos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // `<dialog>` visibility is imperative, so it is synchronised with the state
  // that owns it (ADR-04).
  useEffect(() => {
    syncDialog(formDialog.current, formState !== null);
  }, [formState]);

  useEffect(() => {
    syncDialog(deleteDialog.current, pendingDelete !== null);
  }, [pendingDelete]);

  function openCreateForm() {
    setErrors({});
    setFormState({ product: null });
  }

  function openEditForm(product: BankingProduct) {
    setErrors({});
    setFormState({ product });
  }

  async function handleSubmit(values: Record<string, unknown>) {
    const editing = formState?.product ?? null;
    setSubmitting(true);

    try {
      const response = await fetch(editing ? `${API_URL}/${editing.id}` : API_URL, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.status === 400) {
        const body = (await response.json()) as { errors?: FieldErrors };
        setErrors(body.errors ?? {});
        return;
      }

      if (!response.ok) {
        setAlert("Não foi possível salvar o produto.");
        return;
      }

      setErrors({});
      setFormState(null);
      await load();
    } catch {
      setAlert("Não foi possível salvar o produto.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    const product = pendingDelete;

    if (!product) {
      return;
    }

    setPendingDelete(null);

    try {
      const response = await fetch(`${API_URL}/${product.id}`, { method: "DELETE" });

      if (!response.ok) {
        setAlert("Não foi possível excluir o produto.");
        return;
      }

      // Drop the row locally instead of reloading the whole page (FR-05).
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setAlert(null);
    } catch {
      setAlert("Não foi possível excluir o produto.");
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Produtos Bancários</h1>
        <button type="button" className={styles.primary} onClick={openCreateForm}>
          Novo Produto
        </button>
      </header>

      {alert ? (
        <p role="alert" className={styles.alert}>
          {alert}
        </p>
      ) : null}

      {loading ? (
        <p className={styles.empty}>Carregando…</p>
      ) : (
        <ProductTable products={products} onEdit={openEditForm} onDelete={setPendingDelete} />
      )}

      <dialog ref={formDialog} className={styles.dialog} onClose={() => setFormState(null)}>
        {formState ? (
          <ProductForm
            key={formState.product?.id ?? "new"}
            product={formState.product}
            errors={errors}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => setFormState(null)}
          />
        ) : null}
      </dialog>

      <dialog
        ref={deleteDialog}
        className={styles.dialog}
        onClose={() => setPendingDelete(null)}
      >
        <h2>Excluir produto</h2>
        <p>Tem certeza que deseja excluir este produto?</p>
        <footer className={styles.dialogActions}>
          <button type="button" onClick={() => setPendingDelete(null)}>
            Cancelar
          </button>
          <button type="button" className={styles.danger} onClick={handleDelete}>
            Excluir
          </button>
        </footer>
      </dialog>
    </main>
  );
}

function syncDialog(dialog: HTMLDialogElement | null, shouldBeOpen: boolean) {
  if (!dialog) {
    return;
  }

  if (shouldBeOpen && !dialog.open) {
    dialog.showModal();
  } else if (!shouldBeOpen && dialog.open) {
    dialog.close();
  }
}
