ALTER TABLE routes
ADD COLUMN capacity integer NOT NULL DEFAULT 40,
ADD COLUMN seats_taken integer NOT NULL DEFAULT 0;

-- Add constraint to ensure seats_taken doesn't exceed capacity
ALTER TABLE routes
ADD CONSTRAINT seats_taken_check CHECK (seats_taken <= capacity); 