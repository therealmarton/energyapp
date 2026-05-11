import { useTranslation } from "react-i18next";
import { ArrowDownRight, ArrowUpRight, Leaf, Sun, Zap } from "lucide-react";

import { ABPanel } from "../components/panels/ABPanel";
import { Card } from "../components/ui/Card";
import { SavingsChart } from "../components/panels/SavingsChart";
import { StatCard } from "../components/ui/StatCard";
import { formatFt, formatKwh } from "../components/ui/formatting";
import { useActiveUser } from "../stores/useActiveUser";
import { useSettlement } from "../components/hooks/useSettlement";

export function MySavingsPage() {
  const { t } = useTranslation();
  const { activeUser } = useActiveUser();
  const { data, isLoading } = useSettlement();

  const row = data?.users.find((u) => u.user_id === activeUser?.id);

  if (isLoading) {
    return <div className="text-slate-500" data-testid="loading">{t("loading")}</div>;
  }
  if (!data || !row || !activeUser) {
    return <div className="text-slate-500" data-testid="empty-state">{t("noData")}</div>;
  }

  return (
    <div className="space-y-6" data-testid="page-my-savings">
      <ABPanel data={data} scope={row} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          tone="grid"
          icon={<Zap size={18} />}
          label={t("my.importFromGrid")}
          value={`${formatKwh(row.grid_purchased_kwh)} kWh`}
          hint={`${formatFt(row.grid_purchased_kwh * 40)} Ft @ 40 Ft/kWh`}
        />
        <StatCard
          tone="brand"
          icon={<Leaf size={18} />}
          label={t("my.importFromCommunity")}
          value={`${formatKwh(row.community_purchased_kwh)} kWh`}
          hint={`${formatFt(row.community_purchased_kwh * 22.5)} Ft @ 22.5 Ft/kWh`}
        />
        <StatCard
          tone="solar"
          icon={<Sun size={18} />}
          label={t("my.exportToCommunity")}
          value={`${formatKwh(row.community_sold_kwh)} kWh`}
          hint={`${formatFt(row.community_sold_kwh * 22.5)} Ft @ 22.5 Ft/kWh`}
        />
        <StatCard
          tone="neutral"
          icon={<ArrowDownRight size={18} />}
          label={t("my.exportToGrid")}
          value={`${formatKwh(row.grid_sold_kwh)} kWh`}
          hint={`${formatFt(row.grid_sold_kwh * 5)} Ft @ 5 Ft/kWh`}
        />
      </div>

      {activeUser.is_prosumer && (
        <Card
          title={t("my.profitIncrement.title")}
          subtitle={t("my.profitIncrement.body")}
          data-testid="my-profit-increment"
        >
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-savings-dark">
              +{formatFt(row.prosumer_profit_increment_ft)} Ft
            </span>
            <span className="pill bg-emerald-100 text-emerald-800">
              <ArrowUpRight size={12} /> {t("my.vsGrid")}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            {t("my.profitIncrement.explain")}
          </p>
        </Card>
      )}

      <SavingsChart hourly={data.hourly} />
    </div>
  );
}
