-- script_reads is only touched through the functions below: readers record
-- their own progress, authors get aggregates of their own scripts.
REVOKE ALL ON TABLE "public"."script_reads" FROM anon, authenticated;--> statement-breakpoint
GRANT SELECT ON TABLE "public"."script_reads" TO authenticated;--> statement-breakpoint

-- Records how far the signed-in reader got in a published script. max_page only
-- moves forward; completed_at is set the first time the last page is reached.
-- The page count comes from script_files when known, so the client cannot
-- inflate it. Authors reading their own script are not recorded.
CREATE OR REPLACE FUNCTION public.record_script_read(p_script_id uuid, p_page integer, p_pages_total integer)
RETURNS void
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
  INSERT INTO public.script_reads AS r (script_id, reader_id, pages_total, max_page, completed_at)
  SELECT s.id, me.id, t.total, LEAST(GREATEST(p_page, 1), t.total),
         CASE WHEN p_page >= t.total THEN now() END
  FROM public.scripts s
  CROSS JOIN LATERAL (SELECT public.current_user_id() AS id) me
  LEFT JOIN public.script_files f ON f.script_id = s.id
  CROSS JOIN LATERAL (SELECT COALESCE(f.page_count, p_pages_total) AS total) t
  WHERE s.id = p_script_id
    AND s.status = 'published'
    AND me.id IS NOT NULL
    AND s.author_id <> me.id
    AND t.total >= 1
  ON CONFLICT (script_id, reader_id) DO UPDATE SET
    max_page = GREATEST(r.max_page, EXCLUDED.max_page),
    pages_total = EXCLUDED.pages_total,
    last_read_at = now(),
    completed_at = COALESCE(r.completed_at, EXCLUDED.completed_at)
$$;--> statement-breakpoint
REVOKE ALL ON FUNCTION public.record_script_read(uuid, integer, integer) FROM PUBLIC, anon;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.record_script_read(uuid, integer, integer) TO authenticated;--> statement-breakpoint

-- Reading stats of one script, for its author only (null for anyone else).
--   milestones: readers who reached 25/50/75/100% of the pages
--   stopPages:  last page reached by readers who did not finish
--   newLast30 / newPrev30: readers who started in the last 30 days / the 30 before
CREATE OR REPLACE FUNCTION public.get_script_read_stats(p_script_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH reads AS (
    SELECT r.* FROM public.script_reads r
    JOIN public.scripts s ON s.id = r.script_id
    WHERE r.script_id = p_script_id AND s.author_id = public.current_user_id()
  )
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM public.scripts WHERE id = p_script_id AND author_id = public.current_user_id()
  ) THEN jsonb_build_object(
    'readers', (SELECT count(*) FROM reads),
    'completed', (SELECT count(*) FROM reads WHERE completed_at IS NOT NULL),
    'newLast30', (SELECT count(*) FROM reads WHERE first_read_at >= now() - interval '30 days'),
    'newPrev30', (SELECT count(*) FROM reads
                  WHERE first_read_at >= now() - interval '60 days' AND first_read_at < now() - interval '30 days'),
    'milestones', (
      SELECT jsonb_agg(jsonb_build_object(
        'milestone', m,
        'count', (SELECT count(*) FROM reads WHERE max_page * 100 >= m * pages_total)
      ) ORDER BY m)
      FROM unnest(ARRAY[25, 50, 75, 100]) AS m
    ),
    'stopPages', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('page', max_page, 'count', n) ORDER BY max_page)
      FROM (SELECT max_page, count(*) AS n FROM reads WHERE completed_at IS NULL GROUP BY max_page) x
    ), '[]'::jsonb)
  ) END
$$;--> statement-breakpoint
REVOKE ALL ON FUNCTION public.get_script_read_stats(uuid) FROM PUBLIC, anon;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.get_script_read_stats(uuid) TO authenticated;--> statement-breakpoint

-- Reader counts across all scripts of the signed-in author.
--   uniqueReaders: distinct people who read at least one of the scripts
--   newLast30 / newPrev30: people whose first read of any of them falls in that window
--   scripts: readers and finished readers per script
CREATE OR REPLACE FUNCTION public.get_author_read_counts()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH reads AS (
    SELECT r.* FROM public.script_reads r
    JOIN public.scripts s ON s.id = r.script_id
    WHERE s.author_id = public.current_user_id()
  ),
  first_reads AS (
    SELECT reader_id, min(first_read_at) AS first_at FROM reads GROUP BY reader_id
  )
  SELECT jsonb_build_object(
    'uniqueReaders', (SELECT count(*) FROM first_reads),
    'newLast30', (SELECT count(*) FROM first_reads WHERE first_at >= now() - interval '30 days'),
    'newPrev30', (SELECT count(*) FROM first_reads
                  WHERE first_at >= now() - interval '60 days' AND first_at < now() - interval '30 days'),
    'scripts', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('scriptId', script_id, 'readers', readers, 'completed', completed))
      FROM (
        SELECT script_id, count(*) AS readers, count(*) FILTER (WHERE completed_at IS NOT NULL) AS completed
        FROM reads GROUP BY script_id
      ) per_script
    ), '[]'::jsonb)
  )
$$;--> statement-breakpoint
REVOKE ALL ON FUNCTION public.get_author_read_counts() FROM PUBLIC, anon;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.get_author_read_counts() TO authenticated;
