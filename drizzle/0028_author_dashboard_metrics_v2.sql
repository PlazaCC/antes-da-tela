-- Author dashboard metrics, v2 (replaces the 0008 version).
--   * avgRating is null when there are no ratings (was 0, shown as "★ 0.0")
--   * ratingCount per script and overall, so averages show their sample size
--   * comments written by the author on their own scripts are not counted
--   * publishedScripts separate from totalScripts (which includes drafts)
--   * ratings/comments are aggregated only for the author's scripts, not the
--     whole table
CREATE OR REPLACE FUNCTION get_author_dashboard_metrics(p_author_id UUID)
RETURNS JSONB LANGUAGE sql STABLE AS $$
  WITH author_scripts AS (
    SELECT s.id, s.title, s.status, s.created_at
    FROM scripts s
    WHERE s.author_id = p_author_id
  ),
  script_ratings AS (
    SELECT r.script_id, AVG(r.score)::NUMERIC AS avg_score, COUNT(*) AS rating_count
    FROM ratings r
    WHERE r.script_id IN (SELECT id FROM author_scripts)
    GROUP BY r.script_id
  ),
  script_comments AS (
    SELECT c.script_id, COUNT(*) AS comment_count
    FROM comments c
    WHERE c.script_id IN (SELECT id FROM author_scripts)
      AND c.deleted_at IS NULL
      AND c.author_id <> p_author_id
    GROUP BY c.script_id
  )
  SELECT jsonb_build_object(
    'scripts', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', a.id,
        'title', a.title,
        'status', a.status,
        'avgRating', sr.avg_score,
        'ratingCount', COALESCE(sr.rating_count, 0),
        'commentCount', COALESCE(sc.comment_count, 0)
      ) ORDER BY a.created_at DESC)
      FROM author_scripts a
      LEFT JOIN script_ratings sr ON sr.script_id = a.id
      LEFT JOIN script_comments sc ON sc.script_id = a.id
    ), '[]'::jsonb),
    'totalScripts', (SELECT COUNT(*) FROM author_scripts),
    'publishedScripts', (SELECT COUNT(*) FROM author_scripts WHERE status = 'published'),
    'avgRating', (
      SELECT AVG(r.score)::NUMERIC FROM ratings r
      WHERE r.script_id IN (SELECT id FROM author_scripts)
    ),
    'ratingCount', (SELECT COALESCE(SUM(rating_count), 0) FROM script_ratings),
    'totalComments', (SELECT COALESCE(SUM(comment_count), 0) FROM script_comments)
  );
$$;
