import { useState } from "react";
import { Link } from "wouter";
import { useClients, useDeleteClient } from "@/hooks/use-clients";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClientForm } from "@/components/forms/client-form";
import { UserPlus, Building, Mail, ChevronRight, Trash2, Edit, Users } from "lucide-react";
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

export default function ClientsPage() {
  const { data: clients, isLoading } = useClients();
  const deleteClient = useDeleteClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    try {
      await deleteClient.mutateAsync(id);
      toast({ title: "Client deleted successfully" });
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to delete client" });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("clients.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("clients.subtitle")}</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="hover-elevate shadow-sm">
              <UserPlus className="w-4 h-4 mr-2" />
              {t("clients.add")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <ClientForm onSuccess={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse bg-muted/20 h-40 border-none"></Card>
          ))}
        </div>
      ) : clients?.length === 0 ? (
        <div className="text-center py-20 bg-muted/10 rounded-2xl border border-dashed">
          <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-primary/40" />
          </div>
          <h3 className="text-lg font-medium">{t("clients.noClients")}</h3>
          <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
            {t("clients.noClientsDesc")}
          </p>
          <Button onClick={() => setIsCreateOpen(true)} variant="outline" className="mt-6">
            {t("clients.add")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients?.map((client) => (
            <Card key={client.id} className="group hover-elevate transition-all border-border/50 overflow-hidden relative">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <Link href={`/clients/${client.id}`} className="block font-semibold text-lg hover:text-primary transition-colors">
                      {client.name}
                    </Link>
                  </div>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 bg-background/80 backdrop-blur rounded-md p-1 shadow-sm">
                    <Dialog open={editingClient === client.id} onOpenChange={(open) => setEditingClient(open ? client.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Client</DialogTitle>
                        </DialogHeader>
                        <ClientForm initialData={client} onSuccess={() => setEditingClient(null)} />
                      </DialogContent>
                    </Dialog>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Client</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure? This action cannot be undone. All associated projects and charges may be lost.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(client.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Building className="w-4 h-4 mr-2 opacity-70" />
                    {client.company || <span className="italic opacity-50">No company</span>}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 mr-2 opacity-70" />
                    {client.email || <span className="italic opacity-50">No email</span>}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/50 flex justify-end">
                  <Link href={`/clients/${client.id}`}>
                    <Button variant="ghost" size="sm" className="w-full justify-between group/btn text-muted-foreground hover:text-foreground hover:bg-primary/5">
                      {t("common.view")}
                      <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
