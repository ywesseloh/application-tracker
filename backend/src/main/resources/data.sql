-- Test user (password: password) — BCrypt via BCryptPasswordEncoder
INSERT INTO users (id, username, password, created_at, updated_at)
VALUES (
  1,
  'demo',
  '$2a$10$71azWnax8XBTMn0CbZAZn.AisFEqBqzrmCqjjV0F0hetMTZHZ6ir2',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

ALTER TABLE users ALTER COLUMN id RESTART WITH 2;

INSERT INTO job_application (id, user_id, company, role, status, notes, job_posting_url)
VALUES
-- Wishlist
(1, 1, 'Acme Corp', 'Frontend Engineer', 'WISHLIST', 'Strong design culture. Reach out to Maya on LinkedIn before applying.', 'https://example.com/jobs/acme-frontend'),
(2, 1, 'Lumen Analytics', 'Senior React Developer', 'WISHLIST', 'Remote friendly, but the team is mostly in Berlin.', 'https://example.com/jobs/lumen-react'),
(3, 1, 'Fjord Systems', 'Web Platform Engineer', 'WISHLIST', NULL, 'https://example.com/jobs/fjord-platform'),
(4, 1, 'Beacon Health', 'UI Engineer', 'WISHLIST', 'Healthcare domain. Posting closes end of the month.', NULL),

-- Applied
(5, 1, 'Bright Labs', 'Full Stack Developer', 'APPLIED', 'Submitted via company portal. Recruiter screen scheduled for next week.', 'https://example.com/jobs/bright-labs-fullstack'),
(6, 1, 'Northwind Trading', 'React Developer', 'APPLIED', 'Applied through a referral from Jonas.', 'https://example.com/jobs/northwind-react'),
(7, 1, 'Vertex Robotics', 'Frontend Engineer', 'APPLIED', 'Take-home assignment expected before the first call.', 'https://example.com/jobs/vertex-frontend'),
(8, 1, 'Copperline Media', 'JavaScript Developer', 'APPLIED', NULL, NULL),

-- Interview
(9, 1, 'Cascade Systems', 'Software Engineer', 'INTERVIEW', 'Onsite loop: system design plus React take-home review.', 'https://example.com/jobs/cascade-swe'),
(10, 1, 'Orbit Financial', 'Frontend Engineer II', 'INTERVIEW', 'Second round with the platform team on Thursday.', 'https://example.com/jobs/orbit-frontend'),
(11, 1, 'Tidewater Logistics', 'Full Stack Engineer', 'INTERVIEW', 'Pair programming session went well. Waiting on the hiring manager.', NULL),

-- Offer
(12, 1, 'Helios AI', 'UI Engineer', 'OFFER', 'Verbal offer received. Waiting on written package.', NULL),
(13, 1, 'Northstar Ventures', 'Product Engineer', 'OFFER', 'Offer expires in two weeks. Negotiating equity.', 'https://example.com/jobs/northstar-product'),

-- Rejected
(14, 1, 'Ironclad Security', 'Frontend Developer', 'REJECTED', 'Rejected after the take-home. Feedback: wanted deeper testing experience.', 'https://example.com/jobs/ironclad-frontend'),
(15, 1, 'Marigold Studio', 'Web Developer', 'REJECTED', 'Role was put on hold.', NULL),
(16, 1, 'Pinnacle Datawork', 'Senior Frontend Engineer', 'REJECTED', NULL, 'https://example.com/jobs/pinnacle-senior-frontend');

INSERT INTO board_placement (application_id, user_id, status, position)
VALUES
(1, 1, 'WISHLIST', 0),
(2, 1, 'WISHLIST', 1),
(3, 1, 'WISHLIST', 2),
(4, 1, 'WISHLIST', 3),
(5, 1, 'APPLIED', 0),
(6, 1, 'APPLIED', 1),
(7, 1, 'APPLIED', 2),
(8, 1, 'APPLIED', 3),
(9, 1, 'INTERVIEW', 0),
(10, 1, 'INTERVIEW', 1),
(11, 1, 'INTERVIEW', 2),
(12, 1, 'OFFER', 0),
(13, 1, 'OFFER', 1),
(14, 1, 'REJECTED', 0),
(15, 1, 'REJECTED', 1),
(16, 1, 'REJECTED', 2);

ALTER TABLE job_application ALTER COLUMN id RESTART WITH 17;
