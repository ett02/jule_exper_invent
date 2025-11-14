TRUNCATE TABLE shop_hours;

INSERT INTO shop_hours (giorno, orario_apertura, orario_chiusura, is_chiuso) VALUES
(1, '09:00:00', '19:00:00', FALSE),  -- Lunedì
(2, '09:00:00', '19:00:00', FALSE),  -- Martedì
(3, '09:00:00', '19:00:00', FALSE),  -- Mercoledì
(4, '09:00:00', '19:00:00', FALSE),  -- Giovedì
(5, '09:00:00', '20:00:00', FALSE),  -- Venerdì (orario prolungato)
(6, '09:00:00', '18:00:00', FALSE),  -- Sabato (orario ridotto)
(0, NULL, NULL, TRUE);               -- Domenica (chiuso)
