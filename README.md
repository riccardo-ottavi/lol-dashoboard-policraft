# lol-dashboard-policraft

## Panoramica

`lol-dashboard-policraft` è un'applicazione full-stack composta da:

- `client/`: una Single Page Application React + TypeScript con Vite
- `server/`: un backend Express + TypeScript che gestisce autenticazione Discord, autorizzazione JWT e integrazione con le API Riot

L'obiettivo è offrire un login Discord, collegare un account Riot e poi mostrare i dati del summoner su una dashboard.

---

## Architettura

### Client

- `client/src/main.tsx`: avvia React con `BrowserRouter` e `AuthProvider`
- `client/src/App.tsx`: definisce le route principali
- `client/src/contexts/AuthContext.tsx`: gestisce l'autenticazione lato client e carica il token da `localStorage`
- `client/src/pages/AuthCallback.tsx`: riceve il token dalla callback del backend, salva il token e decide se mandare l'utente a `onboarding` o `dashboard`
- `client/src/pages/Onboarding.tsx`: pagina dove l'utente collega il proprio Riot ID
- `client/src/pages/Dashboard.tsx`: pagina protetta che mostra i dati del profilo Riot

### Server

- `server/src/index.ts`: inizializza Express, configura CORS, Passport e le route
- `server/src/auth/discordStrategy.ts`: definisce la strategia Discord e salva l'utente nel DB
- `server/src/routes/auth.ts`: gestisce il login Discord e la callback
- `server/src/routes/summoners.ts`: gestisce le API protette per i summoner
- `server/src/controllers/summonerController.ts`: implementa la logica di link, profilo e recupero summoner
- `server/src/middlewares/authMiddleware.ts`: valida il JWT in ingresso
- `server/src/services/riotService.ts`: chiama le API Riot per informazioni sul summoner, rank e partite
- `server/src/db.ts`: connessione al database MySQL

---

## Requisiti

- Node.js 18+ (consigliato)
- MySQL o MariaDB
- Account Discord con una app registrata e autorizzazioni corrette
- Chiave API Riot valida

---

## Configurazione

### 1. Installazione dipendenze

Apri due terminali separati:

```bash
cd client
npm install
```

```bash
cd server
npm install
```

### 2. Variabili d'ambiente

Nel server serve un file `.env` con queste variabili:

```dotenv
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=tuo_utente_db
DB_PASSWORD=tuo_password_db
DB_NAME=tuo_database
JWT_SECRET=una_chiave_lunga_e_sicura
DISCORD_CLIENT_ID=il_tuo_client_id_discord
DISCORD_CLIENT_SECRET=il_tuo_client_secret_discord
DISCORD_REDIRECT_URI=http://localhost:3001/auth/discord/callback
DISCORD_GUILD_ID=id_del_tuo_server_discord
RIOT_API_KEY=la_tua_chiave_riot
```

Assicurati che il redirect URI registrato nell'app Discord corrisponda esattamente a `DISCORD_REDIRECT_URI`.

### 3. Struttura database minima

Il backend assume che esistano almeno queste tabelle:

- `users` con campi come `discord_id`, `username`, `avatar`
- `summoners` con campi come `user_id`, `summoner_name`, `puuid`, `region`, `tier`, `rank_division`, `lp`, `last_synced_at`

> Nota: non c'è uno script SQL fornito qui, quindi crea le tabelle in base al modello usato nel codice.

---

## Esecuzione

### Server

```bash
cd server
npm run dev
```

### Client

```bash
cd client
npm run dev
```

---

## Flusso di autenticazione

### 1) Login Discord

- L'utente clicca il pulsante su `/`
- Il client apre `http://localhost:3001/auth/discord`
- Il server inizia l'OAuth Discord con Passport
- Discord autentica l'utente e torna al backend

### 2) Callback backend

- Il backend riceve la callback su `/auth/discord/callback`
- Passport verifica l'utente e controlla se è membro del server Discord configurato
- Se l'utente è valido, viene creato un JWT
- Il backend reindirizza il browser a:
  - `http://localhost:5173/auth/callback?token=<JWT>`

### 3) Callback client

- `client/src/pages/AuthCallback.tsx` legge il token
- Salva il token in `localStorage`
- Chiama `GET http://localhost:3001/summoners/me` per verificare il collegamento Riot
- Se la risposta è `404`, l'utente va a `/onboarding`
- Se la risposta è OK, l'utente va a `/dashboard`

---

## Endpoint server principali

### Autenticazione

- `GET /auth/discord`
  - avvia la procedura di login Discord

- `GET /auth/discord/callback`
  - callback Discord
  - genera JWT e reindirizza al client

### Summoner

Tutte le route `summoners/*` richiedono l'header `Authorization: Bearer <token>`.

- `GET /summoners/me`
  - ritorna il summoner collegato all'utente autenticato
  - se non esiste, restituisce `404`

- `POST /summoners/link`
  - riceve `riot_id` e `region`
  - cerca il summoner su Riot
  - salva o aggiorna i dati in DB
  - ritorna i dati del summoner

- `GET /summoners/profile`
  - ritorna il profilo completo del summoner
  - utile per la dashboard

---

## Come funziona il client

### AuthContext

- carica il token da `localStorage`
- decodifica il JWT per ottenere `user`
- espone `user`, `token`, `logout` e `loading`

### Route protette

- `ProtectedRoute` mostra la pagina solo se l'utente è autenticato
- altrimenti reindirizza a `/`

### Pagina di onboarding

- l'utente inserisce `Nome#TAG` e `region`
- invia i dati a `/summoners/link`
- in caso di successo va a `/dashboard`

### Dashboard

- chiama `/summoners/profile`
- se riceve `404`, reindirizza a `/onboarding`
- se riceve `401`, fa logout

---

## Debug e errori comuni

### Problema: dopo login non va alla dashboard

- verifica che il backend reindirizzi correttamente a `http://localhost:5173/auth/callback?token=...`
- verifica che il token venga salvato in `localStorage`
- verifica che la route `GET /summoners/me` ritorni `200` o `404` correttamente

### Problema: 404 su `/auth/callback`

Questo può succedere se React non riconosce la rotta.

- Assicurati che `client/src/App.tsx` definisca il route `/auth/callback`
- Assicurati di usare `BrowserRouter` in `client/src/main.tsx`

### Problema: token non valido

- controlla `JWT_SECRET` in `.env`
- verifica che il token generato dal backend sia valido
- se fallisce, il client viene reindirizzato a `/`

---

## Note tecniche

- Il backend usa `passport-discord` per l'OAuth Discord
- Il backend usa `jsonwebtoken` per generare JWT
- Il database è gestito con `mysql2/promise`
- Le API Riot sono invocate in `server/src/services/riotService.ts`

---

## Miglioramenti possibili

- aggiungere uno script SQL di creazione delle tabelle
- aggiungere gestione dei refresh token o sessioni più robuste
- aggiungere uno stato utente persistente più solido sul client
- aggiungere la visualizzazione dei match recenti
- usare HTTPS in produzione
- centralizzare i fetch
