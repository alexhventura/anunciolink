import { Lock } from "lucide-react";
import { useCallback, useId, useState, type FormEvent } from "react";
import { sanitizeAdPassword } from "../lib/adLock";
import { AdBrandedSurface } from "./AdBrandedSurface";
import { ViewEnter } from "./ViewEnter";

interface AdUnlockPageProps {
  onUnlock: (password: string) => boolean;
}

/** Tela de desbloqueio para anúncios protegidos por senha (client-side AES). */
export function AdUnlockPage({ onUnlock }: AdUnlockPageProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputId = useId();
  const errorId = useId();

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      setError(null);

      const key = sanitizeAdPassword(password);
      if (!key) {
        setError("Digite a senha de 1 a 4 caracteres.");
        setSubmitting(false);
        return;
      }

      const ok = onUnlock(key);
      if (!ok) {
        setError("Senha incorreta.");
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
    },
    [onUnlock, password]
  );

  return (
    <ViewEnter
      as="section"
      className="ad-unlock-page mx-auto w-full max-w-md min-w-0 px-2 sm:px-0"
      aria-labelledby="ad-unlock-heading"
    >
      <AdBrandedSurface variant="create" contentClassName="ad-unlock-page__content">
        <div className="ad-unlock-card neo-card-white p-6 sm:p-8 text-center space-y-6">
          <div
            className="ad-unlock-card__icon mx-auto flex h-16 w-16 items-center justify-center rounded-lg border-[3px] border-black bg-amber-100 neo-shadow-sm"
            aria-hidden="true"
          >
            <Lock className="h-8 w-8 text-zinc-900" strokeWidth={2.25} />
          </div>

          <div className="space-y-2">
            <h1 id="ad-unlock-heading" className="text-display text-xl font-black uppercase">
              Anúncio protegido
            </h1>
            <p className="text-sm font-semibold text-zinc-700 leading-snug">
              Este link está criptografado no seu navegador. Digite a senha que o vendedor criou para
              ver o anúncio.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
            <div className="ad-form-field">
              <label htmlFor={inputId} className="label-field mb-0">
                Senha do anúncio
              </label>
              <input
                id={inputId}
                type="password"
                inputMode="text"
                autoComplete="off"
                maxLength={4}
                value={password}
                onChange={(e) => {
                  setPassword(sanitizeAdPassword(e.target.value));
                  setError(null);
                }}
                placeholder="Até 4 caracteres"
                aria-describedby={error ? errorId : undefined}
                aria-invalid={error ? true : undefined}
                className={`input-field text-center font-mono text-lg tracking-[0.35em] uppercase ${
                  error ? "input-field--error" : ""
                }`}
              />
              <p className="ad-form-field__micro">
                Apenas letras e números — máximo 4 caracteres. A senha não fica salva em servidor.
              </p>
            </div>

            {error ? (
              <p id={errorId} className="ad-form-field__error text-center" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={submitting || !password.trim()}
              aria-busy={submitting}
            >
              {submitting ? "Verificando…" : "Desbloquear anúncio"}
            </button>
          </form>
        </div>
      </AdBrandedSurface>
    </ViewEnter>
  );
}
