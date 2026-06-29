import { Clock } from "lucide-react";
import { AD_EXPIRED_BANNER_COPY } from "../lib/adExpiry";

export function AdExpiredBanner() {
  return (
    <div className="ad-expired-banner" role="status" aria-live="polite">
      <Clock className="ad-expired-banner__icon shrink-0" strokeWidth={2} aria-hidden="true" />
      <p className="ad-expired-banner__text">{AD_EXPIRED_BANNER_COPY}</p>
    </div>
  );
}
