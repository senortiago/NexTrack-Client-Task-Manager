import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreatePayment } from "@/hooks/use-payments";
import { useLanguage } from "@/hooks/use-language";
import { useCurrency } from "@/hooks/use-currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface PaymentFormProps {
  chargeId: number;
  remainingAmountDollars?: number;
  onSuccess?: () => void;
}

const formSchema = z.object({
  amountDollars: z.coerce.number().positive("Amount must be greater than zero"),
  paidAt: z.string().min(1, "Date is required"),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function PaymentForm({ chargeId, remainingAmountDollars, onSuccess }: PaymentFormProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { currencySymbol, formatMoney } = useCurrency();
  const createPayment = useCreatePayment();

  const defaultAmount = remainingAmountDollars !== undefined && remainingAmountDollars > 0 
    ? remainingAmountDollars 
    : 10;
  
  const todayStr = new Date().toISOString().split("T")[0];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amountDollars: Math.round(defaultAmount * 100) / 100,
      paidAt: todayStr,
      note: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const amountCents = Math.round(values.amountDollars * 100);
      await createPayment.mutateAsync({
        chargeId,
        amount: amountCents,
        paidAt: values.paidAt,
        note: values.note || undefined,
      });

      toast({ title: t("payments.recordedSuccess") });
      onSuccess?.();
    } catch (error) {
      toast({ variant: "destructive", title: t("common.error") });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {remainingAmountDollars !== undefined && (
          <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-xs flex justify-between items-center">
            <span className="text-muted-foreground">{t("payments.balanceDue")}:</span>
            <span className="font-bold text-foreground text-sm">
              {formatMoney(Math.round(remainingAmountDollars * 100))}
            </span>
          </div>
        )}

        <FormField
          control={form.control}
          name="amountDollars"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("payments.amount")} ({currencySymbol})</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paidAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("payments.date")}</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("payments.note")}</FormLabel>
              <FormControl>
                <Input placeholder={t("payments.notePlaceholder")} {...field} />
              </FormControl>
              <FormDescription className="text-xs">
                {t("payments.noteDesc")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={createPayment.isPending} className="hover-elevate">
            {createPayment.isPending ? t("common.loading") : t("payments.recordPayment")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
