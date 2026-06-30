import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { FieldLabelWithHint } from "./HelpTooltip";

interface AdFormFieldProps {
  id: string;
  label: ReactNode;
  hint: string;
  microcopy?: string;
  error?: string | null;
  counter?: ReactNode;
  optional?: boolean;
  children: ReactNode;
}

function wireControlAria(
  children: ReactNode,
  describedBy: string | undefined,
  invalid: boolean
): ReactNode {
  const child = Children.only(children);
  if (!isValidElement(child)) return children;

  return cloneElement(child as ReactElement<Record<string, unknown>>, {
    "aria-describedby": describedBy,
    "aria-invalid": invalid ? true : undefined,
  });
}

export function AdFormField({
  id,
  label,
  hint,
  microcopy,
  error,
  counter,
  optional = false,
  children,
}: AdFormFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = microcopy ? `${id}-micro` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;
  const fieldLabel = typeof label === "string" ? label : undefined;

  return (
    <div className={`ad-form-field ${error ? "ad-form-field--invalid" : ""}`}>
      <div className="ad-form-field__head">
        <FieldLabelWithHint htmlFor={id} hint={hint} fieldLabel={fieldLabel} className="mb-0">
          {label}
          {optional ? (
            <span className="ad-form-field__optional">opcional</span>
          ) : (
            <span className="ad-form-field__required" aria-hidden="true">
              *
            </span>
          )}
        </FieldLabelWithHint>
        {counter}
      </div>

      {microcopy && (
        <p id={hintId} className="ad-form-field__micro">
          {microcopy}
        </p>
      )}

      <div className="ad-form-field__control">
        {wireControlAria(children, describedBy, Boolean(error))}
      </div>

      {error && (
        <p id={errorId} className="ad-form-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
