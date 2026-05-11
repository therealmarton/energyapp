import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Gauge,
  LineChart as LineChartIcon,
  Receipt,
  Sun,
  TrendingUp,
  Zap,
} from "lucide-react";

import { Card } from "../components/ui/Card";
import { StatCard } from "../components/ui/StatCard";
import { UserAvatar } from "../components/layout/UserAvatar";
import { useActiveUser } from "../stores/useActiveUser";
import { useSettlement } from "../components/hooks/useSettlement";
import { formatFt, formatKwh, formatPct } from "../components/ui/formatting";
import { useDateWindow } from "../stores/useDateWindow";

function shortcuts(t: (k: string) => string) {
  return [
    { to: "/my-savings", title: t("nav.mySavings"), desc: t("home.shortcuts.mySavings"), icon: Gauge },
    { to: "/community", title: t("nav.community"), desc: t("home.shortcuts.community"), icon: TrendingUp },
    { to: "/prosumer-profit", title: t("nav.prosumerProfit"), desc: t("home.shortcuts.profit"), icon: Sun },
    { to: "/live", title: t("nav.live"), desc: t("home.shortcuts.live"), icon: LineChartIcon },
  ] as const;
}

export function HomePage() {
  const { t } = useTranslation();
  const { activeUser } = useActiveUser();
  const { start, end } = useDateWindow();
  const { data, isLoading } = useSettlement();

  const myRow = data?.users.find((u) => u.user_id === activeUser?.id);

  return (
    <div className="space-y-6" data-testid="page-home">
      <Card className="overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          {activeUser && <UserAvatar name={activeUser.name} size="lg" />}
          <div className="flex-1">
            <div className="text-sm text-slate-500">
              {t("home.greeting")}
              {activeUser ? `, ${activeUser.name}` : ""}
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              {t("home.welcomeTitle")}
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              {t("home.welcomeBody")}
            </p>
            <div className="text-xs text-slate-400 mt-2">
              {t("filters.dataRange")}: {start} → {end}
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/my-savings" className="inline-flex items-center gap-1 text-sm font-medium bg-brand-600 text-white rounded-md px-3 py-2 hover:bg-brand-700">
              {t("home.viewSavings")} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          tone="savings"
          icon={<Receipt size={18} />}
          label={t("home.kpis.communitySavings")}
          value={isLoading ? "…" : `${formatFt(data?.total_savings_ft)} Ft`}
          hint={formatPct((data?.total_savings_ft ?? 0) / (data?.total_baseline_ft || 1) * 100)}
          data-testid="kpi-community-savings"
        />
        <StatCard
          tone="brand"
          icon={<TrendingUp size={18} />}
          label={t("home.kpis.selfSufficiency")}
          value={isLoading ? "…" : formatPct(data?.self_sufficiency_pct)}
          hint={t("home.kpis.selfSufficiencyHint")}
        />
        <StatCard
          tone="solar"
          icon={<Sun size={18} />}
          label={t("home.kpis.yourSavings")}
          value={isLoading || !myRow ? "…" : `${formatFt(myRow.savings_ft)} Ft`}
          hint={activeUser?.is_prosumer ? t("community.prosumer") : t("community.consumer")}
        />
        <StatCard
          tone="grid"
          icon={<Zap size={18} />}
          label={t("home.kpis.yourImport")}
          value={isLoading || !myRow ? "…" : `${formatKwh(myRow.import_kwh)} kWh`}
          hint={t("home.kpis.importHint")}
        />
      </div>

      <Card title={t("home.shortcutsTitle")} subtitle={t("home.shortcutsSubtitle")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {shortcuts(t).map(({ to, title, desc, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="group border border-slate-200 rounded-lg p-4 hover:border-brand-400 hover:shadow-card transition bg-white"
            >
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Icon size={16} />
                </span>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-brand-500" />
              </div>
              <div className="mt-3 text-sm font-semibold text-slate-900">{title}</div>
              <div className="text-xs text-slate-500 mt-1">{desc}</div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
