import { useTranslation } from "react-i18next";
import { Sun } from "lucide-react";

import { Card } from "../components/ui/Card";
import { ProsumerProfitChart } from "../components/panels/ProsumerProfitChart";
import { StatCard } from "../components/ui/StatCard";
import { UserAvatar } from "../components/layout/UserAvatar";
import { formatFt, formatKwh } from "../components/ui/formatting";
import { useActiveUser } from "../stores/useActiveUser";
import { useSettlement } from "../components/hooks/useSettlement";

export function ProsumerProfitPage() {
  const { t } = useTranslation();
  const { activeUser, users } = useActiveUser();
  const { data, isLoading } = useSettlement();

  if (isLoading) return <div className="text-slate-500" data-testid="loading">{t("loading")}</div>;
  if (!data) return <div className="text-slate-500">{t("noData")}</div>;

  const kwpByName = Object.fromEntries(users.map((u) => [u.name, u.solar_kwp] as const));
  const prosumers = data.users.filter((u) => u.is_prosumer);
  const totalIncrement = prosumers.reduce((a, u) => a + u.prosumer_profit_increment_ft, 0);
  const totalSold = prosumers.reduce((a, u) => a + u.community_sold_kwh, 0);

  return (
    <div className="space-y-6" data-testid="page-prosumer-profit">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          tone="savings"
          icon={<Sun size={18} />}
          label={t("profit.kpi.totalIncrement")}
          value={`${formatFt(totalIncrement)} Ft`}
          hint={t("profit.kpi.totalIncrementHint")}
        />
        <StatCard
          tone="solar"
          label={t("profit.kpi.soldToCommunity")}
          value={`${formatKwh(totalSold)} kWh`}
          hint={`${formatFt(totalSold * 22.5)} Ft`}
        />
        <StatCard
          tone="grid"
          label={t("profit.kpi.gridOnlyWouldBe")}
          value={`${formatFt(totalSold * 5)} Ft`}
          hint={t("profit.kpi.gridOnlyHint")}
        />
      </div>

      <ProsumerProfitChart data={data} highlightName={activeUser?.name} />

      <Card title={t("profit.breakdownTitle")} bodyClassName="p-0">
        <ul className="divide-y divide-slate-100">
          {prosumers.map((u) => (
            <li
              key={u.user_id}
              className={`flex items-center justify-between px-5 py-4 ${
                u.user_id === activeUser?.id ? "bg-brand-50/60" : ""
              }`}
              data-testid={`profit-row-${u.name}`}
            >
              <div className="flex items-center gap-3">
                <UserAvatar name={u.name} size="sm" />
                <div>
                  <div className="font-medium text-slate-900">{u.name}</div>
                  <div className="text-xs text-slate-500">
                    {kwpByName[u.name] ?? 0} kWp · {formatKwh(u.community_sold_kwh)} kWh → {t("profit.community")}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-savings-dark tabular-nums">
                  +{formatFt(u.prosumer_profit_increment_ft)} Ft
                </div>
                <div className="text-xs text-slate-500">
                  {formatFt(u.community_sold_kwh * 22.5)} − {formatFt(u.community_sold_kwh * 5)}{" "}
                  {t("profit.diffLabel")}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
