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
        <main className="px-4 py-4">
          <SidebarTrigger className="mb-2" />
          <AppHeading />
          {children}
        </main>
      </SidebarProvider>
    </>
  );
}
