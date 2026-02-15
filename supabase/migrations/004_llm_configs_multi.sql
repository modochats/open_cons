CREATE TABLE public.llm_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  api_base_url TEXT NOT NULL DEFAULT 'https://api.openai.com/v1',
  api_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_llm_configs_user_id ON public.llm_configs(user_id);

ALTER TABLE public.llm_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own llm configs"
  ON public.llm_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own llm configs"
  ON public.llm_configs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own llm configs"
  ON public.llm_configs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own llm configs"
  ON public.llm_configs FOR DELETE
  USING (auth.uid() = user_id);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_llm_config') THEN
    INSERT INTO public.llm_configs (user_id, name, api_base_url, api_key, created_at, updated_at)
    SELECT user_id, 'Default', api_base_url, api_key, created_at, updated_at FROM public.user_llm_config;
    DROP TABLE public.user_llm_config;
  END IF;
END $$;
