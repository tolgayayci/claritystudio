-- Complete NEAR Playground Database Schema

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  name text CHECK (name IS NULL OR length(name) >= 3),
  company text CHECK (company IS NULL OR length(company) >= 2),
  avatar_url text CHECK (avatar_url IS NULL OR avatar_url ~ '^https?://.*'),
  bio text,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL CHECK (char_length(name) > 0),
  code text NOT NULL DEFAULT '',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  description text DEFAULT '',
  metadata jsonb DEFAULT '{}',
  last_activity_at timestamp with time zone DEFAULT now(),
  is_public boolean DEFAULT false,
  shared_at timestamp with time zone,
  view_count integer DEFAULT 0,
  source_url text,
  import_type text CHECK (import_type = ANY (ARRAY['template'::text, 'github'::text, 'manual'::text, 'embed'::text])),
  import_metadata jsonb DEFAULT '{}',
  embed_source text,
  embed_metadata jsonb DEFAULT '{}',
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create compilation_history table
CREATE TABLE IF NOT EXISTS public.compilation_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  user_id uuid NOT NULL,
  code_snapshot text NOT NULL,
  result jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL CHECK (status = ANY (ARRAY['success'::text, 'error'::text])),
  exit_code integer NOT NULL,
  stdout text,
  stderr text,
  abi jsonb,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  error_type text DEFAULT 'unknown' CHECK (error_type = ANY (ARRAY['compilation'::text, 'network'::text, 'unknown'::text])),
  wasm_available boolean DEFAULT false,
  abi_available boolean DEFAULT false,
  artifact_id uuid,
  CONSTRAINT compilation_history_pkey PRIMARY KEY (id),
  CONSTRAINT compilation_history_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT compilation_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create compilation_artifacts table
CREATE TABLE IF NOT EXISTS public.compilation_artifacts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  user_id uuid NOT NULL,
  wasm_binary bytea,
  wasm_size integer,
  wasm_hash text,
  abi_json jsonb,
  abi_solidity text,
  abi_size integer,
  compilation_id uuid UNIQUE,
  contract_size text,
  metadata_hash text,
  compiler_version text,
  cargo_stylus_version text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT compilation_artifacts_pkey PRIMARY KEY (id),
  CONSTRAINT compilation_artifacts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT compilation_artifacts_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT compilation_artifacts_compilation_id_fkey FOREIGN KEY (compilation_id) REFERENCES public.compilation_history(id) ON DELETE CASCADE
);

-- Create deployments table
CREATE TABLE IF NOT EXISTS public.deployments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  contract_address text NOT NULL,
  chain_id integer NOT NULL,
  chain_name text NOT NULL,
  deployed_code text NOT NULL,
  abi jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  CONSTRAINT deployments_pkey PRIMARY KEY (id),
  CONSTRAINT deployments_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- Create abi_calls table
CREATE TABLE IF NOT EXISTS public.abi_calls (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  contract_address text NOT NULL,
  method_name text NOT NULL,
  method_type text NOT NULL,
  inputs jsonb DEFAULT '{}',
  outputs jsonb DEFAULT '{}',
  status text NOT NULL,
  error text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT abi_calls_pkey PRIMARY KEY (id),
  CONSTRAINT abi_calls_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- Create embed_templates table
CREATE TABLE IF NOT EXISTS public.embed_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  code text NOT NULL,
  dependencies jsonb DEFAULT '[]',
  category text DEFAULT 'general',
  is_public boolean DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  usage_count integer DEFAULT 0,
  CONSTRAINT embed_templates_pkey PRIMARY KEY (id),
  CONSTRAINT embed_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create project_views table
CREATE TABLE IF NOT EXISTS public.project_views (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  viewer_id uuid,
  viewer_ip text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT project_views_pkey PRIMARY KEY (id),
  CONSTRAINT project_views_viewer_id_fkey FOREIGN KEY (viewer_id) REFERENCES public.users(id) ON DELETE SET NULL,
  CONSTRAINT project_views_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compilation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compilation_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abi_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embed_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data" ON public.users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can read own projects" ON public.projects FOR SELECT TO authenticated USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can create own projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Compilation history policies
CREATE POLICY "Users can read own compilation history" ON public.compilation_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own compilation history" ON public.compilation_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Compilation artifacts policies
CREATE POLICY "Users can read own artifacts" ON public.compilation_artifacts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own artifacts" ON public.compilation_artifacts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Deployments policies
CREATE POLICY "Users can read deployments of own projects" ON public.deployments FOR SELECT TO authenticated USING (
  project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create deployments for own projects" ON public.deployments FOR INSERT TO authenticated WITH CHECK (
  project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
);

-- ABI calls policies
CREATE POLICY "Users can read own abi calls" ON public.abi_calls FOR SELECT TO authenticated USING (
  project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create own abi calls" ON public.abi_calls FOR INSERT TO authenticated WITH CHECK (
  project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
);

-- Embed templates policies
CREATE POLICY "Anyone can read public templates" ON public.embed_templates FOR SELECT TO public USING (is_public = true);
CREATE POLICY "Users can read own templates" ON public.embed_templates FOR SELECT TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Users can create templates" ON public.embed_templates FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own templates" ON public.embed_templates FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- Project views policies
CREATE POLICY "Users can read project views" ON public.project_views FOR SELECT TO authenticated USING (
  project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
);
CREATE POLICY "Anyone can create project views" ON public.project_views FOR INSERT TO public WITH CHECK (true);

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_last_activity_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_last_activity BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_last_activity_timestamp();
CREATE TRIGGER update_compilation_artifacts_updated_at BEFORE UPDATE ON public.compilation_artifacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_embed_templates_updated_at BEFORE UPDATE ON public.embed_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraint after compilation_artifacts table is created
ALTER TABLE public.compilation_history ADD CONSTRAINT compilation_history_artifact_id_fkey 
FOREIGN KEY (artifact_id) REFERENCES public.compilation_artifacts(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_is_public ON public.projects(is_public);
CREATE INDEX IF NOT EXISTS idx_compilation_history_project_id ON public.compilation_history(project_id);
CREATE INDEX IF NOT EXISTS idx_compilation_history_user_id ON public.compilation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_compilation_artifacts_project_id ON public.compilation_artifacts(project_id);
CREATE INDEX IF NOT EXISTS idx_deployments_project_id ON public.deployments(project_id);
CREATE INDEX IF NOT EXISTS idx_abi_calls_project_id ON public.abi_calls(project_id);
CREATE INDEX IF NOT EXISTS idx_project_views_project_id ON public.project_views(project_id);