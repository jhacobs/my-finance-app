import AppHeading from "../components/app-heading";
import AppSidebar from "../components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";

type MainLayoutProps = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <main className="min-h-svh flex-1 px-5 py-5">
          <SidebarTrigger className="mb-3 text-muted-foreground hover:text-foreground" />
          <AppHeading />
          {children}
        </main>
      </SidebarProvider>
    </>
  );
}
