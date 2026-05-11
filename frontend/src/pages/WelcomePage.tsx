import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Home as HomeIcon, Sun, Zap } from "lucide-react";

import { Badge } from "../components/ui/Badge";
import { LangToggle } from "../components/layout/LangToggle";
import { UserAvatar } from "../components/layout/UserAvatar";
import { useActiveUser } from "../stores/useActiveUser";

export function WelcomePage() {
  const { t } = useTranslation();
  const { users, setActiveUserId, isLoading } = useActiveUser();
  const [hoverId, setHoverId] = useState<number | null>(null);
  const navigate = useNavigate();

  const pick = (id: number) => {
    setActiveUserId(id);
    void navigate({ to: "/" });
  };

  return (
    <div
      className="min-h-full w-full bg-gradient-to-br from-slate-950 via-brand-950 to-slate-900 text-white flex flex-col"
      data-testid="page-welcome"
    >
      <header className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center shadow-raised">
            <Zap size={18} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">{t("app.brand")}</div>
            <div className="text-[11px] text-slate-400">{t("app.tagline")}</div>
          </div>
        </div>
        <LangToggle />
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-5xl">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs uppercase tracking-wider text-brand-100 backdrop-blur">
              <Sun size={12} className="text-solar-light" />
              {t("welcome.kicker")}
            </span>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              {t("welcome.title")}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base">
              {t("welcome.subtitle")}
            </p>
          </div>

          <section
            aria-label={t("welcome.selectLabel")}
            className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            data-testid="welcome-user-grid"
          >
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse" />
              ))}
            {!isLoading &&
              users.map((u) => {
                const hovered = hoverId === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => pick(u.id)}
                    onMouseEnter={() => setHoverId(u.id)}
                    onMouseLeave={() => setHoverId(null)}
                    onFocus={() => setHoverId(u.id)}
                    onBlur={() => setHoverId(null)}
                    className={`group text-left rounded-xl border bg-white/5 backdrop-blur transition p-5 hover:bg-white/10 hover:border-brand-400/60 hover:-translate-y-0.5 ${
                      hovered ? "border-brand-400/60 shadow-raised" : "border-white/10"
                    }`}
                    data-testid={`welcome-pick-${u.name}`}
                  >
                    <div className="flex items-start justify-between">
                      <UserAvatar name={u.name} size="lg" />
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                          hovered
                            ? "bg-brand-500 text-white"
                            : "bg-white/10 text-slate-300"
                        }`}
                      >
                        {hovered ? <ArrowRight size={16} /> : <Check size={16} />}
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="text-base font-semibold text-white">{u.name}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-300">
                        {u.is_prosumer ? (
                          <Badge tone="solar">
                            <Sun size={10} /> {t("community.prosumer")}
                          </Badge>
                        ) : (
                          <Badge tone="grid">
                            <HomeIcon size={10} /> {t("community.consumer")}
                          </Badge>
                        )}
                        <span>{u.profile_type}</span>
                        {u.is_prosumer && <span>· {u.solar_kwp} kWp</span>}
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-300/90">
                      {t("welcome.cardCta")}
                    </div>
                  </button>
                );
              })}
          </section>

          <footer className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs text-slate-300">
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <div className="text-slate-400 uppercase tracking-wider">{t("welcome.price.buy")}</div>
              <div className="mt-0.5 text-base font-semibold text-white">40 Ft/kWh</div>
            </div>
            <div className="rounded-lg border border-brand-400/40 bg-brand-500/10 px-4 py-3">
              <div className="text-brand-200 uppercase tracking-wider">{t("welcome.price.community")}</div>
              <div className="mt-0.5 text-base font-semibold text-white">22.5 Ft/kWh</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <div className="text-slate-400 uppercase tracking-wider">{t("welcome.price.sell")}</div>
              <div className="mt-0.5 text-base font-semibold text-white">5 Ft/kWh</div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
