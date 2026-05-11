import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "../ui/Card";
import type { HourlyPoint } from "../../api";

interface Props {
  hourly: HourlyPoint[];
}

export function SelfSufficiencyChart({ hourly }: Props) {
  const { t } = useTranslation();
  const rows = useMemo(() => {
    const map = new Map<string, { day: string; num: number; denom: number }>();
    for (const h of hourly) {
      const day = h.hour.slice(0, 10);
      const entry = map.get(day) ?? { day, num: 0, denom: 0 };
      entry.num += Math.min(h.community_supply_kwh, h.community_demand_kwh);
      entry.denom += h.community_demand_kwh;
      map.set(day, entry);
    }
    return Array.from(map.values()).map((r) => ({
      day: r.day.slice(5),
      pct: r.denom > 0 ? Math.round((r.num / r.denom) * 1000) / 10 : 0,
    }));
  }, [hourly]);

  return (
    <Card title={t("charts.self.title")} subtitle={t("charts.self.subtitle")} data-testid="selfsuff-chart">
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={rows} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
              formatter={(v: number) => `${v}%`}
            />
            <Line
              type="monotone"
              dataKey="pct"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              name={t("community.selfSufficiency")}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
