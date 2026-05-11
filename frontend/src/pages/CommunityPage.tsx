import { useTranslation } from "react-i18next";
import { Receipt, TrendingUp, Users, Zap } from "lucide-react";

import { CommunityTable } from "../components/panels/CommunityTable";
import { SavingsChart } from "../components/panels/SavingsChart";
import { SelfSufficiencyChart } from "../components/panels/SelfSufficiencyChart";
import { StatCard } from "../components/ui/StatCard";
import { formatFt, formatKwh, formatPct } from "../components/ui/formatting";
import { useActiveUser } from "../stores/useActiveUser";
import { useSettlement } from "../components/hooks/useSettlement";

export function CommunityPage() {
  const { t } = useTranslation();
  const { activeUser } = useActiveUser();
  const { data, isLoading } = useSettlement();

  if (isLoading) return <div className="text-slate-500" data-testid="loading">{t("loading")}</div>;
  if (!data) return <div className="text-slate-500">{t("noData")}</div>;

  const totalEnergy = data.users.reduce((a, u) => a + u.consumption_kwh, 0);
  const totalGen = data.users.reduce((a, u) => a + u.generation_kwh, 0);

  return (
    <div className="space-y-6" data-testid="page-community">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          tone="savings"
          icon={<Receipt size={18} />}
          label={t("community.kpi.savings")}
          value={`${formatFt(data.total_savings_ft)} Ft`}
          hint={formatPct((data.total_savings_ft / (data.total_baseline_ft || 1)) * 100)}
        />
        <StatCard
          tone="solar"
          icon={<TrendingUp size={18} />}
          label={t("community.kpi.selfSufficiency")}
          value={formatPct(data.self_sufficiency_pct)}
          hint={t("community.kpi.selfSufficiencyHint")}
        />
        <StatCard
          tone="brand"
          icon={<Users size={18} />}
          label={t("community.kpi.households")}
          value={data.users.length}
          hint={`${data.users.filter((u) => u.is_prosumer).length} ${t("community.prosumer")}`}
        />
        <StatCard
          tone="grid"
          icon={<Zap size={18} />}
          label={t("community.kpi.totalEnergy")}
          value={`${formatKwh(totalEnergy)} kWh`}
          hint={`${formatKwh(totalGen)} kWh ${t("community.kpi.generated")}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SavingsChart hourly={data.hourly} />
        <SelfSufficiencyChart hourly={data.hourly} />
      </div>

      <CommunityTable data={data} highlightUserId={activeUser?.id} />
    </div>
  );
}
