-- Function to create messages table
CREATE OR REPLACE FUNCTION create_messages_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
    reactions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
  );

  -- Create indexes for better query performance
  CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
  CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON messages(channel_id);
  CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
  CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
END;
$$ LANGUAGE plpgsql;

-- Function to create channels table
CREATE OR REPLACE FUNCTION create_channels_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
  );

  -- Create indexes for better query performance
  CREATE INDEX IF NOT EXISTS idx_channels_name ON channels(name);
  CREATE INDEX IF NOT EXISTS idx_channels_created_by ON channels(created_by);
END;
$$ LANGUAGE plpgsql;

-- Function to create user_relationships table
CREATE OR REPLACE FUNCTION create_user_relationships_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS user_relationships (
    id BIGSERIAL PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT different_follower_following CHECK (follower_id != following_id),
    UNIQUE(follower_id, following_id)
  );

  -- Create indexes for better query performance
  CREATE INDEX IF NOT EXISTS idx_user_relationships_follower_id ON user_relationships(follower_id);
  CREATE INDEX IF NOT EXISTS idx_user_relationships_following_id ON user_relationships(following_id);
END;
$$ LANGUAGE plpgsql; 