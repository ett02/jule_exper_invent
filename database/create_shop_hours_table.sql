CREATE TABLE IF NOT EXISTS shop_hours (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    giorno INTEGER NOT NULL,           -- 0=Domenica, 1=Lunedì, ..., 6=Sabato
    orario_apertura TIME(6),
    orario_chiusura TIME(6),
    is_chiuso BOOLEAN DEFAULT FALSE,   -- true se salone chiuso quel giorno
    UNIQUE KEY unique_giorno (giorno)
);

-- Popola con orari default
INSERT INTO shop_hours (giorno, orario_apertura, orario_chiusura, is_chiuso) VALUES
(1, '09:00:00', '19:00:00', FALSE),  -- Lunedì
(2, '09:00:00', '19:00:00', FALSE),  -- Martedì
(3, '09:00:00', '19:00:00', FALSE),  -- Mercoledì
(4, '09:00:00', '19:00:00', FALSE),  -- Giovedì
(5, '09:00:00', '20:00:00', FALSE),  -- Venerdì (orario prolungato)
(6, '09:00:00', '18:00:00', FALSE),  -- Sabato (orario ridotto)
(0, NULL, NULL, TRUE);               -- Domenica (chiuso)
