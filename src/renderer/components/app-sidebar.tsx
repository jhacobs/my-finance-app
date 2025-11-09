import { LayoutDashboard, Wallet } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Link } from "@tanstack/react-router";

type SidebarItems = {
  title: string;
  url: string;
  icon: React.ElementType;
};

const items: SidebarItems[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
];

export default function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center">
          <span className="bg-primary text-white p-1.5 rounded-lg mr-2">
            <Wallet className="w-[--spacing(4)] h-[--spacing(4)]" />
          </span>
          <h1>My finance</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="mx-4">
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <Link
                to={item.url}
                className="[&.active]:bg-primary [&.active]:text-white"
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
