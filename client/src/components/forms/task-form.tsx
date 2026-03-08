import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema, type InsertTask, type Task } from "@shared/schema";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
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

interface TaskFormProps {
  projectId: number;
  parentId?: number;
  initialData?: Task;
  onSuccess?: () => void;
}

export function TaskForm({ projectId, parentId, initialData, onSuccess }: TaskFormProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  
  const form = useForm<InsertTask>({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      projectId: projectId,
      parentId: initialData?.parentId || parentId || null,
      title: initialData?.title || "",
      description: initialData?.description || "",
      status: initialData?.status || "todo",
    },
  });

  const onSubmit = async (data: InsertTask) => {
    try {
      if (initialData) {
        await updateTask.mutateAsync({ id: initialData.id, ...data });
        toast({ title: t("tasks.updatedSuccess") });
      } else {
        await createTask.mutateAsync(data);
        toast({ title: t("tasks.createdSuccess") });
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

  const isPending = createTask.isPending || updateTask.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.taskTitle")} {t("form.required")}</FormLabel>
              <FormControl>
                <Input placeholder="..." {...field} />
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
                  <SelectItem value="todo">{t("status.todo")}</SelectItem>
                  <SelectItem value="in_progress">{t("status.inProgress")}</SelectItem>
                  <SelectItem value="done">{t("status.done")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? t("form.saving") : t("form.saveTask")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
