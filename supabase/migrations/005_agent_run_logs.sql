CREATE TABLE public.agent_run_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flow_run_id UUID NOT NULL DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  flow_id UUID REFERENCES public.flows(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL NOT NULL,
  node_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  model TEXT,
  system_prompt TEXT,
  user_content TEXT,
  response_content TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_agent_run_logs_question_id ON public.agent_run_logs(question_id);
CREATE INDEX idx_agent_run_logs_agent_id ON public.agent_run_logs(agent_id);
CREATE INDEX idx_agent_run_logs_flow_run_id ON public.agent_run_logs(flow_run_id);
CREATE INDEX idx_agent_run_logs_created_at ON public.agent_run_logs(created_at DESC);

ALTER TABLE public.agent_run_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view run logs for own agents"
  ON public.agent_run_logs FOR SELECT
  USING (
    agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid())
  );
