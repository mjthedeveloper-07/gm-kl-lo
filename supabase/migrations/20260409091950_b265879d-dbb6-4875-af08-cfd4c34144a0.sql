
-- Fix profiles: add INSERT and DELETE policies
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Fix overly permissive INSERT on lottery_results
DROP POLICY IF EXISTS "Service role can insert lottery results" ON public.lottery_results;
CREATE POLICY "Service role can insert lottery results"
ON public.lottery_results
FOR INSERT
TO service_role
WITH CHECK (true);

-- Fix overly permissive INSERT on prediction_history
DROP POLICY IF EXISTS "Service role can insert prediction history" ON public.prediction_history;
CREATE POLICY "Service role can insert prediction history"
ON public.prediction_history
FOR INSERT
TO service_role
WITH CHECK (true);

-- Fix overly permissive INSERT on prediction_accuracy
DROP POLICY IF EXISTS "Service role can insert prediction accuracy" ON public.prediction_accuracy;
CREATE POLICY "Service role can insert prediction accuracy"
ON public.prediction_accuracy
FOR INSERT
TO service_role
WITH CHECK (true);

-- Fix overly permissive ALL on method_performance
DROP POLICY IF EXISTS "Service role can manage method performance" ON public.method_performance;
CREATE POLICY "Service role can manage method performance"
ON public.method_performance
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
