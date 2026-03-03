import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertChargeSchema, type InsertCharge, type Charge } from "@shared/schema";
import { useCreateCharge, useUpdateCharge } from "@/hooks/use-charges";
import { useTasks } from "@/hooks/use-tasks";
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

// Custom schema for form (handles dollars)
const formSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amountDollars: z.coerce.number().min(0, "Amount must be positive"),
  discountPercentage: z.coerce.number().min(0).max(100).default(0),
  taskId: z.coerce.number().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export function ChargeForm({ projectId, initialData, onSuccess }: ChargeFormProps) {
  const { toast } = useToast();
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
        amount: Math.round(data.amountDollars * 100), // Convert to cents
        discountPercentage: data.discountPercentage,
        taskId: data.taskId || null,
      };

      if (initialData) {
        await updateCharge.mutateAsync({ id: initialData.id, ...chargeData });
        toast({ title: "Charge updated successfully" });
      } else {
        await createCharge.mutateAsync(chargeData);
        toast({ title: "Charge created successfully" });
      }
      onSuccess?.();
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Something went wrong", 
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
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea placeholder="Consulting hours..." {...field} />
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
                <FormLabel>Amount ($) *</FormLabel>
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
                <FormLabel>Discount (%)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="0" max="100" {...field} />
                </FormControl>
                <FormDescription>100 = Fully discounted</FormDescription>
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
              <FormLabel>Assign to Task (Optional)</FormLabel>
              <Select 
                onValueChange={(val) => field.onChange(val === "none" ? null : parseInt(val))} 
                value={field.value ? field.value.toString() : "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a task" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">-- None --</SelectItem>
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
            {isPending ? "Saving..." : "Save Charge"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
