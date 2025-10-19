import { Button } from "@/components/ui/button";
import { Download, FileText, Table } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportResultsProps {
  data: any[];
  filename: string;
  title: string;
}

export const ExportResults = ({ data, filename, title }: ExportResultsProps) => {
  const exportToCSV = () => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(item => 
      Object.values(item).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(",")
    ).join("\n");

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success("CSV exported successfully");
  };

  const exportToJSON = () => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    toast.success("JSON exported successfully");
  };

  const printResults = () => {
    if (data.length === 0) {
      toast.error("No data to print");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #1a472a;
            }
            h1 {
              color: #2d7a4d;
              border-bottom: 3px solid #d4af37;
              padding-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #2d7a4d;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #2d7a4d;
              color: white;
            }
            tr:nth-child(even) {
              background-color: #f0f7f3;
            }
            .footer {
              margin-top: 30px;
              padding-top: 10px;
              border-top: 2px solid #d4af37;
              font-size: 12px;
              color: #666;
            }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                ${Object.keys(data[0]).map(key => `<th>${key}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${data.map(item => `
                <tr>
                  ${Object.values(item).map(val => `<td>${val}</td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div class="footer">
            <p><strong>Disclaimer:</strong> These predictions are for educational purposes only. Lottery draws are random events.</p>
          </div>
          <button onclick="window.print()">Print</button>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-background">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-popover z-50">
        <DropdownMenuItem onClick={exportToCSV} className="gap-2 cursor-pointer">
          <Table className="w-4 h-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={printResults} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4" />
          Print Results
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
