import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, CheckCircle2, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  generateAllHistoricalData, 
  getHistoricalDataStats,
  generate2019LotteryData,
  generate2020LotteryData,
  generate2021LotteryData,
  generate2022LotteryData,
  generate2023LotteryData,
  generate2024LotteryData,
} from '@/utils/historicalLotteryData';
import { generate2018LotteryData } from '@/utils/lottery2018Data';
import { generate2025LotteryData, get2025DataStats } from '@/utils/lottery2025Data';

export const ImportHistoricalData = () => {
  const { user, isAdmin } = useAuth();
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [selectedYears, setSelectedYears] = useState<number[]>([2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]);

  const historicalStats = getHistoricalDataStats();
  const stats2025 = get2025DataStats();
  
  const allStats = {
    total: historicalStats.total + stats2025.total,
    byYear: {
      ...historicalStats.byYear,
      2025: stats2025.total,
    },
  };

  const yearDataGenerators: Record<number, () => any[]> = {
    2018: generate2018LotteryData,
    2019: generate2019LotteryData,
    2020: generate2020LotteryData,
    2021: generate2021LotteryData,
    2022: generate2022LotteryData,
    2023: generate2023LotteryData,
    2024: generate2024LotteryData,
    2025: generate2025LotteryData,
  };

  const toggleYear = (year: number) => {
    setSelectedYears(prev => 
      prev.includes(year) 
        ? prev.filter(y => y !== year)
        : [...prev, year].sort()
    );
  };

  const handleImport = async () => {
    if (!user || !isAdmin) {
      toast.error('Admin access required to import data');
      return;
    }

    if (selectedYears.length === 0) {
      toast.error('Please select at least one year to import');
      return;
    }

    setIsImporting(true);
    setProgress(0);
    setResult(null);

    try {
      // Generate data for selected years
      const allLotteryData = selectedYears
        .flatMap(year => yearDataGenerators[year as keyof typeof yearDataGenerators]())
        .sort((a, b) => a.date.localeCompare(b.date));
      
      toast.info(`Preparing to import ${allLotteryData.length} lottery results from ${selectedYears.join(', ')}...`);
      setProgress(10);

      // Import in batches
      const batchSize = 100;
      const batches = [];
      
      for (let i = 0; i < allLotteryData.length; i += batchSize) {
        batches.push(allLotteryData.slice(i, i + batchSize));
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
        message: `Successfully imported lottery results from years: ${selectedYears.join(', ')}`,
        total: allLotteryData.length,
        inserted: totalInserted,
        duplicates: totalDuplicates,
        years: selectedYears,
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
            Import Historical Lottery Data
          </CardTitle>
          <CardDescription>Sign in to import complete historical lottery data (2019-2025)</CardDescription>
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
            Import Historical Lottery Data
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
          Import Complete Historical Data (2018-2025)
        </CardTitle>
        <CardDescription>
          Import comprehensive 7+ years of lottery results from 2018 to 2025 for enhanced prediction accuracy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Year Selection */}
        <div className="space-y-3">
          <p className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Select Years to Import:
          </p>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(allStats.byYear).map(([year, count]) => (
              <Button
                key={year}
                variant={selectedYears.includes(Number(year)) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleYear(Number(year))}
                className="flex flex-col h-auto py-2"
              >
                <span className="font-bold">{year}</span>
                <span className="text-xs opacity-80">{count} results</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Data Summary */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">Total Selected Results:</span>
            <span className="text-lg font-bold text-primary">
              {selectedYears.reduce((sum, year) => sum + (allStats.byYear[year] || 0), 0)}
            </span>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-semibold">Coverage Summary:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {selectedYears.map(year => (
                <div key={year} className="flex justify-between p-2 bg-background rounded border border-primary/20">
                  <span className="font-semibold">{year}:</span>
                  <span className="text-primary">{allStats.byYear[year] || 0} results</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Complete 7+ years of historical coverage from {historicalStats.dateRange.start} to {stats2025.dateRange.end}
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
                    <p>• Years imported: {result.years.join(', ')}</p>
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
          disabled={isImporting || selectedYears.length === 0}
          className="w-full h-12 text-base font-semibold"
        >
          {isImporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing {selectedYears.reduce((sum, year) => sum + (allStats.byYear[year] || 0), 0)} Results...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Import Selected Years ({selectedYears.reduce((sum, year) => sum + (allStats.byYear[year] || 0), 0)} results)
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          7+ years of comprehensive lottery data (2018-2025) ready to import. 2018 data is extracted and ready for comprehensive predictions.
          Duplicate entries will be automatically skipped to maintain data integrity.
        </p>
      </CardContent>
    </Card>
  );
};