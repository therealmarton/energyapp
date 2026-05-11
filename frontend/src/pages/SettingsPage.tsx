import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Database, LogOut, RotateCcw, Trash2 } from "lucide-react";

import { Card } from "../components/ui/Card";
import { StatCard } from "../components/ui/StatCard";
import { UserAvatar } from "../components/layout/UserAvatar";
import { api } from "../api";
import { useDateWindow } from "../stores/useDateWindow";
import { useActiveUser } from "../stores/useActiveUser";

export function SettingsPage() {
  const { t } = useTranslation();
  const { start, end, reset } = useDateWindow();
  const { activeUser, signOut } = useActiveUser();
  const qc = useQueryClient();

  const range = useQuery({ queryKey: ["range"], queryFn: api.range });
  const drop = useMutation({
    mutationFn: api.dropData,
    onSuccess: async () => {
      await qc.invalidateQueries();
    },
  });

  return (
    <div className="space-y-6" data-testid="page-settings">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          tone="brand"
          icon={<Database size={18} />}
          label={t("settings.records")}
          value={range.data?.record_count.toLocaleString("hu-HU") ?? "—"}
        />
        <StatCard
          tone="neutral"
          label={t("settings.first")}
          value={range.data?.first ? range.data.first.slice(0, 10) : "—"}
        />
        <StatCard
          tone="neutral"
          label={t("settings.last")}
          value={range.data?.last ? range.data.last.slice(0, 10) : "—"}
        />
      </div>

      <Card title={t("settings.account.title")} subtitle={t("settings.account.subtitle")}>
        <div className="flex items-center justify-between gap-3" data-testid="settings-account-row">
          <div className="flex items-center gap-3">
            {activeUser && <UserAvatar name={activeUser.name} />}
            <div>
              <div className="text-sm font-medium text-slate-900">
                {activeUser?.name ?? "—"}
              </div>
              <div className="text-xs text-slate-500">
                {activeUser?.is_prosumer ? t("community.prosumer") : t("community.consumer")}
                {activeUser?.is_prosumer && ` · ${activeUser.solar_kwp} kWp`}
                {" · "}
                {activeUser?.profile_type}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white hover:bg-slate-50"
            data-testid="sign-out"
          >
            <LogOut size={14} /> {t("settings.account.signOut")}
          </button>
        </div>
      </Card>

      <Card title={t("settings.window.title")} subtitle={t("settings.window.subtitle")}>
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-slate-600">
            {t("filters.start")}: <b className="tabular-nums">{start}</b> · {t("filters.end")}:{" "}
            <b className="tabular-nums">{end}</b>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white hover:bg-slate-50"
            data-testid="filter-reset"
          >
            <RotateCcw size={14} /> {t("filters.reset")}
          </button>
        </div>
      </Card>

      <Card title={t("settings.danger.title")} subtitle={t("settings.danger.subtitle")}>
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-slate-600">{t("settings.danger.body")}</div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(t("actions.dropConfirm"))) drop.mutate();
            }}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 shadow-sm"
            data-testid="drop-data"
          >
            <Trash2 size={14} /> {t("actions.dropData")}
          </button>
        </div>
        {drop.isSuccess && (
          <div className="mt-3 text-sm text-emerald-700" data-testid="drop-success">
            {t("actions.dropped")}
          </div>
        )}
      </Card>
    </div>
  );
}
