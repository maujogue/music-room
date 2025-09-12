-- Create delegation_sessions table for managing music control delegation
CREATE TABLE delegation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delegator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    delegate_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT different_users CHECK (delegator_id != delegate_id),
    CONSTRAINT unique_delegation UNIQUE (delegator_id, delegate_id)
);

-- Create delegation_activities table for audit logging
CREATE TABLE delegation_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delegation_session_id UUID REFERENCES delegation_sessions(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL CHECK (
        activity_type IN (
            'delegation_created',
            'delegation_revoked',
            'play_track',
            'pause_track',
            'skip_track',
            'set_volume',
            'get_current_track'
        )
    ),
    performed_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    activity_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_delegation_sessions_delegator ON delegation_sessions(delegator_id);
CREATE INDEX idx_delegation_sessions_delegate ON delegation_sessions(delegate_id);
CREATE INDEX idx_delegation_sessions_token ON delegation_sessions(session_token);
CREATE INDEX idx_delegation_activities_session ON delegation_activities(delegation_session_id);
CREATE INDEX idx_delegation_activities_type ON delegation_activities(activity_type);
CREATE INDEX idx_delegation_activities_performed_by ON delegation_activities(performed_by);
CREATE INDEX idx_delegation_activities_created_at ON delegation_activities(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE delegation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE delegation_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for delegation_sessions table
-- Users can view delegations they are involved in (as delegator or delegate)
CREATE POLICY "Users can view their own delegations" ON delegation_sessions
    FOR SELECT USING (
        delegator_id = auth.uid() OR delegate_id = auth.uid()
    );

-- Users can create delegations where they are the delegator
CREATE POLICY "Users can create delegations as delegator" ON delegation_sessions
    FOR INSERT WITH CHECK (delegator_id = auth.uid());

-- Users can delete delegations where they are the delegator or delegate
CREATE POLICY "Users can delete their own delegations" ON delegation_sessions
    FOR DELETE USING (
        delegator_id = auth.uid() OR delegate_id = auth.uid()
    );

-- RLS Policies for delegation_activities table
-- Users can view activities for delegations they are involved in
CREATE POLICY "Users can view delegation activities they are involved in" ON delegation_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM delegation_sessions ds
            WHERE ds.id = delegation_session_id
            AND (ds.delegator_id = auth.uid() OR ds.delegate_id = auth.uid())
        )
    );

-- Users can insert activities for delegations they are involved in
CREATE POLICY "Users can create delegation activities" ON delegation_activities
    FOR INSERT WITH CHECK (
        performed_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM delegation_sessions ds
            WHERE ds.id = delegation_session_id
            AND (ds.delegator_id = auth.uid() OR ds.delegate_id = auth.uid())
        )
    );

-- Create function to log delegation activities
CREATE OR REPLACE FUNCTION log_delegation_activity(
    p_delegation_session_id UUID,
    p_activity_type TEXT,
    p_performed_by UUID,
    p_activity_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO delegation_activities (
        delegation_session_id,
        activity_type,
        performed_by,
        activity_data
    ) VALUES (
        p_delegation_session_id,
        p_activity_type,
        p_performed_by,
        p_activity_data
    ) RETURNING id INTO activity_id;

    RETURN activity_id;
END;
$$;

-- Create trigger function to automatically log delegation creation and revocation
CREATE OR REPLACE FUNCTION handle_delegation_lifecycle()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Log delegation creation
        PERFORM log_delegation_activity(
            NEW.id,
            'delegation_created',
            NEW.delegator_id,
            jsonb_build_object(
                'delegate_id', NEW.delegate_id,
                'session_token', NEW.session_token
            )
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Log delegation revocation
        PERFORM log_delegation_activity(
            OLD.id,
            'delegation_revoked',
            auth.uid(), -- The user who performed the deletion
            jsonb_build_object(
                'delegator_id', OLD.delegator_id,
                'delegate_id', OLD.delegate_id
            )
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Create triggers for automatic activity logging
CREATE TRIGGER delegation_lifecycle_trigger
    AFTER INSERT OR DELETE ON delegation_sessions
    FOR EACH ROW EXECUTE FUNCTION handle_delegation_lifecycle();

-- Grant necessary permissions
GRANT SELECT, INSERT, DELETE ON delegation_sessions TO authenticated;
GRANT SELECT, INSERT ON delegation_activities TO authenticated;
GRANT EXECUTE ON FUNCTION log_delegation_activity TO authenticated;
