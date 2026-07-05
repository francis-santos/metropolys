-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    "id" VARCHAR(50) PRIMARY KEY,
    "code" VARCHAR(6) NOT NULL UNIQUE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'LOBBY',
    "cityCode" VARCHAR(50) NOT NULL,
    "currentRound" INT NOT NULL DEFAULT 1,
    "bankingLiquidity" INT NOT NULL DEFAULT 10000,
    "interestRate" DECIMAL(5, 4) NOT NULL DEFAULT 0.05,
    "economicCycle" VARCHAR(20) NOT NULL DEFAULT 'EXPANSION',
    "activeEventName" VARCHAR(255),
    "activeEventModifier" DECIMAL(5, 2) NOT NULL DEFAULT 1.0,
    "winnerId" VARCHAR(50),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
    "id" VARCHAR(50) PRIMARY KEY,
    "roomId" VARCHAR(50) NOT NULL REFERENCES rooms("id") ON DELETE CASCADE,
    "name" VARCHAR(50) NOT NULL,
    "color" VARCHAR(20) NOT NULL,
    "money" INT NOT NULL DEFAULT 1500,
    "position" INT NOT NULL DEFAULT 0,
    "isBankrupt" BOOLEAN NOT NULL DEFAULT FALSE,
    "isHost" BOOLEAN NOT NULL DEFAULT FALSE,
    "isBot" BOOLEAN NOT NULL DEFAULT FALSE,
    "botPersonality" VARCHAR(50),
    "isOnline" BOOLEAN NOT NULL DEFAULT TRUE,
    "pin" VARCHAR(20)
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
    "id" VARCHAR(50) PRIMARY KEY,
    "roomId" VARCHAR(50) NOT NULL REFERENCES rooms("id") ON DELETE CASCADE,
    "slotId" INT NOT NULL,
    "ownerId" VARCHAR(50) REFERENCES players("id") ON DELETE SET NULL,
    "baseCost" INT NOT NULL,
    "currentRent" INT NOT NULL,
    "multiplier" DECIMAL(5, 2) NOT NULL DEFAULT 1.0,
    UNIQUE("roomId", "slotId")
);

-- Create logs table
CREATE TABLE IF NOT EXISTS logs (
    "id" VARCHAR(50) PRIMARY KEY,
    "roomId" VARCHAR(50) NOT NULL REFERENCES rooms("id") ON DELETE CASCADE,
    "text" TEXT NOT NULL,
    "color" VARCHAR(20),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create auctions table
CREATE TABLE IF NOT EXISTS auctions (
    "id" VARCHAR(50) PRIMARY KEY,
    "roomId" VARCHAR(50) NOT NULL REFERENCES rooms("id") ON DELETE CASCADE,
    "slotId" INT NOT NULL,
    "highestBid" INT NOT NULL,
    "highestBidderId" VARCHAR(50) REFERENCES players("id") ON DELETE SET NULL,
    "endsAt" TIMESTAMPTZ NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
    "id" VARCHAR(50) PRIMARY KEY,
    "roomId" VARCHAR(50) NOT NULL REFERENCES rooms("id") ON DELETE CASCADE,
    "senderId" VARCHAR(50) NOT NULL REFERENCES players("id") ON DELETE CASCADE,
    "receiverId" VARCHAR(50) NOT NULL REFERENCES players("id") ON DELETE CASCADE,
    "offerCash" INT NOT NULL DEFAULT 0,
    "offerProperties" INT[] NOT NULL DEFAULT '{}',
    "requestProperties" INT[] NOT NULL DEFAULT '{}',
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING'
);

-- Create ai_news table
CREATE TABLE IF NOT EXISTS ai_news (
    "id" VARCHAR(50) PRIMARY KEY,
    "roomId" VARCHAR(50) NOT NULL REFERENCES rooms("id") ON DELETE CASCADE,
    "headline" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create publication for realtime if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END
$$;

-- Set Realtime properties for Supabase
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE properties;
ALTER PUBLICATION supabase_realtime ADD TABLE logs;
ALTER PUBLICATION supabase_realtime ADD TABLE auctions;
ALTER PUBLICATION supabase_realtime ADD TABLE trades;
