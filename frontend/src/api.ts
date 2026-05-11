export interface UserOut {
  id: number;
  name: string;
  profile_type: string;
  is_prosumer: boolean;
  solar_kwp: number;
}

export interface PerUserSettlement {
  user_id: number;
  name: string;
  is_prosumer: boolean;
  consumption_kwh: number;
  generation_kwh: number;
  import_kwh: number;
  export_kwh: number;
  community_purchased_kwh: number;
  community_sold_kwh: number;
  grid_purchased_kwh: number;
  grid_sold_kwh: number;
  baseline_cost_ft: number;
  community_cost_ft: number;
  savings_ft: number;
  prosumer_profit_increment_ft: number;
}

export interface HourlyPoint {
  hour: string;
  community_supply_kwh: number;
  community_demand_kwh: number;
  self_sufficiency_pct: number;
  baseline_total_ft: number;
  community_total_ft: number;
  savings_ft: number;
}

export interface SettlementResponse {
  start: string | null;
  end: string | null;
  total_baseline_ft: number;
  total_community_ft: number;
  total_savings_ft: number;
  self_sufficiency_pct: number;
  users: PerUserSettlement[];
  hourly: HourlyPoint[];
}

export interface DataRangeOut {
  first: string | null;
  last: string | null;
  record_count: number;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, init);
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return (await r.json()) as T;
}

export const api = {
  users: () => fetchJson<UserOut[]>("/api/users"),
  range: () => fetchJson<DataRangeOut>("/api/data-range"),
  settlement: (start?: string, end?: string) => {
    const p = new URLSearchParams();
    if (start) p.set("start", start);
    if (end) p.set("end", end);
    const qs = p.toString();
    return fetchJson<SettlementResponse>(`/api/settlement${qs ? `?${qs}` : ""}`);
  },
  dropData: () => fetchJson<{ status: string }>("/api/data-drop", { method: "POST" }),
};
