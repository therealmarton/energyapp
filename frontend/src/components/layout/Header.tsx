import { useTranslation } from "react-i18next";
import { useRouterState } from "@tanstack/react-router";

import { DateRangePicker } from "./DateRangePicker";
import { LangToggle } from "./LangToggle";
import { UserBadge } from "./UserBadge";

const titleByPath: Record<string, string> = {
  "/": "nav.home",
  "/my-savings": "nav.mySavings",
  "/community": "nav.community",
  "/prosumer-profit": "nav.prosumerProfit",
  "/live": "nav.live",
  "/settings": "nav.settings",
};

export function Header() {
  const { t } = useTranslation();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const titleKey = titleByPath[path] ?? "nav.home";

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div>
        <div className="text-[11px] uppercase tracking-wide text-slate-400">
          {t("app.title")}
        </div>
        <h1 className="text-lg font-semibold text-slate-900 leading-tight" data-testid="app-title">
          {t(titleKey)}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <DateRangePicker />
        <LangToggle />
        <UserBadge />
      </div>
    </header>
  );
}
