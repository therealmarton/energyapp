import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "../ui/Card";
import type { SettlementResponse } from "../../api";

interface Props {
  data: SettlementResponse;
  highlightName?: string;
  compact?: boolean;
}

export function ProsumerProfitChart({ data, highlightName, compact }: Props) {
  const { t } = useTranslation();
  const prosumers = data.users.filter((u) => u.is_prosumer);
  const rows = prosumers.map((u) => ({
    name: u.name.replace("Haz_", "H"),
    fullName: u.name,
    gridOnly: Math.round(u.community_sold_kwh * 5 + u.grid_sold_kwh * 5),
    community: Math.round(u.community_sold_kwh * 22.5 + u.grid_sold_kwh * 5),
    increment: Math.round(u.prosumer_profit_increment_ft),
  }));

  return (
    <Card
      title={t("profit.title")}
      subtitle={t("profit.description")}
      data-testid="profit-chart"
    >
      <div style={{ width: "100%", height: compact ? 220 : 300 }}>
        <ResponsiveContainer>
          <BarChart data={rows} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
              formatter={(v: number) => `${v.toLocaleString("hu-HU")} Ft`}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="gridOnly" name={t("profit.gridOnly")} fill="#94a3b8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="community" name={t("profit.community")} fill="#f59e0b" radius={[4, 4, 0, 0]}>
              {rows.map((r, i) => (
                <Cell
                  key={i}
                  fill={highlightName && r.fullName === highlightName ? "#b45309" : "#f59e0b"}
                />
              ))}
            </Bar>
            <Bar dataKey="increment" name={t("profit.increment")} fill="#059669" radius={[4, 4, 0, 0]}>
              {rows.map((r, i) => (
                <Cell
                  key={i}
                  fill={highlightName && r.fullName === highlightName ? "#065f46" : "#059669"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
