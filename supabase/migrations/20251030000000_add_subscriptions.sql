-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  started_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  renewal_date timestamp with time zone NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own subscription
CREATE POLICY "Users can read their own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own subscription
CREATE POLICY "Users can insert their own subscription" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own subscription
CREATE POLICY "Users can update their own subscription" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own subscription
CREATE POLICY "Users can delete their own subscription" ON public.subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Policy: Anyone can check if a user has a subscription (for public premium status checks)
CREATE POLICY "Anyone can check subscription existence" ON public.subscriptions
  FOR SELECT USING (true);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal_date ON public.subscriptions(renewal_date);
