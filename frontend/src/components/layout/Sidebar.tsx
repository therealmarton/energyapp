import { Link, useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Activity,
  Gauge,
  LayoutDashboard,
  type LucideIcon,
  Settings as SettingsIcon,
  Sun,
  TrendingUp,
  Zap,
} from "lucide-react";
import clsx from "clsx";

interface Item {
  to: string;
  labelKey: string;
  icon: LucideIcon;
}

const items: Item[] = [
  { to: "/", labelKey: "nav.home", icon: LayoutDashboard },
  { to: "/my-savings", labelKey: "nav.mySavings", icon: Gauge },
  { to: "/community", labelKey: "nav.community", icon: TrendingUp },
  { to: "/prosumer-profit", labelKey: "nav.prosumerProfit", icon: Sun },
  { to: "/live", labelKey: "nav.live", icon: Activity },
  { to: "/settings", labelKey: "nav.settings", icon: SettingsIcon },
];

export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0" data-testid="sidebar">
      <div className="px-5 h-16 flex items-center gap-3 border-b border-slate-800">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-raised">
          <Zap size={18} />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">{t("app.brand")}</div>
          <div className="text-[11px] text-slate-400">{t("app.tagline")}</div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1" aria-label="Primary">
        {items.map(({ to, labelKey, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={clsx("nav-item", active && "nav-item-active")}
              data-testid={`nav-${to === "/" ? "home" : to.slice(1)}`}
            >
              <Icon size={16} />
              <span>{t(labelKey)}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500">
        {t("app.footer")}
      </div>
    </aside>
  );
}
