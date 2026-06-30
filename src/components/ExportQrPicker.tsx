import type { ExportQrPreference } from "../lib/exportQr";

interface ExportQrPickerProps {
  value: ExportQrPreference;
  onChange: (value: ExportQrPreference) => void;
  hasPix: boolean;
  id?: string;
  compact?: boolean;
}

/** Escolha do QR no cartaz offline (JPG/PDF/compartilhar) */
export function ExportQrPicker({
  value,
  onChange,
  hasPix,
  id = "export-qr-picker",
  compact = false,
}: ExportQrPickerProps) {
  return (
    <fieldset className={`export-qr-picker ${compact ? "export-qr-picker--compact" : ""}`}>
      <legend className="export-qr-picker__legend">QR Code no cartaz offline</legend>
      <div className="export-qr-picker__options" role="radiogroup">
        <label className="export-qr-picker__option">
          <input
            type="radio"
            name={id}
            value="ad"
            checked={value === "ad"}
            onChange={() => onChange("ad")}
          />
          <span className="export-qr-picker__label">Anúncio</span>
          <span className="export-qr-picker__desc">Escaneie para visitar a página e ver mais informações.</span>
        </label>
        <label className={`export-qr-picker__option ${!hasPix ? "export-qr-picker__option--disabled" : ""}`}>
          <input
            type="radio"
            name={id}
            value="pix"
            checked={value === "pix"}
            disabled={!hasPix}
            onChange={() => onChange("pix")}
          />
          <span className="export-qr-picker__label">Pix</span>
          <span className="export-qr-picker__desc">
            {hasPix
              ? "Escaneie para pagamento direto via Pix ao vendedor."
              : "Disponível quando o anúncio tiver Pix copia e cola."}
          </span>
        </label>
      </div>
    </fieldset>
  );
}
