import { formatCurrency, formatInterestRate } from "../lib/format";
import { PRODUCT_TYPE_LABELS } from "../lib/types";
import type { BankingProduct } from "../lib/types";
import styles from "./page.module.css";

interface ProductTableProps {
  products: BankingProduct[];
  onEdit: (product: BankingProduct) => void;
  onDelete: (product: BankingProduct) => void;
}

/** FR-02 — product list, or the empty state when nothing is registered. */
export default function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  if (products.length === 0) {
    return <p className={styles.empty}>Nenhum produto cadastrado.</p>;
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th scope="col">Nome</th>
          <th scope="col">Tipo</th>
          <th scope="col">Taxa de Juros</th>
          <th scope="col">Tarifa Mensal</th>
          <th scope="col">Ativo</th>
          <th scope="col">Ações</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id}>
            <td>
              {product.name}
              {product.description ? (
                <span className={styles.description}>{product.description}</span>
              ) : null}
            </td>
            <td>{PRODUCT_TYPE_LABELS[product.type]}</td>
            <td className={styles.numeric}>{formatInterestRate(product.interestRate)}</td>
            <td className={styles.numeric}>{formatCurrency(product.monthlyFee)}</td>
            <td>{product.isActive ? "Sim" : "Não"}</td>
            <td className={styles.actions}>
              <button type="button" onClick={() => onEdit(product)}>
                Editar
              </button>
              <button type="button" className={styles.danger} onClick={() => onDelete(product)}>
                Excluir
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
