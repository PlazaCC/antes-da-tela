-- Custom migration to baseline Supabase specific features (RPCs and Storage)
-- This ensures that new environments get the necessary functions and buckets.

-- 1. Storage Buckets and Policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('scripts', 'scripts', true, 52428800,  ARRAY['application/pdf']),
  ('audio',   'audio',   true, 104857600, ARRAY['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/webm']),
  ('avatars', 'avatars', true, 5242880,   ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public            = EXCLUDED.public,
  file_size_limit   = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS Policies for Storage (Simplified/Consolidated)
CREATE POLICY "scripts bucket public read" ON storage.objects FOR SELECT USING (bucket_id = 'scripts');
CREATE POLICY "scripts bucket authenticated insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'scripts' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "scripts bucket owner update delete" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'scripts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "audio bucket public read" ON storage.objects FOR SELECT USING (bucket_id = 'audio');
CREATE POLICY "audio bucket authenticated insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'audio' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "audio bucket owner update delete" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'audio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars bucket public read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars bucket authenticated insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatars bucket owner update delete" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 2. RPC Functions
CREATE OR REPLACE FUNCTION get_average_rating(p_script_id UUID)
RETURNS TABLE (average NUMERIC, total BIGINT) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY SELECT COALESCE(AVG(score)::NUMERIC, 0), COUNT(*)::BIGINT FROM ratings WHERE script_id = p_script_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_many_average_ratings(p_script_ids UUID[])
RETURNS TABLE (script_id UUID, average NUMERIC, total BIGINT) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY SELECT s.id, COALESCE(AVG(r.score)::NUMERIC, 0), COUNT(r.score)::BIGINT
  FROM unnest(p_script_ids) as s(id) LEFT JOIN ratings r ON r.script_id = s.id GROUP BY s.id;
END;
$$;

CREATE OR REPLACE FUNCTION get_author_dashboard_metrics(p_author_id UUID)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE v_scripts JSONB; v_overall_avg NUMERIC; v_total_scripts BIGINT;
BEGIN
  WITH author_scripts AS (SELECT s.id, s.title, s.status FROM scripts s WHERE s.author_id = p_author_id),
  script_ratings AS (SELECT script_id, AVG(score) as avg_score FROM ratings GROUP BY script_id),
  script_comments AS (SELECT script_id, COUNT(*) as comment_count FROM comments WHERE deleted_at IS NULL GROUP BY script_id)
  SELECT jsonb_agg(jsonb_build_object('id', ads.id, 'title', ads.title, 'status', ads.status, 'avgRating', COALESCE(sr.avg_score, 0), 'commentCount', COALESCE(sc.comment_count, 0)))
  INTO v_scripts FROM author_scripts ads LEFT JOIN script_ratings sr ON ads.id = sr.script_id LEFT JOIN script_comments sc ON ads.id = sc.script_id;
  SELECT COALESCE(AVG(score)::NUMERIC, 0) INTO v_overall_avg FROM ratings WHERE script_id IN (SELECT id FROM scripts WHERE author_id = p_author_id);
  SELECT COUNT(*) INTO v_total_scripts FROM scripts WHERE author_id = p_author_id;
  RETURN jsonb_build_object('scripts', COALESCE(v_scripts, '[]'::jsonb), 'avgRating', v_overall_avg, 'totalScripts', v_total_scripts);
END;
$$;

CREATE OR REPLACE FUNCTION get_profile_stats(p_user_id UUID)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE v_scripts_count BIGINT; v_average_rating NUMERIC; v_followers_count BIGINT; v_following_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO v_scripts_count FROM scripts WHERE author_id = p_user_id AND status = 'published';
  SELECT COALESCE(AVG(r.score)::NUMERIC, 0) INTO v_average_rating FROM ratings r JOIN scripts s ON r.script_id = s.id WHERE s.author_id = p_user_id AND s.status = 'published';
  SELECT COUNT(*) INTO v_followers_count FROM user_follows WHERE followee_id = p_user_id;
  SELECT COUNT(*) INTO v_following_count FROM user_follows WHERE follower_id = p_user_id;
  RETURN jsonb_build_object('scriptsCount', v_scripts_count, 'averageRating', v_average_rating, 'followersCount', v_followers_count, 'followingCount', v_following_count);
END;
$$;
