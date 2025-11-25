-- Web Search Cache Table
-- Stores results from web searches to avoid repeated API calls
-- Saves significant costs by caching for 90 days

CREATE TABLE IF NOT EXISTS web_search_cache (
  id SERIAL PRIMARY KEY,
  facility_identifier VARCHAR(50) NOT NULL,  -- NPI or other unique ID
  field_name VARCHAR(100) NOT NULL,          -- e.g., 'bed_count', 'rating', 'accreditation'
  field_value JSONB NOT NULL,                 -- Actual data (flexible JSON format)
  source TEXT,                                 -- Source URL or name for verification
  cached_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  
  -- Ensure one cached value per facility per field
  UNIQUE(facility_identifier, field_name)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_cache_lookup 
  ON web_search_cache(facility_identifier, field_name);

-- Index for expiry cleanup
CREATE INDEX IF NOT EXISTS idx_cache_expiry 
  ON web_search_cache(expires_at);

-- Index for field statistics
CREATE INDEX IF NOT EXISTS idx_cache_field 
  ON web_search_cache(field_name);

-- Function to auto-cleanup expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM web_search_cache 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run cleanup (requires pg_cron extension)
-- If you have pg_cron installed, uncomment the following:
-- SELECT cron.schedule('cleanup-web-cache', '0 2 * * *', 'SELECT cleanup_expired_cache()');

-- Add helpful comments
COMMENT ON TABLE web_search_cache IS 'Caches web search results to reduce API costs';
COMMENT ON COLUMN web_search_cache.facility_identifier IS 'NPI or other unique facility identifier';
COMMENT ON COLUMN web_search_cache.field_name IS 'Name of the field cached (bed_count, rating, etc)';
COMMENT ON COLUMN web_search_cache.field_value IS 'JSON value of the cached field';
COMMENT ON COLUMN web_search_cache.source IS 'Source of the data (URL or name)';
COMMENT ON COLUMN web_search_cache.expires_at IS 'When this cache entry expires (default 90 days)';

-- Grant permissions (adjust based on your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON web_search_cache TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE web_search_cache_id_seq TO your_app_user;

-- Example queries for monitoring:

-- View cache statistics
-- SELECT 
--   field_name,
--   COUNT(*) as cached_items,
--   MIN(cached_at) as oldest,
--   MAX(cached_at) as newest
-- FROM web_search_cache
-- WHERE expires_at > NOW()
-- GROUP BY field_name
-- ORDER BY cached_items DESC;

-- View recently cached items
-- SELECT 
--   facility_identifier,
--   field_name,
--   field_value,
--   source,
--   cached_at,
--   expires_at
-- FROM web_search_cache
-- WHERE expires_at > NOW()
-- ORDER BY cached_at DESC
-- LIMIT 100;

-- Manually cleanup expired entries
-- SELECT cleanup_expired_cache();

