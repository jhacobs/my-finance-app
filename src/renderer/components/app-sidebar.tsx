import { LayoutDashboard, Wallet } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/renderer/components/ui/sidebar";
import {
  Link,
  RegisteredRouter,
  ValidateLinkOptions,
} from "@tanstack/react-router";

type SidebarItems<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
> = {
  title: string;
  linkOptions: ValidateLinkOptions<TRouter, TOptions>;
  icon: React.ElementType;
};

const items: SidebarItems[] = [
  {
    title: "Dashboard",
    linkOptions: {
      to: "/",
    },
    icon: LayoutDashboard,
  },
  {
    title: "Transactions",
    linkOptions: {
      to: "/transactions",
    },
    icon: Wallet,
  },
];

export default function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center">
          <span className="mr-2 rounded-xl bg-primary p-1.5 text-primary-foreground shadow-[0_12px_28px_-18px_var(--primary)]">
            <Wallet className="w-[--spacing(4)] h-[--spacing(4)]" />
          </span>
          <h1 className="font-semibold tracking-tight">My finance</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="mx-4">
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <Link
                {...item.linkOptions}
                className="[&.active]:bg-primary [&.active]:text-primary-foreground"
              >
                <item.icon />
                <span className="text-base">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
