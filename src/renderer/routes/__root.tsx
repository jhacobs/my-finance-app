import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/renderer/components/ui/sidebar";
import AppSidebar from "@/renderer/components/app-sidebar";
import AppHeading from "@/renderer/components/app-heading";

const RootRoute = () => (
  <>
    <SidebarProvider>
      <AppSidebar />
      <main className="px-4 py-4">
        <SidebarTrigger className="mb-2" />
        <AppHeading />
        <Outlet />
      </main>
    </SidebarProvider>
    <TanStackRouterDevtools />
  </>
);

export const Route = createRootRoute({ component: RootRoute });
