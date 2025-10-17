import { useState, useEffect } from 'react';
import { fetchAllLotteryResults, type LotteryResult } from '@/utils/databaseQueries';
import { useToast } from '@/hooks/use-toast';

export const useLotteryData = () => {
  const [data, setData] = useState<LotteryResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const results = await fetchAllLotteryResults();
      setData(results);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load lottery results from database. Using cached data if available.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: loadData
  };
};
