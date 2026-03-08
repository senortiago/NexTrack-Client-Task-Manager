import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClientSchema, type InsertClient, type Client } from "@shared/schema";
import { useCreateClient, useUpdateClient } from "@/hooks/use-clients";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

interface ClientFormProps {
  initialData?: Client;
  onSuccess?: () => void;
}

export function ClientForm({ initialData, onSuccess }: ClientFormProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  
  const form = useForm<InsertClient>({
    resolver: zodResolver(insertClientSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      company: initialData?.company || "",
    },
  });

  const onSubmit = async (data: InsertClient) => {
    try {
      if (initialData) {
        await updateClient.mutateAsync({ id: initialData.id, ...data });
        toast({ title: t("clients.updatedSuccess") });
      } else {
        await createClient.mutateAsync(data);
        toast({ title: t("clients.createdSuccess") });
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

  const isPending = createClient.isPending || updateClient.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.name")} {t("form.required")}</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.email")}</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.company")}</FormLabel>
              <FormControl>
                <Input placeholder="Acme Inc." {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? t("form.saving") : t("form.saveClient")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
