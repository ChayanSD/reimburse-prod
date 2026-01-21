"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Download, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
import { generateCSV, downloadCSV } from "@/utils/csvGenerator";
import { pdf } from "@react-pdf/renderer";
import { ReimburseMePDFDocument } from "@/utils/reactPdfTemplates";

interface Receipt {
  id: string;
  merchant_name: string;
  amount: string;
  category: string;
  receipt_date: string;
  currency: string;
  user_name: string;
  user_email?: string;
  note?: string;
  file_url?: string;
}

export default function TeamReceiptsPage() {
  const { teamId } = useParams();
  const router = useRouter();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [team, setTeam] = useState<any>(null);
  const [selectedReceipts, setSelectedReceipts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [receiptsRes, teamRes] = await Promise.all([
        fetch(`/api/receipts?teamId=${teamId}`),
        fetch(`/api/teams/${teamId}`)
      ]);

      if (!receiptsRes.ok) throw new Error("Failed to load receipts");
      if (!teamRes.ok) throw new Error("Failed to load team details");

      const receiptsData = await receiptsRes.json();
      const teamData = await teamRes.json();

      setReceipts(receiptsData.receipts);
      setTeam(teamData.team);
    } catch (error) {
       console.error(error);
       toast.error("Failed to load data");
    } finally {
        setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleSelectAll = () => {
    if (selectedReceipts.size === receipts.length) {
        setSelectedReceipts(new Set());
    } else {
        setSelectedReceipts(new Set(receipts.map(r => r.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedReceipts);
    if (newSelected.has(id)) {
        newSelected.delete(id);
    } else {
        newSelected.add(id);
    }
    setSelectedReceipts(newSelected);
  };

  const getExportData = () => {
      if (selectedReceipts.size === 0) return receipts;
      return receipts.filter(r => selectedReceipts.has(r.id));
  };

  const handleExportCSV = () => {
    const dataToExport = getExportData();
    try {
      const csvContent = generateCSV(dataToExport, teamId as string);
      const filename = `team_${teamId}_receipts_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, filename);
      toast.success(`Exported ${dataToExport.length} receipts to CSV`);
    } catch (error) {
      console.error("Export CSV Error:", error);
      toast.error("Failed to export CSV");
    }
  };

  const handleExportPDF = async () => {
    const dataToExport = getExportData();
    if (dataToExport.length === 0) {
      toast.error("No receipts to export");
      return;
    }

    setExporting(true);
    try {
      // 1. Prepare Data for PDF Template
      const reportData = {
        reportMeta: {
          report_id: `TEAM-${teamId}-${Date.now()}`,
          period_start: dataToExport[dataToExport.length - 1]?.receipt_date || new Date().toISOString(),
          period_end: dataToExport[0]?.receipt_date || new Date().toISOString(),
          generated_at: new Date().toISOString(),
          currency: team?.defaultCurrency || dataToExport[0]?.currency || "USD",
        },
        submitter: {
          name: "Team Export",
          email: "Team Admin",
        },
        recipient: {
          company_name: team?.name || `Team #${teamId}`,
          approver_name: team?.owner ? `${team.owner.firstName || ""} ${team.owner.lastName || ""}`.trim() : "Admin",
          approver_email: team?.owner?.email || "",
        },
        summary: {
          total_reimbursable: dataToExport.reduce((sum, r) => sum + parseFloat(r.amount), 0),
          non_reimbursable: 0,
          totals_by_category: [],
        },
        line_items: dataToExport.map(r => ({
          date: r.receipt_date,
          merchant: r.merchant_name,
          category: r.category,
          amount: parseFloat(r.amount),
          notes: r.note,
          submitted_by: r.user_name,
          file_url: r.file_url,
        })),
      };

      // 2. Generate Blob
      const blob = await pdf(<ReimburseMePDFDocument data={reportData} />).toBlob();
      
      // 3. Trigger Download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `team_${teamId}_report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Exported ${dataToExport.length} receipts to PDF`);
    } catch (error) {
      console.error("Export PDF Error:", error);
      toast.error("Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div>Loading receipts...</div>;

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Team Receipts</h2>
                <p className="text-muted-foreground">View and manage receipts for this team.</p>
            </div>
            <div className="flex gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" disabled={exporting}>
                            <Download className="mr-2 h-4 w-4" />
                            {exporting ? "Exporting..." : `Export ${selectedReceipts.size > 0 ? `(${selectedReceipts.size})` : "All"}`}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={handleExportCSV}>
                             Export as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportPDF}>
                             Export as PDF
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button onClick={() => router.push(`/upload?teamId=${teamId}`)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Receipt
                </Button>
            </div>
        </div>

        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">
                            <Checkbox 
                                checked={receipts.length > 0 && selectedReceipts.size === receipts.length}
                                onCheckedChange={toggleSelectAll}
                                aria-label="Select all"
                            />
                        </TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Merchant</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Submitted By</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-center w-[80px]">Receipt</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {receipts.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                                No receipts found for this team.
                            </TableCell>
                        </TableRow>
                    ) : (
                        receipts.map((receipt) => (
                            <TableRow key={receipt.id} data-state={selectedReceipts.has(receipt.id) && "selected"}>
                                <TableCell>
                                    <Checkbox 
                                        checked={selectedReceipts.has(receipt.id)}
                                        onCheckedChange={() => toggleSelect(receipt.id)}
                                        aria-label="Select row"
                                    />
                                </TableCell>
                                <TableCell>{receipt.receipt_date}</TableCell>
                                <TableCell className="font-medium">{receipt.merchant_name}</TableCell>
                                <TableCell>{receipt.category}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{receipt.user_name}</span>
                                        <span className="text-xs text-muted-foreground">{receipt.user_email}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                    {receipt.amount} {receipt.currency}
                                </TableCell>
                                <TableCell className="text-center">
                                    {receipt.file_url ? (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            asChild
                                            title="View Original Receipt"
                                        >
                                            <a href={receipt.file_url} target="_blank" rel="noopener noreferrer">
                                                <Eye className="h-4 w-4 text-[#2E86DE]" />
                                            </a>
                                        </Button>
                                    ) : (
                                        <FileText className="h-4 w-4 text-muted-foreground mx-auto opacity-20" />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
        <div className="text-sm text-muted-foreground">
            {selectedReceipts.size} of {receipts.length} row(s) selected.
        </div>
    </div>
  );
}
