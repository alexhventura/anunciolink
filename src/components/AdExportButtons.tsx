import { useCallback, useState } from "react";
import { ImageIcon, Printer } from "lucide-react";
import type { AdData } from "../types/ad";
import type { ExportQrPreference } from "../lib/exportQr";
import { printA4CardPdf } from "../lib/a4CardPdf";
import { exportJpgCard } from "../lib/shareImage";
import { IconActionButton } from "./IconActionButton";

interface AdExportButtonsProps {
  ad: AdData;
  qrUrl: string;
  qrPreference?: ExportQrPreference;
}

/** PDF e JPG — ícones na toolbar de Meus Anúncios */
export function AdExportButtons({
  ad,
  qrUrl,
  qrPreference = "ad",
}: AdExportButtonsProps) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [jpgLoading, setJpgLoading] = useState(false);

  const handlePdf = useCallback(async () => {
    if (!qrUrl.trim() || pdfLoading) return;
    setPdfLoading(true);
    try {
      await printA4CardPdf(ad, qrUrl, qrPreference);
    } finally {
      setPdfLoading(false);
    }
  }, [ad, pdfLoading, qrPreference, qrUrl]);

  const handleJpg = useCallback(async () => {
    if (jpgLoading) return;
    setJpgLoading(true);
    try {
      await exportJpgCard(ad, qrUrl, qrPreference);
    } finally {
      setJpgLoading(false);
    }
  }, [ad, jpgLoading, qrPreference, qrUrl]);

  return (
    <>
      <IconActionButton
        icon={Printer}
        label="Baixar cartaz A4 em PDF"
        onClick={() => void handlePdf()}
        disabled={!qrUrl.trim()}
        busy={pdfLoading}
      />
      <IconActionButton
        icon={ImageIcon}
        label="Baixar cartaz A4 em JPG"
        onClick={() => void handleJpg()}
        busy={jpgLoading}
      />
    </>
  );
}
