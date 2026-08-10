INSERT INTO users (id, username, password, created_at, updated_at)
VALUES (
  1,
  'mock-user',
  '$2a$10$71azWnax8XBTMn0CbZAZn.AisFEqBqzrmCqjjV0F0hetMTZHZ6ir2',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

ALTER TABLE users ALTER COLUMN id RESTART WITH 2;
