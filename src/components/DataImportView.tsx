import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { chart2025Data, getDataSummary, getValidResults } from "@/utils/chartDataMigration";
import { Upload, Database, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const DataImportView = () => {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    inserted: number;
    duplicates: number;
    total: number;
  } | null>(null);

  const summary = getDataSummary();
  const validResults = getValidResults();

  const handleImport = async () => {
    setIsImporting(true);
    setImportProgress(0);
    setImportResult(null);

    try {
      // Simulate progress
      setImportProgress(20);

      const { data, error } = await supabase.functions.invoke('import-lottery-data', {
        body: { results: validResults }
      });

      setImportProgress(100);

      if (error) {
        throw error;
      }

      setImportResult({
        success: true,
        message: data.message || 'Import completed successfully',
        inserted: data.inserted || 0,
        duplicates: data.duplicates || 0,
        total: data.total || 0
      });

      toast({
        title: "Import Successful",
        description: `Imported ${data.inserted} new lottery results`,
      });

    } catch (error: any) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        message: error.message || 'Import failed',
        inserted: 0,
        duplicates: 0,
        total: validResults.length
      });

      toast({
        title: "Import Failed",
        description: error.message || "Failed to import lottery data",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Data Import Management</h2>
            <p className="text-muted-foreground">Import 2025 lottery results from chart data</p>
          </div>
        </div>

        {/* Data Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Results</span>
            </div>
            <p className="text-3xl font-bold">{summary.total}</p>
          </div>

          <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/10">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Valid Results</span>
            </div>
            <p className="text-3xl font-bold text-green-500">{summary.valid}</p>
          </div>

          <div className="p-4 bg-yellow-500/5 rounded-lg border border-yellow-500/10">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Invalid Results</span>
            </div>
            <p className="text-3xl font-bold text-yellow-500">{summary.invalid}</p>
          </div>

          <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/10">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Months</span>
            </div>
            <p className="text-3xl font-bold text-blue-500">{Object.keys(summary.byMonth).length}</p>
          </div>
        </div>

        {/* Date Range */}
        <div className="mb-6 p-4 bg-secondary/50 rounded-lg">
          <h3 className="font-semibold mb-2">Data Range</h3>
          <p className="text-sm text-muted-foreground">
            From: <span className="font-medium">{summary.dateRange.from}</span> to{" "}
            <span className="font-medium">{summary.dateRange.to}</span>
          </p>
        </div>

        {/* Monthly Breakdown */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Monthly Distribution</h3>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(summary.byMonth).map(([month, count]) => (
              <div key={month} className="p-3 bg-secondary/30 rounded text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  {new Date(2025, parseInt(month) - 1).toLocaleString('default', { month: 'short' })}
                </div>
                <div className="text-lg font-bold">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Import Progress */}
        {isImporting && (
          <div className="mb-6">
            <Progress value={importProgress} className="h-2" />
            <p className="text-sm text-center mt-2 text-muted-foreground">
              Importing data... {importProgress}%
            </p>
          </div>
        )}

        {/* Import Result */}
        {importResult && (
          <div className={`mb-6 p-4 rounded-lg border ${
            importResult.success 
              ? 'bg-green-500/5 border-green-500/20' 
              : 'bg-red-500/5 border-red-500/20'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {importResult.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <h3 className="font-semibold">{importResult.message}</h3>
            </div>
            <div className="text-sm space-y-1">
              <p>Total processed: {importResult.total}</p>
              <p>New records inserted: {importResult.inserted}</p>
              <p>Duplicates skipped: {importResult.duplicates}</p>
            </div>
          </div>
        )}

        {/* Import Button */}
        <Button
          onClick={handleImport}
          disabled={isImporting || summary.valid === 0}
          size="lg"
          className="w-full"
        >
          <Upload className="mr-2 h-5 w-5" />
          {isImporting ? "Importing..." : `Import ${summary.valid} Results to Database`}
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Note: Duplicate entries will be automatically skipped during import
        </p>
      </Card>
    </div>
  );
};
