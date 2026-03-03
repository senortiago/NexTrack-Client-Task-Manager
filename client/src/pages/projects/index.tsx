import { useState } from "react";
import { Link } from "wouter";
import { useProjects, useDeleteProject } from "@/hooks/use-projects";
import { useClients } from "@/hooks/use-clients";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProjectForm } from "@/components/forms/project-form";
import { FolderPlus, Trash2, Edit, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export default function ProjectsPage() {
  const { data: projects, isLoading: loadingProjects } = useProjects();
  const { data: clients } = useClients();
  const deleteProject = useDeleteProject();
  const { toast } = useToast();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    try {
      await deleteProject.mutateAsync(id);
      toast({ title: "Project deleted successfully" });
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to delete project" });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">Track and manage all your active work</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="hover-elevate shadow-sm">
              <FolderPlus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <ProjectForm onSuccess={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {loadingProjects ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse bg-muted/20 h-24 border-none"></Card>
          ))}
        </div>
      ) : projects?.length === 0 ? (
        <div className="text-center py-20 bg-muted/10 rounded-2xl border border-dashed">
          <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderPlus className="w-8 h-8 text-primary/40" />
          </div>
          <h3 className="text-lg font-medium">No projects yet</h3>
          <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
            Create a project to start organizing tasks and tracking charges.
          </p>
          <Button onClick={() => setIsCreateOpen(true)} variant="outline" className="mt-6">
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {projects?.map((project) => {
            const client = clients?.find(c => c.id === project.clientId);
            return (
              <Card key={project.id} className="group hover-elevate transition-all border-border/60 hover:border-primary/20 overflow-hidden relative">
                <CardContent className="p-0 flex items-center">
                  <div className={`w-2 h-full absolute left-0 top-0 bottom-0 ${project.status === 'active' ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
                  
                  <div className="flex-1 p-5 pl-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <Link href={`/projects/${project.id}`} className="font-semibold text-lg hover:text-primary transition-colors">
                          {project.name}
                        </Link>
                        <Badge variant={project.status === 'active' ? "default" : "secondary"} className="no-default-active-elevate">
                          {project.status === 'active' ? 'Active' : 'Completed'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {client ? (
                          <span>Client: <Link href={`/clients/${client.id}`} className="hover:underline">{client.name}</Link></span>
                        ) : (
                          'Unknown Client'
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Dialog open={editingProject === project.id} onOpenChange={(open) => setEditingProject(open ? project.id : null)}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Project</DialogTitle>
                            </DialogHeader>
                            <ProjectForm initialData={project} clientId={project.clientId} onSuccess={() => setEditingProject(null)} />
                          </DialogContent>
                        </Dialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Project</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure? This action cannot be undone. All tasks and charges within this project will be deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(project.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      
                      <Link href={`/projects/${project.id}`}>
                        <Button variant="secondary" className="hover-elevate">
                          Open Project
                          <ChevronRight className="w-4 h-4 ml-1 opacity-70" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
