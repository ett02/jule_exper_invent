

# jule_exper_invent

[INSERISCI QUI UNA BREVE DESCRIZIONE DEL PROGETTO: Cosa fa? Qual è il suo scopo principale?]

Questo progetto è un'applicazione web completa divisa in un backend (scritto in Java) e un frontend (scritto in TypeScript).

---

## 🚀 Tecnologie Utilizzate

### Backend
* **Java**
* **[INSERISCI IL FRAMEWORK, es. Spring Boot, Quarkus, o "Nessun framework"]**
* **[INSERISCI IL BUILD TOOL, es. Maven o Gradle]**
* **[INSERISCI IL DATABASE, es. PostgreSQL, MySQL, H2, o "Nessuno"]**

### Frontend
* **TypeScript**
* **HTML5**
* **CSS3**
* **[INSERISCI IL FRAMEWORK, es. Angular, React, Vue, o "Nessun framework/Vanilla TS"]**
* **[INSERISCI IL PACKAGE MANAGER, es. npm o yarn]**

---

## 📋 Prerequisiti

Prima di iniziare, assicurati di avere installato sul tuo sistema:

* [INSERISCI LA VERSIONE DI JAVA, es. JDK 17 o superiore]
* [INSERISCI IL BUILD TOOL E VERSIONE, es. Apache Maven 3.8+ o Gradle 7.x]
* Node.js (v18 o superiore consigliata) e npm
* Un client Git (come Git Bash, SourceTree, ecc.)
* [INSERISCI ALTRI SOFTWARE NECESSARI, es. Docker, se usi un database containerizzato]

---

## ⚙️ Installazione e Setup

Segui questi passaggi per configurare l'ambiente di sviluppo locale.

1.  **Clona il repository:**
    ```bash
    git clone [https://github.com/ett02/jule_exper_invent.git](https://github.com/ett02/jule_exper_invent.git)
    cd jule_exper_invent
    ```

2.  **Configura il Backend (nella cartella `/backend`):**
    ```bash
    cd backend
    
    # [ISTRUZIONE: Se usi Maven]
    # Installa le dipendenze Java
    mvn clean install
    
    # [ISTRUZIONE: Se usi Gradle]
    # Costruisci il progetto
    ./gradlew build
    
    # [INSERISCI ALTRI PASSAGGI, es. configurare il file 'application.properties' o un .env]
    
    cd ..
    ```

3.  **Configura il Frontend (nella cartella `/frontend`):**
    ```bash
    cd frontend
    
    # Installa le dipendenze di Node.js
    npm install
    
    cd ..
    ```

---

## ▶️ Esecuzione

Per avviare l'applicazione, devi eseguire separatamente sia il backend che il frontend, ognuno nel proprio terminale.

### 1. Avvia il Backend

*Apri un terminale nella cartella `/backend`.*

```bash
# [ISTRUZIONE: Se usi Spring Boot con Maven]
mvn spring-boot:run

# [ISTRUZIONE: Se usi Gradle]
./gradlew bootRun

# [ISTRUZIONE: Se è un file .jar eseguibile (dopo la build)]
java -jar target/[NOME_DEL_TUO_FILE].jar



# [ISTRUZIONE: Comando standard per avviare un server di sviluppo]
npm start

# [ISTRUZIONE: Oppure, se usi un comando diverso specificato in package.json]
npm run dev
