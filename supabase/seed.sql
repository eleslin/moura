-- Insert initial guide
INSERT INTO guides (title, link, image_url) VALUES (
    'EL NO MÉTODO | PÉRDIDA DE GRASA | CASA',
    'https://thesaiyankiwi.com/athlete/routine/575c9d49-e564-4842-9f16-559bb89af639',
    'https://dvbw6k2veuonh.cloudfront.net/routines/575c9d49-e564-4842-9f16-559bb89af639/cbc3cf06c1c284f8b98260225.webp'
) RETURNING id;

-- Insert week
INSERT INTO weeks (guide_id, week_title, week_link, week_index) VALUES (
    (SELECT id FROM guides WHERE title = 'EL NO MÉTODO | PÉRDIDA DE GRASA | CASA'),
    'Semana 1',
    'https://thesaiyankiwi.com/athlete/routine/575c9d49-e564-4842-9f16-559bb89af639/week/817084f6-42c4-451a-9692-d0e4a237050f',
    1
) RETURNING id;

-- Insert session
INSERT INTO sessions (week_id, day_number, title, link) VALUES (
    (SELECT id FROM weeks WHERE week_title = 'Semana 1'),
    1,
    'Tren inferior - fuerza',
    'https://thesaiyankiwi.com/athlete/routine/575c9d49-e564-4842-9f16-559bb89af639/week/817084f6-42c4-451a-9692-d0e4a237050f/day/97962f50-b81f-4465-b80c-a0ccc9ec3ed7'
) RETURNING id;

-- Insert exercises and sets
INSERT INTO exercises (session_id, title, video_url) VALUES (
    (SELECT id FROM sessions WHERE title = 'Tren inferior - fuerza'),
    'Movilidad - Rotación interna de cadera 90-90',
    'https://dvbw6k2veuonh.cloudfront.net/exercises/56227339-d0ce-4a6e-959e-2ccf179a5d9d/Movilidad__rotacion_interna_de_cadera_9090.mp4'
) RETURNING id;

INSERT INTO exercise_sets (exercise_id, set_series, set_reps, set_rest) VALUES (
    (SELECT id FROM exercises WHERE title = 'Movilidad - Rotación interna de cadera 90-90'),
    '1',
    '10 alterno',
    '-'
);

-- Continue with more exercises and sets as needed
