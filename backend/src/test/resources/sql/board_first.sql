INSERT INTO users (id, username, password, created_at, updated_at)
VALUES (
  1,
  'mock-user',
  '$2a$10$71azWnax8XBTMn0CbZAZn.AisFEqBqzrmCqjjV0F0hetMTZHZ6ir2',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT INTO job_application (id, user_id, company, role, status, notes, job_posting_url, created_at, updated_at)
VALUES
  (1, 1, 'First', 'Role', 'WISHLIST', 'Some notes', 'MyUrl', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO board_placement (application_id, user_id, status, position)
VALUES
  (1, 1, 'WISHLIST', 0);

ALTER TABLE users ALTER COLUMN id RESTART WITH 2;
ALTER TABLE job_application ALTER COLUMN id RESTART WITH 2;
