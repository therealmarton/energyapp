import { useTranslation } from "react-i18next";
import { Home as HomeIcon, Sun } from "lucide-react";

import { UserAvatar } from "./UserAvatar";
import { useActiveUser } from "../../stores/useActiveUser";

export function UserBadge() {
  const { t } = useTranslation();
  const { activeUser } = useActiveUser();

  if (!activeUser) {
    return <div className="h-10 w-40 rounded-lg bg-slate-100 animate-pulse" />;
  }

  return (
    <div
      className="flex items-center gap-3 border border-slate-200 rounded-lg pl-1.5 pr-3 py-1.5 bg-white shadow-sm"
      data-testid="user-badge"
      aria-label={t("switcher.signedInAs", { name: activeUser.name })}
    >
      <UserAvatar name={activeUser.name} />
      <div className="flex flex-col leading-tight min-w-[9rem]">
        <span className="text-sm font-medium text-slate-900" data-testid="active-user-name">
          {activeUser.name}
        </span>
        <span className="text-[11px] text-slate-500 flex items-center gap-1">
          {activeUser.is_prosumer ? (
            <>
              <Sun size={10} className="text-solar" /> {t("community.prosumer")} · {activeUser.solar_kwp} kWp
            </>
          ) : (
            <>
              <HomeIcon size={10} /> {t("community.consumer")} · {activeUser.profile_type}
            </>
          )}
        </span>
      </div>
    </div>
  );
}
