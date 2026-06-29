import type { ReactNode } from "react";
import { motion } from "motion/react";
import type { AppView } from "../types/ad";
import { AdSenseSlot } from "./AdSenseSlot";
import { getPathForInstitutionalView, isInstitutionalView } from "../lib/siteRoutes";

interface SiteNavLinkProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
  children: ReactNode;
  className?: string;
  highlight?: boolean;
}

export function SiteNavLink({
  view,
  onNavigate,
  children,
  className = "",
  highlight = false,
}: SiteNavLinkProps) {
  const href = view === "home" ? "/" : isInstitutionalView(view) ? getPathForInstitutionalView(view) : "/";

  return (
    <a
      href={href}
      className={`site-nav-link ${highlight ? "site-nav-link--highlight" : ""} ${className}`.trim()}
      onClick={(e) => {
        e.preventDefault();
        onNavigate(view);
      }}
    >
      {children}
    </a>
  );
}

interface InstitutionalPageLayoutProps {
  title: string;
  subtitle?: string;
  adsenseReady: boolean;
  children: ReactNode;
}

export function InstitutionalPageLayout({
  title,
  subtitle,
  adsenseReady,
  children,
}: InstitutionalPageLayoutProps) {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22 }}
      className="space-y-8"
    >
      <AdSenseSlot slot="topo" ready={adsenseReady} />

      <header className="neo-card-white text-center">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900">{title}</h1>
        {subtitle ? (
          <p className="mt-3 text-sm md:text-base font-medium text-zinc-600 leading-relaxed">{subtitle}</p>
        ) : null}
      </header>

      <div className="institutional-content space-y-6">{children}</div>

      <AdSenseSlot slot="meio" ready={adsenseReady} />
      <AdSenseSlot slot="rodape" ready={adsenseReady} />
    </motion.div>
  );
}

interface InstitutionalSectionProps {
  title: string;
  children: ReactNode;
}

export function InstitutionalSection({ title, children }: InstitutionalSectionProps) {
  return (
    <section className="neo-card-muted">
      <h2 className="text-lg font-black text-zinc-900 mb-3">{title}</h2>
      <div className="space-y-3 text-sm md:text-base font-medium text-zinc-700 leading-relaxed">{children}</div>
    </section>
  );
}

interface StepCardProps {
  step: number;
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

export function StepCard({ step, icon, title, children }: StepCardProps) {
  return (
    <article className="neo-card-white flex gap-4">
      <div className="flex shrink-0 flex-col items-center gap-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-zinc-900 bg-amber-400 text-zinc-900 shadow-[3px_3px_0_0_#18181b]">
          {icon}
        </span>
        <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Passo {step}</span>
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-base md:text-lg font-black text-zinc-900">{title}</h2>
        <p className="mt-2 text-sm md:text-base font-medium text-zinc-700 leading-relaxed">{children}</p>
      </div>
    </article>
  );
}
