import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema, type InsertProject, type Project } from "@shared/schema";
import { useCreateProject, useUpdateProject } from "@/hooks/use-projects";
import { useClients } from "@/hooks/use-clients";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

interface ProjectFormProps {
  initialData?: Project;
  clientId?: number;
  onSuccess?: () => void;
}

export function ProjectForm({ initialData, clientId, onSuccess }: ProjectFormProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const { data: clients } = useClients();
  
  const form = useForm<InsertProject>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      status: initialData?.status || "active",
      clientId: initialData?.clientId || clientId || 0,
    },
  });

  const onSubmit = async (data: InsertProject) => {
    try {
      if (initialData) {
        await updateProject.mutateAsync({ id: initialData.id, ...data });
        toast({ title: t("projects.updatedSuccess") });
      } else {
        await createProject.mutateAsync(data);
        toast({ title: t("projects.createdSuccess") });
      }
      onSuccess?.();
    } catch (error) {
      toast({ 
        title: t("common.error"), 
        description: error instanceof Error ? error.message : t("common.somethingWentWrong"), 
        variant: "destructive" 
      });
    }
  };

  const isPending = createProject.isPending || updateProject.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!initialData && !clientId && (
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("projects.client")} {t("form.required")}</FormLabel>
                <Select 
                  onValueChange={(val) => field.onChange(parseInt(val))} 
                  defaultValue={field.value ? field.value.toString() : ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("form.selectClient")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients?.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.projectName")} {t("form.required")}</FormLabel>
              <FormControl>
                <Input placeholder="Website Redesign" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.description")}</FormLabel>
              <FormControl>
                <Textarea placeholder="..." {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.status")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.selectStatus")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">{t("status.active")}</SelectItem>
                  <SelectItem value="completed">{t("status.completed")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? t("form.saving") : t("form.saveProject")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
