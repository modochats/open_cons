CREATE TABLE public.user_llm_config (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  api_base_url TEXT NOT NULL DEFAULT 'https://api.openai.com/v1',
  api_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_llm_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own llm config"
  ON public.user_llm_config FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own llm config"
  ON public.user_llm_config FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own llm config"
  ON public.user_llm_config FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_user_llm_config_user_id ON public.user_llm_config(user_id);
