-- Elimina utente admin esistente
DELETE FROM users WHERE email = 'admin@barbershop.com';

-- NON inserire password hashata manualmente!
-- Usa invece l'API /auth/register via Postman con:
-- POST http://localhost:8080/auth/register
-- {
--   "nome": "Admin",
--   "cognome": "Sistema",
--   "email": "admin@barbershop.com",
--   "password": "admin123",
--   "ruolo": "ADMIN"
-- }
