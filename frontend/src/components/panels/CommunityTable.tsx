import { useTranslation } from "react-i18next";
import { Sun, Home as HomeIcon } from "lucide-react";

import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { UserAvatar } from "../layout/UserAvatar";
import { formatFt, formatKwh } from "../ui/formatting";
import type { SettlementResponse } from "../../api";

interface Props {
  data: SettlementResponse;
  highlightUserId?: number;
}

export function CommunityTable({ data, highlightUserId }: Props) {
  const { t } = useTranslation();

  return (
    <Card title={t("community.table.title")} subtitle={t("community.table.subtitle")} data-testid="community-table" bodyClassName="p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/60 text-slate-500 border-b border-slate-100">
            <tr className="text-left">
              <th className="py-3 px-5 font-medium">{t("community.name")}</th>
              <th className="py-3 px-3 font-medium">{t("community.role")}</th>
              <th className="py-3 px-3 font-medium text-right">{t("community.import")}</th>
              <th className="py-3 px-3 font-medium text-right">{t("community.export")}</th>
              <th className="py-3 px-3 font-medium text-right">{t("community.baseline")}</th>
              <th className="py-3 px-3 font-medium text-right">{t("community.communityCost")}</th>
              <th className="py-3 px-3 font-medium text-right">{t("community.savings")}</th>
              <th className="py-3 px-5 font-medium text-right">{t("community.profitExtra")}</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((u) => {
              const highlight = highlightUserId === u.user_id;
              return (
                <tr
                  key={u.user_id}
                  className={`border-b border-slate-100 last:border-0 ${
                    highlight ? "bg-brand-50/60" : "hover:bg-slate-50"
                  }`}
                  data-testid={`row-${u.name}`}
                >
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={u.name} size="sm" />
                      <div>
                        <div className="font-medium text-slate-900">{u.name}</div>
                        {highlight && (
                          <div className="text-[11px] text-brand-700">{t("community.you")}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    {u.is_prosumer ? (
                      <Badge tone="solar">
                        <Sun size={10} /> {t("community.prosumer")}
                      </Badge>
                    ) : (
                      <Badge tone="grid">
                        <HomeIcon size={10} /> {t("community.consumer")}
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">{formatKwh(u.import_kwh)}</td>
                  <td className="py-3 px-3 text-right tabular-nums">{formatKwh(u.export_kwh)}</td>
                  <td className="py-3 px-3 text-right tabular-nums text-slate-600">
                    {formatFt(u.baseline_cost_ft)}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-slate-600">
                    {formatFt(u.community_cost_ft)}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums font-semibold text-savings-dark">
                    {formatFt(u.savings_ft)}
                  </td>
                  <td className="py-3 px-5 text-right tabular-nums text-amber-700">
                    {formatFt(u.prosumer_profit_increment_ft)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
