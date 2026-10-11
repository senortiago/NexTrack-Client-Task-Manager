import { useState } from "react";
import { useClients } from "@/hooks/use-clients";
import { useProjects } from "@/hooks/use-projects";
import { useTasks, useUpdateTask } from "@/hooks/use-tasks";
import { useCharges } from "@/hooks/use-charges";
import { usePayments } from "@/hooks/use-payments";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, FolderKanban, DollarSign, Activity, CheckCircle2, Clock, AlertCircle, ArrowUpRight } from "lucide-react";
import { calculateChargeFinal } from "@/lib/format";
import { useCurrency } from "@/hooks/use-currency";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { format, type Locale } from "date-fns";
import { de, el, enUS, es, fr, it } from "date-fns/locale";

export default function Dashboard() {
  const { data: clients, isLoading: loadingClients } = useClients();
  const { data: projects, isLoading: loadingProjects } = useProjects();
  const { data: tasks, isLoading: loadingTasks } = useTasks();
  const { data: charges, isLoading: loadingCharges } = useCharges();
  const { data: payments, isLoading: loadingPayments } = usePayments();
  const { t, language } = useLanguage();
  const { formatMoney } = useCurrency();
  const updateTask = useUpdateTask();

  const [taskFilter, setTaskFilter] = useState<"all" | "active" | "done">("active");

  const dateFnsLocaleMap: Record<string, Locale> = { de, el, en: enUS, es, fr, it };
  const dateFnsLocale = dateFnsLocaleMap[language] || enUS;

  const totalClients = clients?.length || 0;
  const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
  
  // Financial totals
  const totalInvoiced = charges?.reduce((acc, charge) => {
    return acc + calculateChargeFinal(charge.amount, charge.discountPercentage);
  }, 0) || 0;

  const totalCollected = payments?.reduce((acc, p) => acc + p.amount, 0) || 0;
  const totalOutstanding = Math.max(0, totalInvoiced - totalCollected);
  const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

  // Task checklist items
  const allTasksList = tasks || [];
  const filteredTasks = allTasksList.filter(task => {
    if (taskFilter === "active") return task.status !== "done";
    if (taskFilter === "done") return task.status === "done";
    return true;
  });

  const toggleTaskStatus = (taskId: number, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "todo" : "done";
    updateTask.mutate({ id: taskId, status: newStatus });
  };

  // Recent payments
  const sortedPayments = [...(payments || [])].sort((a, b) => {
    const da = a.paidAt ? new Date(a.paidAt).getTime() : 0;
    const db = b.paidAt ? new Date(b.paidAt).getTime() : 0;
    return db - da;
  }).slice(0, 5);

  const isLoading = loadingClients || loadingProjects || loadingCharges || loadingTasks || loadingPayments;

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
          {/* Top 4 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover-elevate transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.totalRevenue")}</CardTitle>
                <DollarSign className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatMoney(totalInvoiced)}</div>
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

          {/* Middle Row: Financial Reporting & Task Checklist */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Financial Overview Card */}
            <Card className="shadow-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle>{t("dashboard.financialReporting")}</CardTitle>
                  <CardDescription className="text-xs mt-1">{t("dashboard.collectionRate")}: {collectionRate}%</CardDescription>
                </div>
                <Link href="/reports">
                  <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                    {t("nav.reports")}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Visual Progress Bar for Collections */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t("dashboard.collectedRevenue")}: {formatMoney(totalCollected)}
                    </span>
                    <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {t("dashboard.outstandingRevenue")}: {formatMoney(totalOutstanding)}
                    </span>
                  </div>
                  <Progress value={collectionRate} className="h-2.5 w-full bg-amber-500/20 [&>div]:bg-green-600" />
                </div>

                {/* Sub KPI Stats */}
                <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-muted/30 border border-border/40 text-center">
                  <div>
                    <div className="text-xs text-muted-foreground">{t("reports.finalTotal")}</div>
                    <div className="text-base font-bold text-foreground mt-0.5">{formatMoney(totalInvoiced)}</div>
                  </div>
                  <div className="border-x border-border/40">
                    <div className="text-xs text-green-700 dark:text-green-400">{t("payments.totalPaid")}</div>
                    <div className="text-base font-bold text-green-600 dark:text-green-400 mt-0.5">{formatMoney(totalCollected)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-amber-700 dark:text-amber-400">{t("payments.balanceDue")}</div>
                    <div className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">{formatMoney(totalOutstanding)}</div>
                  </div>
                </div>

                {/* Recent Transactions List */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    {t("dashboard.recentTransactions")}
                  </h4>
                  <div className="space-y-2.5">
                    {sortedPayments.map(p => {
                      const charge = charges?.find(c => c.id === p.chargeId);
                      const project = charge ? projects?.find(pr => pr.id === charge.projectId) : undefined;
                      return (
                        <div key={p.id} className="flex items-center justify-between p-2.5 rounded-md bg-muted/20 border border-border/30 text-sm">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate text-xs text-foreground">
                              {project?.name || t("common.unknown")} {p.note ? `• ${p.note}` : ""}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {p.paidAt ? format(new Date(p.paidAt), 'PP', { locale: dateFnsLocale }) : t("common.noData")}
                            </div>
                          </div>
                          <span className="font-bold text-xs text-green-600 dark:text-green-400 ml-3">
                            +{formatMoney(p.amount)}
                          </span>
                        </div>
                      );
                    })}
                    {sortedPayments.length === 0 && (
                      <div className="text-center py-5 text-muted-foreground text-xs">
                        {t("dashboard.noTransactions")}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Task Checklist Card */}
            <Card className="shadow-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle>{t("dashboard.taskChecklist")}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {allTasksList.filter(t => t.status === "done").length}/{allTasksList.length} {t("projects.tasksCompleted")}
                  </CardDescription>
                </div>
                <div className="flex gap-1 bg-muted/60 p-1 rounded-lg text-xs">
                  <button
                    onClick={() => setTaskFilter("active")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      taskFilter === "active" ? "bg-background text-foreground font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t("dashboard.todayTasks")}
                  </button>
                  <button
                    onClick={() => setTaskFilter("all")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      taskFilter === "all" ? "bg-background text-foreground font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t("dashboard.allTasks")}
                  </button>
                  <button
                    onClick={() => setTaskFilter("done")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      taskFilter === "done" ? "bg-background text-foreground font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t("status.done")}
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                  {filteredTasks.slice(0, 10).map(task => {
                    const project = projects?.find(p => p.id === task.projectId);
                    const isDone = task.status === "done";
                    return (
                      <div
                        key={task.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                          isDone 
                            ? "bg-muted/15 border-border/30 opacity-60" 
                            : "bg-muted/30 border-border/40 hover:bg-muted/50"
                        }`}
                      >
                        <Checkbox
                          checked={isDone}
                          onCheckedChange={() => toggleTaskStatus(task.id, task.status)}
                          className="mt-0.5"
                        />
                        <div className="min-w-0 flex-1">
                          <div className={`text-sm font-medium ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {task.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {project && (
                              <Link
                                href={`/projects/${project.id}`}
                                className="text-[11px] text-primary hover:underline font-medium truncate max-w-[160px]"
                              >
                                {project.name}
                              </Link>
                            )}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              task.status === "done"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : task.status === "in_progress"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {task.status === "done" ? t("status.done") : task.status === "in_progress" ? t("status.inProgress") : t("status.todo")}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {filteredTasks.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      {t("tasks.noTasks")}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row: Recent Projects & Recent Clients */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="col-span-1 shadow-sm border-border/50">
              <CardHeader>
                <CardTitle>{t("dashboard.recentProjects")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects?.slice(0, 5).map(project => {
                    const client = clients?.find(c => c.id === project.clientId);
                    const projectTasks = tasks?.filter(t => t.projectId === project.id) || [];
                    const completedTasks = projectTasks.filter(t => t.status === 'done').length;
                    const totalTasks = projectTasks.length;
                    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : (project.status === 'completed' ? 100 : 0);

                    return (
                      <div key={project.id} className="grid grid-cols-1 sm:grid-cols-12 items-start sm:items-center p-4 rounded-lg bg-muted/30 border border-border/40 transition-colors hover:bg-muted/50 gap-4">
                        <div className="min-w-0 sm:col-span-6">
                          <Link href={`/projects/${project.id}`} className="font-medium hover:text-primary transition-colors truncate block">
                            {project.name}
                          </Link>
                          <div className="text-sm text-muted-foreground mt-0.5 truncate">{client?.name || t("dashboard.unknownClient")}</div>
                        </div>
                        <div className="w-full sm:col-span-4 flex flex-col gap-1">
                          <div className="flex justify-between w-full text-[11px] text-muted-foreground font-medium">
                            <span className="text-foreground">{progressPercent}%</span>
                            <span>{totalTasks > 0 ? `${completedTasks}/${totalTasks}` : "—"}</span>
                          </div>
                          <Progress value={progressPercent} className="h-1.5 w-full bg-muted" />
                        </div>
                        <div className="sm:col-span-2 flex justify-start sm:justify-end">
                          <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            project.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                          }`}>
                            {project.status === 'active' ? t("status.active") : t("status.completed")}
                          </div>
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
