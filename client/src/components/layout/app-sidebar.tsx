import { Link, useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { useBranding } from "@/hooks/use-branding";
import { useProjects } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  BarChart3, 
  Briefcase, 
  Settings,
  Sparkles,
  CheckCircle2,
  Clock
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";

export function AppSidebar() {
  const [location] = useLocation();
  const { t } = useLanguage();
  const { appName, logoUrl } = useBranding();
  const { isMobile, setOpenMobile } = useSidebar();
  const { data: projects } = useProjects();
  const { data: tasks } = useTasks();

  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(task => task.status === "done").length || 0;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const activeProjectsCount = projects?.filter(p => p.status === "active").length || 0;

  const navItems = [
    { title: t("nav.dashboard"), url: "/", icon: LayoutDashboard },
    { title: t("nav.clients"), url: "/clients", icon: Users },
    { 
      title: t("nav.projects"), 
      url: "/projects", 
      icon: FolderKanban,
      badge: activeProjectsCount > 0 ? `${activeProjectsCount}` : undefined 
    },
    { title: t("nav.reports"), url: "/reports", icon: BarChart3 },
    { title: t("nav.settings"), url: "/settings", icon: Settings },
  ];

  return (
    <Sidebar className="border-r border-border/50 bg-sidebar/95 backdrop-blur-sm select-none">
      {/* Brand Header */}
      <SidebarHeader className="p-4 border-b border-border/40">
        <Link 
          href="/" 
          className="flex items-center gap-3 px-2 py-1 rounded-xl transition-all hover:bg-sidebar-accent/50 group"
          onClick={() => { if (isMobile) setOpenMobile(false); }}
        >
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={appName} 
              className="w-9 h-9 rounded-xl object-contain shadow-sm border border-border/40 group-hover:scale-105 transition-transform" 
              data-testid="img-sidebar-logo" 
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground flex items-center justify-center shadow-sm shadow-primary/20 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-display font-bold text-base tracking-tight truncate text-sidebar-foreground" data-testid="text-sidebar-app-name">
              {appName}
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary shrink-0" />
              <span>Workspace Pro</span>
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 mb-2 px-3">
            {t("nav.workspace")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => {
                const isActive = location === item.url || (item.url !== "/" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title} onClick={() => { if (isMobile) setOpenMobile(false); }}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive} 
                      tooltip={item.title}
                      className={`h-10 px-3 rounded-lg text-sm font-medium transition-all ${
                        isActive 
                          ? "bg-primary text-primary-foreground shadow-sm font-semibold hover:bg-primary/95 hover:text-primary-foreground" 
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`}
                    >
                      <Link href={item.url} className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <item.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                          <span>{item.title}</span>
                        </div>
                        {item.badge && (
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold tabular-nums transition-colors ${
                            isActive 
                              ? "bg-primary-foreground/20 text-primary-foreground" 
                              : "bg-primary/10 text-primary group-hover:bg-primary/20"
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer with Live Productivity Summary */}
      <SidebarFooter className="p-3 border-t border-border/40">
        <div className="p-3 rounded-xl bg-sidebar-accent/50 border border-border/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-sidebar-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              {t("projects.progress")}
            </span>
            <span className="font-bold text-primary tabular-nums">
              {taskCompletionRate}%
            </span>
          </div>
          <Progress value={taskCompletionRate} className="h-1.5 w-full bg-sidebar-accent" />
          <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-0.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              {completedTasks}/{totalTasks} {t("projects.tasksCompleted")}
            </span>
            <span>{activeProjectsCount} {t("status.active").toLowerCase()}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
