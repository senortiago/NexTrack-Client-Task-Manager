import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertChargeSchema, type InsertCharge, type Charge } from "@shared/schema";
import { useCreateCharge, useUpdateCharge } from "@/hooks/use-charges";
import { useTasks } from "@/hooks/use-tasks";
import { useLanguage } from "@/hooks/use-language";
import { useCurrency } from "@/hooks/use-currency";
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
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

interface ChargeFormProps {
  projectId: number;
  initialData?: Charge;
  onSuccess?: () => void;
}

const formSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amountDollars: z.coerce.number().min(0, "Amount must be positive"),
  discountPercentage: z.coerce.number().min(0).max(100).default(0),
  taskId: z.coerce.number().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export function ChargeForm({ projectId, initialData, onSuccess }: ChargeFormProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { currencySymbol } = useCurrency();
  const createCharge = useCreateCharge();
  const updateCharge = useUpdateCharge();
  const { data: tasks } = useTasks(projectId);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData?.description || "",
      amountDollars: initialData ? initialData.amount / 100 : 0,
      discountPercentage: initialData?.discountPercentage || 0,
      taskId: initialData?.taskId || null,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const chargeData: InsertCharge = {
        projectId,
        description: data.description,
        amount: Math.round(data.amountDollars * 100),
        discountPercentage: data.discountPercentage,
        taskId: data.taskId || null,
      };

      if (initialData) {
        await updateCharge.mutateAsync({ id: initialData.id, ...chargeData });
        toast({ title: t("charges.updatedSuccess") });
      } else {
        await createCharge.mutateAsync(chargeData);
        toast({ title: t("charges.createdSuccess") });
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

  const isPending = createCharge.isPending || updateCharge.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.description")} {t("form.required")}</FormLabel>
              <FormControl>
                <Textarea placeholder="..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amountDollars"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.amount")} ({currencySymbol}) {t("form.required")}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="discountPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.discount")}</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="0" max="100" {...field} />
                </FormControl>
                <FormDescription>{t("form.discountHint")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="taskId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.assignToTask")}</FormLabel>
              <Select 
                onValueChange={(val) => field.onChange(val === "none" ? null : parseInt(val))} 
                value={field.value ? field.value.toString() : "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.selectTask")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">{t("form.none")}</SelectItem>
                  {tasks?.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>{t.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? t("form.saving") : t("form.saveCharge")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
