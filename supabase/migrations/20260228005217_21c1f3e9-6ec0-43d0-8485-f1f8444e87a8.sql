
-- Re-seed skill libraries for existing families
INSERT INTO family_skill_library (family_id, skill_definition_id, status)
SELECT f.id, sd.id, 'suggested'
FROM families f
CROSS JOIN skill_definitions sd
WHERE sd.is_default = true
ON CONFLICT DO NOTHING;
