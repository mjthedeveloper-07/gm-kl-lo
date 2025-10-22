import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { generate2025LotteryData, get2025DataStats } from '@/utils/lottery2025Data';

export const Import2025Data = () => {
  const { user, isAdmin } = useAuth();
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);

  const stats = get2025DataStats();

  const handleImport = async () => {
    if (!user || !isAdmin) {
      toast.error('Admin access required to import data');
      return;
    }

    setIsImporting(true);
    setProgress(0);
    setResult(null);

    try {
      const lotteryData = generate2025LotteryData();
      
      toast.info(`Preparing to import ${lotteryData.length} lottery results from 2025 chart...`);
      setProgress(10);

      // Import in batches to avoid timeout
      const batchSize = 100;
      const batches = [];
      
      for (let i = 0; i < lotteryData.length; i += batchSize) {
        batches.push(lotteryData.slice(i, i + batchSize));
      }

      let totalInserted = 0;
      let totalDuplicates = 0;

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        setProgress(10 + (i / batches.length) * 80);

        const { data, error } = await supabase.functions.invoke('import-lottery-data', {
          body: { results: batch },
        });

        if (error) {
          console.error('Import error:', error);
          throw error;
        }

        if (data) {
          totalInserted += data.inserted || 0;
          totalDuplicates += data.duplicates || 0;
        }
      }

      setProgress(100);
      
      const finalResult = {
        success: true,
        message: `Successfully imported ${totalInserted} lottery results from 2025 chart`,
        total: lotteryData.length,
        inserted: totalInserted,
        duplicates: totalDuplicates,
      };

      setResult(finalResult);
      
      toast.success(
        `Import completed! ${totalInserted} new results added, ${totalDuplicates} duplicates skipped.`
      );
    } catch (error: any) {
      console.error('Import failed:', error);
      setResult({
        success: false,
        error: error.message || 'Failed to import data',
      });
      toast.error(error.message || 'Failed to import data');
    } finally {
      setIsImporting(false);
    }
  };

  if (!user) {
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Import 2025 Lottery Data
          </CardTitle>
          <CardDescription>Sign in to import the full 2025 lottery chart</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please sign in to access data import features.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Import 2025 Lottery Data
          </CardTitle>
          <CardDescription>Admin access required</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only administrators can import lottery data. Contact your system administrator for access.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          Import 2025 Lottery Chart Data
        </CardTitle>
        <CardDescription>
          Import the complete 2025 lottery results dataset for predictions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Summary */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">Total Results Available:</span>
            <span className="text-lg font-bold text-primary">{stats.total}</span>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-semibold">Monthly Breakdown:</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {Object.entries(stats.byMonth).map(([month, count]) => (
                <div key={month} className="flex justify-between p-1 bg-background rounded">
                  <span>{month}:</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Date Range: {stats.dateRange.start} to {stats.dateRange.end}
            </p>
          </div>
        </div>

        {/* Import Progress */}
        {isImporting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Importing data...</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Import Result */}
        {result && (
          <Alert className={result.success ? 'border-green-500 bg-green-50' : 'border-destructive'}>
            {result.success ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {result.success ? (
                <div className="space-y-1">
                  <p className="font-semibold text-green-700">{result.message}</p>
                  <div className="text-sm text-green-600">
                    <p>• New results added: {result.inserted}</p>
                    <p>• Duplicates skipped: {result.duplicates}</p>
                    <p>• Total processed: {result.total}</p>
                  </div>
                </div>
              ) : (
                <p className="text-destructive">{result.error}</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Import Button */}
        <Button
          onClick={handleImport}
          disabled={isImporting}
          className="w-full h-12 text-base font-semibold"
        >
          {isImporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing {stats.total} Results...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Import 2025 Chart Data ({stats.total} results)
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          This will import all available lottery results from the 2025 chart.
          Duplicate entries will be automatically skipped.
        </p>
      </CardContent>
    </Card>
  );
};
