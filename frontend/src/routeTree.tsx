import { useEffect } from "react";
import { Outlet, RootRoute, Route, useNavigate, useRouterState } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";

import { AppShell } from "./components/layout/AppShell";
import { HomePage } from "./pages/HomePage";
import { MySavingsPage } from "./pages/MySavingsPage";
import { CommunityPage } from "./pages/CommunityPage";
import { ProsumerProfitPage } from "./pages/ProsumerProfitPage";
import { LivePage } from "./pages/LivePage";
import { SettingsPage } from "./pages/SettingsPage";
import { WelcomePage } from "./pages/WelcomePage";
import { useActiveUser } from "./stores/useActiveUser";

interface RouterContext {
  queryClient: QueryClient;
}

function RootComponent() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { activeUser, isLoading } = useActiveUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!activeUser && path !== "/welcome") {
      void navigate({ to: "/welcome", replace: true });
    } else if (activeUser && path === "/welcome") {
      void navigate({ to: "/", replace: true });
    }
  }, [activeUser, isLoading, path, navigate]);

  if (path === "/welcome") return <Outlet />;
  if (!activeUser) {
    return <div className="h-full w-full flex items-center justify-center text-slate-400">…</div>;
  }
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

const rootRoute = new RootRoute<RouterContext>({ component: RootComponent });

const welcomeRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/welcome",
  component: WelcomePage,
});
const indexRoute = new Route({ getParentRoute: () => rootRoute, path: "/", component: HomePage });
const mySavingsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/my-savings",
  component: MySavingsPage,
});
const communityRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/community",
  component: CommunityPage,
});
const prosumerRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/prosumer-profit",
  component: ProsumerProfitPage,
});
const liveRoute = new Route({ getParentRoute: () => rootRoute, path: "/live", component: LivePage });
const settingsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

export const routeTree = rootRoute.addChildren([
  welcomeRoute,
  indexRoute,
  mySavingsRoute,
  communityRoute,
  prosumerRoute,
  liveRoute,
  settingsRoute,
]);
