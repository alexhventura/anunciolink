/** Move foco para o conteúdo principal após troca de view (leitores de tela + teclado) */
export function focusMainContent(): void {
  const main = document.getElementById("conteudo-principal");
  if (!main) return;
  main.setAttribute("tabindex", "-1");
  requestAnimationFrame(() => {
    main.focus({ preventScroll: false });
  });
}

const FIELD_INPUT_ID: Record<string, string> = {
  title: "title-input",
  price: "price-input",
  description: "desc-input",
  phone: "phone-input",
  pix: "pix-input",
  cardLink: "card-input",
};

export function focusFirstField(fieldKey: string): void {
  const id = FIELD_INPUT_ID[fieldKey];
  if (!id) return;
  const el = document.getElementById(id);
  if (el instanceof HTMLElement) {
    el.focus();
  }
}
