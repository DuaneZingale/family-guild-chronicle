
-- Clear orphaned family_skill_library references
DELETE FROM family_skill_library;

-- Clear old character_skills that reference old skill_definitions
-- (keeping the table, just clearing stale refs)
DELETE FROM character_skills;

-- Delete old skill definitions
DELETE FROM skill_definitions;

-- Insert 35 new RPG-named skills (5 per path)
-- Path of Care
INSERT INTO skill_definitions (id, name, description, domain_id, path_id, is_default, tags) VALUES
  (gen_random_uuid(), 'Vitality', 'Fortify your life force through health and wellness practices', 'care', 'care', true, '{}'),
  (gen_random_uuid(), 'Athletics', 'Strengthen the body through movement, sport, and physical training', 'care', 'care', true, '{}'),
  (gen_random_uuid(), 'Restoration', 'Master the arts of rest, recovery, and nervous system regulation', 'care', 'care', true, '{}'),
  (gen_random_uuid(), 'Discipline', 'Build steady habits and routines that anchor your day', 'care', 'care', true, '{}'),
  (gen_random_uuid(), 'Composure', 'Cultivate emotional steadiness and calm under pressure', 'care', 'care', true, '{}');

-- Path of Curiosity
INSERT INTO skill_definitions (id, name, description, domain_id, path_id, is_default, tags) VALUES
  (gen_random_uuid(), 'Insight', 'Develop deep understanding through observation and reflection', 'curiosity', 'curiosity', true, '{}'),
  (gen_random_uuid(), 'Inquiry', 'Ask powerful questions and pursue answers with determination', 'curiosity', 'curiosity', true, '{}'),
  (gen_random_uuid(), 'Perception', 'Sharpen awareness of the world through all senses', 'curiosity', 'curiosity', true, '{}'),
  (gen_random_uuid(), 'Lore', 'Accumulate knowledge through reading, study, and research', 'curiosity', 'curiosity', true, '{}'),
  (gen_random_uuid(), 'Expression', 'Communicate ideas clearly through writing and speech', 'curiosity', 'curiosity', true, '{}');

-- Path of Craft
INSERT INTO skill_definitions (id, name, description, domain_id, path_id, is_default, tags) VALUES
  (gen_random_uuid(), 'Creation', 'Bring new things into existence through imagination and effort', 'craft', 'craft', true, '{}'),
  (gen_random_uuid(), 'Artistry', 'Develop aesthetic skill in visual, musical, or performing arts', 'craft', 'craft', true, '{}'),
  (gen_random_uuid(), 'Mastery', 'Deepen expertise through deliberate practice and repetition', 'craft', 'craft', true, '{}'),
  (gen_random_uuid(), 'Performance', 'Execute skills under pressure with confidence and flair', 'craft', 'craft', true, '{}'),
  (gen_random_uuid(), 'Engineering', 'Design and build systems, structures, and solutions', 'craft', 'craft', true, '{}');

-- Path of Contribution
INSERT INTO skill_definitions (id, name, description, domain_id, path_id, is_default, tags) VALUES
  (gen_random_uuid(), 'Service', 'Strengthen the guild by helping others without expectation', 'contribution', 'contribution', true, '{}'),
  (gen_random_uuid(), 'Order', 'Bring structure and cleanliness to shared spaces', 'contribution', 'contribution', true, '{}'),
  (gen_random_uuid(), 'Reliability', 'Follow through on commitments and be someone others can count on', 'contribution', 'contribution', true, '{}'),
  (gen_random_uuid(), 'Maintenance', 'Keep systems, spaces, and responsibilities running smoothly', 'contribution', 'contribution', true, '{}'),
  (gen_random_uuid(), 'Community', 'Build bonds and contribute to the greater good of the guild', 'contribution', 'contribution', true, '{}');

-- Path of Connection
INSERT INTO skill_definitions (id, name, description, domain_id, path_id, is_default, tags) VALUES
  (gen_random_uuid(), 'Speechcraft', 'Master the art of conversation, persuasion, and storytelling', 'connection', 'connection', true, '{}'),
  (gen_random_uuid(), 'Empathy', 'Understand and share the feelings of others deeply', 'connection', 'connection', true, '{}'),
  (gen_random_uuid(), 'Compassion', 'Act with kindness and warmth toward all guild members', 'connection', 'connection', true, '{}'),
  (gen_random_uuid(), 'Repair', 'Mend relationships through honest apology and reconnection', 'connection', 'connection', true, '{}'),
  (gen_random_uuid(), 'Leadership', 'Guide and inspire others through example and encouragement', 'connection', 'connection', true, '{}');

-- Path of Wealth
INSERT INTO skill_definitions (id, name, description, domain_id, path_id, is_default, tags) VALUES
  (gen_random_uuid(), 'Commerce', 'Understand the flow of gold through earning and trading', 'wealth', 'wealth', true, '{}'),
  (gen_random_uuid(), 'Provisioning', 'Manage resources wisely to keep the guild well-supplied', 'wealth', 'wealth', true, '{}'),
  (gen_random_uuid(), 'Strategy', 'Plan ahead and make decisions that compound over time', 'wealth', 'wealth', true, '{}'),
  (gen_random_uuid(), 'Investment', 'Grow wealth by planting seeds for the long game', 'wealth', 'wealth', true, '{}'),
  (gen_random_uuid(), 'Administration', 'Handle bills, paperwork, and financial responsibilities', 'wealth', 'wealth', true, '{}');

-- Path of Adventure
INSERT INTO skill_definitions (id, name, description, domain_id, path_id, is_default, tags) VALUES
  (gen_random_uuid(), 'Exploration', 'Venture into the unknown and discover new territories', 'adventure', 'adventure', true, '{}'),
  (gen_random_uuid(), 'Recreation', 'Find joy and renewal through play and leisure', 'adventure', 'adventure', true, '{}'),
  (gen_random_uuid(), 'Courage', 'Face challenges and fears with bravery and determination', 'adventure', 'adventure', true, '{}'),
  (gen_random_uuid(), 'Adaptation', 'Thrive in changing circumstances and unfamiliar environments', 'adventure', 'adventure', true, '{}'),
  (gen_random_uuid(), 'Discovery', 'Uncover hidden wonders in the world around you', 'adventure', 'adventure', true, '{}');
