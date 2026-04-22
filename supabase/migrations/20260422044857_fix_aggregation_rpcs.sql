-- Fix get_many_average_ratings to correctly handle scripts with no ratings
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

-- Ensure get_profile_stats is correctly defined (re-deploying to refresh cache)
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
