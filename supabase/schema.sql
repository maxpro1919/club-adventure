-- 房间表
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(6) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '30 minutes'
);

-- 玩家表
CREATE TABLE players (
  id UUID PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  nickname VARCHAR(20) NOT NULL,
  animal_type VARCHAR(20) NOT NULL,
  color VARCHAR(20) NOT NULL,
  accessory VARCHAR(20) NOT NULL DEFAULT 'none',
  is_online BOOLEAN DEFAULT true,
  joined_at TIMESTAMPTZ DEFAULT now()
);

-- 事件卡表 (预置数据)
CREATE TABLE cards (
  id VARCHAR(20) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  options JSONB NOT NULL,
  outcomes JSONB NOT NULL
);

-- 对局表
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  card_id VARCHAR(20) REFERENCES cards(id),
  player1_id UUID REFERENCES players(id),
  player2_id UUID REFERENCES players(id),
  player1_choice CHAR(1),
  player2_choice CHAR(1),
  status VARCHAR(10) DEFAULT 'waiting',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_players_room ON players(room_id);
CREATE INDEX idx_matches_room ON matches(room_id);
CREATE INDEX idx_matches_status ON matches(status);

-- 启用 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE players;

-- 房间过期自动清理 (可选，用 Supabase Edge Function 或 cron)
