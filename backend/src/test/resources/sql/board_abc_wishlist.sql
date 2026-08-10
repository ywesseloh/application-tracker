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
  (1, 1, 'A', 'Role A', 'WISHLIST', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 1, 'B', 'Role B', 'WISHLIST', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 1, 'C', 'Role C', 'WISHLIST', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO board_placement (application_id, user_id, status, position)
VALUES
  (1, 1, 'WISHLIST', 0),
  (2, 1, 'WISHLIST', 1),
  (3, 1, 'WISHLIST', 2);

ALTER TABLE users ALTER COLUMN id RESTART WITH 2;
ALTER TABLE job_application ALTER COLUMN id RESTART WITH 4;
