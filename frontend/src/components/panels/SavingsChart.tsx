import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
  CartesianGrid,
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

export function SavingsChart({ hourly }: Props) {
  const { t } = useTranslation();
  const rows = useMemo(() => {
    // Aggregate to daily totals to keep chart readable across long windows.
    const map = new Map<string, { day: string; baseline: number; community: number; savings: number }>();
    for (const h of hourly) {
      const day = h.hour.slice(0, 10);
      const entry = map.get(day) ?? { day, baseline: 0, community: 0, savings: 0 };
      entry.baseline += h.baseline_total_ft;
      entry.community += h.community_total_ft;
      entry.savings += h.savings_ft;
      map.set(day, entry);
    }
    return Array.from(map.values()).map((r) => ({
      day: r.day.slice(5),
      baseline: Math.round(r.baseline),
      community: Math.round(r.community),
      savings: Math.round(r.savings),
    }));
  }, [hourly]);

  return (
    <Card title={t("charts.savings.title")} subtitle={t("charts.savings.subtitle")} data-testid="savings-chart">
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <AreaChart data={rows} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="gBaseline" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gCommunity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
              formatter={(v: number) => `${v.toLocaleString("hu-HU")} Ft`}
            />
            <Area
              type="monotone"
              dataKey="baseline"
              stroke="#64748b"
              fill="url(#gBaseline)"
              name={t("ab.without")}
            />
            <Area
              type="monotone"
              dataKey="community"
              stroke="#4f46e5"
              fill="url(#gCommunity)"
              name={t("ab.with")}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
