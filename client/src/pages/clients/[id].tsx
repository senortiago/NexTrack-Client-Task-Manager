import { useState } from "react";
import { useParams, Link } from "wouter";
import { useClient } from "@/hooks/use-clients";
import { useProjects } from "@/hooks/use-projects";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProjectForm } from "@/components/forms/project-form";
import { ArrowLeft, Building, Mail, FolderPlus, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { el, enUS } from "date-fns/locale";

export default function ClientView() {
  const { id } = useParams<{ id: string }>();
  const clientId = parseInt(id, 10);
  const { t, language } = useLanguage();
  const dateFnsLocale = language === "el" ? el : enUS;
  
  const { data: client, isLoading: loadingClient } = useClient(clientId);
  const { data: projects, isLoading: loadingProjects } = useProjects(clientId);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  if (loadingClient) return <div className="p-8 animate-pulse"><div className="h-8 w-48 bg-muted rounded mb-8"></div><div className="h-64 bg-muted rounded"></div></div>;
  if (!client) return <div className="p-8 text-center text-muted-foreground">{t("clients.notFound")}</div>;

  const activeProjects = projects?.filter(p => p.status === 'active') || [];
  const completedProjects = projects?.filter(p => p.status === 'completed') || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <Link href="/clients" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t("clients.backToClients")}
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{client.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {client.company && (
                <div className="flex items-center"><Building className="w-4 h-4 mr-1.5" />{client.company}</div>
              )}
              {client.email && (
                <div className="flex items-center"><Mail className="w-4 h-4 mr-1.5" />{client.email}</div>
              )}
              {client.createdAt && (
                <div className="flex items-center">
                  <span className="opacity-50">{t("clients.added")} {format(new Date(client.createdAt), 'PPP', { locale: dateFnsLocale })}</span>
                </div>
              )}
            </div>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="hover-elevate shadow-sm">
                <FolderPlus className="w-4 h-4 mr-2" />
                {t("projects.new")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("projects.createFor")} {client.name}</DialogTitle>
              </DialogHeader>
              <ProjectForm clientId={clientId} onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-border/50 shadow-sm bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="pb-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <CardTitle>{t("projects.activeProjects")} ({activeProjects.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingProjects ? (
              <div className="p-6 text-center text-muted-foreground text-sm">{t("projects.loadingProjects")}</div>
            ) : activeProjects.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm italic">
                {t("projects.noActiveProjects")}
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {activeProjects.map(project => (
                  <div key={project.id} className="p-5 flex items-center justify-between group hover:bg-muted/30 transition-colors">
                    <div>
                      <Link href={`/projects/${project.id}`} className="font-medium text-foreground hover:text-primary transition-colors text-lg">
                        {project.name}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{project.description || t("projects.noDescriptionShort")}</p>
                    </div>
                    <Link href={`/projects/${project.id}`}>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">{t("common.view")}</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="pb-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-muted-foreground">{t("projects.completedProjects")} ({completedProjects.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingProjects ? (
              <div className="p-6 text-center text-muted-foreground text-sm">{t("projects.loadingProjects")}</div>
            ) : completedProjects.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm italic opacity-70">
                {t("projects.noCompletedProjects")}
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {completedProjects.map(project => (
                  <div key={project.id} className="p-5 flex items-center justify-between group hover:bg-muted/30 transition-colors opacity-75 hover:opacity-100">
                    <div>
                      <Link href={`/projects/${project.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                        {project.name}
                      </Link>
                    </div>
                    <Link href={`/projects/${project.id}`}>
                      <Button variant="outline" size="sm" className="h-8">{t("projects.review")}</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
