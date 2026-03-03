import { useState } from "react";
import { useClients } from "@/hooks/use-clients";
import { useProjects } from "@/hooks/use-projects";
import { useCharges } from "@/hooks/use-charges";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatMoney, calculateChargeFinal, calculateChargeDiscount } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default function ReportsPage() {
  const { data: clients } = useClients();
  const { data: allProjects } = useProjects();
  const { data: allCharges, isLoading: loadingCharges } = useCharges();

  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");

  // Filter projects based on client selection
  const filteredProjects = selectedClientId === "all" 
    ? allProjects 
    : allProjects?.filter(p => p.clientId === parseInt(selectedClientId));

  // Reset project selection if client changes and current project doesn't belong
  if (selectedProjectId !== "all" && filteredProjects && !filteredProjects.find(p => p.id.toString() === selectedProjectId)) {
    setSelectedProjectId("all");
  }

  // Filter charges based on selections
  let activeCharges = allCharges || [];
  
  if (selectedProjectId !== "all") {
    activeCharges = activeCharges.filter(c => c.projectId === parseInt(selectedProjectId));
  } else if (selectedClientId !== "all" && filteredProjects) {
    const projectIds = filteredProjects.map(p => p.id);
    activeCharges = activeCharges.filter(c => projectIds.includes(c.projectId));
  }

  // Calculations
  const subtotal = activeCharges.reduce((acc, c) => acc + c.amount, 0);
  const totalDiscounts = activeCharges.reduce((acc, c) => acc + calculateChargeDiscount(c.amount, c.discountPercentage), 0);
  const total = subtotal - totalDiscounts;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Financial Reports</h1>
        <p className="text-muted-foreground mt-1">Generate charge reports for clients and projects</p>
      </div>

      <Card className="border-border/50 bg-card shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Filter by Client</label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients?.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Filter by Project</label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={!filteredProjects?.length && selectedClientId !== "all"}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {filteredProjects?.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-muted/10 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Subtotal (Before Discounts)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatMoney(subtotal)}</div></CardContent>
        </Card>
        <Card className="bg-muted/10 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Discounts Applied</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-destructive">-{formatMoney(totalDiscounts)}</div></CardContent>
        </Card>
        <Card className="bg-primary text-primary-foreground border-transparent shadow-md">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-primary-foreground/80">Final Total</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{formatMoney(total)}</div></CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm mt-8">
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
          <CardDescription>All charges matching your current filters.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingCharges ? (
            <div className="py-8 text-center text-muted-foreground">Loading data...</div>
          ) : activeCharges.length === 0 ? (
            <div className="py-12 text-center border-t border-border/50 text-muted-foreground">
              No charges found for the selected criteria.
            </div>
          ) : (
            <div className="rounded-md border border-border/50 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead className="text-right">Base Amount</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead className="text-right font-bold">Final Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeCharges.map(charge => {
                    const project = allProjects?.find(p => p.id === charge.projectId);
                    const finalAmount = calculateChargeFinal(charge.amount, charge.discountPercentage);
                    const isFullyDiscounted = charge.discountPercentage === 100;
                    
                    return (
                      <TableRow key={charge.id} className={isFullyDiscounted ? 'opacity-60 bg-muted/20' : ''}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {charge.createdAt ? format(new Date(charge.createdAt), 'MMM d, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell className="font-medium">{charge.description}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{project?.name || 'Unknown'}</TableCell>
                        <TableCell className="text-right">{formatMoney(charge.amount)}</TableCell>
                        <TableCell className="text-right text-destructive text-sm">
                          {charge.discountPercentage > 0 ? `${charge.discountPercentage}%` : '-'}
                        </TableCell>
                        <TableCell className="text-right font-bold">{formatMoney(finalAmount)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
