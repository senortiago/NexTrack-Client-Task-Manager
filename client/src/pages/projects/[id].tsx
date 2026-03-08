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
import { ArrowLeft, Plus, CheckCircle, Circle, Edit, Trash2, Tag, DollarSign } from "lucide-react";
import { formatMoney, calculateChargeFinal } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@shared/schema";

export default function ProjectView() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id, 10);
  const { t } = useLanguage();
  
  const { data: project, isLoading: loadingProject } = useProject(projectId);
  const { data: client } = useClient(project?.clientId);
  const { data: allTasks, isLoading: loadingTasks } = useTasks(projectId);
  const { data: charges, isLoading: loadingCharges } = useCharges(projectId);
  
  const updateProject = useUpdateProject();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const deleteCharge = useDeleteCharge();
  const { toast } = useToast();

  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [isChargeOpen, setIsChargeOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editingCharge, setEditingCharge] = useState<number | null>(null);

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
                    
                    return (
                      <div key={charge.id} className="p-4 flex items-center justify-between group hover:bg-muted/10 transition-colors">
                        <div>
                          <div className="font-medium">{charge.description}</div>
                          <div className="text-sm text-muted-foreground mt-0.5 flex flex-wrap gap-2 items-center">
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
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-bold text-lg">{formatMoney(finalAmount)}</div>
                            {charge.discountPercentage > 0 && (
                              <div className="text-xs text-muted-foreground line-through">{formatMoney(charge.amount)}</div>
                            )}
                          </div>
                          
                          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
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
                    );
                  })}
                  <div className="p-4 bg-muted/20 border-t-2 border-border font-bold flex justify-between items-center rounded-b-xl">
                    <span>{t("projects.totalValue")}</span>
                    <span className="text-xl">
                      {formatMoney(charges?.reduce((acc, c) => acc + calculateChargeFinal(c.amount, c.discountPercentage), 0) || 0)}
                    </span>
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
