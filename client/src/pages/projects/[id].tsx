import { useState } from "react";
import { useParams, Link } from "wouter";
import { useProject, useUpdateProject } from "@/hooks/use-projects";
import { useClient } from "@/hooks/use-clients";
import { useTasks, useDeleteTask, useUpdateTask } from "@/hooks/use-tasks";
import { useCharges, useDeleteCharge } from "@/hooks/use-charges";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm } from "@/components/forms/task-form";
import { ChargeForm } from "@/components/forms/charge-form";
import { PaymentForm } from "@/components/forms/payment-form";
import { usePayments, useDeletePayment } from "@/hooks/use-payments";
import { ArrowLeft, Plus, CheckCircle, Circle, Edit, Trash2, Tag, DollarSign, CreditCard, ChevronDown, ChevronUp, History } from "lucide-react";
import { calculateChargeFinal } from "@/lib/format";
import { useCurrency } from "@/hooks/use-currency";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@shared/schema";

export default function ProjectView() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id, 10);
  const { t } = useLanguage();
  const { formatMoney } = useCurrency();
  
  const { data: project, isLoading: loadingProject } = useProject(projectId);
  const { data: client } = useClient(project?.clientId);
  const { data: allTasks, isLoading: loadingTasks } = useTasks(projectId);
  const { data: charges, isLoading: loadingCharges } = useCharges(projectId);
  const { data: payments } = usePayments();
  
  const updateProject = useUpdateProject();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const deleteCharge = useDeleteCharge();
  const deletePayment = useDeletePayment();
  const { toast } = useToast();

  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [isChargeOpen, setIsChargeOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editingCharge, setEditingCharge] = useState<number | null>(null);
  const [payingCharge, setPayingCharge] = useState<number | null>(null);
  const [expandedChargePayments, setExpandedChargePayments] = useState<number | null>(null);

  if (loadingProject) return <div className="p-8 animate-pulse text-muted-foreground">{t("projects.loadingProject")}</div>;
  if (!project) return <div className="p-8 text-center text-muted-foreground">{t("projects.notFound")}</div>;

  const toggleProjectStatus = async () => {
    const newStatus = project.status === 'active' ? 'completed' : 'active';
    await updateProject.mutateAsync({ id: project.id, status: newStatus });
    toast({ title: `${t("projects.markedAs")} ${newStatus === 'active' ? t("status.active").toLowerCase() : t("status.completed").toLowerCase()}` });
  };

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    await updateTask.mutateAsync({ id: task.id, status: newStatus });
  };

  const rootTasks = allTasks?.filter(t => !t.parentId) || [];
  const totalTasks = allTasks?.length || 0;
  const completedTasks = allTasks?.filter(t => t.status === 'done').length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : (project.status === 'completed' ? 100 : 0);
  
  const renderTaskRow = (task: Task, depth = 0) => {
    const subtasks = allTasks?.filter(t => t.parentId === task.id) || [];
    const isDone = task.status === 'done';
    
    return (
      <div key={task.id}>
        <div className={`flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors group ${depth > 0 ? 'ml-8 border-l-2 border-border/50 rounded-l-none' : 'border border-border/50 bg-background'}`}>
          <div className="flex items-center gap-3 flex-1">
            <button onClick={() => toggleTaskStatus(task)} className="text-muted-foreground hover:text-primary transition-colors">
              {isDone ? <CheckCircle className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5" />}
            </button>
            <div className={`${isDone ? 'opacity-60 line-through' : ''}`}>
              <span className="font-medium text-sm">{task.title}</span>
              {task.description && <span className="ml-2 text-xs text-muted-foreground line-clamp-1">{task.description}</span>}
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {depth === 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">{t("tasks.subtask")}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{t("tasks.addSubtaskTo")} {task.title}</DialogTitle></DialogHeader>
                  <TaskForm projectId={projectId} parentId={task.id} />
                </DialogContent>
              </Dialog>
            )}
            
            <Dialog open={editingTask === task.id} onOpenChange={(o) => setEditingTask(o ? task.id : null)}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Edit className="w-3.5 h-3.5" /></Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t("tasks.editTask")}</DialogTitle></DialogHeader>
                <TaskForm projectId={projectId} initialData={task} onSuccess={() => setEditingTask(null)} />
              </DialogContent>
            </Dialog>
            
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteTask.mutate(task.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        {subtasks.length > 0 && (
          <div className="mt-1 mb-2 space-y-1">
            {subtasks.map(st => renderTaskRow(st, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <Link href="/projects" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t("projects.backToProjects")}
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{project.name}</h1>
              <Badge variant={project.status === 'active' ? "default" : "secondary"}>
                {project.status === 'active' ? t("status.active") : t("status.completed")}
              </Badge>
            </div>
            <p className="text-muted-foreground">{project.description || t("projects.noDescription")}</p>
            {client && (
              <div className="mt-3 text-sm">
                <span className="text-muted-foreground">{t("projects.client")}:</span> <Link href={`/clients/${client.id}`} className="font-medium hover:underline">{client.name}</Link>
              </div>
            )}
          </div>
          
          <Button 
            variant={project.status === 'active' ? "outline" : "default"} 
            onClick={toggleProjectStatus}
            className="shrink-0"
          >
            {project.status === 'active' ? t("projects.markCompleted") : t("projects.reopenProject")}
          </Button>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border/50 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              {t("projects.progress")}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {totalTasks > 0 ? `${completedTasks} / ${totalTasks} ${t("projects.tasksCompleted")}` : t("projects.noTasksYet")}
              </span>
              <span className="font-bold text-foreground text-sm">{progressPercent}%</span>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2.5 bg-muted" />
        </div>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="tasks">{t("tasks.tasksAndSubtasks")}</TabsTrigger>
          <TabsTrigger value="charges">{t("charges.title")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t("tasks.title")}</h3>
            <Dialog open={isTaskOpen} onOpenChange={setIsTaskOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="hover-elevate">
                  <Plus className="w-4 h-4 mr-1" /> {t("tasks.addTask")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t("tasks.createTask")}</DialogTitle></DialogHeader>
                <TaskForm projectId={projectId} onSuccess={() => setIsTaskOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2 pt-2">
            {loadingTasks ? (
              <div className="animate-pulse space-y-2">
                <div className="h-12 bg-muted rounded-md w-full"></div>
                <div className="h-12 bg-muted rounded-md w-full"></div>
              </div>
            ) : rootTasks.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-xl text-muted-foreground">
                {t("tasks.noTasks")}
              </div>
            ) : (
              rootTasks.map(task => renderTaskRow(task))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="charges" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t("charges.projectCharges")}</h3>
            <Dialog open={isChargeOpen} onOpenChange={setIsChargeOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="hover-elevate">
                  <Plus className="w-4 h-4 mr-1" /> {t("charges.addCharge")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t("charges.addCharge")}</DialogTitle></DialogHeader>
                <ChargeForm projectId={projectId} onSuccess={() => setIsChargeOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-0">
              {loadingCharges ? (
                <div className="p-6 text-center text-muted-foreground">{t("charges.loadingCharges")}</div>
              ) : charges?.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  {t("charges.noCharges")}
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {charges?.map(charge => {
                    const finalAmount = calculateChargeFinal(charge.amount, charge.discountPercentage);
                    const task = charge.taskId ? allTasks?.find(t => t.id === charge.taskId) : null;
                    const chargePayments = payments?.filter(p => p.chargeId === charge.id) || [];
                    const totalPaid = chargePayments.reduce((acc, p) => acc + p.amount, 0);
                    const balanceDue = Math.max(0, finalAmount - totalPaid);
                    const isPaid = finalAmount === 0 || totalPaid >= finalAmount;
                    const isPartial = !isPaid && totalPaid > 0;
                    const isExpanded = expandedChargePayments === charge.id;
                    
                    return (
                      <div key={charge.id} className="p-4 transition-colors hover:bg-muted/10 space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground text-base">{charge.description}</span>
                              {isPaid ? (
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                  {t("payments.paid")}
                                </span>
                              ) : isPartial ? (
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                  {t("payments.partial")}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                                  {t("payments.unpaid")}
                                </span>
                              )}
                            </div>
                            
                            <div className="text-sm text-muted-foreground flex flex-wrap gap-2 items-center">
                              {task && (
                                <span className="inline-flex items-center bg-muted px-2 py-0.5 rounded text-xs">
                                  <Tag className="w-3 h-3 mr-1" /> {task.title}
                                </span>
                              )}
                              {charge.discountPercentage > 0 && (
                                <span className="text-destructive text-xs font-medium">
                                  {charge.discountPercentage}% {t("charges.offApplied")}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-4 text-right">
                              <div>
                                <div className="text-xs text-muted-foreground">{t("reports.colFinalAmount")}</div>
                                <div className="font-bold text-base">{formatMoney(finalAmount)}</div>
                              </div>

                              <div className="border-l border-border/50 pl-4">
                                <div className="text-xs text-muted-foreground">{t("payments.totalPaid")}</div>
                                <div className="font-semibold text-emerald-600 text-sm">{formatMoney(totalPaid)}</div>
                              </div>

                              <div className="border-l border-border/50 pl-4">
                                <div className="text-xs text-muted-foreground">{t("payments.balanceDue")}</div>
                                <div className={`font-semibold text-sm ${balanceDue > 0 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                                  {formatMoney(balanceDue)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {balanceDue > 0 && (
                                <Dialog open={payingCharge === charge.id} onOpenChange={(o) => setPayingCharge(o ? charge.id : null)}>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="h-8 gap-1 hover-elevate">
                                      <CreditCard className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline">{t("payments.recordPayment")}</span>
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>{t("payments.recordPayment")}</DialogTitle>
                                    </DialogHeader>
                                    <PaymentForm
                                      chargeId={charge.id}
                                      remainingAmountDollars={balanceDue / 100}
                                      onSuccess={() => setPayingCharge(null)}
                                    />
                                  </DialogContent>
                                </Dialog>
                              )}

                              {chargePayments.length > 0 && (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 gap-1 text-xs" 
                                  onClick={() => setExpandedChargePayments(isExpanded ? null : charge.id)}
                                >
                                  <History className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span>{chargePayments.length}</span>
                                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </Button>
                              )}

                              <div className="flex items-center">
                                <Dialog open={editingCharge === charge.id} onOpenChange={(o) => setEditingCharge(o ? charge.id : null)}>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Edit className="w-4 h-4" /></Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader><DialogTitle>{t("charges.editCharge")}</DialogTitle></DialogHeader>
                                    <ChargeForm projectId={projectId} initialData={charge} onSuccess={() => setEditingCharge(null)} />
                                  </DialogContent>
                                </Dialog>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteCharge.mutate(charge.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Payment history list */}
                        {isExpanded && chargePayments.length > 0 && (
                          <div className="p-3 bg-muted/30 rounded-lg border border-border/40 space-y-2 mt-2 animate-in fade-in duration-200">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                              <History className="w-3 h-3" /> {t("payments.paymentHistory")}
                            </div>
                            <div className="divide-y divide-border/20">
                              {chargePayments.map(payment => (
                                <div key={payment.id} className="py-2 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-3">
                                    <span className="font-semibold text-foreground">{formatMoney(payment.amount)}</span>
                                    <span className="text-muted-foreground">{payment.paidAt ? payment.paidAt.split('T')[0] : ''}</span>
                                    {payment.note && (
                                      <span className="bg-background px-2 py-0.5 rounded border border-border/40 text-muted-foreground">
                                        {payment.note}
                                      </span>
                                    )}
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive" 
                                    onClick={() => deletePayment.mutate(payment.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Summary Totals */}
                  <div className="p-5 bg-muted/20 border-t-2 border-border grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-b-xl">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground uppercase">{t("projects.totalValue")}</div>
                      <div className="text-xl font-bold text-foreground">
                        {formatMoney(charges?.reduce((acc, c) => acc + calculateChargeFinal(c.amount, c.discountPercentage), 0) || 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-emerald-600 uppercase">{t("payments.totalPaid")}</div>
                      <div className="text-xl font-bold text-emerald-600">
                        {formatMoney(
                          charges?.reduce((acc, c) => {
                            const cPayments = payments?.filter(p => p.chargeId === c.id) || [];
                            return acc + cPayments.reduce((pSum, p) => pSum + p.amount, 0);
                          }, 0) || 0
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-amber-600 uppercase">{t("payments.totalOutstanding")}</div>
                      <div className="text-xl font-bold text-amber-600">
                        {formatMoney(
                          charges?.reduce((acc, c) => {
                            const final = calculateChargeFinal(c.amount, c.discountPercentage);
                            const cPayments = payments?.filter(p => p.chargeId === c.id) || [];
                            const paid = cPayments.reduce((pSum, p) => pSum + p.amount, 0);
                            return acc + Math.max(0, final - paid);
                          }, 0) || 0
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
