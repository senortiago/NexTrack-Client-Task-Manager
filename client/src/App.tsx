import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/hooks/use-language";
import { CurrencyProvider } from "@/hooks/use-currency";
import { BrandingProvider } from "@/hooks/use-branding";
import NotFound from "@/pages/not-found";

// Pages
import Dashboard from "@/pages/dashboard";
import ClientsPage from "@/pages/clients/index";
import ClientView from "@/pages/clients/[id]";
import ProjectsPage from "@/pages/projects/index";
import ProjectView from "@/pages/projects/[id]";
import ReportsPage from "@/pages/reports/index";
import SettingsPage from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard}/>
      <Route path="/clients" component={ClientsPage}/>
      <Route path="/clients/:id" component={ClientView}/>
      <Route path="/projects" component={ProjectsPage}/>
      <Route path="/projects/:id" component={ProjectView}/>
      <Route path="/reports" component={ReportsPage}/>
      <Route path="/settings" component={SettingsPage}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <LanguageProvider>
          <CurrencyProvider>
          <BrandingProvider>
            <TooltipProvider>
            <SidebarProvider style={style}>
              <div className="flex h-screen w-full bg-background overflow-hidden">
                <AppSidebar />
                <div className="flex flex-col flex-1 overflow-hidden">
                  <AppHeader />
                  <main className="flex-1 overflow-y-auto bg-muted/10 relative">
                    <Router />
                  </main>
                </div>
              </div>
            </SidebarProvider>
            <Toaster />
            </TooltipProvider>
          </BrandingProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
