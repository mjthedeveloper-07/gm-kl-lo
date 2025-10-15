-- Create enum for prediction confidence levels
CREATE TYPE public.confidence_level AS ENUM ('very_low', 'low', 'medium', 'high', 'very_high');

-- Table to track all predictions generated
CREATE TABLE public.prediction_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  method_name TEXT NOT NULL,
  predicted_numbers TEXT[] NOT NULL,
  confidence_level confidence_level NOT NULL DEFAULT 'medium',
  metadata JSONB,
  lottery_type TEXT
);

-- Table to track accuracy of predictions
CREATE TABLE public.prediction_accuracy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id UUID REFERENCES public.prediction_history(id) ON DELETE CASCADE,
  actual_result_id UUID REFERENCES public.lottery_results(id) ON DELETE CASCADE,
  exact_match BOOLEAN DEFAULT FALSE,
  last_4_match BOOLEAN DEFAULT FALSE,
  last_3_match BOOLEAN DEFAULT FALSE,
  matching_digits INTEGER DEFAULT 0,
  match_positions INTEGER[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for performance metrics per prediction method
CREATE TABLE public.method_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  method_name TEXT UNIQUE NOT NULL,
  total_predictions INTEGER DEFAULT 0,
  exact_matches INTEGER DEFAULT 0,
  last_4_matches INTEGER DEFAULT 0,
  last_3_matches INTEGER DEFAULT 0,
  avg_matching_digits DECIMAL(5,2) DEFAULT 0,
  confidence_score DECIMAL(5,2) DEFAULT 50,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB
);

-- Enable RLS
ALTER TABLE public.prediction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_accuracy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.method_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public read for all)
CREATE POLICY "Anyone can view prediction history"
  ON public.prediction_history FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view prediction accuracy"
  ON public.prediction_accuracy FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view method performance"
  ON public.method_performance FOR SELECT
  USING (true);

-- Service role can insert/update for tracking
CREATE POLICY "Service role can insert prediction history"
  ON public.prediction_history FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can insert prediction accuracy"
  ON public.prediction_accuracy FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can manage method performance"
  ON public.method_performance FOR ALL
  USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_prediction_history_created_at ON public.prediction_history(created_at DESC);
CREATE INDEX idx_prediction_history_method ON public.prediction_history(method_name);
CREATE INDEX idx_prediction_accuracy_prediction_id ON public.prediction_accuracy(prediction_id);
CREATE INDEX idx_method_performance_name ON public.method_performance(method_name);

-- Function to update method performance after validation
CREATE OR REPLACE FUNCTION public.update_method_performance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.method_performance mp
  SET
    total_predictions = (
      SELECT COUNT(*) 
      FROM public.prediction_history ph 
      WHERE ph.method_name = (
        SELECT method_name 
        FROM public.prediction_history 
        WHERE id = NEW.prediction_id
      )
    ),
    exact_matches = (
      SELECT COUNT(*) 
      FROM public.prediction_accuracy pa
      JOIN public.prediction_history ph ON pa.prediction_id = ph.id
      WHERE ph.method_name = (
        SELECT method_name 
        FROM public.prediction_history 
        WHERE id = NEW.prediction_id
      ) AND pa.exact_match = true
    ),
    last_4_matches = (
      SELECT COUNT(*) 
      FROM public.prediction_accuracy pa
      JOIN public.prediction_history ph ON pa.prediction_id = ph.id
      WHERE ph.method_name = (
        SELECT method_name 
        FROM public.prediction_history 
        WHERE id = NEW.prediction_id
      ) AND pa.last_4_match = true
    ),
    last_3_matches = (
      SELECT COUNT(*) 
      FROM public.prediction_accuracy pa
      JOIN public.prediction_history ph ON pa.prediction_id = ph.id
      WHERE ph.method_name = (
        SELECT method_name 
        FROM public.prediction_history 
        WHERE id = NEW.prediction_id
      ) AND pa.last_3_match = true
    ),
    avg_matching_digits = (
      SELECT COALESCE(AVG(pa.matching_digits), 0)
      FROM public.prediction_accuracy pa
      JOIN public.prediction_history ph ON pa.prediction_id = ph.id
      WHERE ph.method_name = (
        SELECT method_name 
        FROM public.prediction_history 
        WHERE id = NEW.prediction_id
      )
    ),
    last_updated = NOW()
  WHERE mp.method_name = (
    SELECT method_name 
    FROM public.prediction_history 
    WHERE id = NEW.prediction_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;