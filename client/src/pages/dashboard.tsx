import { useClients } from "@/hooks/use-clients";
import { useProjects } from "@/hooks/use-projects";
import { useCharges } from "@/hooks/use-charges";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderKanban, DollarSign, Activity } from "lucide-react";
import { formatMoney, calculateChargeFinal } from "@/lib/format";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: clients, isLoading: loadingClients } = useClients();
  const { data: projects, isLoading: loadingProjects } = useProjects();
  const { data: charges, isLoading: loadingCharges } = useCharges();
  const { t } = useLanguage();

  const totalClients = clients?.length || 0;
  const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
  
  const totalRevenue = charges?.reduce((acc, charge) => {
    return acc + calculateChargeFinal(charge.amount, charge.discountPercentage);
  }, 0) || 0;

  const isLoading = loadingClients || loadingProjects || loadingCharges;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("dashboard.welcome")}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/clients">
            <Button variant="outline">{t("dashboard.viewClients")}</Button>
          </Link>
          <Link href="/projects">
            <Button>{t("dashboard.viewProjects")}</Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse bg-muted/20 h-32 border-none shadow-none"></Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover-elevate transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.totalRevenue")}</CardTitle>
                <DollarSign className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatMoney(totalRevenue)}</div>
                <p className="text-xs text-muted-foreground mt-1">{t("dashboard.revenueSuffix")}</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.activeProjects")}</CardTitle>
                <Activity className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeProjects}</div>
                <p className="text-xs text-muted-foreground mt-1">{t("dashboard.projectsSuffix")}</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.totalClients")}</CardTitle>
                <Users className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalClients}</div>
                <p className="text-xs text-muted-foreground mt-1">{t("dashboard.clientsSuffix")}</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.totalProjects")}</CardTitle>
                <FolderKanban className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">{t("dashboard.allProjectsSuffix")}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <Card className="col-span-1 shadow-sm border-border/50">
              <CardHeader>
                <CardTitle>{t("dashboard.recentProjects")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects?.slice(0, 5).map(project => {
                    const client = clients?.find(c => c.id === project.clientId);
                    return (
                      <div key={project.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/40 transition-colors hover:bg-muted/50">
                        <div>
                          <Link href={`/projects/${project.id}`} className="font-medium hover:text-primary transition-colors">
                            {project.name}
                          </Link>
                          <div className="text-sm text-muted-foreground mt-0.5">{client?.name || t("dashboard.unknownClient")}</div>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          project.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          {project.status === 'active' ? t("status.active") : t("status.completed")}
                        </div>
                      </div>
                    );
                  })}
                  {(!projects || projects.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      {t("dashboard.noProjects")}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1 shadow-sm border-border/50">
              <CardHeader>
                <CardTitle>{t("dashboard.recentClients")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clients?.slice(0, 5).map(client => (
                    <div key={client.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/40 transition-colors hover:bg-muted/50">
                      <div>
                        <Link href={`/clients/${client.id}`} className="font-medium hover:text-primary transition-colors">
                          {client.name}
                        </Link>
                        <div className="text-sm text-muted-foreground mt-0.5">{client.company || t("dashboard.noCompany")}</div>
                      </div>
                      <Link href={`/clients/${client.id}`}>
                        <Button variant="ghost" size="sm" className="h-8">{t("common.view")}</Button>
                      </Link>
                    </div>
                  ))}
                  {(!clients || clients.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      {t("dashboard.noClients")}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
