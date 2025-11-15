# Revisione Progetto e Cose da Fare

Questo file riassume lo stato attuale del progetto e elenca le funzionalità ancora da implementare.

## Stato Attuale

### Backend

*   **Servizi:**
    *   `AppointmentsService`: Gestione completa degli appuntamenti (creazione, lettura, aggiornamento, cancellazione).
    *   `AuthService`: Gestione della registrazione utenti.
    *   `BarbersService`: Gestione completa dei barbieri (creazione, lettura, aggiornamento, cancellazione).
    *   `ServicesService`: Gestione completa dei servizi (creazione, lettura, aggiornamento, cancellazione).
    *   `WaitingListService`: Gestione della lista d'attesa (aggiunta, lettura, cancellazione).
*   **Funzionalità Mancanti:**
    *   Login utenti.
    *   Notifiche per gli utenti in lista d'attesa.

### Frontend

*   **Componenti:**
    *   `admin-dashboard`: Gestione completa dei servizi e dei barbieri.
    *   `customer-dashboard`: Visualizzazione degli appuntamenti e della lista d'attesa.
    *   `login`: Interfaccia utente per il login.
    *   `register`: Interfaccia utente per la registrazione.
    *   `service-booking`: Flusso di prenotazione degli appuntamenti.
*   **Funzionalità da Completare:**
    *   Collegare il componente `login` al backend.
    *   Sostituire i dati mock in `service-booking` con chiamate API reali.

## Cose da Fare

*   [ ] Implementare la funzionalità di login nel backend.
*   [ ] Implementare un sistema di notifiche per la lista d'attesa.
*   [ ] Collegare il componente `login` al backend.
*   [ ] Sostituire i dati mock in `service-booking` con chiamate API reali.
*   [ ] Aggiungere test di integrazione per il backend.
*   [ ] Aggiungere test E2E per il frontend.
