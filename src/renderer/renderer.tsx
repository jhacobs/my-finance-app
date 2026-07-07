import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./styles/globals.css";
import { toast } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "@/renderer/components/ui/sonner";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();

window.electronAPI.onErrorNotification((message) => {
  toast.error(message);
});

window.electronAPI.onSuccessNotification((message) => {
  toast.success(message);
});

window.electronAPI.onInfoNotification((message) => {
  toast(message);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster />
        <TanStackDevtools
          plugins={[
            formDevtoolsPlugin(),
            {
              name: "TanStack Query",
              render: <ReactQueryDevtools />,
            },
            {
              name: "TanStack Router",
              render: <TanStackRouterDevtools router={router} />,
            },
          ]}
        />
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>,
);
