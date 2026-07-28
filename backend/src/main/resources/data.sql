INSERT INTO job_application (company, role, status, column_position, notes, job_posting_url)
VALUES
-- Wishlist
('Acme Corp', 'Frontend Engineer', 'WISHLIST', 0, 'Strong design culture. Reach out to Maya on LinkedIn before applying.', 'https://example.com/jobs/acme-frontend'),
('Lumen Analytics', 'Senior React Developer', 'WISHLIST', 1, 'Remote friendly, but the team is mostly in Berlin.', 'https://example.com/jobs/lumen-react'),
('Fjord Systems', 'Web Platform Engineer', 'WISHLIST', 2, NULL, 'https://example.com/jobs/fjord-platform'),
('Beacon Health', 'UI Engineer', 'WISHLIST', 3, 'Healthcare domain. Posting closes end of the month.', NULL),

-- Applied
('Bright Labs', 'Full Stack Developer', 'APPLIED', 0, 'Submitted via company portal. Recruiter screen scheduled for next week.', 'https://example.com/jobs/bright-labs-fullstack'),
('Northwind Trading', 'React Developer', 'APPLIED', 1, 'Applied through a referral from Jonas.', 'https://example.com/jobs/northwind-react'),
('Vertex Robotics', 'Frontend Engineer', 'APPLIED', 2, 'Take-home assignment expected before the first call.', 'https://example.com/jobs/vertex-frontend'),
('Copperline Media', 'JavaScript Developer', 'APPLIED', 3, NULL, NULL),

-- Interview
('Cascade Systems', 'Software Engineer', 'INTERVIEW', 0, 'Onsite loop: system design plus React take-home review.', 'https://example.com/jobs/cascade-swe'),
('Orbit Financial', 'Frontend Engineer II', 'INTERVIEW', 1, 'Second round with the platform team on Thursday.', 'https://example.com/jobs/orbit-frontend'),
('Tidewater Logistics', 'Full Stack Engineer', 'INTERVIEW', 2, 'Pair programming session went well. Waiting on the hiring manager.', NULL),

-- Offer
('Helios AI', 'UI Engineer', 'OFFER', 0, 'Verbal offer received. Waiting on written package.', NULL),
('Northstar Ventures', 'Product Engineer', 'OFFER', 1, 'Offer expires in two weeks. Negotiating equity.', 'https://example.com/jobs/northstar-product'),

-- Rejected
('Ironclad Security', 'Frontend Developer', 'REJECTED', 0, 'Rejected after the take-home. Feedback: wanted deeper testing experience.', 'https://example.com/jobs/ironclad-frontend'),
('Marigold Studio', 'Web Developer', 'REJECTED', 1, 'Role was put on hold.', NULL),
('Pinnacle Datawork', 'Senior Frontend Engineer', 'REJECTED', 2, NULL, 'https://example.com/jobs/pinnacle-senior-frontend');
