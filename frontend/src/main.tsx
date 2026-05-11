import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";

import "./index.css";
import "./i18n";
import { routeTree } from "./routeTree";
import { ActiveUserProvider } from "./stores/useActiveUser";
import { DateWindowProvider } from "./stores/useDateWindow";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5_000, refetchOnWindowFocus: false } },
});

const router = createRouter({ routeTree, context: { queryClient } });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <DateWindowProvider>
        <ActiveUserProvider>
          <RouterProvider router={router} />
        </ActiveUserProvider>
      </DateWindowProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
