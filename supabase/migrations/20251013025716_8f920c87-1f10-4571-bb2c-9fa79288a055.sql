-- Create lottery results table
CREATE TABLE IF NOT EXISTS public.lottery_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  lottery_name TEXT NOT NULL,
  draw_number TEXT NOT NULL,
  result TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  lottery_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(date, draw_number)
);

-- Enable RLS
ALTER TABLE public.lottery_results ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (lottery data is public)
CREATE POLICY "Anyone can view lottery results"
ON public.lottery_results
FOR SELECT
USING (true);

-- Create policy for admin insert (you can modify this later)
CREATE POLICY "Service role can insert lottery results"
ON public.lottery_results
FOR INSERT
WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_lottery_results_date ON public.lottery_results(date);
CREATE INDEX idx_lottery_results_year ON public.lottery_results(year);
CREATE INDEX idx_lottery_results_month ON public.lottery_results(month);
CREATE INDEX idx_lottery_results_draw ON public.lottery_results(draw_number);