-- Create api_logs table for tracking API calls from mobile app
CREATE TABLE IF NOT EXISTS public.api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  platform TEXT, -- ios, android, web
  device_model TEXT, -- e.g., "iPhone 14 Pro", "Samsung Galaxy S21"
  os_version TEXT, -- e.g., "iOS 17.2", "Android 13"
  app_version TEXT, -- from app.json
  error_message TEXT,
  request_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create indexes for query performance
CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_status_code ON api_logs(status_code);
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_logs_platform ON api_logs(platform);

-- Enable RLS
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only service role can access (not regular users)
-- Service role bypasses RLS by default, so we don't need explicit policies
-- This table is managed by backend functions only
