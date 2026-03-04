import { useState } from "react";
import { useClients } from "@/hooks/use-clients";
import { useProjects } from "@/hooks/use-projects";
import { useCharges } from "@/hooks/use-charges";
import { useTasks } from "@/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatMoney, calculateChargeFinal, calculateChargeDiscount } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, FileDown, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Document, Packer, Paragraph, TextRun, Table as DocxTable, TableRow as DocxTableRow, TableCell as DocxTableCell, AlignmentType, BorderStyle, HeadingLevel, WidthType } from "docx";
import { saveAs } from "file-saver";

// Add type augmentation for jspdf-autotable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function ReportsPage() {
  const { data: clients } = useClients();
  const { data: allProjects } = useProjects();
  const { data: allCharges, isLoading: loadingCharges } = useCharges();
  const { data: allTasks } = useTasks();

  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [isExporting, setIsExporting] = useState<"pdf" | "word" | null>(null);

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

  const exportPDF = () => {
    setIsExporting("pdf");
    try {
      const doc = new jsPDF();
      const clientName = selectedClientId === "all" ? "All Clients" : clients?.find(c => c.id.toString() === selectedClientId)?.name || "";
      const projectName = selectedProjectId === "all" ? "All Projects" : allProjects?.find(p => p.id.toString() === selectedProjectId)?.name || "";

      doc.setFontSize(20);
      doc.text("Financial Report", 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 30);
      doc.text(`Client: ${clientName}`, 14, 35);
      doc.text(`Project: ${projectName}`, 14, 40);

      const tableData = activeCharges.map(charge => {
        const project = allProjects?.find(p => p.id === charge.projectId);
        const task = allTasks?.find(t => t.id === charge.taskId);
        const finalAmount = calculateChargeFinal(charge.amount, charge.discountPercentage);
        
        let description = charge.description;
        if (task) {
          description += ` (Task: ${task.title})`;
          if (task.parentId) {
            const parent = allTasks?.find(t => t.id === task.parentId);
            if (parent) description += ` [Subtask of: ${parent.title}]`;
          }
        }

        return [
          charge.createdAt ? format(new Date(charge.createdAt), 'MMM d, yyyy') : 'N/A',
          description,
          project?.name || 'Unknown',
          formatMoney(charge.amount),
          charge.discountPercentage > 0 ? `${charge.discountPercentage}%` : '-',
          formatMoney(finalAmount)
        ];
      });

      doc.autoTable({
        startY: 50,
        head: [['Date', 'Description', 'Project', 'Base', 'Disc.', 'Final']],
        body: tableData,
        foot: [[
          '', '', 'TOTALS', 
          formatMoney(subtotal), 
          `-${formatMoney(totalDiscounts)}`, 
          formatMoney(total)
        ]],
        footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
      });

      doc.save(`report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } finally {
      setIsExporting(null);
    }
  };

  const exportWord = async () => {
    setIsExporting("word");
    try {
      const clientName = selectedClientId === "all" ? "All Clients" : clients?.find(c => c.id.toString() === selectedClientId)?.name || "";
      const projectName = selectedProjectId === "all" ? "All Projects" : allProjects?.find(p => p.id.toString() === selectedProjectId)?.name || "";

      const tableRows = [
        new DocxTableRow({
          children: [
            new DocxTableCell({ children: [new Paragraph({ text: "Date", style: "bold" })] }),
            new DocxTableCell({ children: [new Paragraph({ text: "Description", style: "bold" })] }),
            new DocxTableCell({ children: [new Paragraph({ text: "Project", style: "bold" })] }),
            new DocxTableCell({ children: [new Paragraph({ text: "Base", style: "bold" })] }),
            new DocxTableCell({ children: [new Paragraph({ text: "Disc.", style: "bold" })] }),
            new DocxTableCell({ children: [new Paragraph({ text: "Final", style: "bold" })] }),
          ],
        }),
        ...activeCharges.map(charge => {
          const project = allProjects?.find(p => p.id === charge.projectId);
          const task = allTasks?.find(t => t.id === charge.taskId);
          
          let description = charge.description;
          if (task) {
            description += ` (Task: ${task.title})`;
            if (task.parentId) {
              const parent = allTasks?.find(t => t.id === task.parentId);
              if (parent) description += ` [Subtask of: ${parent.title}]`;
            }
          }

          return new DocxTableRow({
            children: [
              new DocxTableCell({ children: [new Paragraph(charge.createdAt ? format(new Date(charge.createdAt), 'MMM d, yyyy') : 'N/A')] }),
              new DocxTableCell({ children: [new Paragraph(description)] }),
              new DocxTableCell({ children: [new Paragraph(project?.name || 'Unknown')] }),
              new DocxTableCell({ children: [new Paragraph(formatMoney(charge.amount))] }),
              new DocxTableCell({ children: [new Paragraph(charge.discountPercentage > 0 ? `${charge.discountPercentage}%` : '-')] }),
              new DocxTableCell({ children: [new Paragraph(formatMoney(calculateChargeFinal(charge.amount, charge.discountPercentage)))] }),
            ],
          });
        }),
        new DocxTableRow({
          children: [
            new DocxTableCell({ children: [new Paragraph("")] }),
            new DocxTableCell({ children: [new Paragraph("")] }),
            new DocxTableCell({ children: [new Paragraph({ text: "TOTALS", style: "bold" })] }),
            new DocxTableCell({ children: [new Paragraph({ text: formatMoney(subtotal), style: "bold" })] }),
            new DocxTableCell({ children: [new Paragraph({ text: `-${formatMoney(totalDiscounts)}`, style: "bold" })] }),
            new DocxTableCell({ children: [new Paragraph({ text: formatMoney(total), style: "bold" })] }),
          ],
        }),
      ];

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({ text: "Financial Report", heading: HeadingLevel.HEADING_1 }),
            new Paragraph({ text: `Generated on: ${format(new Date(), 'PPP')}` }),
            new Paragraph({ text: `Client: ${clientName}` }),
            new Paragraph({ text: `Project: ${projectName}` }),
            new Paragraph({ text: "" }),
            new DocxTable({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: tableRows,
            }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `report-${format(new Date(), 'yyyy-MM-dd')}.docx`);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Financial Reports</h1>
          <p className="text-muted-foreground mt-1">Generate charge reports for clients and projects</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={exportPDF} 
            disabled={activeCharges.length === 0 || !!isExporting}
            className="gap-2"
          >
            {isExporting === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            Export PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={exportWord} 
            disabled={activeCharges.length === 0 || !!isExporting}
            className="gap-2"
          >
            {isExporting === "word" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Export Word
          </Button>
        </div>
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
                    const task = allTasks?.find(t => t.id === charge.taskId);
                    const finalAmount = calculateChargeFinal(charge.amount, charge.discountPercentage);
                    const isFullyDiscounted = charge.discountPercentage === 100;
                    
                    let displayDescription = charge.description;
                    if (task) {
                      displayDescription = (
                        <div className="flex flex-col">
                          <span>{charge.description}</span>
                          <span className="text-xs text-muted-foreground">
                            Task: {task.title}
                            {task.parentId && (
                              <> (Subtask of: {allTasks?.find(t => t.id === task.parentId)?.title})</>
                            )}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <TableRow key={charge.id} className={isFullyDiscounted ? 'opacity-60 bg-muted/20' : ''}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {charge.createdAt ? format(new Date(charge.createdAt), 'MMM d, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell className="font-medium">{displayDescription}</TableCell>
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

