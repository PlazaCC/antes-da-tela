-- Function to get average rating for a script
CREATE OR REPLACE FUNCTION get_average_rating(p_script_id UUID)
RETURNS TABLE (
  average NUMERIC,
  total BIGINT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(AVG(score)::NUMERIC, 0) as average,
    COUNT(*)::BIGINT as total
  FROM ratings
  WHERE script_id = p_script_id;
END;
$$;

-- Function to get average ratings for multiple scripts
CREATE OR REPLACE FUNCTION get_many_average_ratings(p_script_ids UUID[])
RETURNS TABLE (
  script_id UUID,
  average NUMERIC,
  total BIGINT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as script_id,
    COALESCE(AVG(r.score)::NUMERIC, 0) as average,
    COUNT(r.score)::BIGINT as total
  FROM unnest(p_script_ids) as s(id)
  LEFT JOIN ratings r ON r.script_id = s.id
  GROUP BY s.id;
END;
$$;

-- Function to get dashboard metrics for an author
CREATE OR REPLACE FUNCTION get_author_dashboard_metrics(p_author_id UUID)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  v_scripts JSONB;
  v_overall_avg NUMERIC;
  v_total_scripts BIGINT;
BEGIN
  -- Get all scripts for the author
  WITH author_scripts AS (
    SELECT s.id, s.title, s.status, s.genre
    FROM scripts s
    WHERE s.author_id = p_author_id
    ORDER BY s.published_at DESC
  ),
  script_ratings AS (
    SELECT script_id, AVG(score) as avg_score
    FROM ratings
    WHERE script_id IN (SELECT id FROM author_scripts)
    GROUP BY script_id
  ),
  script_comments AS (
    SELECT script_id, COUNT(*) as comment_count
    FROM comments
    WHERE script_id IN (SELECT id FROM author_scripts)
      AND deleted_at IS NULL
    GROUP BY script_id
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', ads.id,
      'title', ads.title,
      'status', ads.status,
      'avgRating', COALESCE(sr.avg_score, 0),
      'commentCount', COALESCE(sc.comment_count, 0)
    )
  ) INTO v_scripts
  FROM author_scripts ads
  LEFT JOIN script_ratings sr ON ads.id = sr.script_id
  LEFT JOIN script_comments sc ON ads.id = sc.script_id;

  -- Overall average
  SELECT COALESCE(AVG(score)::NUMERIC, 0) INTO v_overall_avg
  FROM ratings
  WHERE script_id IN (SELECT id FROM scripts WHERE author_id = p_author_id);

  -- Total scripts
  SELECT COUNT(*) INTO v_total_scripts
  FROM scripts
  WHERE author_id = p_author_id;

  RETURN jsonb_build_object(
    'scripts', COALESCE(v_scripts, '[]'::jsonb),
    'avgRating', v_overall_avg,
    'totalScripts', v_total_scripts
  );
END;
$$;

-- Function to get profile stats for a user
CREATE OR REPLACE FUNCTION get_profile_stats(p_user_id UUID)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  v_scripts_count BIGINT;
  v_average_rating NUMERIC;
  v_followers_count BIGINT;
  v_following_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO v_scripts_count
  FROM scripts
  WHERE author_id = p_user_id AND status = 'published';

  SELECT COALESCE(AVG(r.score)::NUMERIC, 0) INTO v_average_rating
  FROM ratings r
  JOIN scripts s ON r.script_id = s.id
  WHERE s.author_id = p_user_id AND s.status = 'published';

  SELECT COUNT(*) INTO v_followers_count
  FROM user_follows
  WHERE followee_id = p_user_id;

  SELECT COUNT(*) INTO v_following_count
  FROM user_follows
  WHERE follower_id = p_user_id;

  RETURN jsonb_build_object(
    'scriptsCount', v_scripts_count,
    'averageRating', v_average_rating,
    'followersCount', v_followers_count,
    'followingCount', v_following_count
  );
END;
$$;
