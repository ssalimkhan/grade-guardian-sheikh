-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create grade_templates table for saving reusable grading schemes
CREATE TABLE public.grade_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  test_configs JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.grade_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for grade_templates
CREATE POLICY "Users can view their own templates"
ON public.grade_templates
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates"
ON public.grade_templates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
ON public.grade_templates
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
ON public.grade_templates
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updating timestamps
CREATE TRIGGER update_grade_templates_updated_at
BEFORE UPDATE ON public.grade_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();