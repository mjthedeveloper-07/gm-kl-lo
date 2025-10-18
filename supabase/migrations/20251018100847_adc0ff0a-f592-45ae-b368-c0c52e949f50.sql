-- Remove duplicate entries for October 15 and 17
DELETE FROM lottery_results WHERE id IN ('cad93416-07f0-46fb-b86d-94e5b15fe88c', '52e9af0c-4a80-4aee-ab84-a1bc4dcf1905');

-- Insert October 18, 2025 result
INSERT INTO lottery_results (date, lottery_name, draw_number, result, year, month, lottery_type)
VALUES ('2025-10-18', 'Pournami', 'W-2025-OCT-18', '708982', 2025, 10, 'regular')
ON CONFLICT (date, draw_number) DO UPDATE SET result = EXCLUDED.result;