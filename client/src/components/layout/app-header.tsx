import { useLocation, Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { useTheme } from "next-themes";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Sun, 
  Moon, 
  Languages, 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  BarChart3, 
  Settings,
  Plus
} from "lucide-react";

export function AppHeader() {
  const [location] = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  // Compute breadcrumb / page title based on location
  const getPageInfo = () => {
    if (location === "/") return { title: t("nav.dashboard"), icon: LayoutDashboard };
    if (location.startsWith("/clients")) return { title: t("nav.clients"), icon: Users };
    if (location.startsWith("/projects")) return { title: t("nav.projects"), icon: FolderKanban };
    if (location.startsWith("/reports")) return { title: t("nav.reports"), icon: BarChart3 };
    if (location.startsWith("/settings")) return { title: t("nav.settings"), icon: Settings };
    return { title: t("nav.workspace"), icon: LayoutDashboard };
  };

  const page = getPageInfo();
  const PageIcon = page.icon;

  const languages = [
    { code: "en", label: "English" },
    { code: "de", label: "Deutsch" },
    { code: "el", label: "Ελληνικά" },
    { code: "es", label: "Español" },
    { code: "fr", label: "Français" },
    { code: "it", label: "Italiano" },
  ] as const;

  return (
    <header className="flex items-center justify-between h-14 px-4 sm:px-6 border-b border-border/40 bg-background/95 backdrop-blur-md z-10 shrink-0 sticky top-0 select-none">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="hover-elevate bg-muted/40 hover:bg-muted border border-border/40 h-8 w-8 rounded-lg" />
        <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <PageIcon className="w-4 h-4 text-primary" />
          <span>{page.title}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Quick Nav Shortcut Buttons on medium+ displays */}
        <div className="hidden md:flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/40 text-xs">
          <Link href="/projects">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-7 px-2.5 text-xs font-medium rounded-md ${
                location.startsWith("/projects") ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5 mr-1" />
              {t("nav.projects")}
            </Button>
          </Link>
          <Link href="/reports">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-7 px-2.5 text-xs font-medium rounded-md ${
                location.startsWith("/reports") ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 mr-1" />
              {t("nav.reports")}
            </Button>
          </Link>
        </div>

        {/* Language Quick Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 gap-1.5 text-xs font-medium border border-border/40 hover:bg-muted/60">
              <Languages className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="uppercase font-semibold tracking-wider">{language}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            {languages.map(l => (
              <DropdownMenuItem 
                key={l.code} 
                onClick={() => setLanguage(l.code)}
                className={`text-xs flex items-center justify-between cursor-pointer ${language === l.code ? "font-bold text-primary" : ""}`}
              >
                <span>{l.label}</span>
                <span className="uppercase text-[10px] text-muted-foreground">{l.code}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-lg border border-border/40 hover:bg-muted/60"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  );
}
