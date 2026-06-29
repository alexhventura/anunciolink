import { FieldLabelWithHint } from "./HelpTooltip";
import { TOOLTIP_COPY } from "../lib/tooltipCopy";
import {
  POSTIMAGES_UPLOAD_URL,
  getExternalImageUrlValidationMessage,
} from "../lib/externalImageUrl";

interface ImageUrlFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

export function ImageUrlField({ value, onChange, error }: ImageUrlFieldProps) {
  const validationHint = value.trim() ? getExternalImageUrlValidationMessage(value) : null;
  const showError = error ?? validationHint;

  return (
    <div className="image-url-field space-y-2">
      <FieldLabelWithHint htmlFor="image-url-input" hint={TOOLTIP_COPY.imageUrl} className="mb-0">
        Link da foto (opcional)
      </FieldLabelWithHint>

      <input
        type="url"
        id="image-url-input"
        inputMode="url"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://i.postimg.cc/…/produto.jpg"
        aria-invalid={Boolean(showError)}
        aria-describedby="image-url-help"
        className={`input-field font-mono text-sm ${showError ? "border-red-500" : ""}`}
      />

      <p
        id="image-url-help"
        className="image-url-field__help text-xs font-medium text-zinc-600 leading-relaxed"
      >
        <span className="mr-0.5" aria-hidden="true">
          📷
        </span>
        <strong className="font-bold text-zinc-800">Link da Foto:</strong> Cole o link direto da foto do seu produto
        (ex: .jpg, .png, .webp). Se você já anunciou em outra plataforma, clique com o botão direito na foto e
        escolha &quot;Copiar endereço da imagem&quot;. Não tem um link?{" "}
        <a
          href={POSTIMAGES_UPLOAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-black underline decoration-amber-600 underline-offset-2 hover:text-amber-900"
        >
          Clique aqui para gerar o link da sua foto em 5 segundos no Postimages (Grátis e Sem Cadastro)
        </a>
        .
      </p>

      {showError && (
        <p role="alert" className="text-xs font-semibold text-red-600">
          {showError}
        </p>
      )}
    </div>
  );
}
