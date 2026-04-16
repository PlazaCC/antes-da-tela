-- Combined schema aligned with remote dump (idempotent)

-- Extensions (safe)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enum: script_status
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
		WHERE t.typname = 'script_status' AND n.nspname = 'public'
	) THEN
		EXECUTE 'CREATE TYPE "public"."script_status" AS ENUM (''draft'', ''published'')';
	END IF;
END
$$;

-- Tables (idempotent)
CREATE TABLE IF NOT EXISTS public.audio_files (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	script_id uuid NOT NULL,
	storage_path text NOT NULL,
	duration_seconds integer,
	created_at timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.comments (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	script_id uuid NOT NULL,
	author_id uuid NOT NULL,
	page_number integer NOT NULL,
	content text NOT NULL,
	created_at timestamp without time zone DEFAULT now() NOT NULL,
	updated_at timestamp without time zone,
	deleted_at timestamp without time zone
);

CREATE TABLE IF NOT EXISTS public.ratings (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	script_id uuid NOT NULL,
	user_id uuid NOT NULL,
	score smallint NOT NULL,
	created_at timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.script_files (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	script_id uuid NOT NULL,
	storage_path text NOT NULL,
	file_size integer,
	page_count integer,
	created_at timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.scripts (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	title text NOT NULL,
	logline text,
	synopsis text,
	genre text,
	age_rating text,
	is_featured boolean DEFAULT false NOT NULL,
	status public.script_status DEFAULT 'published'::public.script_status NOT NULL,
	author_id uuid NOT NULL,
	banner_path text,
	created_at timestamp without time zone DEFAULT now() NOT NULL,
	published_at timestamp without time zone
);

CREATE TABLE IF NOT EXISTS public.users (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	name text NOT NULL,
	email text NOT NULL,
	image text,
	created_at timestamp without time zone DEFAULT now() NOT NULL,
	bio text
);

-- Primary keys and unique constraints (idempotent checks)
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audio_files_pkey') THEN
		ALTER TABLE IF EXISTS public.audio_files ADD CONSTRAINT audio_files_pkey PRIMARY KEY (id);
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comments_pkey') THEN
		ALTER TABLE IF EXISTS public.comments ADD CONSTRAINT comments_pkey PRIMARY KEY (id);
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ratings_pkey') THEN
		ALTER TABLE IF EXISTS public.ratings ADD CONSTRAINT ratings_pkey PRIMARY KEY (id);
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'script_files_pkey') THEN
		ALTER TABLE IF EXISTS public.script_files ADD CONSTRAINT script_files_pkey PRIMARY KEY (id);
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'scripts_pkey') THEN
		ALTER TABLE IF EXISTS public.scripts ADD CONSTRAINT scripts_pkey PRIMARY KEY (id);
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_email_unique') THEN
		ALTER TABLE IF EXISTS public.users ADD CONSTRAINT users_email_unique UNIQUE (email);
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_pkey') THEN
		ALTER TABLE IF EXISTS public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
	END IF;
END
$$;

-- Unique index on ratings (script_id, user_id)
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid WHERE c.relname = 'ratings_script_user_unique') THEN
		CREATE UNIQUE INDEX ratings_script_user_unique ON public.ratings USING btree (script_id, user_id);
	END IF;
END
$$;

-- Foreign keys (idempotent checks)
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audio_files_script_id_scripts_id_fk') THEN
		ALTER TABLE ONLY public.audio_files ADD CONSTRAINT audio_files_script_id_scripts_id_fk FOREIGN KEY (script_id) REFERENCES public.scripts(id) ON DELETE CASCADE;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comments_author_id_users_id_fk') THEN
		ALTER TABLE ONLY public.comments ADD CONSTRAINT comments_author_id_users_id_fk FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comments_script_id_scripts_id_fk') THEN
		ALTER TABLE ONLY public.comments ADD CONSTRAINT comments_script_id_scripts_id_fk FOREIGN KEY (script_id) REFERENCES public.scripts(id) ON DELETE CASCADE;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ratings_script_id_scripts_id_fk') THEN
		ALTER TABLE ONLY public.ratings ADD CONSTRAINT ratings_script_id_scripts_id_fk FOREIGN KEY (script_id) REFERENCES public.scripts(id) ON DELETE CASCADE;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ratings_user_id_users_id_fk') THEN
		ALTER TABLE ONLY public.ratings ADD CONSTRAINT ratings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'script_files_script_id_scripts_id_fk') THEN
		ALTER TABLE ONLY public.script_files ADD CONSTRAINT script_files_script_id_scripts_id_fk FOREIGN KEY (script_id) REFERENCES public.scripts(id) ON DELETE CASCADE;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'scripts_author_id_users_id_fk') THEN
		ALTER TABLE ONLY public.scripts ADD CONSTRAINT scripts_author_id_users_id_fk FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;
	END IF;
END
$$;

-- Policies: drop if exists then create (idempotent)
DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='audio_files' AND policyname='Audio files are publicly readable') THEN
		PERFORM 1; -- already exists
	ELSE
		CREATE POLICY "Audio files are publicly readable" ON public.audio_files FOR SELECT USING (true);
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='comments' AND policyname='Authenticated users can create comments') THEN
		CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT TO authenticated WITH CHECK ((auth.uid() = author_id));
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ratings' AND policyname='Authenticated users manage their own ratings') THEN
		CREATE POLICY "Authenticated users manage their own ratings" ON public.ratings TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='audio_files' AND policyname='Authors manage their audio files') THEN
		CREATE POLICY "Authors manage their audio files" ON public.audio_files TO authenticated USING ((auth.uid() = ( SELECT scripts.author_id FROM public.scripts WHERE (scripts.id = audio_files.script_id)))) WITH CHECK ((auth.uid() = ( SELECT scripts.author_id FROM public.scripts WHERE (scripts.id = audio_files.script_id))));
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='comments' AND policyname='Authors manage their own comments') THEN
		CREATE POLICY "Authors manage their own comments" ON public.comments TO authenticated USING ((auth.uid() = author_id)) WITH CHECK ((auth.uid() = author_id));
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='scripts' AND policyname='Authors manage their own scripts') THEN
		CREATE POLICY "Authors manage their own scripts" ON public.scripts TO authenticated USING ((auth.uid() = author_id)) WITH CHECK ((auth.uid() = author_id));
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='script_files' AND policyname='Authors manage their script files') THEN
		CREATE POLICY "Authors manage their script files" ON public.script_files TO authenticated USING ((auth.uid() = ( SELECT scripts.author_id FROM public.scripts WHERE (scripts.id = script_files.script_id)))) WITH CHECK ((auth.uid() = ( SELECT scripts.author_id FROM public.scripts WHERE (scripts.id = script_files.script_id))));
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='comments' AND policyname='Comments on published scripts are publicly readable') THEN
		CREATE POLICY "Comments on published scripts are publicly readable" ON public.comments FOR SELECT USING ((deleted_at IS NULL));
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='scripts' AND policyname='Published scripts are publicly readable') THEN
		CREATE POLICY "Published scripts are publicly readable" ON public.scripts FOR SELECT USING ((status = 'published'::public.script_status));
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ratings' AND policyname='Ratings are publicly readable') THEN
		CREATE POLICY "Ratings are publicly readable" ON public.ratings FOR SELECT USING (true);
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='script_files' AND policyname='Script files follow script visibility') THEN
		CREATE POLICY "Script files follow script visibility" ON public.script_files FOR SELECT USING (true);
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='Users are publicly readable') THEN
		CREATE POLICY "Users are publicly readable" ON public.users FOR SELECT USING (true);
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='Users can view and update their own data') THEN
		CREATE POLICY "Users can view and update their own data" ON public.users TO authenticated USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));
	END IF;
END
$$;

-- Enable RLS
ALTER TABLE IF EXISTS public.audio_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.script_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

-- ratings score range (idempotent)
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ratings_score_range') THEN
		ALTER TABLE IF EXISTS public.ratings ADD CONSTRAINT ratings_score_range CHECK ((score >= 1) AND (score <= 5));
	END IF;
END
$$;
