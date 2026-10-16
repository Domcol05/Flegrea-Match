# Documentazione Tecnica e Funzionale: Flegrea Match

---

## 1. Panoramica del Progetto

**Flegrea Match** è una Progressive Web App (PWA) progettata per la digitalizzazione delle prenotazioni sportive (Calcio a 5 e Calciotto) e la risoluzione del problema del "giocatore mancante" (bacheca Cerca Uomo) nel comprensorio flegreo (Bacoli, Monte di Procida, Pozzuoli, Quarto, Agnano).

### Obiettivi Principali

* **Centralizzazione dell'offerta:** Mappa interattiva geolocalizzata di tutte le principali strutture sportive dell'area flegrea con posizionamento al metro.
* **Bacheca dinamica "Cerca Uomo":** Possibilità per chi prenota un campo di aprire slot pubblici per ruoli specifici (Portiere, Difensore, Centrocampista, Attaccante) con modalità di adesione libera o su accettazione.
* **Gestione Operativa delle Strutture:** Accesso differenziato per i gestori dei centri sportivi, con calendario giornaliero e possibilità di inserire prenotazioni telefoniche manuali.
* **Nessuna barriera d'ingresso nativa:** Fruibilità immediata da qualsiasi browser mobile e installazione istantanea come PWA su iOS e Android senza passare per gli store applicativi.

---

## 2. Architettura di Sistema e Stack Tecnologico

L'applicazione adotta un'architettura **Serverless / JAMstack** orientata al mobile, con sincronizzazione in tempo reale basata su WebSocket (Cloud Firestore) e rendering lato client.

```
                      ┌────────────────────────────────────────┐
                      │             CLIENT (PWA)               │
                      │  HTML5 + Tailwind CSS + Leaflet.js     │
                      │  Service Worker (Cache First/Network)  │
                      └───────┬────────────────────────┬───────┘
                              │                        │
               OAuth 2.0 /    │                        │ Realtime Listeners
               Persistence    ▼                        ▼ (onSnapshot)
        ┌───────────────────────────┐           ┌───────────────────────────┐
        │   Firebase Authentication │           │  Cloud Firestore Database │
        │   (Google Sign-In)        │           │  (users, bookings, etc.)  │
        └───────────────────────────┘           └───────────────────────────┘

```

| Componente | Tecnologia | Ruolo e Funzione |
| --- | --- | --- |
| **Frontend UI** | HTML5 semantico, Tailwind CSS | Layout responsive, gestione safe-area per dispositivi con notch/Dynamic Island. |
| **Mappe & GIS** | Leaflet.js (v1.9.4) | Visualizzazione mappe, coordinate WGS84, layer switching (OpenStreetMap / Esri World Imagery). |
| **Autenticazione** | Firebase Auth (v10.8) | Autenticazione obbligatoria tramite Google OAuth con persistenza di sessione locale (`browserLocalPersistence`). |
| **Database Real-time** | Cloud Firestore | Gestione documentale NoSQL con sottoscrizioni in tempo reale (`onSnapshot`) senza necessità di polling. |
| **PWA & Offline** | Web App Manifest + Service Worker | Caching degli asset statici e dei tile di mappa, visualizzazione a schermo intero (`standalone`). |
| **Integrazione Esterna** | WhatsApp Web / Universal Links | Contatto diretto tra utenti e strutture via protocollo `[https://wa.me/](https://wa.me/)`. |

---

## 3. Modello Dati (Cloud Firestore)

Il database è strutturato su tre collezioni principali:

### 3.1. Collezione `users`

Contiene le schede anagrafiche e di profilo sia dei giocatori che dei gestori.

* **Document ID:** `uid` (assegnato da Firebase Auth)
* **Campi:**
* `id` *(string)*: UID utente.
* `email` *(string)*: Indirizzo email normalizzato in minuscolo.
* `name` *(string)*: Nome e cognome o nickname.
* `phone` *(string)*: Recapito telefonico per le comunicazioni WhatsApp.
* `whatsapp` *(string)*: Recapito WhatsApp verificato (fondamentale per i gestori).
* `role` *(string)*: Ruolo calcistico preferito (`POR`, `DIF`, `CEN`, `ATT`).
* `accountType` *(string)*: Livello autorizzativo (`PLAYER`, `MANAGER`, `SUPER_ADMIN`).
* `managedVenueId` *(string|null)*: ID della struttura associata se `accountType == 'MANAGER'`.
* `onboardingDone` *(boolean)*: Flag di completamento della prima registrazione.
* `updatedAt` *(string, ISO 8601)*: Timestamp di aggiornamento.



### 3.2. Collezione `bookings`

Rappresenta ogni prenotazione effettuata tramite l'applicazione o inserita manualmente dal gestore.

* **Document ID:** `bk_<timestamp>` oppure `bk_tel_<timestamp>`
* **Campi:**
* `id` *(string)*: ID univoco.
* `venueId` *(string)*: Riferimento al centro sportivo (es. `da_innaro`, `maracana_bacoli`).
* `pitchId` *(string)*: Campo specifico all'interno della struttura (es. `innaro_c1`).
* `pitchName` *(string)*: Nome descrittivo del campo.
* `format` *(string)*: `C5` (Calcio a 5, max 10 giocatori) o `C8` (Calciotto, max 16 giocatori).
* `date` *(string, YYYY-MM-DD)*: Data della partita.
* `startTime` *(string, HH:mm)*: Orario d'inizio dello slot.
* `endTime` *(string, HH:mm)*: Orario di fine dello slot (inizio + 90 minuti).
* `startMinutes` *(number)*: Orario d'inizio convertito in minuti dalla mezzanotte.
* `endMinutes` *(number)*: Orario di fine convertito in minuti dalla mezzanotte.
* `organizerId` *(string)*: UID dell'utente o prefisso `phone_<numero>` per prenotazioni telefoniche.
* `organizerName` *(string)*: Nome dell'organizzatore o del cliente.
* `organizerPhone` *(string)*: Telefono dell'organizzatore.
* `bookingSource` *(string)*: `APP` per prenotazioni utente, `PHONE` per inserimenti del gestore.
* `needsPlayers` *(boolean)*: Flag che indica se la partita deve comparire come pin attivo sulla mappa.
* `joinMode` *(string)*: `FREE` (ingresso immediato) o `APPROVAL` (richiesta soggetta ad approvazione).
* `pricePerPerson` *(number)*: Quota individuale espressa in Euro.
* `skillLevel` *(number, 1-5)*: Livello agonistico dichiarato (da "Dopopalista" ad "Agonistico").
* `status` *(string)*: `CONFIRMED` o `CANCELLED`.
* `slots` *(array of objects)*: Elenco dei posti da riempire:
* `id` *(string)*: ID univoco dello slot.
* `role` *(string)*: `POR`, `DIF`, `CEN`, `ATT`, `ANY`.
* `status` *(string)*: `OPEN` o `OCCUPIED`.
* `player` *(object|null)*: Oggetto con `userId`, `userName`, `userPhone`.
* `requests` *(array of objects)*: Richieste di partecipazione pendenti con status `PENDING`, `ACCEPTED`, `REJECTED`.


* `createdAt` *(string, ISO 8601)*: Timestamp di creazione.



### 3.3. Collezione `venue_contacts`

Memorizza i contatti operativi aggiornati dai gestori per ciascun centro sportivo.

* **Document ID:** `venueId`
* **Campi:**
* `venueId` *(string)*: ID della struttura.
* `managerName` *(string)*: Nome del referente.
* `phone` *(string)*: Recapito chiamate.
* `whatsapp` *(string)*: Recapito WhatsApp.
* `email` *(string)*: Email del gestore.
* `updatedAt` *(string, ISO 8601)*: Timestamp ultimo salvataggio.



---

## 4. Sistema dei Ruoli e Controllo Accessi (RBAC)

L'applicazione definisce tre livelli di autorizzazione determinati al momento dell'autenticazione tramite confronto dell'email Google con la configurazione di sistema:

```
                  ┌───────────────────────────────┐
                  │      Login Google OAuth       │
                  └──────────────┬────────────────┘
                                 │
                 Controllo email in CentriSportivi.js
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
  Email in ADMIN_EMAILS   Email in managerEmails      Qualsiasi altra
         │                       │                         │
         ▼                       ▼                         ▼
   SUPER-ADMIN                MANAGER                   PLAYER
 (Console globale)     (Pannello esclusivo)      (Mappa e prenotazioni)

```

### 4.1. Giocatore (`PLAYER`)

* Navigazione libera sulla mappa con filtraggio per data, ruolo e formato.
* Prenotazione autonoma dei campi disponibili con slot fisso da 90 minuti.
* Creazione e pubblicazione dell'annuncio "Cerca Uomo" con gestione quote e ruoli.
* Gestione delle richieste di partecipazione ricevute nella scheda "Le Mie Partite".
* Profilo utente personalizzabile (nome, ruolo abituale, numero WhatsApp).

### 4.2. Gestore Struttura (`MANAGER`)

* Viene reindirizzato a un pannello operativo dedicato, senza la mappa utente.
* Visualizzazione del tabellone orario giornaliero per i soli campi della propria struttura.
* Possibilità di inserire prenotazioni telefoniche istantanee per bloccare gli slot orari.
* Disdetta immediata di qualsiasi slot occupato con liberazione della disponibilità.
* Configurazione e aggiornamento dei recapiti ufficiali (chiamate e WhatsApp).

### 4.3. Super-Admin (`SUPER_ADMIN`)

* Accesso a tutte le viste dell'applicazione (Mappa, Le Mie Partite, Account) più la scheda riservata "Admin".
* Cruscotto statistico in tempo reale (prenotazioni attive totali, strutture collegate, utenti registrati).
* Supervisione e blocco slot su qualsiasi campo di qualsiasi struttura affiliata.
* Monitoraggio delle email gestori configurate e dei dati di primo accesso.
* Rubrica generale di tutti gli utenti registrati con link diretto WhatsApp per comunicazioni o supporto.

---

## 5. Logica Applicativa e Algoritmi Chiave

### 5.1. Rilevamento Sovrapposizione Slot (`isSlotOverlapping`)

Per consentire prenotazioni di durata pari a 90 minuti su una griglia con intervalli ogni 30 minuti (17:00, 17:30, 18:00, ecc.), il sistema calcola la collisione temporale su base minuti:

$$\text{Collisione} \iff (\text{start}_{\text{candidato}} < \text{end}_{\text{esistente}}) \land (\text{end}_{\text{candidato}} > \text{start}_{\text{esistente}})$$

```javascript
function isSlotOverlapping(venueId, pitchId, dateIso, candidateStartStr) {
  const tStart = timeToMinutes(candidateStartStr);
  const tEnd = tStart + MATCH_DURATION_MIN; // 90 minuti

  return bookings.some(b => {
    if (b.status !== "CONFIRMED") return false;
    if (b.venueId !== venueId || b.pitchId !== pitchId || b.date !== dateIso) return false;
    return (tStart < b.endMinutes) && (tEnd > b.startMinutes);
  });
}

```

### 5.2. Validazione Orari Trascorsi (`isTimeSlotPast`)

Impedisce la prenotazione o l'esposizione di partite con orario antecedente a quello corrente nella data odierna:

```javascript
function isTimeSlotPast(dateIso, startStr) {
  if (!dateIso || !startStr) return false;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const todayIso = `${year}-${month}-${day}`;
  const todayUtcIso = now.toISOString().split("T")[0];

  if (dateIso < todayIso && dateIso < todayUtcIso) return true;
  if (dateIso > todayIso && dateIso > todayUtcIso) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const slotMinutes = timeToMinutes(startStr);
  return slotMinutes <= currentMinutes;
}

```

### 5.3. Calibrazione e Rendering Pin su Leaflet

Per evitare disallineamenti dello spillo rispetto al punto GPS della struttura quando si effettua lo zoom, i pin sono realizzati tramite un `L.divIcon` con dimensioni `[0, 0]` e coordinate di ancoraggio `[0, 0]`, demandando il centraggio alla trasformazione CSS:

```css
.map-pin-anchor {
  position: relative;
  transform: translate(-50%, -100%);
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}

```

In questo modo, la punta inferiore dell'indicatore punta esattamente alle coordinate geografiche del centro sportivo.

---

## 6. Progressive Web App e Ottimizzazione Mobile

### 6.1. Gestione Cache e Service Worker (`sw.js`)

Il Service Worker adotta una doppia strategia:

* **Cache-First per le Mappe:** Le richieste verso i tile server (`tile.openstreetmap.org` e `server.arcgisonline.com`) vengono memorizzate localmente nella cache `flegrei-match-pwa-v5` per minimizzare il consumo di dati e garantire la fluidità durante il pan della mappa.
* **Network-First con Fallback per i file applicativi:** I file `index.html`, `CentriSportivi.js` e le librerie CDN vengono sempre richiesti prioritariamente alla rete per garantire che gli utenti ricevano subito gli ultimi aggiornamenti di codice rilasciati su GitHub Pages, con fallback immediato alla cache in caso di assenza di connettività.

### 6.2. Adattamento Schermo Nativo iOS (Safe Area)

Per supportare i dispositivi con Notch o Dynamic Island, il viewport è configurato con `viewport-fit=cover` e il CSS integra le variabili d'ambiente di sistema:

* `padding-top: env(safe-area-inset-top)` sul `<body>` per staccare l'header dalla status bar di sistema (orario, batteria, segnale di rete).
* `padding-bottom: env(safe-area-inset-bottom)` e `calc(4.25rem + env(safe-area-inset-bottom))` sulla barra di navigazione inferiore `<nav>` per sollevare le icone dei tab sopra la barra Home di iOS.

---

## 7. Struttura dei File del Progetto

```
Flegrea-Match/
├── index.html              # Core single-page application (UI, logica e controller)
├── CentriSportivi.js       # Configurazione anagrafica campi e mappatura email gestori/admin
├── manifest.json           # Dichiarazione PWA (nome, colori tema, icone, modalità standalone)
├── sw.js                   # Service Worker per caching e supporto offline
├── apple-touch-icon.png    # Icona specifica per schermata Home iOS
├── icon-192.png            # Icona standard per dispositivi mobili Android
└── icon-512.png            # Icona ad alta risoluzione per splash screen PWA

```

---

## 8. Guida Operativa di Configurazione

### Aggiungere un nuovo Centro Sportivo o Assegnare un Gestore

Aprire `CentriSportivi.js` e inserire un nuovo blocco nell'array esportato su `window.VENUES_CONFIG`:

```javascript
{
  id: "nuovo_centro",
  name: "Nome Centro Sportivo",
  shortName: "Nome Breve",
  city: "Bacoli",
  address: "Via Esempio 10, Bacoli",
  lat: 40.80100,
  lng: 14.07000,
  managerEmails: ["emailgestore@gmail.com"], // Consente l'accesso al pannello gestore
  pitches: [
    { id: "campo_1", name: "Campo A (C5)", format: "C5", maxPlayers: 10 },
    { id: "campo_2", name: "Campo B (C8)", format: "C8", maxPlayers: 16 }
  ]
}

```

### Assegnare i Privilegi di Super-Admin

In `CentriSportivi.js`, aggiungere l'indirizzo email dell'amministratore all'interno dell'array `window.ADMIN_EMAILS`:

```javascript
window.ADMIN_EMAILS = [
  "domenico.colandrea007@gmail.com"
];

```