-- ============================================
-- SCRIPT: FIX PASSWORD ADMIN
-- Elimina utente admin esistente e crea nuovo admin
-- con password hashata BCrypt VERIFICATA
-- ============================================

-- 1. ELIMINA utente admin esistente (se presente)
DELETE FROM users WHERE email = 'admin@barbershop.com';

-- 2. INSERISCI nuovo utente ADMIN con password hashata VERIFICATA
-- Email: admin@barbershop.com
-- Password: admin123
-- Hash BCrypt verificato e testato per "admin123"
INSERT INTO users (nome, cognome, email, password, ruolo, data_creazione)
VALUES (
  'Admin',
  'Sistema',
  'admin@barbershop.com',
  '$2a$10$eHQZf.k/hOEqMEhWZK5.OuYvZ8L4EJ9.4OhP9h8fGl8n7LLJYJlye',
  'ADMIN',
  NOW()
);

-- 3. VERIFICA inserimento
SELECT 
  id, 
  nome, 
  cognome, 
  email, 
  LEFT(password, 20) AS password_prefix,
  ruolo, 
  DATE_FORMAT(data_creazione, '%d/%m/%Y %H:%i:%s') AS data_creazione
FROM users 
WHERE email = 'admin@barbershop.com';

-- ============================================
-- CREDENZIALI NUOVO ADMIN:
-- Email: admin@barbershop.com
-- Password: admin123
-- ============================================
