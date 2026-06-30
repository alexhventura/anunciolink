import { useEffect, useId, useRef } from "react";
import { Lock } from "lucide-react";

interface DeleteAdConfirmDialogProps {
  open: boolean;
  adTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmação neo-brutalista para remover anúncio da lista local */
export function DeleteAdConfirmDialog({
  open,
  adTitle,
  onConfirm,
  onCancel,
}: DeleteAdConfirmDialogProps) {
  const titleId = useId();
  const descId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="delete-ad-dialog" role="presentation">
      <button
        type="button"
        className="delete-ad-dialog__backdrop"
        aria-label="Fechar confirmação"
        onClick={onCancel}
      />
      <div
        className="delete-ad-dialog__panel"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <div className="delete-ad-dialog__icon-wrap" aria-hidden="true">
          <Lock className="delete-ad-dialog__icon" strokeWidth={2.5} />
        </div>
        <h2 id={titleId} className="delete-ad-dialog__title">
          Tem certeza que deseja excluir?
        </h2>
        <p id={descId} className="delete-ad-dialog__text">
          Este anúncio é perpétuo e existirá para sempre se você salvou o link em outro lugar, mas você
          não poderá mais visualizá-lo aqui.
        </p>
        {adTitle ? (
          <p className="delete-ad-dialog__ad-name" aria-hidden="true">
            {adTitle}
          </p>
        ) : null}
        <div className="delete-ad-dialog__actions">
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className="delete-ad-dialog__confirm"
          >
            Confirmar Exclusão
          </button>
          <button type="button" onClick={onCancel} className="delete-ad-dialog__cancel">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
